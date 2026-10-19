from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Message, User
from ..schemas import (
    MessageCreate,
    MessageResponse,
)
from ..storage import upload_message_image


router = APIRouter(
    prefix="/messages",
    tags=["Messages"],
)


# ============================================================
# GET ALL MESSAGES
# ============================================================

@router.get(
    "",
    response_model=List[MessageResponse],
)
def get_messages(
    user_id: Optional[int] = None,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    """
    Get messages for the logged-in user.

    If user_id is provided:
        Return conversation between
        current user and that user.

    If user_id is not provided:
        Return all messages where the
        current user is sender or receiver.
    """

    # --------------------------------------------------------
    # SPECIFIC CONVERSATION
    # --------------------------------------------------------

    if user_id is not None:

        if user_id == current_user.id:
            return []

        other_user = (
            db.query(User)
            .filter(
                User.id == user_id
            )
            .first()
        )

        if not other_user:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        messages = (
            db.query(Message)
            .filter(
                or_(
                    and_(
                        Message.sender_id
                        == current_user.id,
                        Message.receiver_id
                        == user_id,
                    ),
                    and_(
                        Message.sender_id
                        == user_id,
                        Message.receiver_id
                        == current_user.id,
                    ),
                )
            )
            .order_by(
                Message.created_at.asc()
            )
            .all()
        )

        return messages

    # --------------------------------------------------------
    # ALL USER MESSAGES
    # --------------------------------------------------------

    messages = (
        db.query(Message)
        .filter(
            or_(
                Message.sender_id
                == current_user.id,
                Message.receiver_id
                == current_user.id,
            )
        )
        .order_by(
            Message.created_at.asc()
        )
        .all()
    )

    return messages


# ============================================================
# SEND TEXT MESSAGE
# ============================================================

@router.post(
    "",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def send_message(
    data: MessageCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    """
    Send a text message.

    The authenticated user is always
    used as the sender.
    """

    # --------------------------------------------------------
    # VALIDATE RECEIVER
    # --------------------------------------------------------

    receiver = (
        db.query(User)
        .filter(
            User.id == data.receiver_id
        )
        .first()
    )

    if not receiver:
        raise HTTPException(
            status_code=404,
            detail="Receiver not found",
        )

    # --------------------------------------------------------
    # PREVENT SELF MESSAGE
    # --------------------------------------------------------

    if receiver.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot send a message to yourself",
        )

    # --------------------------------------------------------
    # VALIDATE TEXT
    # --------------------------------------------------------

    text = (
        data.text.strip()
        if data.text
        else ""
    )

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty",
        )

    if len(text) > 5000:
        raise HTTPException(
            status_code=400,
            detail="Message cannot exceed 5000 characters",
        )

    # --------------------------------------------------------
    # CREATE MESSAGE
    # --------------------------------------------------------

    message = Message(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        text=text,
        image_url=None,
        read=False,
    )

    db.add(message)

    db.commit()

    db.refresh(message)

    return message


# ============================================================
# SEND IMAGE MESSAGE
# ============================================================

@router.post(
    "/image",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def send_image_message(
    receiver_id: int = Form(...),
    file: UploadFile = File(...),
    text: Optional[str] = Form(None),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    """
    Send an image message.

    Optional text can be sent together
    with the image.
    """

    # --------------------------------------------------------
    # VALIDATE RECEIVER
    # --------------------------------------------------------

    receiver = (
        db.query(User)
        .filter(
            User.id == receiver_id
        )
        .first()
    )

    if not receiver:
        raise HTTPException(
            status_code=404,
            detail="Receiver not found",
        )

    # --------------------------------------------------------
    # PREVENT SELF MESSAGE
    # --------------------------------------------------------

    if receiver.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot send a message to yourself",
        )

    # --------------------------------------------------------
    # VALIDATE IMAGE TYPE
    # --------------------------------------------------------

    allowed_types = {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
    }

    content_type = (
        file.content_type
        or ""
    ).lower()

    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, PNG, WEBP and GIF "
                "images are supported."
            ),
        )

    # --------------------------------------------------------
    # READ IMAGE
    # --------------------------------------------------------

    file_bytes = await file.read()

    # --------------------------------------------------------
    # VALIDATE FILE SIZE
    # --------------------------------------------------------

    max_size = 10 * 1024 * 1024

    if len(file_bytes) > max_size:
        raise HTTPException(
            status_code=400,
            detail="Image size cannot exceed 10 MB.",
        )

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty.",
        )

    # --------------------------------------------------------
    # UPLOAD TO SUPABASE STORAGE
    # --------------------------------------------------------

    try:
        image_url = upload_message_image(
            file_bytes=file_bytes,
            file_name=file.filename or "image.jpg",
            content_type=content_type,
        )

    except Exception as exc:
        print(
            "MESSAGE IMAGE UPLOAD ERROR:",
            repr(exc),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to upload image. "
                "Please check the Supabase messages bucket."
            ),
        )

    # --------------------------------------------------------
    # OPTIONAL TEXT
    # --------------------------------------------------------

    clean_text = (
        text.strip()
        if text
        else None
    )

    if clean_text == "":
        clean_text = None

    if clean_text and len(clean_text) > 5000:
        raise HTTPException(
            status_code=400,
            detail="Message cannot exceed 5000 characters",
        )

    # --------------------------------------------------------
    # CREATE DATABASE MESSAGE
    # --------------------------------------------------------

    message = Message(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        text=clean_text,
        image_url=image_url,
        read=False,
    )

    db.add(message)

    db.commit()

    db.refresh(message)

    return message


# ============================================================
# MARK MESSAGE AS READ
# ============================================================

@router.patch(
    "/{message_id}/read",
    response_model=MessageResponse,
)
def mark_message_read(
    message_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    """
    Mark a received message as read.

    Only the receiver can mark a message
    as read.
    """

    message = (
        db.query(Message)
        .filter(
            Message.id == message_id
        )
        .first()
    )

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found",
        )

    # --------------------------------------------------------
    # OWNERSHIP CHECK
    # --------------------------------------------------------

    if (
        message.receiver_id
        != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You can only mark received "
                "messages as read"
            ),
        )

    # --------------------------------------------------------
    # UPDATE
    # --------------------------------------------------------

    if not message.read:
        message.read = True

        db.commit()

        db.refresh(message)

    return message
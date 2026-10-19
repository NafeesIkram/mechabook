from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import SoundTest, User
from ..schemas import SoundTestResponse
from ..storage import upload_sound_test_audio


router = APIRouter(
    prefix="/sound-tests",
    tags=["Sound Tests"],
)


# ============================================================
# GET SOUND TESTS
# ============================================================

@router.get(
    "",
    response_model=list[SoundTestResponse],
)
def get_sound_tests(
    switch_name: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(SoundTest)

    if switch_name and switch_name.strip():
        query = query.filter(
            SoundTest.switch_name.ilike(
                switch_name.strip()
            )
        )

    return (
        query
        .order_by(SoundTest.id.desc())
        .all()
    )


# ============================================================
# GET SINGLE SOUND TEST
# ============================================================

@router.get(
    "/{sound_test_id}",
    response_model=SoundTestResponse,
)
def get_sound_test(
    sound_test_id: int,
    db: Session = Depends(get_db),
):
    item = (
        db.query(SoundTest)
        .filter(
            SoundTest.id == sound_test_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Sound test not found",
        )

    return item


# ============================================================
# CREATE SOUND TEST
# ============================================================

@router.post(
    "",
    response_model=SoundTestResponse,
    status_code=201,
)
async def create_sound_test(
    title: str | None = Form(None),
    keyboard: str | None = Form(None),
    switch_name: str | None = Form(None),
    plate: str | None = Form(None),
    lubed: str | None = Form(None),
    switches: str | None = Form(None),
    keycaps: str | None = Form(None),
    microphone: str | None = Form(None),
    description: str | None = Form(None),
    video_url: str | None = Form(None),
    audio_file: UploadFile | None = File(None),

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(get_db),
):
    audio_url = None

    # --------------------------------------------------------
    # AUDIO UPLOAD
    # --------------------------------------------------------

    if (
        audio_file
        and audio_file.filename
    ):
        allowed_types = {
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/x-wav",
            "audio/ogg",
            "audio/webm",
            "audio/mp4",
            "audio/x-m4a",
            "audio/m4a",
        }

        if (
            audio_file.content_type
            not in allowed_types
        ):
            raise HTTPException(
                status_code=400,
                detail="Unsupported audio format.",
            )

        data = await audio_file.read()

        if len(data) > (
            25 * 1024 * 1024
        ):
            raise HTTPException(
                status_code=400,
                detail="Audio file cannot exceed 25 MB.",
            )

        suffix = (
            Path(
                audio_file.filename
            ).suffix.lower()
            or ".audio"
        )

        audio_url = (
            upload_sound_test_audio(
                data,
                f"{uuid4().hex}{suffix}",
                audio_file.content_type
                or "application/octet-stream",
            )
        )

    # --------------------------------------------------------
    # DATABASE
    # --------------------------------------------------------

    item = SoundTest(
        user_id=current_user.id,

        title=(
            title.strip()
            if title
            else None
        ),

        keyboard=(
            keyboard.strip()
            if keyboard
            else None
        ),

        switch_name=(
            switch_name.strip()
            if switch_name
            else None
        ),

        plate=(
            plate.strip()
            if plate
            else None
        ),

        lubed=(
            lubed.strip()
            if lubed
            else None
        ),

        switches=(
            switches.strip()
            if switches
            else None
        ),

        keycaps=(
            keycaps.strip()
            if keycaps
            else None
        ),

        microphone=(
            microphone.strip()
            if microphone
            else None
        ),

        description=(
            description.strip()
            if description
            else None
        ),

        audio_url=audio_url,

        video_url=(
            video_url.strip()
            if video_url
            else None
        ),
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


# ============================================================
# DELETE SOUND TEST
# ============================================================

@router.delete(
    "/{sound_test_id}",
)
def delete_sound_test(
    sound_test_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    item = (
        db.query(SoundTest)
        .filter(
            SoundTest.id == sound_test_id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Sound test not found",
        )

    if (
        item.user_id != current_user.id
        and not current_user.is_admin
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own sound test.",
        )

    db.delete(item)
    db.commit()

    return {
        "message":
        "Sound test deleted successfully"
    }
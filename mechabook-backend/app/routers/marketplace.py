from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import MarketplaceListing, User
from ..schemas import ListingResponse
from ..storage import upload_marketplace_image


router = APIRouter(
    prefix="/marketplace",
    tags=["Marketplace"],
)


# ============================================================
# GET ALL LISTINGS
# ============================================================

@router.get(
    "",
    response_model=list[ListingResponse],
)
def get_listings(
    db: Session = Depends(get_db),
):
    listings = (
        db.query(MarketplaceListing)
        .order_by(MarketplaceListing.id.desc())
        .all()
    )

    return listings


# ============================================================
# GET SINGLE LISTING
# ============================================================

@router.get(
    "/{listing_id}",
    response_model=ListingResponse,
)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
):
    listing = (
        db.query(MarketplaceListing)
        .filter(MarketplaceListing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    return listing


# ============================================================
# CREATE LISTING
# ============================================================

@router.post(
    "",
    response_model=ListingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_listing(
    title: str = Form(...),
    description: str = Form(""),
    price: str = Form(...),
    condition: str = Form(...),
    location: str = Form(...),
    category: str | None = Form(None),
    image: UploadFile | None = File(None),

    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    clean_title = title.strip()
    clean_description = description.strip()
    clean_price = price.strip()
    clean_condition = condition.strip()
    clean_location = location.strip()

    if len(clean_title) < 3:
        raise HTTPException(
            status_code=400,
            detail="Title must be at least 3 characters.",
        )

    if len(clean_description) < 5:
        raise HTTPException(
            status_code=400,
            detail="Description must be at least 5 characters.",
        )

    if not clean_price:
        raise HTTPException(
            status_code=400,
            detail="Price is required.",
        )

    if not clean_condition:
        raise HTTPException(
            status_code=400,
            detail="Condition is required.",
        )

    if not clean_location:
        raise HTTPException(
            status_code=400,
            detail="Location is required.",
        )

    image_url = None

    # --------------------------------------------------------
    # IMAGE UPLOAD
    # --------------------------------------------------------

    if image:
        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        }

        if image.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Unsupported image format.",
            )

        file_bytes = await image.read()

        if len(file_bytes) > 50 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Image must be 50 MB or smaller.",
            )

        extension = ""

        if image.filename and "." in image.filename:
            extension = "." + image.filename.rsplit(".", 1)[1].lower()

        unique_name = f"{uuid4().hex}{extension}"

        try:
            image_url = upload_marketplace_image(
                file_bytes=file_bytes,
                file_name=unique_name,
                content_type=image.content_type,
            )
        except Exception as exc:
            print("Supabase image upload error:", exc)

            raise HTTPException(
                status_code=500,
                detail="Failed to upload marketplace image.",
            )

    # --------------------------------------------------------
    # IMPORTANT:
    # category is intentionally NOT sent to the SQLAlchemy
    # model because the current MarketplaceListing model
    # does not have a category column.
    # --------------------------------------------------------

    listing = MarketplaceListing(
        user_id=current_user.id,
        title=clean_title,
        description=clean_description,
        price=clean_price,
        condition=clean_condition,
        location=clean_location,
        image=image_url,
        status="active",
    )

    db.add(listing)
    db.commit()
    db.refresh(listing)

    return listing


# ============================================================
# UPDATE LISTING
# OWNER ONLY
# ============================================================

@router.patch(
    "/{listing_id}",
    response_model=ListingResponse,
)
async def update_listing(
    listing_id: int,

    title: str = Form(...),
    description: str = Form(""),
    price: str = Form(...),
    condition: str = Form(...),
    location: str = Form(...),
    image: UploadFile | None = File(None),

    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = (
        db.query(MarketplaceListing)
        .filter(MarketplaceListing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found.",
        )

    # ========================================================
    # OWNER CHECK
    # ========================================================

    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only edit your own listings.",
        )

    clean_title = title.strip()
    clean_description = description.strip()
    clean_price = price.strip()
    clean_condition = condition.strip()
    clean_location = location.strip()

    if len(clean_title) < 3:
        raise HTTPException(
            status_code=400,
            detail="Title must be at least 3 characters.",
        )

    if len(clean_description) < 5:
        raise HTTPException(
            status_code=400,
            detail="Description must be at least 5 characters.",
        )

    if not clean_price:
        raise HTTPException(
            status_code=400,
            detail="Price is required.",
        )

    # ========================================================
    # UPDATE TEXT DATA
    # ========================================================

    listing.title = clean_title
    listing.description = clean_description
    listing.price = clean_price
    listing.condition = clean_condition
    listing.location = clean_location

    # ========================================================
    # OPTIONAL NEW IMAGE
    # ========================================================

    if image:
        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
        }

        if image.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Unsupported image format.",
            )

        file_bytes = await image.read()

        if len(file_bytes) > 50 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="Image must be 50 MB or smaller.",
            )

        extension = ""

        if image.filename and "." in image.filename:
            extension = "." + image.filename.rsplit(".", 1)[1].lower()

        unique_name = f"{uuid4().hex}{extension}"

        try:
            image_url = upload_marketplace_image(
                file_bytes=file_bytes,
                file_name=unique_name,
                content_type=image.content_type,
            )

            listing.image = image_url

        except Exception as exc:
            print("Supabase image upload error:", exc)

            raise HTTPException(
                status_code=500,
                detail="Failed to upload new marketplace image.",
            )

    db.commit()
    db.refresh(listing)

    return listing


# ============================================================
# UPDATE STATUS
# OWNER ONLY
# ============================================================

@router.patch(
    "/{listing_id}/status",
    response_model=ListingResponse,
)
def update_listing_status(
    listing_id: int,
    new_status: str = Form(...),

    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = (
        db.query(MarketplaceListing)
        .filter(MarketplaceListing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found.",
        )

    # OWNER CHECK
    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only change the status of your own listing.",
        )

    normalized_status = new_status.strip().lower()

    allowed_statuses = {
        "active",
        "pending",
        "sold",
    }

    if normalized_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Status must be active, pending, or sold.",
        )

    listing.status = normalized_status

    db.commit()
    db.refresh(listing)

    return listing


# ============================================================
# DELETE LISTING
# OWNER ONLY
# ============================================================

@router.delete(
    "/{listing_id}",
)
def delete_listing(
    listing_id: int,

    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    listing = (
        db.query(MarketplaceListing)
        .filter(MarketplaceListing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found.",
        )

    # OWNER CHECK
    if listing.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own listings.",
        )

    db.delete(listing)
    db.commit()

    return {
        "message": "Listing deleted successfully.",
    }
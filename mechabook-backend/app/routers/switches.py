from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import Switch, SwitchReview, User
from ..schemas import (
    SwitchCreate,
    SwitchResponse,
    SwitchReviewCreate,
    SwitchReviewResponse,
)

router = APIRouter(
    prefix="/switches",
    tags=["Switches"],
)


def validate_profile(data: SwitchCreate) -> None:
    for field in ("deep", "thocky", "clacky", "sharp"):
        value = getattr(data, field)

        if value is not None and (
            value < 0 or value > 100
        ):
            raise HTTPException(
                status_code=400,
                detail=f"{field} must be between 0 and 100.",
            )


# ============================================================
# GET ALL SWITCHES
# ============================================================

@router.get(
    "",
    response_model=list[SwitchResponse],
)
def get_switches(
    db: Session = Depends(get_db),
):
    return (
        db.query(Switch)
        .order_by(Switch.id.desc())
        .all()
    )


# ============================================================
# GET SWITCH BY NAME
# ============================================================

@router.get(
    "/by-name/{switch_name}",
    response_model=SwitchResponse,
)
def get_switch_by_name(
    switch_name: str,
    db: Session = Depends(get_db),
):
    switch = (
        db.query(Switch)
        .filter(
            Switch.name.ilike(switch_name)
        )
        .order_by(
            Switch.id.desc()
        )
        .first()
    )

    if not switch:
        raise HTTPException(
            status_code=404,
            detail="Switch not found",
        )

    return switch


# ============================================================
# CREATE SWITCH
# ============================================================

@router.post(
    "",
    response_model=SwitchResponse,
    status_code=201,
)
def create_switch(
    data: SwitchCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Switch name is required.",
        )

    existing = (
        db.query(Switch)
        .filter(
            Switch.name.ilike(name)
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="A switch with this name already exists.",
        )

    validate_profile(data)

    values = data.model_dump()

    values["name"] = name

    for field in (
        "brand",
        "type",
        "sound",
        "actuation",
        "force",
        "travel",
    ):
        values[field] = (
            values[field].strip()
        )

    new_switch = Switch(
        user_id=current_user.id,
        **values,
    )

    db.add(new_switch)
    db.commit()
    db.refresh(new_switch)

    return new_switch


# ============================================================
# DELETE SWITCH
# ============================================================

@router.delete(
    "/{switch_id}",
)
def delete_switch(
    switch_id: int,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    switch = (
        db.query(Switch)
        .filter(
            Switch.id == switch_id
        )
        .first()
    )

    if not switch:
        raise HTTPException(
            status_code=404,
            detail="Switch not found.",
        )

    if (
        switch.user_id != current_user.id
        and not current_user.is_admin
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own switch.",
        )

    db.delete(switch)
    db.commit()

    return {
        "message": "Switch deleted successfully."
    }


# ============================================================
# GET REVIEWS
# ============================================================

@router.get(
    "/reviews/{switch_name}",
    response_model=list[
        SwitchReviewResponse
    ],
)
def get_switch_reviews(
    switch_name: str,
    db: Session = Depends(get_db),
):
    rows = (
        db.query(
            SwitchReview,
            User,
        )
        .join(
            User,
            User.id == SwitchReview.user_id,
        )
        .filter(
            SwitchReview.switch_name.ilike(
                switch_name
            )
        )
        .order_by(
            SwitchReview.id.desc()
        )
        .all()
    )

    result = []

    for review, user in rows:
        result.append(
            {
                "id": review.id,
                "user_id": review.user_id,
                "switch_name": review.switch_name,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at,
                "user_name": user.name,
                "user_handle": user.handle,
                "user_avatar": user.avatar,
            }
        )

    return result


# ============================================================
# CREATE REVIEW
# ============================================================

@router.post(
    "/reviews",
    response_model=SwitchReviewResponse,
    status_code=201,
)
def create_switch_review(
    data: SwitchReviewCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    switch_name = data.switch_name.strip()
    comment = data.comment.strip()

    if not switch_name:
        raise HTTPException(
            status_code=400,
            detail="Switch name is required.",
        )

    if not comment:
        raise HTTPException(
            status_code=400,
            detail="Review comment is required.",
        )

    if data.rating < 1 or data.rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 1 and 5.",
        )

    switch = (
        db.query(Switch)
        .filter(
            Switch.name.ilike(
                switch_name
            )
        )
        .order_by(
            Switch.id.desc()
        )
        .first()
    )

    if not switch:
        raise HTTPException(
            status_code=404,
            detail="Switch not found.",
        )

    review = SwitchReview(
        user_id=current_user.id,
        switch_name=switch.name,
        rating=data.rating,
        comment=comment,
    )

    db.add(review)
    db.flush()

    ratings = [
        row[0]
        for row in (
            db.query(
                SwitchReview.rating
            )
            .filter(
                SwitchReview.switch_name.ilike(
                    switch.name
                )
            )
            .all()
        )
    ]

    if ratings:
        switch.rating = round(
            sum(ratings) / len(ratings),
            2,
        )
    else:
        switch.rating = 0

    db.commit()
    db.refresh(review)

    return {
        "id": review.id,
        "user_id": review.user_id,
        "switch_name": review.switch_name,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at,
        "user_name": current_user.name,
        "user_handle": current_user.handle,
        "user_avatar": current_user.avatar,
    }
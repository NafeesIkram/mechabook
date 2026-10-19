from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..database import get_db
from ..models import User, Post, MarketplaceListing, Community


router = APIRouter(
    prefix="/search",
    tags=["Search"],
)


# ============================================================
# USER SEARCH
# ============================================================

@router.get("/users")
def search_users(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Search MechaBook users by name or handle.

    The currently logged-in user is excluded.
    Maximum 20 results.
    """

    query = q.strip()

    if not query:
        return []

    search_pattern = f"%{query}%"

    users = (
        db.query(User)
        .filter(
            User.id != current_user.id,
            or_(
                User.name.ilike(search_pattern),
                User.handle.ilike(search_pattern),
            ),
        )
        .order_by(User.name.asc())
        .limit(20)
        .all()
    )

    return [
        {
            "id": user.id,
            "name": user.name,
            "handle": user.handle,
            "avatar": user.avatar,
        }
        for user in users
    ]


# ============================================================
# GENERAL SEARCH
# ============================================================

@router.get("")
def search(
    q: str = Query(..., min_length=1),
    type: str = "all",
    db: Session = Depends(get_db),
):
    query = q.strip()

    if not query:
        return {
            "query": q,
            "users": [],
            "posts": [],
            "marketplace": [],
            "communities": [],
        }

    search_pattern = f"%{query}%"

    out = {
        "query": query,
        "users": [],
        "posts": [],
        "marketplace": [],
        "communities": [],
    }

    # --------------------------------------------------------
    # USERS
    # --------------------------------------------------------

    if type in ("all", "people"):
        users = (
            db.query(User)
            .filter(
                or_(
                    User.name.ilike(search_pattern),
                    User.handle.ilike(search_pattern),
                    User.bio.ilike(search_pattern),
                )
            )
            .limit(25)
            .all()
        )

        out["users"] = [
            {
                "id": user.id,
                "name": user.name,
                "handle": user.handle,
                "avatar": user.avatar,
                "bio": user.bio,
            }
            for user in users
        ]

    # --------------------------------------------------------
    # POSTS
    # --------------------------------------------------------

    if type in ("all", "posts"):
        posts = (
            db.query(Post)
            .filter(
                or_(
                    Post.caption.ilike(search_pattern),
                    Post.keyboard.ilike(search_pattern),
                )
            )
            .limit(25)
            .all()
        )

        out["posts"] = posts

    # --------------------------------------------------------
    # MARKETPLACE
    # --------------------------------------------------------

    if type in ("all", "marketplace"):
        marketplace = (
            db.query(MarketplaceListing)
            .filter(
                or_(
                    MarketplaceListing.title.ilike(search_pattern),
                    MarketplaceListing.location.ilike(search_pattern),
                    MarketplaceListing.condition.ilike(search_pattern),
                    MarketplaceListing.description.ilike(search_pattern),
                )
            )
            .limit(25)
            .all()
        )

        out["marketplace"] = marketplace

    # --------------------------------------------------------
    # COMMUNITIES
    # --------------------------------------------------------

    if type in ("all", "communities"):
        communities = (
            db.query(Community)
            .filter(
                or_(
                    Community.name.ilike(search_pattern),
                    Community.description.ilike(search_pattern),
                    Community.category.ilike(search_pattern),
                )
            )
            .limit(25)
            .all()
        )

        out["communities"] = communities

    return out
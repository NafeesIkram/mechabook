from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


# ============================================================
# USER SCHEMAS
# ============================================================

class RegisterRequest(BaseModel):
    name: str
    handle: str
    email: EmailStr
    password: str
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    cover: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    handle: str
    email: EmailStr
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    cover: Optional[str] = None
    star_badge: bool
    is_admin: bool

    model_config = ConfigDict(
        from_attributes=True
    )


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ============================================================
# USER CREATE
# ============================================================

class UserCreate(BaseModel):
    name: str
    handle: str
    email: EmailStr
    password: str
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    cover: Optional[str] = None


# ============================================================
# USER UPDATE
# ============================================================

class UserUpdate(BaseModel):
    name: Optional[str] = None
    handle: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    cover: Optional[str] = None
    star_badge: Optional[bool] = None


# ============================================================
# POST
# ============================================================

class PostCreate(BaseModel):
    user_id: int
    caption: str
    image: Optional[str] = None
    keyboard: Optional[str] = None
    tags: Optional[str] = None


class PostResponse(BaseModel):
    id: int
    user_id: int
    caption: str
    image: Optional[str] = None
    keyboard: Optional[str] = None
    tags: Optional[str] = None
    likes: int
    comments: int
    sponsored: bool

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# MARKETPLACE
# ============================================================

class ListingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: str
    condition: str
    location: str
    category: Optional[str] = None
    image: Optional[str] = None


class ListingResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    price: str
    condition: str
    location: str
    image: Optional[str] = None
    status: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# COMMUNITY
# ============================================================

class CommunityCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    members: int = 0
    max_members: int = 1000
    private: bool = False
    owner_id: Optional[int] = None


class CommunityResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    members: int
    max_members: int
    private: bool
    owner_id: Optional[int] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# SOUND TEST
# ============================================================

class SoundTestCreate(BaseModel):
    user_id: int
    title: Optional[str] = None
    keyboard: Optional[str] = None
    switch_name: Optional[str] = None
    plate: Optional[str] = None
    lubed: Optional[str] = None
    switches: Optional[str] = None
    keycaps: Optional[str] = None
    microphone: Optional[str] = None
    description: Optional[str] = None
    audio_url: Optional[str] = None
    video_url: Optional[str] = None


class SoundTestResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = None
    keyboard: Optional[str] = None
    switch_name: Optional[str] = None
    plate: Optional[str] = None
    lubed: Optional[str] = None
    switches: Optional[str] = None
    keycaps: Optional[str] = None
    microphone: Optional[str] = None
    description: Optional[str] = None
    audio_url: Optional[str] = None
    video_url: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# MESSAGES
# ============================================================

class MessageCreate(BaseModel):
    receiver_id: int
    text: Optional[str] = None


class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    text: Optional[str] = None
    image_url: Optional[str] = None
    read: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# SWITCH
# ============================================================

class SwitchCreate(BaseModel):
    name: str
    brand: str
    type: str
    sound: str
    actuation: str
    force: str
    travel: str

    tests: int = 0

    description: Optional[str] = None
    image: Optional[str] = None

    rating: float = 0

    # Optional
    deep: Optional[int] = None
    thocky: Optional[int] = None
    clacky: Optional[int] = None
    sharp: Optional[int] = None


class SwitchResponse(BaseModel):
    id: int
    user_id: int

    name: str
    brand: str
    type: str
    sound: str
    actuation: str
    force: str
    travel: str

    tests: int

    description: Optional[str] = None
    image: Optional[str] = None

    rating: float

    deep: Optional[int] = None
    thocky: Optional[int] = None
    clacky: Optional[int] = None
    sharp: Optional[int] = None

    created_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# SWITCH REVIEW
# ============================================================

class SwitchReviewCreate(BaseModel):
    switch_name: str
    rating: float
    comment: str


class SwitchReviewResponse(BaseModel):
    id: int
    user_id: int
    switch_name: str
    rating: float
    comment: str

    created_at: Optional[datetime] = None

    user_name: str
    user_handle: str
    user_avatar: Optional[str] = None


class SwitchCreate(BaseModel):
    name: str
    brand: str
    type: str
    sound: str
    actuation: str
    force: str
    travel: str

    tests: int = 0

    description: Optional[str] = None
    image: Optional[str] = None

    rating: float = 0

    # Optional Sound Profile
    deep: Optional[int] = None
    thocky: Optional[int] = None
    clacky: Optional[int] = None
    sharp: Optional[int] = None


class SwitchResponse(BaseModel):
    id: int
    user_id: int

    name: str
    brand: str
    type: str
    sound: str
    actuation: str
    force: str
    travel: str

    tests: int

    description: Optional[str] = None
    image: Optional[str] = None

    rating: float

    deep: Optional[int] = None
    thocky: Optional[int] = None
    clacky: Optional[int] = None
    sharp: Optional[int] = None

    created_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )


class SwitchReviewCreate(BaseModel):
    switch_name: str
    rating: float
    comment: str


class SwitchReviewResponse(BaseModel):
    id: int
    user_id: int
    switch_name: str

    rating: float
    comment: str

    created_at: Optional[datetime] = None

    user_name: str
    user_handle: str
    user_avatar: Optional[str] = None
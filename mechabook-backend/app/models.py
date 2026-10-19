from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    handle = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)

    password_hash = Column(String, nullable=False)

    avatar = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)

    is_admin = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # Relationships
    posts = relationship(
        "Post",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    marketplace_items = relationship(
        "MarketplaceItem",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    communities = relationship(
        "Community",
        back_populates="creator",
        cascade="all, delete-orphan",
    )

    messages_sent = relationship(
        "Message",
        foreign_keys="Message.sender_id",
        back_populates="sender",
        cascade="all, delete-orphan",
    )

    messages_received = relationship(
        "Message",
        foreign_keys="Message.receiver_id",
        back_populates="receiver",
        cascade="all, delete-orphan",
    )

    sound_tests = relationship(
        "SoundTest",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    switches = relationship(
        "Switch",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    content = Column(Text, nullable=False)

    image = Column(Text, nullable=True)

    likes = Column(Integer, default=0, nullable=False)
    comments = Column(Integer, default=0, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="posts",
    )


class MarketplaceItem(Base):
    __tablename__ = "marketplace_items"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    price = Column(Float, nullable=False)

    category = Column(String, nullable=True)
    condition = Column(String, nullable=True)

    image = Column(Text, nullable=True)

    status = Column(
        String,
        default="active",
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="marketplace_items",
    )


class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True)

    creator_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    image = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    creator = relationship(
        "User",
        back_populates="communities",
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    sender_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    receiver_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    text = Column(Text, nullable=True)

    image_url = Column(Text, nullable=True)

    read = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    sender = relationship(
        "User",
        foreign_keys=[sender_id],
        back_populates="messages_sent",
    )

    receiver = relationship(
        "User",
        foreign_keys=[receiver_id],
        back_populates="messages_received",
    )


class SoundTest(Base):
    __tablename__ = "sound_tests"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String, nullable=True)

    keyboard = Column(String, nullable=True)

    switch_name = Column(
        String,
        nullable=True,
        index=True,
    )

    plate = Column(String, nullable=True)

    lubed = Column(String, nullable=True)

    switches = Column(String, nullable=True)

    keycaps = Column(String, nullable=True)

    microphone = Column(String, nullable=True)

    description = Column(Text, nullable=True)

    audio_url = Column(Text, nullable=True)

    video_url = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="sound_tests",
    )


class Switch(Base):
    __tablename__ = "switches"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
        index=True,
    )

    brand = Column(
        String,
        nullable=False,
    )

    type = Column(
        String,
        nullable=False,
    )

    sound = Column(
        String,
        nullable=False,
    )

    actuation = Column(
        String,
        nullable=False,
    )

    force = Column(
        String,
        nullable=False,
    )

    travel = Column(
        String,
        nullable=False,
    )

    tests = Column(
        Integer,
        default=0,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=True,
    )

    image = Column(
        Text,
        nullable=True,
    )

    rating = Column(
        Float,
        default=0,
        nullable=False,
    )

    # Optional Sound Profile
    #
    # If the user does not enter these values while
    # adding a switch, they remain NULL.
    deep = Column(
        Integer,
        nullable=True,
    )

    thocky = Column(
        Integer,
        nullable=True,
    )

    clacky = Column(
        Integer,
        nullable=True,
    )

    sharp = Column(
        Integer,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="switches",
    )


class SwitchReview(Base):
    __tablename__ = "switch_reviews"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    switch_name = Column(
        String,
        nullable=False,
        index=True,
    )

    rating = Column(
        Float,
        nullable=False,
    )

    comment = Column(
        Text,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    user = relationship("User")
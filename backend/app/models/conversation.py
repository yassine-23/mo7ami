"""Conversation, message, and analytics models for auditing chat interactions."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    """Minimal user model to support foreign-key relationships."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[Optional[str]] = mapped_column(String, unique=True)

    conversations: Mapped[List["Conversation"]] = relationship(back_populates="user")
    preferences: Mapped[List["UserPreference"]] = relationship(back_populates="user")


class UserPreference(Base):
    """Mirror of NextAuth user preferences for join queries."""

    __tablename__ = "user_preferences"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column("userId", String, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    language: Mapped[str] = mapped_column(String(10), default="ar")
    voice_enabled: Mapped[bool] = mapped_column("voiceEnabled", Boolean, default=True)
    auto_play_voice: Mapped[bool] = mapped_column("autoPlayVoice", Boolean, default=True)
    voice_gender: Mapped[str] = mapped_column("voiceGender", String(10), default="female")
    theme: Mapped[str] = mapped_column(String(10), default="light")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user: Mapped[User] = relationship(back_populates="preferences")


class Conversation(Base):
    """Conversation container for persisted chats."""

    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[Optional[str]] = mapped_column("userId", String, ForeignKey("users.id", ondelete="SET NULL"))
    client_token: Mapped[Optional[str]] = mapped_column(String(128), index=True)
    title: Mapped[Optional[str]] = mapped_column(Text)
    language: Mapped[str] = mapped_column(String(10), default="ar")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user: Mapped[Optional[User]] = relationship(back_populates="conversations")
    messages: Mapped[List["Message"]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Message(Base):
    """Individual chat messages with optional citations."""

    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    conversation_id: Mapped[str] = mapped_column(
        "conversationId", String, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(10), nullable=False)
    citations: Mapped[Optional[Any]] = mapped_column(JSONB)
    voice_used: Mapped[bool] = mapped_column("voiceUsed", Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    conversation: Mapped[Conversation] = relationship(back_populates="messages")


class QueryAnalytics(Base):
    """Aggregate metrics for monitoring usage and latency."""

    __tablename__ = "query_analytics"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(10), nullable=False)
    domain: Mapped[Optional[str]] = mapped_column(String(50))
    response_time_ms: Mapped[int] = mapped_column("responseTime", Integer, nullable=False)
    voice_used: Mapped[bool] = mapped_column("voiceUsed", Boolean, default=False)
    successful: Mapped[bool] = mapped_column(Boolean, default=True)
    user_id: Mapped[Optional[str]] = mapped_column(String, index=True)
    client_token: Mapped[Optional[str]] = mapped_column(String(128), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

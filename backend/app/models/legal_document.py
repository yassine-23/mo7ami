"""SQLAlchemy models for legal documents and chunks used in the RAG pipeline."""

from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.config import settings


class LegalDocument(Base):
    """Legal document metadata ingested into the vector store."""

    __tablename__ = "legal_documents"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    title_ar: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    domain: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    language: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    official_ref: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    publication_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    content: Mapped[Optional[str]] = mapped_column(Text)
    metadata: Mapped[Dict] = mapped_column(JSONB, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    chunks: Mapped[List["DocumentChunk"]] = relationship(
        back_populates="document",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class DocumentChunk(Base):
    """Chunked legal content with vector embeddings for similarity search."""

    __tablename__ = "document_chunks"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    document_id: Mapped[str] = mapped_column(
        ForeignKey("legal_documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    language: Mapped[str] = mapped_column(String(10), nullable=False, index=True)
    article_number: Mapped[Optional[str]] = mapped_column(String(50))
    embedding: Mapped[Optional[List[float]]] = mapped_column(
        Vector(settings.VECTOR_DIMENSION), nullable=True
    )
    metadata: Mapped[Dict] = mapped_column(JSONB, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    document: Mapped[LegalDocument] = relationship(back_populates="chunks")

"""Document retrieval service powered by pgvector similarity search."""

from __future__ import annotations

from time import perf_counter
from typing import Any, Dict, List, Optional

from loguru import logger
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
import openai

from app.core.config import settings
from app.models import DocumentChunk, LegalDocument


DEFAULT_MATCH_THRESHOLD = 0.30  # Optimized for quality (was 0.6, but 0.05 in practice)


async def retrieve_relevant_documents(
    *,
    db: AsyncSession,
    query: str,
    language: str = "ar",
    top_k: int = 5,
    match_threshold: float = DEFAULT_MATCH_THRESHOLD,
    filter_domain: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Retrieve the most relevant legal document chunks for a query.

    This function performs the full retrieval stage of the RAG pipeline:
    1. Generates an embedding for the user query using OpenAI.
    2. Executes a pgvector cosine-distance search against chunk embeddings.
    3. Returns enriched metadata for downstream generation and citation steps.
    """

    if not query.strip():
        return []

    logger.info(
        "Retrieving documents for query (lang={}, top_k={}, domain={})",
        language,
        top_k,
        filter_domain,
    )

    embedding = await generate_query_embedding(query)
    if not embedding:
        logger.warning("No embedding returned for query; skipping retrieval")
        return []

    search_start = perf_counter()

    similarity_score = (
        1 - DocumentChunk.embedding.cosine_distance(embedding)
    ).label("similarity")

    stmt: Select = (
        select(
            DocumentChunk.id.label("chunk_id"),
            DocumentChunk.content,
            DocumentChunk.language,
            DocumentChunk.article_number,
            DocumentChunk.metadata.label("chunk_metadata"),
            LegalDocument.id.label("document_id"),
            LegalDocument.title,
            LegalDocument.title_ar,
            LegalDocument.domain,
            LegalDocument.language.label("document_language"),
            LegalDocument.official_ref,
            LegalDocument.publication_date,
            LegalDocument.metadata.label("document_metadata"),
            similarity_score,
        )
        .join(LegalDocument, DocumentChunk.document_id == LegalDocument.id)
        .where(DocumentChunk.embedding.isnot(None))
        .order_by(DocumentChunk.embedding.cosine_distance(embedding))
        .limit(top_k * 10)
    )

    if language:
        stmt = stmt.where(DocumentChunk.language == language)
    if filter_domain:
        stmt = stmt.where(LegalDocument.domain == filter_domain)

    result = await db.execute(stmt)
    rows = result.mappings().all()

    duration_ms = (perf_counter() - search_start) * 1000
    logger.info(
        "Vector search returned {} rows in {:.1f} ms", len(rows), duration_ms
    )

    # Filter by similarity threshold and retain top_k highest scores
    filtered: List[Dict[str, Any]] = []
    for row in rows:
        similarity = row["similarity"]
        if similarity is None or similarity < match_threshold:
            continue

        filtered.append(
            {
                "chunk_id": row["chunk_id"],
                "content": row["content"],
                "language": row["language"],
                "article_number": row["article_number"],
                "similarity": similarity,
                "metadata": row["chunk_metadata"] or {},
                "document": {
                    "id": row["document_id"],
                    "title": row["title"],
                    "title_ar": row["title_ar"],
                    "domain": row["domain"],
                    "language": row["document_language"],
                    "official_ref": row["official_ref"],
                    "publication_date": row["publication_date"],
                    "metadata": row["document_metadata"] or {},
                },
            }
        )

        if len(filtered) >= top_k:
            break

    return filtered


async def generate_query_embedding(query: str) -> List[float]:
    """Generate embedding vector for query using OpenAI."""

    try:
        client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.embeddings.create(
            model=settings.OPENAI_EMBEDDING_MODEL,
            input=query,
        )
        return response.data[0].embedding

    except Exception as exc:
        logger.error(f"Embedding generation error: {exc}")
        raise

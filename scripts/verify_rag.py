"""Utility script to verify the RAG pipeline against the configured Supabase database."""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path
from textwrap import indent

from dotenv import load_dotenv

# Ensure backend package is importable when running from repository root
ROOT_DIR = Path(__file__).resolve().parents[1]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.database import AsyncSessionLocal  # noqa: E402
from app.services.retrieval import retrieve_relevant_documents  # noqa: E402
from app.services.generation import generate_answer  # noqa: E402


async def verify(query: str, language: str, top_k: int) -> None:
    """Run retrieval + generation for a given query and print diagnostics."""

    async with AsyncSessionLocal() as session:  # type: ignore[arg-type]
        print("→ Generating embedding and querying vector store...")
        documents = await retrieve_relevant_documents(
            db=session,
            query=query,
            language=language,
            top_k=top_k,
        )

        if not documents:
            print("⚠️  No documents were retrieved. Check embeddings and data ingestion.")
            return

        print(f"✅ Retrieved {len(documents)} document chunks\n")
        for idx, doc in enumerate(documents, start=1):
            meta = doc.get("document", {})
            print(f"[{idx}] {meta.get('title') or meta.get('title_ar')}")
            print(indent(f"Similarity: {doc.get('similarity'):.3f}", prefix="    "))
            print(indent(f"Official Ref: {meta.get('official_ref')}", prefix="    "))
            if doc.get("article_number"):
                print(indent(f"Article: {doc.get('article_number')}", prefix="    "))
            excerpt = (doc.get("content") or "").strip().replace("\n", " ")
            print(indent(f"Excerpt: {excerpt[:220]}...", prefix="    "))
            print()

        print("→ Generating answer with citations...")
        answer, citations = await generate_answer(
            query=query,
            documents=documents,
            language=language,
        )

        print("\n===== AI Answer Snippet =====")
        print(answer[:1000])
        print("\n===== Citations =====")
        if citations:
            for cite in citations:
                print(f"- {cite.get('source')} ({cite.get('reference')}) → {cite.get('url')}")
        else:
            print("No citations returned. Verify document metadata contains official references.")


def main() -> None:
    load_dotenv()

    parser = argparse.ArgumentParser(description="Verify Mo7ami RAG pipeline")
    parser.add_argument("query", help="User query to test")
    parser.add_argument("--language", default="ar", help="Language hint (ar or fr)")
    parser.add_argument("--top-k", type=int, default=5, help="Number of chunks to retrieve")
    args = parser.parse_args()

    missing_env = [
        env for env in ("DATABASE_URL", "OPENAI_API_KEY") if not os.getenv(env)
    ]
    if missing_env:
        print("🚫 Missing required environment variables:", ", ".join(missing_env))
        print("Set them in your .env before running this verification.")
        sys.exit(1)

    asyncio.run(verify(args.query, args.language, args.top_k))


if __name__ == "__main__":
    main()

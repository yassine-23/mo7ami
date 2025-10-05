#!/usr/bin/env python3
"""
Database Ingestion Script for Mo7ami
Ingests processed legal documents into Supabase with vector embeddings
With retry logic, rate limit handling, and progress checkpointing
"""

import os
import sys
import json
import asyncio
import time
from pathlib import Path
from typing import List, Dict
from datetime import datetime
from dotenv import load_dotenv
import openai
from openai import RateLimitError, APIError, APITimeoutError
from supabase import create_client, Client
from tqdm import tqdm
import hashlib

# Load environment variables
load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Embedding configuration
EMBEDDING_MODEL = "text-embedding-3-large"
EMBEDDING_DIMENSIONS = 1536
CHUNK_SIZE = 500  # characters

# Retry configuration
MAX_RETRIES = 5
INITIAL_RETRY_DELAY = 1  # seconds
MAX_RETRY_DELAY = 60  # seconds

class LegalDocumentIngester:
    """Ingest legal documents into database with embeddings"""

    def __init__(self, checkpoint_file: Path = None):
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not set in environment")
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise ValueError("Supabase credentials not set in environment")

        self.openai_client = openai.OpenAI(
            api_key=OPENAI_API_KEY,
            timeout=30.0,  # 30 second timeout
            max_retries=0  # We handle retries ourselves
        )
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        self.checkpoint_file = checkpoint_file or Path("/tmp/ingestion_checkpoint.json")
        self.checkpoint_data = self.load_checkpoint()

    def load_checkpoint(self) -> Dict:
        """Load checkpoint from file"""
        if self.checkpoint_file.exists():
            try:
                with open(self.checkpoint_file, 'r') as f:
                    data = json.load(f)
                    # Convert lists back to sets
                    return {
                        "processed_chunks": set(data.get("processed_chunks", [])),
                        "completed_documents": set(data.get("completed_documents", []))
                    }
            except Exception as e:
                print(f"⚠️  Could not load checkpoint: {e}")
        return {"processed_chunks": set(), "completed_documents": set()}

    def save_checkpoint(self):
        """Save checkpoint to file"""
        try:
            # Convert sets to lists for JSON serialization
            checkpoint_copy = {
                "processed_chunks": list(self.checkpoint_data["processed_chunks"]),
                "completed_documents": list(self.checkpoint_data["completed_documents"]),
                "last_updated": datetime.now().isoformat()
            }
            with open(self.checkpoint_file, 'w') as f:
                json.dump(checkpoint_copy, f, indent=2)
        except Exception as e:
            print(f"⚠️  Could not save checkpoint: {e}")

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using OpenAI with retry logic"""
        retry_delay = INITIAL_RETRY_DELAY

        for attempt in range(MAX_RETRIES):
            try:
                response = self.openai_client.embeddings.create(
                    model=EMBEDDING_MODEL,
                    input=text,
                    dimensions=EMBEDDING_DIMENSIONS
                )
                return response.data[0].embedding

            except RateLimitError as e:
                if attempt < MAX_RETRIES - 1:
                    wait_time = min(retry_delay * (2 ** attempt), MAX_RETRY_DELAY)
                    print(f"⏳ Rate limit hit, waiting {wait_time}s... (attempt {attempt + 1}/{MAX_RETRIES})")
                    time.sleep(wait_time)
                else:
                    print(f"❌ Rate limit exceeded after {MAX_RETRIES} attempts: {e}")
                    return None

            except APITimeoutError as e:
                if attempt < MAX_RETRIES - 1:
                    wait_time = min(retry_delay * (2 ** attempt), MAX_RETRY_DELAY)
                    print(f"⏳ API timeout, retrying in {wait_time}s... (attempt {attempt + 1}/{MAX_RETRIES})")
                    time.sleep(wait_time)
                else:
                    print(f"❌ API timeout after {MAX_RETRIES} attempts: {e}")
                    return None

            except APIError as e:
                if attempt < MAX_RETRIES - 1:
                    wait_time = min(retry_delay * (2 ** attempt), MAX_RETRY_DELAY)
                    print(f"⏳ API error, retrying in {wait_time}s... (attempt {attempt + 1}/{MAX_RETRIES})")
                    time.sleep(wait_time)
                else:
                    print(f"❌ API error after {MAX_RETRIES} attempts: {e}")
                    return None

            except Exception as e:
                print(f"❌ Unexpected error generating embedding: {e}")
                return None

        return None

    def chunk_text(self, text: str, chunk_size: int = CHUNK_SIZE) -> List[str]:
        """Split text into chunks for embedding"""
        # Split by sentences first
        sentences = text.replace('\n', ' ').split('. ')

        chunks = []
        current_chunk = ""

        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue

            # Add period back if it was removed
            if not sentence.endswith('.'):
                sentence += '.'

            # Check if adding this sentence would exceed chunk size
            if len(current_chunk) + len(sentence) > chunk_size:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence
            else:
                current_chunk += " " + sentence if current_chunk else sentence

        # Add remaining chunk
        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks

    def create_document_id(self, code_name: str, article_num: str) -> str:
        """Create unique document ID"""
        text = f"{code_name}_{article_num}".lower()
        text = text.replace(" ", "_").replace("-", "_")
        return hashlib.md5(text.encode()).hexdigest()[:16]

    async def ingest_document(self, doc_data: Dict) -> Dict:
        """Ingest a single legal document"""
        try:
            metadata = doc_data['metadata']

            # Create legal document record
            doc_record = {
                "id": self.create_document_id(metadata['name'], metadata.get('official_ref', '')),
                "title": metadata['name'],
                "title_ar": metadata.get('name_ar', ''),
                "domain": metadata['domain'],
                "language": doc_data['language'],
                "official_ref": metadata['official_ref'],
                "publication_date": None,  # Would need to parse from official_ref
                "content": doc_data.get('raw_text_preview', ''),
                "metadata": {
                    "total_articles": doc_data['total_articles'],
                    "source_file": metadata['filename'],
                    "priority": metadata.get('priority', 99)
                }
            }

            # Upsert document
            doc_result = self.supabase.table('legal_documents').upsert(doc_record).execute()
            document_id = doc_result.data[0]['id']

            print(f"   📄 Created document: {metadata['name']} (ID: {document_id})")

            # Process articles
            articles = doc_data.get('articles', [])
            total_chunks = 0

            for article in tqdm(articles, desc=f"   Processing articles", leave=False):
                # Create chunks from article content
                chunks = self.chunk_text(article['content'])

                for chunk_idx, chunk_text in enumerate(chunks):
                    # Create unique chunk ID
                    chunk_id = f"{document_id}_art{article['article_number']}_chunk{chunk_idx}"

                    # Skip if already processed (checkpoint)
                    if chunk_id in self.checkpoint_data.get("processed_chunks", set()):
                        total_chunks += 1
                        continue

                    # Generate embedding
                    embedding = self.generate_embedding(chunk_text)

                    if not embedding:
                        print(f"⚠️  Skipping chunk {chunk_id} - embedding failed")
                        continue

                    # Create chunk record
                    chunk_record = {
                        "id": chunk_id,
                        "document_id": document_id,
                        "content": chunk_text,
                        "language": article['language'],
                        "article_number": article['article_number'],
                        "embedding": embedding,
                        "metadata": {
                            "title": article.get('title'),
                            "page_number": article.get('page_number'),
                            "chunk_index": chunk_idx,
                            "total_chunks": len(chunks),
                            "code_name": article['code_name'],
                            "official_ref": article['official_ref']
                        }
                    }

                    # Insert chunk
                    try:
                        self.supabase.table('document_chunks').upsert(chunk_record).execute()
                        total_chunks += 1

                        # Update checkpoint
                        if "processed_chunks" not in self.checkpoint_data:
                            self.checkpoint_data["processed_chunks"] = set()
                        self.checkpoint_data["processed_chunks"].add(chunk_id)

                        # Save checkpoint every 10 chunks
                        if total_chunks % 10 == 0:
                            self.save_checkpoint()

                    except Exception as e:
                        print(f"❌ Failed to insert chunk {chunk_id}: {e}")

            print(f"   ✅ Ingested {len(articles)} articles, {total_chunks} chunks")

            # Mark document as completed
            if "completed_documents" not in self.checkpoint_data:
                self.checkpoint_data["completed_documents"] = set()
            self.checkpoint_data["completed_documents"].add(document_id)
            self.save_checkpoint()

            return {
                "success": True,
                "document_id": document_id,
                "articles": len(articles),
                "chunks": total_chunks
            }

        except Exception as e:
            print(f"   ❌ Error ingesting document: {e}")
            self.save_checkpoint()  # Save progress even on error
            return {
                "success": False,
                "error": str(e)
            }

    async def ingest_all_documents(self, processed_dir: Path):
        """Ingest all processed documents"""
        print("=" * 80)
        print("💾 Mo7ami Database Ingestion Pipeline (Enhanced)")
        print("=" * 80)

        # Load extraction summary
        summary_path = processed_dir / "extraction_summary.json"
        if not summary_path.exists():
            print(f"❌ Extraction summary not found: {summary_path}")
            print("   Run extract-legal-text.py first")
            return False

        with open(summary_path, 'r', encoding='utf-8') as f:
            summary = json.load(f)

        # Check for existing checkpoint
        if self.checkpoint_data.get("completed_documents"):
            print(f"\n🔄 Resuming from checkpoint ({len(self.checkpoint_data['completed_documents'])} documents completed)")
            print(f"   {len(self.checkpoint_data.get('processed_chunks', []))} chunks already processed\n")

        print(f"\n📚 Total documents to ingest: {summary['successful']}")
        print(f"📄 Total articles: {summary['total_articles']}\n")

        results = []

        # Process each document
        for result in summary['results']:
            if not result.get('success'):
                continue

            doc_id = result['doc_id']

            # Skip if already completed
            if doc_id in self.checkpoint_data.get("completed_documents", set()):
                print(f"✅ Skipping {doc_id} (already completed)")
                continue

            processed_file = processed_dir / f"{doc_id}.json"

            if not processed_file.exists():
                print(f"⏭️  Skipping {doc_id} (file not found)")
                continue

            # Load processed data
            with open(processed_file, 'r', encoding='utf-8') as f:
                doc_data = json.load(f)

            # Ingest document
            print(f"\n📥 Ingesting: {doc_data['metadata']['name']}")
            ingest_result = await self.ingest_document(doc_data)
            results.append({
                "doc_id": doc_id,
                **ingest_result
            })

        # Summary
        print("\n" + "=" * 80)
        print("📊 Ingestion Summary")
        print("=" * 80)

        successful = sum(1 for r in results if r.get('success'))
        total_articles = sum(r.get('articles', 0) for r in results if r.get('success'))
        total_chunks = sum(r.get('chunks', 0) for r in results if r.get('success'))

        print(f"✅ Successfully ingested: {successful}/{len(results)} documents")
        print(f"📄 Total articles in database: {total_articles}")
        print(f"🧩 Total chunks with embeddings: {total_chunks}")

        # Breakdown
        print("\n📑 Ingestion breakdown:")
        for result in results:
            if result.get('success'):
                print(f"   • {result['doc_id']}: {result['articles']} articles, {result['chunks']} chunks")

        print("\n" + "=" * 80)
        print("✅ Ingestion complete! RAG pipeline ready.")
        print("=" * 80)

        return successful == len(results)

async def main():
    """Main ingestion function"""
    processed_dir = Path(__file__).parent.parent / "backend" / "data" / "processed"

    if not processed_dir.exists():
        print(f"❌ Processed data directory not found: {processed_dir}")
        print("   Run extract-legal-text.py first")
        return False

    ingester = LegalDocumentIngester()
    success = await ingester.ingest_all_documents(processed_dir)

    return success

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Ingestion interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)

#!/usr/bin/env python3
"""
Legal Text Extractor for Mo7ami
Extracts and parses legal text from downloaded PDFs
Handles both Arabic and French legal documents
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import fitz  # PyMuPDF
from dataclasses import dataclass
from tqdm import tqdm

@dataclass
class LegalArticle:
    """Represents a parsed legal article"""
    article_number: str
    title: Optional[str]
    content: str
    language: str
    page_number: int
    code_name: str
    official_ref: str

class LegalTextExtractor:
    """Extract and parse legal text from PDFs"""

    def __init__(self):
        self.article_patterns = {
            'fr': [
                r'Article\s+(\d+(?:\s*-\s*\d+)?)\s*:?\s*(.+?)(?=Article\s+\d+|$)',  # Article 123
                r'Art\.\s*(\d+(?:\s*-\s*\d+)?)\s*:?\s*(.+?)(?=Art\.\s*\d+|$)',      # Art. 123
                r'Article\s+premier\s*:?\s*(.+?)(?=Article\s+\d+|$)',                # Article premier
            ],
            'ar': [
                r'المادة\s+(\d+(?:\s*-\s*\d+)?)\s*:?\s*(.+?)(?=المادة\s+\d+|$)',    # المادة 123
                r'الفصل\s+(\d+(?:\s*-\s*\d+)?)\s*:?\s*(.+?)(?=الفصل\s+\d+|$)',     # الفصل 123
                r'المادة\s+الأولى\s*:?\s*(.+?)(?=المادة\s+\d+|$)',                 # المادة الأولى
            ]
        }

    def extract_text_from_pdf(self, pdf_path: Path) -> str:
        """Extract all text from PDF"""
        try:
            doc = fitz.open(pdf_path)
            full_text = ""

            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text()
                full_text += f"\n--- Page {page_num + 1} ---\n{text}"

            doc.close()
            return full_text

        except Exception as e:
            print(f"❌ Error extracting text from {pdf_path}: {e}")
            return ""

    def detect_language(self, text: str) -> str:
        """Detect if text is primarily Arabic or French"""
        arabic_chars = len(re.findall(r'[\u0600-\u06FF]', text))
        latin_chars = len(re.findall(r'[a-zA-Z]', text))

        return 'ar' if arabic_chars > latin_chars else 'fr'

    def parse_articles(
        self,
        text: str,
        code_name: str,
        official_ref: str,
        language: str = 'auto'
    ) -> List[LegalArticle]:
        """Parse legal text into individual articles"""

        if language == 'auto':
            language = self.detect_language(text)

        articles = []
        patterns = self.article_patterns.get(language, self.article_patterns['fr'])

        # Split by pages first
        pages = text.split('--- Page')

        for page_idx, page_text in enumerate(pages):
            if not page_text.strip():
                continue

            # Try each pattern
            for pattern in patterns:
                matches = re.finditer(pattern, page_text, re.DOTALL | re.MULTILINE)

                for match in matches:
                    if len(match.groups()) >= 2:
                        article_num = match.group(1).strip()
                        content = match.group(2).strip()
                    elif len(match.groups()) == 1:
                        # Article premier / المادة الأولى
                        article_num = "1" if language == 'fr' else "١"
                        content = match.group(1).strip()
                    else:
                        continue

                    # Extract title if present (usually first line)
                    title = None
                    content_lines = content.split('\n')
                    if len(content_lines) > 1 and len(content_lines[0]) < 150:
                        title = content_lines[0].strip()
                        content = '\n'.join(content_lines[1:]).strip()

                    # Clean content
                    content = self.clean_text(content)

                    if content and len(content) > 20:  # Minimum content length
                        articles.append(LegalArticle(
                            article_number=article_num,
                            title=title,
                            content=content,
                            language=language,
                            page_number=page_idx + 1,
                            code_name=code_name,
                            official_ref=official_ref
                        ))

        return articles

    def clean_text(self, text: str) -> str:
        """Clean extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)

        # Remove page numbers
        text = re.sub(r'\bPage\s+\d+\b', '', text)
        text = re.sub(r'\d+\s*/\s*\d+', '', text)

        # Remove headers/footers
        text = re.sub(r'Bulletin Officiel.*?\n', '', text)
        text = re.sub(r'B\.O\.\s+\d+.*?\n', '', text)

        return text.strip()

    def extract_structured_content(
        self,
        pdf_path: Path,
        metadata: Dict
    ) -> Dict:
        """Extract structured content from legal PDF"""

        print(f"\n📖 Processing: {metadata['name']}")
        print(f"   File: {pdf_path}")

        # Extract raw text
        raw_text = self.extract_text_from_pdf(pdf_path)

        if not raw_text:
            return {"success": False, "error": "Failed to extract text"}

        # Detect language
        language = self.detect_language(raw_text)
        print(f"   Detected language: {language.upper()}")

        # Parse articles
        articles = self.parse_articles(
            raw_text,
            metadata['name'],
            metadata['official_ref'],
            language
        )

        print(f"   ✅ Extracted {len(articles)} articles")

        return {
            "success": True,
            "metadata": metadata,
            "language": language,
            "total_articles": len(articles),
            "articles": [
                {
                    "article_number": art.article_number,
                    "title": art.title,
                    "content": art.content,
                    "language": art.language,
                    "page_number": art.page_number,
                    "code_name": art.code_name,
                    "official_ref": art.official_ref
                }
                for art in articles
            ],
            "raw_text_length": len(raw_text),
            "raw_text_preview": raw_text[:500]
        }

def main():
    """Main extraction function"""
    print("=" * 80)
    print("📚 Mo7ami Legal Text Extraction Pipeline")
    print("=" * 80)

    # Directories
    data_dir = Path(__file__).parent.parent / "backend" / "data" / "legal_docs"
    output_dir = Path(__file__).parent.parent / "backend" / "data" / "processed"
    output_dir.mkdir(parents=True, exist_ok=True)

    # Load metadata
    metadata_path = data_dir / "metadata.json"
    if not metadata_path.exists():
        print(f"❌ Metadata file not found: {metadata_path}")
        print("   Run download-legal-docs.py first")
        return False

    with open(metadata_path, 'r', encoding='utf-8') as f:
        all_metadata = json.load(f)

    extractor = LegalTextExtractor()
    results = []

    # Process each document
    for doc_id, metadata in tqdm(all_metadata.items(), desc="Processing documents"):
        pdf_path = data_dir / metadata['filename']

        if not pdf_path.exists():
            print(f"\n⏭️  Skipping {metadata['name']} (file not found)")
            continue

        # Extract content
        result = extractor.extract_structured_content(pdf_path, metadata)
        results.append({
            "doc_id": doc_id,
            **result
        })

        # Save individual processed file
        output_file = output_dir / f"{doc_id}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"   💾 Saved to: {output_file}")

    # Summary
    print("\n" + "=" * 80)
    print("📊 Extraction Summary")
    print("=" * 80)

    total_articles = sum(r.get('total_articles', 0) for r in results if r.get('success'))
    successful = sum(1 for r in results if r.get('success'))

    print(f"✅ Successfully processed: {successful}/{len(results)} documents")
    print(f"📄 Total articles extracted: {total_articles}")

    # Print breakdown
    print("\n📑 Articles by document:")
    for result in results:
        if result.get('success'):
            print(f"   • {result['metadata']['name']}: {result['total_articles']} articles")

    # Save summary
    summary_path = output_dir / "extraction_summary.json"
    with open(summary_path, 'w', encoding='utf-8') as f:
        json.dump({
            "total_documents": len(results),
            "successful": successful,
            "total_articles": total_articles,
            "results": results
        }, f, ensure_ascii=False, indent=2)

    print(f"\n💾 Summary saved to: {summary_path}")
    print("=" * 80)

    return successful == len(results)

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)

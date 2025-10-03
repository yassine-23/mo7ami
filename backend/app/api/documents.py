"""
Document management API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from loguru import logger

from app.core.database import get_db

router = APIRouter()


class DocumentMetadata(BaseModel):
    """Legal document metadata"""

    id: str
    title: str
    title_ar: Optional[str] = None
    title_fr: Optional[str] = None
    domain: str
    document_type: str
    official_ref: str
    publication_date: Optional[str] = None


class DocumentListResponse(BaseModel):
    """Document list response"""

    documents: List[DocumentMetadata]
    total: int


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    domain: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db=Depends(get_db),
):
    """List all legal documents in the corpus"""
    # TODO: Implement with database query
    return DocumentListResponse(documents=[], total=0)


@router.get("/{document_id}")
async def get_document(document_id: str, db=Depends(get_db)):
    """Get a specific legal document"""
    # TODO: Implement
    return {"id": document_id, "content": "..."}


@router.get("/domains")
async def list_domains():
    """List all available legal domains"""
    domains = [
        {"id": "penal", "name_ar": "القانون الجنائي", "name_fr": "Droit pénal"},
        {"id": "civil", "name_ar": "القانون المدني", "name_fr": "Droit civil"},
        {"id": "family", "name_ar": "قانون الأسرة", "name_fr": "Droit de la famille"},
        {"id": "labor", "name_ar": "قانون الشغل", "name_fr": "Droit du travail"},
        {
            "id": "commercial",
            "name_ar": "القانون التجاري",
            "name_fr": "Droit commercial",
        },
        {"id": "property", "name_ar": "قانون العقاري", "name_fr": "Droit immobilier"},
        {
            "id": "administrative",
            "name_ar": "القانون الإداري",
            "name_fr": "Droit administratif",
        },
        {
            "id": "procurement",
            "name_ar": "الصفقات العمومية",
            "name_fr": "Marchés publics",
        },
        {"id": "tax", "name_ar": "القانون الضريبي", "name_fr": "Droit fiscal"},
        {
            "id": "consumer",
            "name_ar": "حماية المستهلك",
            "name_fr": "Protection des consommateurs",
        },
        {
            "id": "data_protection",
            "name_ar": "حماية المعطيات",
            "name_fr": "Protection des données",
        },
        {"id": "traffic", "name_ar": "قانون السير", "name_fr": "Code de la route"},
    ]
    return {"domains": domains}

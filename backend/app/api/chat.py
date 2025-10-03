"""
Chat API endpoints
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from loguru import logger

from app.services.retrieval import retrieve_relevant_documents
from app.services.generation import generate_answer
from app.core.database import get_db

router = APIRouter()


class ChatMessage(BaseModel):
    """Chat message model"""

    role: str  # user or assistant
    content: str
    language: Optional[str] = "ar"


class ChatRequest(BaseModel):
    """Chat request model"""

    message: str
    language: Optional[str] = "ar"
    conversation_id: Optional[str] = None
    voice_input: bool = False


class Citation(BaseModel):
    """Citation model"""

    source: str
    article: Optional[str] = None
    reference: str
    url: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat response model"""

    answer: str
    language: str
    citations: List[Citation]
    conversation_id: str
    processing_time: float


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, db = Depends(get_db)):
    """
    Main chat endpoint - processes user query and returns AI response with citations
    """
    try:
        logger.info(f"Received chat request in {request.language}: {request.message[:50]}...")

        # Step 1: Retrieve relevant documents
        relevant_docs = await retrieve_relevant_documents(
            query=request.message, language=request.language, top_k=5
        )

        # Step 2: Generate answer with citations
        answer, citations = await generate_answer(
            query=request.message,
            documents=relevant_docs,
            language=request.language,
        )

        # Step 3: Save to conversation history (if logged in)
        # TODO: Implement conversation saving

        return ChatResponse(
            answer=answer,
            language=request.language,
            citations=citations,
            conversation_id=request.conversation_id or "temp",
            processing_time=0.0,
        )

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_conversation_history(user_id: str, db = Depends(get_db)):
    """Get user's conversation history"""
    # TODO: Implement
    return {"conversations": []}


@router.delete("/history/{conversation_id}")
async def delete_conversation(conversation_id: str, db = Depends(get_db)):
    """Delete a conversation"""
    # TODO: Implement
    return {"success": True}

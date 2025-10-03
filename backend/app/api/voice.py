"""
Voice API endpoints for Speech-to-Text and Text-to-Speech
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from loguru import logger

from app.services.voice import transcribe_audio, synthesize_speech

router = APIRouter()


class TranscriptionRequest(BaseModel):
    """Transcription request"""

    language: Optional[str] = "ar"


class TranscriptionResponse(BaseModel):
    """Transcription response"""

    text: str
    language: str
    confidence: float


class TTSRequest(BaseModel):
    """Text-to-Speech request"""

    text: str
    language: str = "ar"
    voice: str = "female"  # male or female
    speed: float = 1.0


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe(
    file: UploadFile = File(...), language: Optional[str] = "ar"
):
    """
    Transcribe audio to text (Speech-to-Text)
    Supports Arabic (including Darija) and French
    """
    try:
        logger.info(f"Received audio file for transcription: {file.filename}")

        # Read audio file
        audio_data = await file.read()

        # Transcribe using Google Cloud Speech or Azure
        text, confidence = await transcribe_audio(audio_data, language)

        return TranscriptionResponse(
            text=text, language=language, confidence=confidence
        )

    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/synthesize")
async def synthesize(request: TTSRequest):
    """
    Synthesize speech from text (Text-to-Speech)
    Returns audio stream in MP3 format
    """
    try:
        logger.info(f"Synthesizing speech: {request.text[:50]}...")

        # Generate audio
        audio_stream = await synthesize_speech(
            text=request.text,
            language=request.language,
            voice=request.voice,
            speed=request.speed,
        )

        return StreamingResponse(audio_stream, media_type="audio/mpeg")

    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def list_voices(language: Optional[str] = None):
    """List available TTS voices"""
    voices = {
        "ar": [
            {"id": "ar-female-1", "name": "Maryam", "gender": "female"},
            {"id": "ar-male-1", "name": "Ahmed", "gender": "male"},
        ],
        "fr": [
            {"id": "fr-female-1", "name": "Marie", "gender": "female"},
            {"id": "fr-male-1", "name": "Pierre", "gender": "male"},
        ],
    }

    if language:
        return {"voices": voices.get(language, [])}

    return {"voices": voices}

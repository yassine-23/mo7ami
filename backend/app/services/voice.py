"""
Voice services: Speech-to-Text and Text-to-Speech
Now using 100% OpenAI (Whisper + TTS-1-HD)

This module provides a compatibility layer for the new OpenAI voice implementation.
Google Cloud Speech services are NO LONGER USED.
"""

from typing import Tuple
from io import BytesIO
from loguru import logger

# Import OpenAI voice service as the primary implementation
from app.services.voice_openai import (
    transcribe_audio as transcribe_audio_openai,
    synthesize_speech as synthesize_speech_openai,
    detect_language_from_audio,
    get_available_voices,
    clear_voice_cache,
)


async def transcribe_audio(audio_data: bytes, language: str = "ar") -> Tuple[str, float]:
    """
    Transcribe audio to text using OpenAI Whisper-1.

    This function now uses OpenAI Whisper exclusively.
    Google Cloud Speech-to-Text is deprecated.

    Args:
        audio_data: Audio file bytes
        language: Target language (ar or fr)

    Returns:
        Tuple of (transcribed text, confidence score)
    """
    try:
        logger.info(f"[OpenAI Whisper] Transcribing audio in {language}")
        return await transcribe_audio_openai(audio_data, language)

    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise


async def synthesize_speech(
    text: str, language: str = "ar", voice: str = "female", speed: float = 1.0
) -> BytesIO:
    """
    Synthesize speech from text using OpenAI TTS-1-HD.

    This function now uses OpenAI TTS exclusively.
    Google Cloud Text-to-Speech is deprecated.

    Args:
        text: Text to synthesize
        language: Target language (ar or fr)
        voice: Voice profile (female/male/default/neutral)
        speed: Speech speed (0.25 to 4.0)

    Returns:
        Audio stream in MP3 format
    """
    try:
        logger.info(f"[OpenAI TTS] Synthesizing speech in {language}")

        # Map old voice parameter to new system
        voice_profile = voice if voice in ["default", "male", "female", "neutral"] else "default"

        return await synthesize_speech_openai(text, language, voice_profile, speed)

    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise


# Legacy function names (deprecated but maintained for compatibility)
async def transcribe_audio_google(audio_data: bytes, language: str = "ar") -> Tuple[str, float]:
    """
    DEPRECATED: Google Cloud Speech is no longer used.
    This function now redirects to OpenAI Whisper.
    """
    logger.warning(
        "transcribe_audio_google() is deprecated. "
        "Google Cloud Speech is no longer used. "
        "Using OpenAI Whisper instead."
    )
    return await transcribe_audio(audio_data, language)


async def synthesize_speech_google(
    text: str, language: str = "ar", voice: str = "female", speed: float = 1.0
) -> BytesIO:
    """
    DEPRECATED: Google Cloud TTS is no longer used.
    This function now redirects to OpenAI TTS.
    """
    logger.warning(
        "synthesize_speech_google() is deprecated. "
        "Google Cloud TTS is no longer used. "
        "Using OpenAI TTS-1-HD instead."
    )
    return await synthesize_speech(text, language, voice, speed)


# Azure alternatives (not implemented - OpenAI is preferred)
async def transcribe_audio_azure(
    audio_data: bytes, language: str = "ar"
) -> Tuple[str, float]:
    """
    Alternative transcription using Azure Speech Services.
    NOT IMPLEMENTED - OpenAI Whisper is the recommended solution.
    """
    logger.error("Azure Speech Services not implemented. Use OpenAI Whisper.")
    raise NotImplementedError("Azure Speech Services not implemented. Use OpenAI Whisper.")


async def synthesize_speech_azure(
    text: str, language: str = "ar", voice: str = "female", speed: float = 1.0
) -> BytesIO:
    """
    Alternative TTS using Azure Speech Services.
    NOT IMPLEMENTED - OpenAI TTS is the recommended solution.
    """
    logger.error("Azure Speech Services not implemented. Use OpenAI TTS.")
    raise NotImplementedError("Azure Speech Services not implemented. Use OpenAI TTS.")

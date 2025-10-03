"""
Voice services: Speech-to-Text and Text-to-Speech
"""

from typing import Tuple
from io import BytesIO
from loguru import logger
from google.cloud import speech, texttospeech
from app.core.config import settings


async def transcribe_audio(audio_data: bytes, language: str = "ar") -> Tuple[str, float]:
    """
    Transcribe audio to text using Google Cloud Speech-to-Text

    Args:
        audio_data: Audio file bytes
        language: Target language (ar or fr)

    Returns:
        Tuple of (transcribed text, confidence score)
    """
    try:
        logger.info(f"Transcribing audio in {language}")

        # Initialize client
        client = speech.SpeechClient()

        # Configure recognition
        language_code = "ar-MA" if language == "ar" else "fr-FR"

        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=16000,
            language_code=language_code,
            enable_automatic_punctuation=True,
            model="default",
            use_enhanced=True,
        )

        audio = speech.RecognitionAudio(content=audio_data)

        # Perform recognition
        response = client.recognize(config=config, audio=audio)

        if not response.results:
            return "", 0.0

        # Get first result
        result = response.results[0]
        transcript = result.alternatives[0].transcript
        confidence = result.alternatives[0].confidence

        logger.info(f"Transcription: {transcript[:50]}... (confidence: {confidence})")
        return transcript, confidence

    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise


async def synthesize_speech(
    text: str, language: str = "ar", voice: str = "female", speed: float = 1.0
) -> BytesIO:
    """
    Synthesize speech from text using Google Cloud Text-to-Speech

    Args:
        text: Text to synthesize
        language: Target language (ar or fr)
        voice: Voice gender (male or female)
        speed: Speech speed (0.25 to 4.0)

    Returns:
        Audio stream in MP3 format
    """
    try:
        logger.info(f"Synthesizing speech in {language}")

        # Initialize client
        client = texttospeech.TextToSpeechClient()

        # Build synthesis input
        synthesis_input = texttospeech.SynthesisInput(text=text)

        # Configure voice
        language_code = "ar-XA" if language == "ar" else "fr-FR"
        voice_gender = (
            texttospeech.SsmlVoiceGender.FEMALE
            if voice == "female"
            else texttospeech.SsmlVoiceGender.MALE
        )

        voice_config = texttospeech.VoiceSelectionParams(
            language_code=language_code, ssml_gender=voice_gender
        )

        # Configure audio
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3, speaking_rate=speed
        )

        # Perform synthesis
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice_config, audio_config=audio_config
        )

        # Return audio stream
        audio_stream = BytesIO(response.audio_content)
        audio_stream.seek(0)

        logger.info("Speech synthesis completed")
        return audio_stream

    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise


# Alternative: Azure Cognitive Services implementation
async def transcribe_audio_azure(
    audio_data: bytes, language: str = "ar"
) -> Tuple[str, float]:
    """
    Alternative transcription using Azure Speech Services
    """
    # TODO: Implement Azure Speech SDK
    pass


async def synthesize_speech_azure(
    text: str, language: str = "ar", voice: str = "female", speed: float = 1.0
) -> BytesIO:
    """
    Alternative TTS using Azure Speech Services
    """
    # TODO: Implement Azure Speech SDK
    pass

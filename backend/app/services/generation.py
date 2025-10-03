"""
Answer generation service using LLM with RAG
"""

from typing import List, Dict, Any, Tuple
from loguru import logger
import openai
from app.core.config import settings


SYSTEM_PROMPTS = {
    "ar": """أنت محامي، مساعد قانوني ذكي متخصص في القانون المغربي. مهمتك هي:
1. تقديم معلومات قانونية دقيقة ومفيدة
2. الاستشهاد بالمصادر الرسمية (الجريدة الرسمية، القوانين، المراسيم)
3. شرح النصوص القانونية بطريقة مبسطة وواضحة
4. التحدث بالدارجة المغربية عند الحاجة مع الحفاظ على الدقة
5. التنبيه دائماً بأن هذه معلومات تعليمية وليست استشارة قانونية مهنية

قواعد مهمة:
- استخدم فقط المعلومات الموجودة في المصادر المقدمة
- اذكر رقم المادة والقانون في كل إجابة
- إذا لم تجد المعلومة، قل ذلك بوضوح
- لا تخترع معلومات قانونية""",
    "fr": """Tu es Mo7ami, un assistant juridique intelligent spécialisé dans le droit marocain. Ta mission est de:
1. Fournir des informations juridiques précises et utiles
2. Citer les sources officielles (Bulletin Officiel, lois, décrets)
3. Expliquer les textes juridiques de manière simple et claire
4. Parler en français standard tout en restant accessible
5. Toujours rappeler que ce sont des informations éducatives, pas des conseils juridiques professionnels

Règles importantes:
- N'utiliser que les informations présentes dans les sources fournies
- Citer l'article et la loi dans chaque réponse
- Si l'information n'est pas trouvée, le dire clairement
- Ne jamais inventer d'informations juridiques""",
}


async def generate_answer(
    query: str, documents: List[Dict[str, Any]], language: str = "ar"
) -> Tuple[str, List[Dict[str, str]]]:
    """
    Generate answer using LLM with retrieved documents

    Args:
        query: User's question
        documents: Retrieved relevant documents
        language: Response language (ar or fr)

    Returns:
        Tuple of (answer text, list of citations)
    """
    try:
        logger.info(f"Generating answer for query in {language}")

        # Build context from retrieved documents
        context = build_context(documents, language)

        # Build user prompt
        user_prompt = f"""السؤال: {query}

المصادر القانونية المتاحة:
{context}

الرجاء تقديم إجابة دقيقة مع الاستشهاد بالمصادر."""

        if language == "fr":
            user_prompt = f"""Question: {query}

Sources juridiques disponibles:
{context}

Veuillez fournir une réponse précise avec citations."""

        # Call OpenAI API
        client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPTS[language]},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,  # Lower temperature for factual responses
            max_tokens=1500,
        )

        answer = response.choices[0].message.content

        # Extract citations from documents
        citations = extract_citations(documents)

        logger.info("Answer generated successfully")
        return answer, citations

    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise


def build_context(documents: List[Dict[str, Any]], language: str) -> str:
    """Build context string from retrieved documents"""
    context_parts = []

    for i, doc in enumerate(documents, 1):
        source = doc.get("source", "Unknown")
        ref = doc.get("official_ref", "")
        content = doc.get("content", "")

        context_parts.append(f"[{i}] {source} ({ref}):\n{content}\n")

    return "\n".join(context_parts)


def extract_citations(documents: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """Extract citations from documents"""
    citations = []

    for doc in documents:
        citation = {
            "source": doc.get("source", ""),
            "article": doc.get("article", ""),
            "reference": doc.get("official_ref", ""),
            "url": doc.get("url", ""),
        }
        citations.append(citation)

    return citations

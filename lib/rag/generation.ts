/**
 * Answer Generation Service for Mo7ami RAG Pipeline
 * Generates legal answers using retrieved context and OpenAI GPT
 */

import OpenAI from 'openai';
import { retrieveRelevantChunks, detectLegalDomain, type RetrievedChunk } from './retrieval';
import { detectLanguage, type Language } from '../utils/language';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const GPT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';  // Pinned to stable model (GPT-5 doesn't exist)

export interface Citation {
  source: string;
  article?: string;
  reference: string;
  url?: string;
  similarity?: number;
}

export interface GeneratedAnswer {
  answer: string;
  citations: Citation[];
  language: Language;
  retrievedChunks: number;
  domain: string | null;
}

const SYSTEM_PROMPTS = {
  ar: `أنت محامي، مساعد قانوني ذكي ومتخصص في القانون المغربي. أنت خبير في جميع القوانين المغربية مع معرفة عميقة بالتفاصيل.

قواعد مهمة للأرقام:
- اكتب الأرقام بالحروف: "خمس سنوات" وليس "5 سنوات"
- للمواد القانونية: "المادة خمسمائة وخمسة" وليس "المادة 505"
- للسنوات: "ألف وتسعمائة واثنان وستون" وليس "1962"
- للمبالغ: "مائتان درهم" وليس "200 درهم"

مهمتك - كن مفصلاً ودقيقاً:
- قدم معلومات قانونية شاملة ومفصلة بناءً على **النصوص القانونية المقدمة لك**
- استشهد **فقط** بالمواد والفصول الموجودة في السياق المعطى
- إذا لم يكن السياق كافياً، اذكر ذلك بوضوح
- اذكر أرقام المواد الدقيقة، الفصول، الفقرات
- قدم إرشادات عملية خطوة بخطوة
- استخدم الدارجة المغربية بطريقة احترافية

هيكل الإجابة المطلوب:

1️⃣ **الإجابة المباشرة** (جملتين)

2️⃣ **التفاصيل القانونية:**
   - استشهد بالنصوص القانونية من السياق المعطى
   - اشرح الشروط والإجراءات
   - المدد الزمنية والمبالغ إن وجدت

3️⃣ **الإجراءات العملية:** (إذا كانت مطبقة)

4️⃣ **مثال توضيحي:** (إذا كان مفيداً)

5️⃣ **📚 المصادر القانونية:**
اذكر المصادر بناءً على السياق المعطى بهذا الشكل:
• **[اسم القانون]**
  - المادة/الفصل: [رقم بالحروف]
  - المرجع الرسمي: [ظهير/قانون]
  - الرابط: https://www.sgg.gov.ma

6️⃣ **سؤال المتابعة:**
"واش بغيتي تفاصيل أكثر على شي نقطة معينة؟ 😊"

⚠️ تحذير قانوني (فقط للحالات الشخصية):
"⚖️ ملاحظة: هذه معلومات قانونية عامة للتعليم. لحالتك الخاصة، يُنصح باستشارة محامي مختص."`,

  fr: `Tu es Mo7ami, un assistant juridique intelligent spécialisé dans le droit marocain. Tu es un expert de toutes les lois marocaines avec une connaissance approfondie des détails.

Règles importantes pour les chiffres:
- Écris les nombres en lettres: "cinq ans" et non "5 ans"
- Pour les articles de loi: "l'article cinq cent cinq" et non "l'article 505"
- Pour les années: "mille neuf cent soixante-deux" et non "1962"
- Pour les montants: "deux cents dirhams" et non "200 dirhams"

Ta mission - Sois détaillé et précis:
- Fournis des informations juridiques complètes basées **uniquement sur les textes légaux fournis**
- Cite **seulement** les articles présents dans le contexte donné
- Si le contexte n'est pas suffisant, indique-le clairement
- Mentionne les numéros d'articles précis, chapitres, paragraphes
- Fournis des conseils pratiques étape par étape
- Utilise le français de manière professionnelle

Structure de réponse requise:

1️⃣ **Réponse directe** (deux phrases)

2️⃣ **Détails juridiques:**
   - Cite les textes légaux du contexte fourni
   - Explique les conditions et procédures
   - Délais et montants si applicables

3️⃣ **Procédures pratiques:** (si applicable)

4️⃣ **Exemple concret:** (si utile)

5️⃣ **📚 Sources juridiques:**
Mentionne les sources basées sur le contexte:
• **[Nom de la loi]**
  - Article/Chapitre: [numéro en lettres]
  - Référence officielle: [Dahir/Loi]
  - Lien: https://www.sgg.gov.ma

6️⃣ **Question de suivi:**
"Voulez-vous plus de détails sur un point précis? 😊"

⚖️ Avertissement (uniquement pour cas personnels):
"⚖️ Note: Ces informations juridiques sont générales et à but éducatif. Pour votre cas spécifique, consultez un avocat."`,
};

/**
 * Generate legal answer with RAG (Retrieval-Augmented Generation)
 */
export async function generateLegalAnswer(
  query: string,
  language?: Language
): Promise<GeneratedAnswer> {
  try {
    // Detect language if not provided
    const detectedLanguage = language || detectLanguage(query);

    // Detect legal domain for better filtering
    const domain = detectLegalDomain(query);

    // Retrieve relevant document chunks
    const retrievedChunks = await retrieveRelevantChunks(query, {
      matchThreshold: 0.30,  // Increased for quality matching (was 0.05)
      matchCount: 10,
      filterDomain: domain,
    });

    // If no chunks found, provide a fallback response
    if (retrievedChunks.length === 0) {
      return generateFallbackResponse(query, detectedLanguage, domain);
    }

    // Build context from retrieved chunks
    const context = buildContext(retrievedChunks, detectedLanguage);

    // Generate answer using GPT with context
    const answer = await generateAnswerWithContext(query, context, detectedLanguage);

    // Extract citations from retrieved chunks
    const citations = extractCitations(retrievedChunks);

    return {
      answer,
      citations,
      language: detectedLanguage,
      retrievedChunks: retrievedChunks.length,
      domain: domain || null,
    };
  } catch (error) {
    console.error('Error generating legal answer:', error);
    throw new Error('Failed to generate answer');
  }
}

/**
 * Build context from retrieved chunks
 */
function buildContext(chunks: RetrievedChunk[], language: Language): string {
  const intro =
    language === 'ar'
      ? 'النصوص القانونية المرجعية:\n\n'
      : 'Textes juridiques de référence:\n\n';

  const contextParts = chunks.map((chunk, index) => {
    const article = chunk.articleNumber
      ? language === 'ar'
        ? `المادة ${chunk.articleNumber}`
        : `Article ${chunk.articleNumber}`
      : '';

    return `[${index + 1}] ${article}\n${chunk.content}\n(Similarité: ${(chunk.similarity * 100).toFixed(1)}%)`;
  });

  return intro + contextParts.join('\n\n---\n\n');
}

/**
 * Generate answer using GPT with retrieved context
 */
async function generateAnswerWithContext(
  query: string,
  context: string,
  language: Language
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[language];

  const userPrompt =
    language === 'ar'
      ? `السياق القانوني:\n\n${context}\n\n---\n\nالسؤال: ${query}\n\nأجب بناءً على النصوص القانونية المقدمة فقط. إذا لم يكن السياق كافياً، اذكر ذلك.`
      : `Contexte juridique:\n\n${context}\n\n---\n\nQuestion: ${query}\n\nRéponds en te basant uniquement sur les textes fournis. Si le contexte n'est pas suffisant, indique-le.`;

  const response = await openai.chat.completions.create({
    model: GPT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content || '';
}

/**
 * Extract citations from retrieved chunks
 */
function extractCitations(chunks: RetrievedChunk[]): Citation[] {
  return chunks.map((chunk) => ({
    source: chunk.metadata?.documentTitle || 'القانون المغربي',
    article: chunk.articleNumber || undefined,
    reference: chunk.metadata?.officialRef || 'مصادر رسمية',
    url: 'https://www.sgg.gov.ma',
    similarity: chunk.similarity,
  }));
}

/**
 * Generate fallback response when no documents are retrieved
 */
async function generateFallbackResponse(
  query: string,
  language: Language,
  domain: string | null | undefined
): Promise<GeneratedAnswer> {
  const fallbackMessage =
    language === 'ar'
      ? `عذراً، لم أجد نصوصاً قانونية محددة في قاعدة البيانات تتطابق مع سؤالك.

يمكنني مساعدتك بمعلومات عامة، لكن أنصحك بـ:
1. إعادة صياغة السؤال بطريقة أكثر تحديداً
2. استشارة محامٍ مختص للحصول على معلومات دقيقة
3. زيارة موقع الأمانة العامة للحكومة: https://www.sgg.gov.ma

واش بغيتي تعيد صياغة السؤال؟`
      : `Désolé, je n'ai pas trouvé de textes juridiques spécifiques dans la base de données correspondant à votre question.

Je peux vous aider avec des informations générales, mais je vous conseille de:
1. Reformuler la question de manière plus précise
2. Consulter un avocat pour des informations exactes
3. Visiter le site du Secrétariat Général du Gouvernement: https://www.sgg.gov.ma

Voulez-vous reformuler votre question?`;

  return {
    answer: fallbackMessage,
    citations: [
      {
        source: language === 'ar' ? 'الأمانة العامة للحكومة' : 'Secrétariat Général du Gouvernement',
        reference: language === 'ar' ? 'مصادر رسمية' : 'Sources officielles',
        url: 'https://www.sgg.gov.ma',
      },
    ],
    language,
    retrievedChunks: 0,
    domain: domain || null,
  };
}

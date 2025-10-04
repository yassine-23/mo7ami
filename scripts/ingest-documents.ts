/**
 * Legal Document Ingestion Script
 * Processes legal documents and generates embeddings for RAG
 */

import { PrismaClient } from '@prisma/client';
import { generateEmbedding, generateEmbeddings } from '../lib/rag/embeddings';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface LegalDocumentInput {
  title: string;
  titleAr?: string;
  titleFr?: string;
  domain: string;
  documentType: string;
  officialRef: string;
  publicationDate?: Date;
  language: string;
  contentAr?: string;
  contentFr?: string;
  metadata?: any;
}

/**
 * Chunk text into smaller pieces for embedding
 */
function chunkText(text: string, maxChunkSize: number = 500): string[] {
  const sentences = text.split(/[.。؟?!]+/).filter((s) => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if ((currentChunk + ' ' + trimmedSentence).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = trimmedSentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Extract article numbers from legal text
 */
function extractArticleNumber(text: string): string | null {
  // Arabic patterns
  const arPattern = /(?:المادة|الفصل)\s*(\d+)/;
  const arMatch = text.match(arPattern);
  if (arMatch) return arMatch[1];

  // French patterns
  const frPattern = /(?:Article|Chapitre)\s*(\d+)/i;
  const frMatch = text.match(frPattern);
  if (frMatch) return frMatch[1];

  return null;
}

/**
 * Ingest a legal document
 */
export async function ingestDocument(docInput: LegalDocumentInput) {
  console.log(`📄 Ingesting: ${docInput.title}`);

  try {
    // Create document record
    const document = await prisma.legalDocument.create({
      data: {
        title: docInput.title,
        titleAr: docInput.titleAr,
        titleFr: docInput.titleFr,
        domain: docInput.domain,
        documentType: docInput.documentType,
        officialRef: docInput.officialRef,
        publicationDate: docInput.publicationDate,
        language: docInput.language,
        content: docInput.contentAr || docInput.contentFr || '',
        contentAr: docInput.contentAr,
        contentFr: docInput.contentFr,
        metadata: docInput.metadata || {},
        isActive: true,
      },
    });

    console.log(`✅ Document created: ${document.id}`);

    // Process Arabic content
    if (docInput.contentAr) {
      await processAndEmbedContent(
        document.id,
        docInput.contentAr,
        'ar',
        docInput.title,
        docInput.officialRef
      );
    }

    // Process French content
    if (docInput.contentFr) {
      await processAndEmbedContent(
        document.id,
        docInput.contentFr,
        'fr',
        docInput.title,
        docInput.officialRef
      );
    }

    console.log(`✅ Document ingested successfully: ${docInput.title}\n`);

    return document;
  } catch (error) {
    console.error(`❌ Error ingesting document: ${docInput.title}`, error);
    throw error;
  }
}

/**
 * Process content into chunks and generate embeddings
 */
async function processAndEmbedContent(
  documentId: string,
  content: string,
  language: string,
  documentTitle: string,
  officialRef: string
) {
  console.log(`  🔄 Processing ${language} content...`);

  // Split into chunks
  const chunks = chunkText(content, 500);
  console.log(`  📊 Created ${chunks.length} chunks`);

  // Generate embeddings in batches
  const batchSize = 20;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    console.log(`  🧮 Generating embeddings for chunks ${i + 1}-${i + batch.length}...`);

    const embeddings = await generateEmbeddings(batch);

    // Save chunks with embeddings
    const chunkRecords = batch.map((chunkContent, batchIndex) => {
      const chunkIndex = i + batchIndex;
      const articleNumber = extractArticleNumber(chunkContent);

      return {
        documentId,
        chunkIndex,
        content: chunkContent,
        language,
        embedding: embeddings[batchIndex].embedding,
        articleNumber,
        metadata: {
          documentTitle,
          officialRef,
          tokenCount: embeddings[batchIndex].tokenCount,
        },
      };
    });

    await prisma.documentChunk.createMany({
      data: chunkRecords as any, // Type assertion for embedding field
    });

    console.log(`  ✅ Saved ${batch.length} chunks with embeddings`);
  }
}

/**
 * Ingest sample legal documents
 */
async function ingestSampleDocuments() {
  console.log('🚀 Starting Legal Document Ingestion\n');

  const sampleDocuments: LegalDocumentInput[] = [
    {
      title: 'القانون الجنائي المغربي - السرقة',
      titleAr: 'القانون الجنائي - السرقة',
      titleFr: 'Code Pénal - Vol',
      domain: 'penal',
      documentType: 'code',
      officialRef: 'ظهير 1-59-413',
      publicationDate: new Date('1962-11-26'),
      language: 'both',
      contentAr: `المادة 505
السرقة هي اختلاس مال مملوك للغير بنية تملكه.

الفصل 506
يعاقب على السرقة بالحبس من سنة واحدة إلى خمس سنوات وغرامة من مائتين إلى خمسمائة درهم.

الفصل 507
إذا ارتكبت السرقة في الطريق العام أو في مركبة مخصصة لنقل المسافرين أو ارتكبت ليلا، أو من طرف شخصين أو أكثر، أو بواسطة التسلق أو الكسر، أو باستعمال مفاتيح مزورة، تكون العقوبة الحبس من سنتين إلى عشر سنوات وغرامة من مائتين وخمسين إلى ألفي درهم.`,
      contentFr: `Article 505
Le vol est la soustraction frauduleuse de la chose d'autrui avec intention de se l'approprier.

Article 506
Le vol est puni de l'emprisonnement d'un an à cinq ans et d'une amende de deux cents à cinq cents dirhams.

Article 507
Si le vol a été commis sur un chemin public ou dans un véhicule destiné au transport de voyageurs, ou commis de nuit, ou par deux personnes ou plus, ou à l'aide d'escalade ou d'effraction, ou à l'aide de clés fausses, la peine est l'emprisonnement de deux à dix ans et une amende de deux cent cinquante à deux mille dirhams.`,
      metadata: {
        bulletinOfficiel: 'BO 2602 - 5 juin 1963',
        lastUpdated: '2023',
      },
    },
    {
      title: 'مدونة الأسرة - الزواج',
      titleAr: 'مدونة الأسرة - الزواج',
      titleFr: 'Code de la Famille - Mariage',
      domain: 'family',
      documentType: 'code',
      officialRef: 'قانون 70-03',
      publicationDate: new Date('2004-02-05'),
      language: 'both',
      contentAr: `المادة 4
الزواج ميثاق تراض وترابط شرعي بين رجل وامرأة على وجه الدوام، غايته الإحصان والعفاف وإنشاء أسرة مستقرة.

المادة 5
يجب توفر الشروط التالية لصحة الزواج:
- أهلية الزوج والزوجة
- عدم الإكراه
- ولي الزوجة عند الاقتضاء
- سماع العدلين التصريح بالإيجاب والقبول من الزوجين وتوثيقه
- الصداق

المادة 19
سن الأهلية للزواج ثمان عشرة سنة شمسية كاملة للفتى والفتاة معا.`,
      contentFr: `Article 4
Le mariage est un pacte fondé sur le consentement mutuel en vue d'une union légale et durable entre un homme et une femme. Il a pour but la fidélité réciproque, la pureté et la fondation d'une famille stable.

Article 5
Les conditions de validité du mariage sont:
- La capacité juridique des deux époux
- L'absence de contrainte
- Le tuteur de l'épouse le cas échéant
- L'audition par deux adouls de la déclaration de l'offre et de l'acceptation des deux époux et leur documentation
- La dot

Article 19
L'âge de la capacité au mariage est de dix-huit années grégoriennes révolues pour le garçon et la fille.`,
      metadata: {
        bulletinOfficiel: 'BO 5184 - 5 février 2004',
        lastUpdated: '2004',
      },
    },
    {
      title: 'مدونة الشغل - عقد الشغل',
      titleAr: 'مدونة الشغل - عقد الشغل',
      titleFr: 'Code du Travail - Contrat de travail',
      domain: 'labor',
      documentType: 'code',
      officialRef: 'قانون 65-99',
      publicationDate: new Date('2003-09-11'),
      language: 'both',
      contentAr: `المادة 6
عقد الشغل هو اتفاق يلتزم بمقتضاه الأجير بأن يشتغل لدى المشغل تحت إشرافه أو إدارته مقابل أجر.

المادة 16
يبرم عقد الشغل لمدة غير محددة أو لمدة محددة أو لإنجاز شغل معين.

المادة 34
تحدد مدة الشغل العادية ب2288 ساعة في السنة أو 191 ساعة في الشهر أو 44 ساعة في الأسبوع.

المادة 35
في المقاولات الفلاحية لا يمكن أن تتجاوز مدة الشغل 2496 ساعة في السنة.`,
      contentFr: `Article 6
Le contrat de travail est un accord par lequel le salarié s'engage à travailler pour l'employeur sous sa supervision ou sa direction en contrepartie d'un salaire.

Article 16
Le contrat de travail est conclu pour une durée indéterminée, pour une durée déterminée ou pour accomplir un travail déterminé.

Article 34
La durée normale de travail est fixée à 2288 heures par an ou 191 heures par mois ou 44 heures par semaine.

Article 35
Dans les entreprises agricoles, la durée de travail ne peut dépasser 2496 heures par an.`,
      metadata: {
        bulletinOfficiel: 'BO 5167 - 8 décembre 2003',
        lastUpdated: '2003',
      },
    },
  ];

  for (const doc of sampleDocuments) {
    await ingestDocument(doc);
  }

  console.log('✅ All documents ingested successfully!');
}

/**
 * Main execution
 */
if (require.main === module) {
  ingestSampleDocuments()
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { ingestSampleDocuments, ingestDocument };

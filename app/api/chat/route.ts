/**
 * Chat API Route with RAG
 * Handles legal question answering using Retrieval-Augmented Generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateLegalAnswer } from '@/lib/rag/generation';
import { getServiceSupabase } from '@/lib/supabase/client';
import { detectLanguage } from '@/lib/utils/language';

export async function POST(request: NextRequest) {
  try {
    const { message, language, conversation_id } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Detect language if not provided
    const detectedLanguage = language || detectLanguage(message);

    // Generate answer using RAG pipeline
    const result = await generateLegalAnswer(message, detectedLanguage);

    const responseTime = Date.now() - startTime;

    // Log analytics (fire and forget)
    logQueryAnalytics({
      query: message,
      language: detectedLanguage,
      domain: result.domain,
      responseTime,
      successful: true,
    }).catch((err) => console.error('Failed to log analytics:', err));

    // Save conversation to database if conversation_id is provided
    if (conversation_id) {
      saveConversation(conversation_id, message, result).catch((err) =>
        console.error('Failed to save conversation:', err)
      );
    }

    return NextResponse.json({
      answer: result.answer,
      language: result.language,
      citations: result.citations,
      conversation_id: conversation_id || 'anonymous',
      processing_time: responseTime / 1000,
      retrieved_chunks: result.retrievedChunks,
      domain: result.domain,
    });
  } catch (error) {
    console.error('Error in chat API:', error);

    return NextResponse.json(
      {
        error: 'Failed to process question',
        answer: 'عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.',
        citations: [],
      },
      { status: 500 }
    );
  }
}

/**
 * Log query analytics to database
 */
async function logQueryAnalytics(data: {
  query: string;
  language: string;
  domain: string | null;
  responseTime: number;
  successful: boolean;
}) {
  try {
    const supabase = getServiceSupabase();

    const { error } = await supabase.from('query_analytics').insert({
      query: data.query,
      language: data.language,
      domain: data.domain,
      responseTime: data.responseTime,
      voiceUsed: false,
      successful: data.successful,
    });

    if (error) {
      console.error('Error logging analytics:', error);
    }
  } catch (error) {
    console.error('Failed to log analytics:', error);
  }
}

/**
 * Save conversation to database
 */
async function saveConversation(
  conversationId: string,
  userMessage: string,
  result: any
) {
  try {
    const supabase = getServiceSupabase();

    // Save user message
    await supabase.from('messages').insert({
      conversationId,
      role: 'user',
      content: userMessage,
      language: result.language,
      voiceUsed: false,
    });

    // Save assistant message
    await supabase.from('messages').insert({
      conversationId,
      role: 'assistant',
      content: result.answer,
      language: result.language,
      citations: result.citations,
      voiceUsed: false,
    });
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
}

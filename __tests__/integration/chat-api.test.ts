/**
 * Integration tests for chat API endpoint
 * Tests the full RAG pipeline with real database and OpenAI
 */

import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';

describe('Chat API Integration Tests', () => {
  describe('POST /api/chat', () => {
    it('should return legal answer for French query', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'vol',
          language: 'fr',
          conversation_id: 'test-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('answer');
      expect(data).toHaveProperty('citations');
      expect(data).toHaveProperty('language', 'fr');
      expect(data.retrievedChunks).toBeGreaterThan(0);
      expect(Array.isArray(data.citations)).toBe(true);
    }, 30000);

    it('should return legal answer for Arabic query', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'شنو كايقول القانون على السرقة؟',
          language: 'ar',
          conversation_id: 'test-456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('answer');
      expect(data).toHaveProperty('citations');
      expect(data).toHaveProperty('language', 'ar');
      expect(data.retrievedChunks).toBeGreaterThan(0);
      expect(data.answer).toContain('قانون');  // Should contain Arabic word "law"
    }, 30000);

    it('should auto-detect language when not provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Comment créer une société?',
          conversation_id: 'test-789',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.language).toBe('fr');
      expect(data.retrievedChunks).toBeGreaterThan(0);
    }, 30000);

    it('should return 400 for empty message', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: '',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should detect correct legal domain', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'شركة',  // Company in Arabic
          language: 'ar',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.domain).toBe('commercial_law');
    }, 30000);

    it('should include citations with source and article', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: 'travail',  // Work/Labor in French
          language: 'fr',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.citations.length).toBeGreaterThan(0);

      const firstCitation = data.citations[0];
      expect(firstCitation).toHaveProperty('source');
      expect(firstCitation).toHaveProperty('reference');
      expect(firstCitation).toHaveProperty('similarity');
      expect(typeof firstCitation.similarity).toBe('number');
    }, 30000);
  });
});

describe('Chat API Error Handling', () => {
  it('should handle invalid JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it('should return fallback response when no chunks found', async () => {
    const request = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'quantum physics alien technology',  // Unrelated topic
        language: 'en',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.retrievedChunks).toBe(0);
    expect(data.answer).toContain('لم أجد');  // "I didn't find" in Arabic
  }, 30000);
});

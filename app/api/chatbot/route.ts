import { NextRequest, NextResponse } from 'next/server';
import {
  buildSafeRAGContext,
  answerWithGroundedRAG,
  FALLBACK_UNAVAILABLE_MSG,
} from '@/services/ai.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = (body?.question || '').trim();
    const simulateFailure = Boolean(body?.simulateFailure);

    if (!question) {
      return NextResponse.json(
        {
          reply: 'Silakan isi pertanyaan Anda terlebih dahulu.',
          isFallback: false,
        },
        { status: 400 }
      );
    }

    if (simulateFailure) {
      return NextResponse.json({
        reply: FALLBACK_UNAVAILABLE_MSG,
        isFallback: true,
      });
    }

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

    // Jika API Key Gemini tersedia, panggil LLM API eksternal dengan konteks RAG
    if (apiKey) {
      try {
        const rag = await buildSafeRAGContext();
        const prompt = `Anda adalah Chatbot AI resmi Yayasan Darunnisa Hajj & Umrah Travel (Modul M5.1).
Jawab pertanyaan calon jamaah HANYA berdasarkan konteks data katalog dan agregat di bawah ini.
ATURAN KETAT:
1. Jangan pernah mengarang harga, jadwal, atau fasilitas di luar konteks.
2. Jika pertanyaan tidak dapat dijawab dari konteks di bawah ini, atau menanyakan hal di luar layanan Umrah/Haji Darunnisa, jawab PERSIS dengan kalimat berikut:
"${FALLBACK_UNAVAILABLE_MSG}"
3. Gunakan Bahasa Indonesia yang sopan, ringkas, dan jelas.

${rag.contextText}

Pertanyaan Pengguna: ${question}`;

        const llmRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 350,
              },
            }),
          }
        );

        if (llmRes.ok) {
          const json = await llmRes.json();
          const text =
            json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (text) {
            return NextResponse.json({
              reply: text,
              isFallback: text.includes(FALLBACK_UNAVAILABLE_MSG),
            });
          }
        }
      } catch (llmErr) {
        console.warn('[ChatbotAPI] External LLM error, using Grounded RAG:', llmErr);
      }
    }

    // Grounded RAG dari live database Supabase (paket, keberangkatan, agregat jamaah tanpa data pribadi)
    const grounded = await answerWithGroundedRAG(question);
    return NextResponse.json({
      reply: grounded.reply,
      isFallback: grounded.isFallback,
    });
  } catch {
    return NextResponse.json({
      reply: FALLBACK_UNAVAILABLE_MSG,
      isFallback: true,
    });
  }
}

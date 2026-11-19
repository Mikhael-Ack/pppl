'use client';

import { useState } from 'react';
import { X, Send, Bot, Phone, ClipboardCheck } from 'lucide-react';
import { PaketItem } from '@/types/package.types';
import { FALLBACK_UNAVAILABLE_MSG } from '@/services/ai.service';

interface ChatbotWidgetProps {
  packages: PaketItem[];
  onOpenRegister?: () => void;
}

interface Message {
  sender: 'bot' | 'user';
  text: string;
  isFallback?: boolean;
}

export default function ChatbotWidget({
  packages,
  onOpenRegister,
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [emptyWarn, setEmptyWarn] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Assalamu’alaikum! Saya Chatbot AI Informasi Paket Darunnisa Travel (UI-05 • M5.1). Silakan tanyakan seputar paket Umrah & Haji, harga, hotel, maskapai, atau jadwal keberangkatan.',
    },
  ]);

  const quickPrompts = [
    'Apa saja paket yang tersedia?',
    'Berapa harga paket reguler 9 hari?',
    'Rincian hotel & maskapai?',
    'Jadwal keberangkatan & sisa kuota?',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend !== undefined ? textToSend : input).trim();

    // Aturan M5.1 SD Bab 4.2: JIKA pertanyaan kosong -> minta pengguna mengisi pertanyaan
    if (!query) {
      setEmptyWarn('Silakan isi pertanyaan Anda terlebih dahulu.');
      return;
    }

    setEmptyWarn(null);
    const nextMessages: Message[] = [
      ...messages,
      { sender: 'user', text: query },
    ];
    setMessages(nextMessages);
    if (textToSend === undefined) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: FALLBACK_UNAVAILABLE_MSG,
            isFallback: true,
          },
        ]);
      } else {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: data.reply || FALLBACK_UNAVAILABLE_MSG,
            isFallback: Boolean(data.isFallback),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: FALLBACK_UNAVAILABLE_MSG,
          isFallback: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#0b2242] hover:bg-[#133666] text-amber-300 p-3.5 rounded-full shadow-2xl border border-amber-400/50 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          aria-label="Tanya Chatbot AI"
        >
          <Bot className="w-5 h-5 text-amber-300 animate-bounce" />
          <span className="text-xs font-semibold text-white pr-1 hidden sm:inline">
            Chatbot AI Paket (UI-05)
          </span>
        </button>
      )}

      {/* Chat Window (Sesuai Gambar 6.1 UI-05 SD v1.1) */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 flex flex-col h-[480px] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-[#0b2242] text-white p-3.5 border-b border-[#163d73] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#133666] border border-[#21579e] flex items-center justify-center text-amber-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Chatbot AI Info Paket</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                </div>
                <div className="text-[10px] text-blue-200/80">
                  LLM API + RAG Katalog Live (UI-05 &bull; M5.1)
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
              aria-label="Tutup Chatbot"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-[#0b2242] text-amber-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[84%] leading-relaxed space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-[#0b2242] text-white rounded-tr-xs'
                      : m.isFallback
                      ? 'bg-amber-50 text-slate-900 border border-amber-300 rounded-tl-xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs'
                  }`}
                >
                  <div>{m.text}</div>
                  {m.isFallback && (
                    <div className="pt-1.5 border-t border-amber-200/80 flex flex-wrap gap-1.5">
                      <a
                        href={`https://wa.me/${
                          process.env.NEXT_PUBLIC_TRAVEL_WA || '6281234567890'
                        }?text=${encodeURIComponent(
                          'Assalamu’alaikum Staf Yayasan Darunnisa, saya ingin berkonsultasi mengenai informasi paket Umrah/Haji.'
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-[#0b2242] text-amber-300 font-semibold px-2.5 py-1 rounded-lg text-[10px]"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Hubungi Staf WA</span>
                      </a>
                      {onOpenRegister && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            onOpenRegister();
                          }}
                          className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[10px] cursor-pointer"
                        >
                          <ClipboardCheck className="w-3 h-3" />
                          <span>Ajukan Minat (UI-03)</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-[#0b2242] text-amber-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  AI
                </div>
                <div className="p-2.5 rounded-2xl bg-white text-slate-500 border border-slate-200 text-[11px] italic">
                  Mengambil konteks katalog paket (RAG)...
                </div>
              </div>
            )}
          </div>

          {emptyWarn && (
            <div className="px-3 py-1.5 bg-rose-50 border-t border-rose-200 text-rose-800 text-[11px] font-medium">
              {emptyWarn}
            </div>
          )}

          {/* Quick Prompts */}
          <div className="p-2 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[10px]">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-950 border border-slate-200 rounded-lg cursor-pointer transition-colors shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (emptyWarn) setEmptyWarn(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tulis pertanyaan..."
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800 transition-colors"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSend()}
              className="bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-bold px-3 py-2 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1 text-xs"
              aria-label="Kirim"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

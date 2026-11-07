'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { PaketItem } from '@/types/package.types';
import { formatRupiah } from '@/utils/formatters';

interface ChatbotWidgetProps {
  packages: PaketItem[];
  onOpenRegister?: () => void;
}

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

export default function ChatbotWidget({ packages, onOpenRegister }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Assalamu’alaikum! Saya asisten pintar Darunnisa Travel (M5.1). Ada yang bisa saya bantu terkait jadwal keberangkatan, rincian hotel bintang 5, atau simulasi paket umrah/haji khusus?',
    },
  ]);

  const quickPrompts = [
    'Berapa harga paket reguler 9 hari?',
    'Apa saja hotel di Makkah & Madinah?',
    'Jadwal keberangkatan terdekat?',
    'Bagaimana cara mendaftar?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    // Add user message
    const newMessages: Message[] = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    if (!textToSend) setInput('');

    // AI Knowledge Retrieval Logic (RAG from packages context according to SD M5.1)
    setTimeout(() => {
      const lower = query.toLowerCase();
      let reply = '';

      if (lower.includes('reguler') || lower.includes('9 hari') || lower.includes('termurah') || lower.includes('hemat')) {
        const pkg = packages.find((p) => p.durasi_hari === 9) || packages[0];
        reply = `Paket ${pkg.nama_paket} berbiaya ${formatRupiah(pkg.harga)} dengan durasi ${pkg.durasi_hari} hari. Menggunakan maskapai ${pkg.maskapai} dan akomodasi ${pkg.hotel}.`;
      } else if (lower.includes('turki') || lower.includes('plus') || lower.includes('12 hari')) {
        const pkg = packages.find((p) => p.program === 'umrah' && p.durasi_hari === 12);
        if (pkg) {
          reply = `Paket ${pkg.nama_paket} berbiaya ${formatRupiah(pkg.harga)}. Menggunakan ${pkg.maskapai} dengan ziarah Istanbul & Cappadocia.`;
        } else {
          reply = 'Tersedia Paket Umrah Plus Turki 12 Hari dengan Turkish Airlines dan hotel bintang 5.';
        }
      } else if (lower.includes('haji') || lower.includes('khusus') || lower.includes('kuota')) {
        const pkg = packages.find((p) => p.program === 'haji_khusus');
        if (pkg) {
          reply = `Paket ${pkg.nama_paket} berbiaya ${formatRupiah(pkg.harga)} (durasi ${pkg.durasi_hari} hari) dengan ${pkg.maskapai}. Menggunakan kuota resmi Kemenag RI tanpa masa tunggu bertahun-tahun.`;
        } else {
          reply = 'Yayasan Darunnisa menyelenggarakan Haji Khusus (PIHK 912/2023) dengan kuota resmi Kemenag RI.';
        }
      } else if (lower.includes('hotel') || lower.includes('penginapan') || lower.includes('makkah') || lower.includes('madinah')) {
        reply = 'Seluruh paket Darunnisa menggunakan hotel bintang 5 ring 1 di pelataran Masjidil Haram (Pullman Zamzam, Safwah Royal Orchid, Fairmont) dan Nabawi (Al Aqeeq, Dallah Taibah) tanpa tanjakan demi kenyamanan jemaah.';
      } else if (lower.includes('jadwal') || lower.includes('berangkat') || lower.includes('kapan')) {
        reply = 'Jadwal keberangkatan aktif tahun 1448 H / 2027 dibuka pada Maret (Umrah Reguler), April (Umrah Plus), dan Juni (Haji Khusus). Anda bisa melihat detail kuota di tabel katalog.';
      } else if (lower.includes('daftar') || lower.includes('cara') || lower.includes('syarat')) {
        reply = 'Pendaftaran awal sangat mudah! Anda cukup mengisi formulir daring di menu "Daftar Online" (Nama, No WA, Alamat, dan Pilihan Paket). Staf operasional Darunnisa akan menghubungi untuk verifikasi.';
      } else if (lower.includes('cicil') || lower.includes('bayar') || lower.includes('dp')) {
        reply = 'Pembayaran dapat dilakukan bertahap (cicilan). Cukup membayar DP pendaftaran awal, dan pelunasan dapat diselesaikan sebelum jadwal manasik dan keberangkatan.';
      } else {
        reply = 'Informasi spesifik tersebut belum tercatat di ringkasan data paket publik. Silakan klik tombol "Daftar Online" atau hubungi staf operasional Yayasan Darunnisa via WhatsApp di 0812-3456-7890.';
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 450);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#08221b] hover:bg-[#0c352a] text-amber-300 p-3.5 rounded-full shadow-2xl border border-emerald-500/40 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          aria-label="Tanya Chatbot AI"
        >
          <Bot className="w-5 h-5 text-amber-300 animate-bounce" />
          <span className="text-xs font-semibold text-white pr-1 hidden sm:inline">
            Tanya AI Paket (UI-05)
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 flex flex-col h-[460px] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-[#08221b] text-white p-3.5 border-b border-[#0d3329] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0e3b2f] border border-[#1b5544] flex items-center justify-center text-amber-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Asisten AI Darunnisa</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[10px] text-emerald-300/80">Informasi Paket &amp; Jadwal (M5.1)</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    D
                  </div>
                )}
                <div
                  className={`p-2.5 rounded-2xl max-w-[82%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-emerald-800 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[10px]">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-900 border border-slate-200 rounded-lg cursor-pointer transition-colors shrink-0"
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
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tanyakan jadwal, hotel, harga..."
              className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-emerald-800 transition-colors"
            />
            <button
              onClick={() => handleSend()}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 p-2 rounded-lg cursor-pointer transition-colors"
              aria-label="Kirim"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

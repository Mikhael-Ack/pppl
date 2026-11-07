'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PartnerMarquee from '@/components/PartnerMarquee';
import PackageList from '@/components/PackageList';
import PackageDetailModal from '@/components/PackageDetailModal';
import RegistrationModal from '@/components/RegistrationModal';
import ChatbotWidget from '@/components/ChatbotWidget';
import MLMatcher from '@/components/MLMatcher';
import MLPriceCalculator from '@/components/MLPriceCalculator';
import TestimonialMarquee from '@/components/TestimonialMarquee';
import Footer from '@/components/Footer';
import { PaketItem } from '@/types/package.types';
import { ClipboardCheck, Sparkles, ShieldCheck } from 'lucide-react';

interface HomePageClientProps {
  initialPackages: PaketItem[];
}

export default function HomePageClient({ initialPackages }: HomePageClientProps) {
  const [selectedDetail, setSelectedDetail] = useState<PaketItem | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState<PaketItem | null>(null);

  const handleOpenRegister = (paket?: PaketItem) => {
    setSelectedRegister(paket || null);
    setIsRegisterOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 overflow-x-hidden">
      {/* Navbar with Registration Modal Trigger */}
      <Navbar onOpenRegister={() => handleOpenRegister()} />

      <main className="flex-1 w-full">
        {/* Section 1: Hero Banner */}
        <Hero onOpenRegister={() => handleOpenRegister()} />

        {/* Section 2: Partner Marquee (Preserved) */}
        <PartnerMarquee />

        {/* Section 3: Katalog Paket Dinamis (UI-01) */}
        <PackageList
          initialPackages={initialPackages}
          onViewDetail={(pkg) => setSelectedDetail(pkg)}
          onRegister={(pkg) => handleOpenRegister(pkg)}
        />

        {/* Quick CTA Banner for Registration (UI-03 Anchor) */}
        <section id="daftar" className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-[#08221b] to-[#0f3d31] rounded-2xl p-6 sm:p-8 text-white border border-[#1a5646] flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-[#0e3b2f] border border-[#1b5544] px-3 py-0.5 rounded-full uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pendaftaran Awal Bebas Ribet (UI-03)</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Siap Melaksanakan Ibadah Umrah &amp; Haji Khusus?
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Kunci kuota kursi Anda sekarang tanpa dokumen sensitif di awal. Cukup isi nama, nomor WhatsApp, dan pilihan paket Anda, staf Yayasan Darunnisa akan memproses reservasi Anda.
              </p>
            </div>
            <button
              onClick={() => handleOpenRegister()}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-3 rounded-xl text-xs transition-colors cursor-pointer shrink-0 inline-flex items-center gap-2 shadow-xs"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Isi Formulir Minat Sekarang</span>
            </button>
          </div>
        </section>

        {/* Section 4: Feature ML 1 - Smart Matcher (UI-04) */}
        <div className="bg-slate-100/90 border-y border-slate-200">
          <MLMatcher />
        </div>

        {/* Section 5: Feature ML 2 - Kalkulator Biaya */}
        <MLPriceCalculator />

        {/* Section 6: Marquee Testimoni 2 Jalur (Preserved) */}
        <TestimonialMarquee />
      </main>

      {/* Floating Chatbot AI (UI-05) */}
      <ChatbotWidget
        packages={initialPackages}
        onOpenRegister={() => handleOpenRegister()}
      />

      {/* Modal Detail Paket (UI-02) */}
      <PackageDetailModal
        paket={selectedDetail}
        onClose={() => setSelectedDetail(null)}
        onSelectRegister={(pkg) => handleOpenRegister(pkg)}
      />

      {/* Modal Pengajuan Pendaftaran Daring (UI-03) */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        packages={initialPackages}
        selectedPackage={selectedRegister}
      />

      {/* Grounded Footer */}
      <Footer />
    </div>
  );
}

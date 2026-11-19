import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Sparkles, ClipboardCheck } from 'lucide-react';

interface HeroProps {
  onOpenRegister?: () => void;
}

export default function Hero({ onOpenRegister }: HeroProps) {
  return (
    <section className="bg-gradient-to-b from-[#0b2242] via-[#0e2a52] to-[#123463] text-white pt-10 pb-12 md:pt-16 md:pb-16 px-4 border-b border-[#1c4a8a]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Kolom Kiri: Informasi Layanan & Aksi */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-amber-300 bg-[#133666] border border-[#21579e] px-3.5 py-1 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Yayasan Darunnisa &bull; Musim 1448 H / 2026–2027</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-balance leading-[1.15] text-slate-100">
              Darunnisa Hajj &amp; Umrah Travel
            </h1>

            <p className="text-blue-100/90 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl text-pretty font-normal">
              Biro perjalanan Haji Khusus dan Umrah berafiliasi konsorsium KBIH sejak 1991. Fasilitas hotel bintang 5 pelataran Masjidil Haram dan Nabawi, penerbangan langsung Garuda &amp; Saudia tanpa transit, serta bimbingan muthawif bersertifikasi resmi.
            </p>

            <div className="pt-1 flex flex-wrap gap-3">
              <Link
                href="#jadwal"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold px-5 py-3 rounded-xl text-xs sm:text-sm transition-colors shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Lihat Jadwal Paket</span>
              </Link>

              {onOpenRegister ? (
                <button
                  onClick={onOpenRegister}
                  className="inline-flex items-center gap-2 bg-[#133666] hover:bg-[#1a4785] text-blue-50 border border-[#245ca6] font-medium px-5 py-3 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4 text-amber-300" />
                  <span>Pengajuan Pendaftaran</span>
                </button>
              ) : (
                <Link
                  href="#daftar"
                  className="inline-flex items-center gap-2 bg-[#133666] hover:bg-[#1a4785] text-blue-50 border border-[#245ca6] font-medium px-5 py-3 rounded-xl text-xs sm:text-sm transition-colors"
                >
                  <ClipboardCheck className="w-4 h-4 text-amber-300" />
                  <span>Pengajuan Pendaftaran</span>
                </Link>
              )}

              <Link
                href="#rekomendasi-ml"
                className="inline-flex items-center gap-2 bg-blue-950/70 hover:bg-[#133666] text-blue-100 border border-blue-800/70 font-medium px-4 py-3 rounded-xl text-xs sm:text-sm transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Pencocok AI</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-6 border-t border-[#1d4c8c] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-300 tabular-nums">
                  &lt; 100m
                </div>
                <div className="text-blue-100/80 text-[11px] mt-0.5">Jarak hotel ke pelataran masjid</div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-300 tabular-nums">
                  Direct Flight
                </div>
                <div className="text-blue-100/80 text-[11px] mt-0.5">Garuda &amp; Saudia tanpa transit</div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-300 tabular-nums">
                  Resmi Kemenag
                </div>
                <div className="text-blue-100/80 text-[11px] mt-0.5">PPIU U.412/2021 &bull; PIHK 912/2023</div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Foto Murni Dokumentasi Masjidil Haram */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-[#07162c]">
              <Image
                src="/images/masjidil-haram-night.jpg"
                alt="Dokumentasi Ibadah Haji & Umrah di Masjidil Haram Makkah"
                width={735}
                height={603}
                priority
                className="w-full h-auto object-cover block"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

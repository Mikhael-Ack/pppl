import Link from 'next/link';
import { ArrowDown, Calendar, Search } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-[#08221b] via-[#092921] to-[#0b3329] text-white pt-16 pb-14 md:pt-20 md:pb-18 px-4 border-b border-[#124235]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-300 bg-[#0e3b2f] border border-[#1b5544] px-3 py-1 rounded-full uppercase tracking-wider">
            <span>Musim Umroh 1448 H / 2026–2027</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance leading-[1.1] text-slate-100">
            Jadwal Resmi Umroh &amp; Haji Khusus
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl text-pretty font-normal">
            Hotel bintang 5 di pelataran Masjidil Haram dan Nabawi, penerbangan langsung Garuda Indonesia dan Saudia Airlines, serta bimbingan muthawif bersertifikasi Kemenag.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="#jadwal"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold px-5 py-3 rounded-xl text-xs sm:text-sm transition-colors"
            >
              <Calendar className="w-4 h-4" />
              <span>Lihat Daftar Paket</span>
            </Link>

            <Link
              href="#rekomendasi-ml"
              className="inline-flex items-center gap-2 bg-[#0e3b2f] hover:bg-[#134d3d] text-emerald-100 border border-[#1c5a48] font-medium px-5 py-3 rounded-xl text-xs sm:text-sm transition-colors"
            >
              <Search className="w-4 h-4 text-emerald-300" />
              <span>Pencocok Kebutuhan Kamar</span>
            </Link>
          </div>

          {/* Quick Metrics Bar (Tabular Nums) */}
          <div className="pt-8 border-t border-[#134437] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-200 tabular-nums">
                &lt; 100m
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5">Jarak hotel ke pintu masjid</div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-200 tabular-nums">
                Direct Flight
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5">Garuda &amp; Saudia tanpa transit</div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-300 tabular-nums">
                100% Legal
              </div>
              <div className="text-slate-300 text-[11px] mt-0.5">Terdaftar izin PPIU &amp; PIHK</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

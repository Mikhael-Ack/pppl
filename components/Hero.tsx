import Link from 'next/link';
import { Sparkles, Calendar, Calculator, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white py-16 md:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs px-3.5 py-1.5 rounded-full font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sistem Pemilihan Paket Cerdas Berbasis Machine Learning</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Ibadah Umroh Nyaman, Transparan, &amp; Sesuai Sunnah
          </h1>

          <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl">
            Penyelenggara Resmi Kemenag RI dengan jaminan fasilitas hotel terdekat ke pelataran masjid, maskapai direct penerbangan, serta pembimbing muthawif bersertifikasi.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 sm:gap-4">
            <Link
              href="#jadwal"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-md"
            >
              <Calendar className="w-4 h-4" />
              Lihat Jadwal Keberangkatan
            </Link>

            <Link
              href="#rekomendasi-ml"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-semibold px-5 py-3.5 rounded-xl text-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Rekomendasi Paket (ML)
            </Link>

            <Link
              href="#kalkulator-biaya"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-semibold px-5 py-3.5 rounded-xl text-sm transition-all"
            >
              <Calculator className="w-4 h-4" />
              Simulasi Biaya Musim
            </Link>
          </div>

          {/* Mini Highlights */}
          <div className="pt-6 border-t border-emerald-800/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Berangkat Berizin Resmi</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hotel Ring 1 &amp; Pelataran</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Bimbingan Sesuai Sunnah</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

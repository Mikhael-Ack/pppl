'use client';

import Link from 'next/link';
import { ShieldCheck, Phone } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#08221b] border-b border-[#0d3329] text-slate-100">
      {/* Top Banner Legalitas Resmi */}
      <div className="bg-[#051712] text-emerald-200/90 text-xs py-2 px-4 border-b border-emerald-950/80">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-[11px] sm:text-xs tracking-tight">
              Izin Kemenag RI: <strong className="text-amber-200/90 font-semibold">PPIU U.412/2021</strong> &bull; <strong className="text-amber-200/90 font-semibold">PIHK 912/2023</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-emerald-300/80">
            <span>Tervalidasi SISKOPATUH</span>
            <span className="text-emerald-900">•</span>
            <a href="tel:081234567890" className="flex items-center gap-1 text-slate-200 hover:text-amber-200 transition-colors">
              <Phone className="w-3 h-3 text-amber-300" />
              <span>0812-3456-7890</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0e3b2f] border border-[#1b5544] text-amber-300 font-serif font-bold flex items-center justify-center text-lg">
            M
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight leading-tight">
              Mitra Umroh Mandiri
            </div>
            <div className="text-[10px] text-emerald-300/70 tracking-wider uppercase font-medium">
              Biro Perjalanan Haji Khusus &amp; Umroh
            </div>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wide text-slate-300">
          <Link href="/#jadwal" className="hover:text-amber-200 transition-colors">
            Jadwal Keberangkatan
          </Link>
          <Link href="/#rekomendasi-ml" className="hover:text-amber-200 transition-colors">
            Pencocok Paket
          </Link>
          <Link href="/#kalkulator-biaya" className="hover:text-amber-200 transition-colors">
            Simulasi Biaya
          </Link>
          <Link href="/tracking" className="hover:text-amber-200 transition-colors">
            Lacak Dokumen
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/tracking"
            className="text-xs font-medium text-emerald-200 hover:text-white bg-[#0e3b2f] hover:bg-[#134e3e] border border-[#1a5646] px-3.5 py-2 rounded-lg transition-colors"
          >
            Lacak Berkas
          </Link>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20konsultasi%20paket%20umroh"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-lg transition-colors"
          >
            Konsultasi
          </a>
        </div>
      </div>
    </header>
  );
}

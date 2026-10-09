'use client';

import Link from 'next/link';
import { ShieldCheck, Phone, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      {/* Top Banner Legalitas Kemenag */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-2 px-4 border-b border-emerald-900">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              Izin Resmi Kemenag RI: <strong>PPIU No. U.412/2021 &amp; PIHK No. 912/2023</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-emerald-300 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Tersinkronisasi SISKOPATUH
            </span>
            <span className="hidden sm:inline">•</span>
            <a href="tel:081234567890" className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone className="w-3 h-3 text-amber-400" />
              Call Center: 0812-3456-7890
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
            M
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight text-base sm:text-lg">
              Mitra Umroh Mandiri
            </div>
            <div className="text-[11px] text-slate-500">
              Penyelenggara Haji Khusus &amp; Umroh Resmi
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/#jadwal" className="hover:text-emerald-700 transition-colors">
            Jadwal Paket
          </Link>
          <Link href="/#rekomendasi-ml" className="hover:text-emerald-700 transition-colors">
            Rekomendasi Cerdas (ML)
          </Link>
          <Link href="/#kalkulator-biaya" className="hover:text-emerald-700 transition-colors">
            Kalkulator Biaya
          </Link>
          <Link href="/tracking" className="hover:text-emerald-700 transition-colors">
            Cek Status Jemaah
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/tracking"
            className="text-xs md:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-lg transition-colors"
          >
            Tracking Jemaah
          </Link>
          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20ingin%20konsultasi%20paket%20umroh"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center text-xs md:text-sm font-semibold bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-lg transition-all shadow-xs"
          >
            Konsultasi WA
          </a>
        </div>
      </div>
    </header>
  );
}

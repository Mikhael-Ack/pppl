'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, ClipboardCheck } from 'lucide-react';
import FontSizeControl from './FontSizeControl';

interface NavbarProps {
  onOpenRegister?: () => void;
}

export default function Navbar({ onOpenRegister }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#0b2242] border-b border-[#163d73] text-slate-100">
      {/* Top Banner Legalitas Resmi */}
      <div className="bg-[#07162c] text-blue-200/90 text-xs py-1.5 px-3 sm:px-4 border-b border-blue-950/80 pt-[max(0.375rem,env(safe-area-inset-top))]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse"></span>
            <span className="font-medium tracking-tight whitespace-nowrap">
              Izin Kemenag RI: <strong className="text-amber-300 font-semibold">PPIU U.412/2021</strong> &bull; <strong className="text-amber-300 font-semibold">PIHK 912/2023</strong>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-blue-200/80 shrink-0">
            <span>Yayasan Darunnisa &bull; Afiliasi KBIH</span>
            <span className="text-blue-900">•</span>
            <a href="tel:081234567890" className="flex items-center gap-1 text-slate-200 hover:text-amber-300 transition-colors">
              <Phone className="w-3 h-3 text-amber-300" />
              <span>0812-3456-7890</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white p-1 border border-blue-900/60 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src="/images/logo-darunnisa.jpg"
              alt="Logo Yayasan Darunnisa"
              width={38}
              height={38}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-sm sm:text-base tracking-tight leading-tight truncate">
              Darunnisa Hajj &amp; Umrah
            </div>
            <div className="text-[9px] sm:text-[10px] text-blue-200/75 tracking-wider uppercase font-medium truncate">
              Yayasan Darunnisa &bull; Berdiri Sejak 1991
            </div>
          </div>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wide text-slate-200">
          <Link href="/#jadwal" className="hover:text-amber-300 transition-colors">
            Katalog Paket
          </Link>
          <Link href="/#rekomendasi-ml" className="hover:text-amber-300 transition-colors">
            Pencocok AI
          </Link>
          <Link href="/#kalkulator-biaya" className="hover:text-amber-300 transition-colors">
            Simulasi Biaya
          </Link>
          <Link href="/#daftar" className="hover:text-amber-300 transition-colors">
            Daftar Daring
          </Link>
          <Link href="/tracking" className="hover:text-amber-300 transition-colors">
            Lacak Pengajuan
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:block">
            <FontSizeControl variant="dark" />
          </div>
          <Link
            href="/tracking"
            className="whitespace-nowrap text-xs font-medium text-blue-100 hover:text-white bg-[#133666] hover:bg-[#1a4785] border border-[#1f5296] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors"
          >
            Lacak Pengajuan
          </Link>
          {onOpenRegister ? (
            <button
              onClick={onOpenRegister}
              className="text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Daftar Online</span>
            </button>
          ) : (
            <Link
              href="/#daftar"
              className="text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Daftar Online</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

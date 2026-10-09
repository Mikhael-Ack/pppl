import { ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          {/* Kolom 1: Profil */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 font-bold flex items-center justify-center text-lg">
                M
              </div>
              <div>
                <div className="font-bold text-white text-base leading-tight">Mitra Umroh Mandiri</div>
                <div className="text-[11px] text-slate-400">Haji Khusus &amp; Umroh Resmi</div>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Penyelenggara Perjalanan Ibadah Umrah (PPIU) dan Penyelenggara Ibadah Haji Khusus (PIHK) resmi terdaftar di Kementerian Agama Republik Indonesia.
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-3 py-1.5 rounded-lg text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>PPIU U.412/2021 &amp; PIHK 912/2023</span>
            </div>
          </div>

          {/* Kolom 2: Menu Cepat */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Layanan &amp; Program</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/#jadwal" className="hover:text-emerald-400 transition-colors">
                  Paket Umroh Reguler VIP
                </Link>
              </li>
              <li>
                <Link href="/#jadwal" className="hover:text-emerald-400 transition-colors">
                  Paket Umroh Plus Turki / Thaif
                </Link>
              </li>
              <li>
                <Link href="/#jadwal" className="hover:text-emerald-400 transition-colors">
                  Program Haji Khusus Kemenag
                </Link>
              </li>
              <li>
                <Link href="/#rekomendasi-ml" className="hover:text-emerald-400 transition-colors">
                  Smart Matcher AI / ML
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="hover:text-emerald-400 transition-colors">
                  Tracking Keberangkatan Jemaah
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak & Jam Layanan */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Kontak &amp; Layanan</h4>
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Gedung Graha Mandiri Lt. 3, Jl. Protokol No. 88, Jakarta Selatan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>(021) 7890-1234 / 0812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>info@mitraumrohmandiri.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Senin - Sabtu: 08:30 - 17:00 WIB</span>
              </div>
            </div>
          </div>

          {/* Kolom 4: Jaminan Legalitas */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">Sertifikasi &amp; Asosiasi</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Tersertifikasi Akreditasi A Badan Akreditasi Nasional dan anggota resmi asosiasi travel umroh SAPUHI / HIMPUH. Seluruh jemaah diproteksi asuransi perjalanan internasional.
            </p>
            <div className="pt-2">
              <Link
                href="/tracking"
                className="w-full inline-block text-center bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 py-2.5 rounded-xl font-semibold transition-colors"
              >
                Cek Progres Visa &amp; Koper
              </Link>
            </div>
          </div>
        </div>

        {/* Baris Bawah */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; 2026 Mitra Umroh Mandiri. All rights reserved. Terdaftar di Kemenag RI.
          </div>
          <div className="flex items-center gap-4">
            <span>Privasi Data Jemaah Aman Sesuai UU PDP</span>
            <span>•</span>
            <span>SISKOPATUH Terverifikasi</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { ShieldCheck, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#04120e] text-slate-300 border-t border-[#09261d]">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          {/* Kolom 1: Profil & Izin */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0e3b2f] text-amber-300 font-serif font-bold flex items-center justify-center text-base">
                M
              </div>
              <div>
                <div className="font-bold text-white text-sm leading-tight">Mitra Umroh Mandiri</div>
                <div className="text-[10px] text-emerald-300/70">PPIU U.412/2021 &bull; PIHK 912/2023</div>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Penyelenggara Perjalanan Ibadah Umrah dan Haji Khusus resmi terdaftar di Kementerian Agama RI dan terintegrasi sistem pengawasan SISKOPATUH.
            </p>
          </div>

          {/* Kolom 2: Navigasi Program */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Program</h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li>
                <Link href="/#jadwal" className="hover:text-amber-200 transition-colors">
                  Umroh VIP Pelataran 9 Hari
                </Link>
              </li>
              <li>
                <Link href="/#jadwal" className="hover:text-amber-200 transition-colors">
                  Umroh Plus Turki Cappadocia
                </Link>
              </li>
              <li>
                <Link href="/#jadwal" className="hover:text-amber-200 transition-colors">
                  Haji Khusus Kuota Kemenag
                </Link>
              </li>
              <li>
                <Link href="/#rekomendasi-ml" className="hover:text-amber-200 transition-colors">
                  Pencocok Kamar Jemaah
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="hover:text-amber-200 transition-colors">
                  Lacak Berkas &amp; Dokumen
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak Operasional */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Kontak Kantor</h4>
            <div className="space-y-2 text-slate-400 text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Gedung Graha Mandiri Lt. 3, Jl. Protokol No. 88, Jakarta Selatan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>0812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>info@mitraumrohmandiri.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Senin &ndash; Sabtu: 08:30 &ndash; 17:00 WIB</span>
              </div>
            </div>
          </div>

          {/* Kolom 4: Kepatuhan Hukum */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Kepatuhan Hukum</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Seluruh data identitas jemaah dilindungi sesuai UU Pelindungan Data Pribadi (UU PDP No. 27/2022). Jemaah diproteksi asuransi perjalanan internasional.
            </p>
            <div className="pt-1">
              <Link
                href="/tracking"
                className="inline-block text-[11px] font-medium text-emerald-300 hover:text-white border border-[#1b5544] bg-[#09261d] px-3 py-1.5 rounded-lg transition-colors"
              >
                Cek Status Dokumen &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Baris Hak Cipta */}
        <div className="pt-6 border-t border-[#09261d] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            &copy; 2026 Mitra Umroh Mandiri. Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-4">
            <span>Standar Resmi SISKOPATUH</span>
            <span>&bull;</span>
            <span>Kemenag RI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

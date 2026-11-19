import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[#051020] text-slate-300 border-t border-[#112d55]">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          {/* Kolom 1: Profil & Izin */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-blue-900/60 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                <Image
                  src="/images/logo-darunnisa.jpg"
                  alt="Logo Yayasan Darunnisa"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-bold text-white text-sm leading-tight">Darunnisa Travel</div>
                <div className="text-[10px] text-blue-200/75">Yayasan Darunnisa &bull; Sejak 1991</div>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              PT Darunnisa Wisata Barokah (Yayasan Darunnisa). Penyelenggara perjalanan Umrah berafiliasi konsorsium KBIH dan Haji Khusus resmi izin Kementerian Agama RI.
            </p>
            <div className="text-[10px] text-amber-300 font-mono">
              PPIU U.412/2021 &bull; PIHK 912/2023
            </div>
          </div>

          {/* Kolom 2: Navigasi Program */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Layanan &amp; Program</h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li>
                <Link href="/#jadwal" className="hover:text-amber-300 transition-colors">
                  Katalog Umrah &amp; Haji (UI-01)
                </Link>
              </li>
              <li>
                <Link href="/#daftar" className="hover:text-amber-300 transition-colors">
                  Pengajuan Pendaftaran Daring (UI-03)
                </Link>
              </li>
              <li>
                <Link href="/#rekomendasi-ml" className="hover:text-amber-300 transition-colors">
                  Rekomendasi Paket AI (UI-04)
                </Link>
              </li>
              <li>
                <Link href="/#kalkulator-biaya" className="hover:text-amber-300 transition-colors">
                  Simulasi Estimasi Biaya
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="hover:text-amber-300 transition-colors">
                  Pelacakan Pengajuan (UI-14)
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3: Kontak Operasional */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Kantor Operasional</h4>
            <div className="space-y-2 text-slate-400 text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                <span>Gedung Yayasan Darunnisa, Jl. Pemuda Raya No. 45, Rawamangun, Jakarta Timur</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>0812-3456-7890 / 021-4786-9901</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>operasional@darunnisatravel.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Senin &ndash; Sabtu: 08:30 &ndash; 17:00 WIB</span>
              </div>
            </div>
          </div>

          {/* Kolom 4: Kepatuhan Hukum */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Kepatuhan Hukum &amp; Privasi</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Sesuai arahan mitra, dokumen fisik sensitif (KTP, paspor, buku nikah) diproses manual di kantor yayasan demi keamanan data jemaah. Terhubung sistem pengawasan SISKOPATUH Kemenag RI.
            </p>
            <div className="pt-1">
              <Link
                href="/tracking"
                className="inline-block text-[11px] font-medium text-amber-300 hover:text-white border border-[#1f5296] bg-[#0b2242] px-3 py-1.5 rounded-lg transition-colors"
              >
                Lacak Status Pengajuan &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Baris Hak Cipta */}
        <div className="pt-6 border-t border-[#112d55] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            &copy; 2026 Yayasan Darunnisa (PT Darunnisa Wisata Barokah). Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-4">
            <span>Standar Resmi SISKOPATUH</span>
            <span>&bull;</span>
            <span>Kemenag RI</span>
            <span>&bull;</span>
            <Link href="/admin/login" className="text-blue-300/80 hover:text-amber-300 transition-colors">
              Login Admin (UI-06)
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

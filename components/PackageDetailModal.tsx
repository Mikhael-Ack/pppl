'use client';

import { X, Calendar, Plane, Building2, Clock, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PaketItem } from '@/types/package.types';
import { formatRupiah } from '@/utils/formatters';

interface PackageDetailModalProps {
  paket: PaketItem | null;
  onClose: () => void;
  onSelectRegister: (paket: PaketItem) => void;
}

export default function PackageDetailModal({
  paket,
  onClose,
  onSelectRegister,
}: PackageDetailModalProps) {
  if (!paket) return null;

  const jadwal = paket.keberangkatan && paket.keberangkatan.length > 0 ? paket.keberangkatan[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-[#08221b] text-white p-5 border-b border-[#0d3329] flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 bg-[#0e3b2f] border border-[#1b5544] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
              <span>{paket.kode_paket}</span>
              <span>&bull;</span>
              <span>{paket.program === 'haji_khusus' ? 'Haji Khusus' : 'Umrah'}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {paket.nama_paket}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Price & Duration Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">Biaya Paket All-in</span>
              <div className="text-2xl font-bold text-emerald-900 font-mono tracking-tight">
                {formatRupiah(paket.harga)}
                <span className="text-xs font-normal text-slate-500 ml-1">/ jemaah</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-lg font-semibold">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Durasi {paket.durasi_hari} Hari</span>
            </div>
          </div>

          {/* Key Facilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                <Plane className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Maskapai &amp; Penerbangan</span>
              </div>
              <p className="text-slate-600 pl-6">{paket.maskapai}</p>
              <div className="pl-6 text-[11px] text-emerald-700 font-medium">Penerbangan langsung (Direct)</div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Akomodasi Hotel Bintang 5</span>
              </div>
              <p className="text-slate-600 pl-6 leading-relaxed">{paket.hotel}</p>
              <div className="pl-6 text-[11px] text-amber-700 font-medium">Ring 1 pelataran masjid</div>
            </div>
          </div>

          {/* Departure & Quota Details */}
          {jadwal && (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-emerald-950 text-xs">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Jadwal Keberangkatan Terbuka</span>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-semibold uppercase">
                  {jadwal.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[11px] text-slate-500 block">Tanggal Berangkat</span>
                  <span className="font-semibold text-slate-800">
                    {jadwal.tgl_berangkat || `Bulan ${jadwal.bulan} Tahun ${jadwal.tahun}`}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Alokasi Kuota Kursi</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {jadwal.kuota} Kursi Tersedia
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description & Inclusions */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs">Deskripsi &amp; Fasilitas Termasuk</h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              {paket.deskripsi || 'Paket resmi berizin Kemenag RI dengan bimbingan muthawif bersertifikasi, visa umroh/haji resmi, perlengkapan ibadah lengkap (koper, ihram/mukena), manasik intensif, dan asuransi perjalanan syariah.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Bimbingan Muthawif Profesional</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Visa Resmi &amp; Asuransi Perjalanan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Makan 3x Sehari Menu Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Free Manasik Teori &amp; Praktik</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onClose();
              onSelectRegister(paket);
            }}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Ajukan Pendaftaran Paket Ini
          </button>
        </div>
      </div>
    </div>
  );
}

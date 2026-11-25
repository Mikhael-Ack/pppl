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

  const jadwal =
    paket.keberangkatan?.find((k) => k.status === 'buka') ||
    (paket.keberangkatan && paket.keberangkatan.length > 0 ? paket.keberangkatan[0] : null);
  const sisaKuota = jadwal ? (jadwal.sisa_kuota ?? jadwal.kuota) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-[#0b2242] text-white p-5 border-b border-[#163d73] flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 bg-[#133666] border border-[#21579e] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
              <span>{paket.kode_paket}</span>
              <span>&bull;</span>
              <span>
                {paket.program === 'haji_khusus'
                  ? 'Haji Khusus'
                  : paket.program === 'haji_reguler'
                  ? 'Haji Reguler'
                  : 'Umrah'}
              </span>
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
              <div className="text-2xl font-bold text-blue-950 font-mono tracking-tight">
                {formatRupiah(paket.harga)}
                <span className="text-xs font-normal text-slate-500 ml-1">/ jemaah</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-100 text-amber-950 border border-amber-300 px-3 py-1.5 rounded-lg font-semibold">
              <Clock className="w-4 h-4 text-amber-800" />
              <span>Durasi {paket.durasi_hari} Hari</span>
            </div>
          </div>

          {/* Key Facilities Grid (Dinamis sesuai data paket dari Admin UI-07) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                <Plane className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Maskapai &amp; Penerbangan</span>
              </div>
              <p className="text-slate-700 pl-6 leading-relaxed">{paket.maskapai}</p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                <Building2 className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Akomodasi Hotel</span>
              </div>
              <p className="text-slate-700 pl-6 leading-relaxed">{paket.hotel}</p>
            </div>
          </div>

          {/* Departure & Quota Details (Menampilkan seluruh jadwal paket sesuai SD Bab 4.2 M2.1) */}
          {paket.keberangkatan && paket.keberangkatan.length > 0 && (
            <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-blue-950 text-xs">
                  <Calendar className="w-4 h-4 text-blue-700" />
                  <span>Jadwal Keberangkatan &amp; Ketersediaan Kuota</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {paket.keberangkatan.length} jadwal
                </span>
              </div>
              <div className="divide-y divide-blue-200/60 border border-blue-200/80 rounded-lg bg-white overflow-hidden">
                {paket.keberangkatan.map((jdw) => {
                  const sisa = jdw.sisa_kuota ?? jdw.kuota;
                  return (
                    <div
                      key={jdw.id_keberangkatan}
                      className="p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="text-[10px] text-slate-500 block">
                          Periode / Tanggal Berangkat
                        </span>
                        <span className="font-semibold text-slate-900 font-mono">
                          {jdw.tgl_berangkat ||
                            (jdw.bulan
                              ? `Bulan ${jdw.bulan} Tahun ${jdw.tahun}`
                              : `Alokasi Kuota Tahun ${jdw.tahun}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">
                            Sisa Kuota Kursi
                          </span>
                          <span className="font-bold text-blue-950 font-mono">
                            Sisa {sisa} / {jdw.kuota} Kursi
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            jdw.status === 'buka' && sisa > 0
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}
                        >
                          {jdw.status === 'buka' && sisa <= 0 ? 'penuh' : jdw.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description & Inclusions (100% mengikuti isian admin di UI-07) */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Deskripsi &amp; Fasilitas Termasuk</h4>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 leading-relaxed text-xs whitespace-pre-line">
              {paket.deskripsi?.trim()
                ? paket.deskripsi
                : 'Belum ada keterangan fasilitas tambahan untuk paket ini. Hubungi staf Yayasan Darunnisa untuk rincian lengkap.'}
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

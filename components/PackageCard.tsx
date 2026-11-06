'use client';

import { PaketItem } from '@/types/package.types';
import { formatRupiah } from '@/utils/formatters';
import { Plane, Calendar, Building2, Clock, Eye, ClipboardCheck } from 'lucide-react';

interface PackageCardProps {
  pkg: PaketItem;
  onViewDetail?: (pkg: PaketItem) => void;
  onRegister?: (pkg: PaketItem) => void;
}

export default function PackageCard({ pkg, onViewDetail, onRegister }: PackageCardProps) {
  const getProgramBadge = (program: string) => {
    switch (program) {
      case 'haji_khusus':
        return (
          <span className="text-[11px] font-semibold text-purple-950 bg-purple-100/90 border border-purple-200 px-2.5 py-0.5 rounded-md">
            Haji Khusus Kemenag
          </span>
        );
      case 'umrah':
        return (
          <span className="text-[11px] font-semibold text-emerald-950 bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-md">
            Umrah Resmi (PPIU)
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
            {program}
          </span>
        );
    }
  };

  const jadwal = pkg.keberangkatan && pkg.keberangkatan.length > 0 ? pkg.keberangkatan[0] : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-600/70 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md group">
      <div className="space-y-4">
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          {getProgramBadge(pkg.program)}
          <span className="text-[11px] font-mono text-slate-500 font-medium">
            {jadwal ? `Sisa ${jadwal.kuota} Kursi` : pkg.kode_paket}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
            {pkg.nama_paket}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-800" />
              <span>{pkg.durasi_hari} Hari</span>
            </span>
            <span className="flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-emerald-800" />
              <span className="truncate max-w-[180px]">{pkg.maskapai}</span>
            </span>
          </div>
        </div>

        {/* Accommodation details */}
        <div className="space-y-2 text-xs text-slate-600 pt-1">
          <div className="flex items-start gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{pkg.hotel}</span>
          </div>
          {jadwal && (
            <div className="flex items-center gap-2 text-emerald-900 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>
                Jadwal: {jadwal.tgl_berangkat || `Bulan ${jadwal.bulan}/${jadwal.tahun}`}
              </span>
            </div>
          )}
        </div>

        {/* Quick Pricing Badge */}
        <div className="bg-slate-50 rounded-xl p-3 text-xs border border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 font-medium">Biaya Paket All-in</div>
            <div className="text-lg font-bold font-mono text-emerald-950 tabular-nums">
              {formatRupiah(pkg.harga)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
              Hotel Ring 1
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Detail (UI-02) and Daftar (UI-03) */}
      <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
        <button
          onClick={() => onViewDetail && onViewDetail(pkg)}
          className="w-full inline-flex items-center justify-center gap-1.5 border border-slate-300 hover:border-emerald-800 text-slate-700 hover:text-emerald-950 text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Detail Paket</span>
        </button>

        <button
          onClick={() => onRegister && onRegister(pkg)}
          className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>Daftar</span>
        </button>
      </div>
    </div>
  );
}

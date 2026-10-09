import { PackageItem } from '@/types/package.types';
import { formatRupiah, formatDate, createWhatsAppLink } from '@/utils/formatters';
import { Plane, Calendar, Building2, MapPin, Users, ArrowUpRight } from 'lucide-react';

interface PackageCardProps {
  pkg: PackageItem;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'reguler_vip':
        return <span className="text-[11px] font-semibold text-emerald-900 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded">VIP Pelataran</span>;
      case 'plus_wisata':
        return <span className="text-[11px] font-semibold text-amber-950 bg-amber-100/90 border border-amber-200 px-2 py-0.5 rounded">Plus Wisata</span>;
      case 'haji_khusus':
        return <span className="text-[11px] font-semibold text-purple-950 bg-purple-100/90 border border-purple-200 px-2 py-0.5 rounded">Haji Khusus</span>;
      default:
        return <span className="text-[11px] font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">Ekonomis</span>;
    }
  };

  const waMessage = `Assalamu'alaikum Admin, saya tertarik dengan:\n*${pkg.name}*\nKeberangkatan: ${formatDate(pkg.departure_date)}\nMaskapai: ${pkg.airline}\nHarga Mulai: ${formatRupiah(pkg.price_quad)}\n\nApakah kursi masih tersedia untuk pendaftaran?`;
  const waUrl = createWhatsAppLink(process.env.NEXT_PUBLIC_TRAVEL_WA || '6281234567890', waMessage);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 hover:border-emerald-600/70 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md group">
      <div className="space-y-4">
        {/* Header Tags */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          {getCategoryBadge(pkg.category)}
          <span className="text-[11px] font-mono tabular-nums text-slate-600">
            {pkg.remaining_seat <= 5 ? (
              <span className="text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Tersisa {pkg.remaining_seat} kursi
              </span>
            ) : (
              <span>Kuota sisa {pkg.remaining_seat} kursi</span>
            )}
          </span>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
            {pkg.name}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-800" />
              {formatDate(pkg.departure_date)} ({pkg.duration_days} hari)
            </span>
            <span className="flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-emerald-800" />
              {pkg.airline}
            </span>
          </div>
        </div>

        {/* Accommodation details */}
        <div className="space-y-2 text-xs text-slate-600 pt-1">
          <div className="flex items-start gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
            <span><strong className="text-slate-800">Makkah:</strong> {pkg.hotel_makkah} (Bintang {pkg.hotel_makkah_rating})</span>
          </div>
          <div className="flex items-start gap-2">
            <Building2 className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
            <span><strong className="text-slate-800">Madinah:</strong> {pkg.hotel_madinah} (Bintang {pkg.hotel_madinah_rating})</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span>Embarkasi {pkg.departure_city}</span>
          </div>
        </div>

        {/* Room Price Table */}
        <div className="bg-slate-50/80 rounded-lg p-3 text-xs border border-slate-100 space-y-1.5 font-mono">
          <div className="flex justify-between text-slate-600">
            <span className="font-sans">Quad (sekamar ber-4)</span>
            <strong className="text-slate-900 tabular-nums">{formatRupiah(pkg.price_quad)}</strong>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="font-sans">Triple (sekamar ber-3)</span>
            <span className="text-slate-800 tabular-nums">{formatRupiah(pkg.price_triple)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="font-sans">Double (sekamar ber-2)</span>
            <span className="text-slate-800 tabular-nums">{formatRupiah(pkg.price_double)}</span>
          </div>
        </div>
      </div>

      {/* Footer Card */}
      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Harga Mulai</div>
          <div className="text-lg font-bold font-mono text-emerald-950 tabular-nums leading-tight">
            {formatRupiah(pkg.price_quad)}
          </div>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#08221b] hover:bg-[#0e3b2f] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <span>Pesan via WA</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
        </a>
      </div>
    </div>
  );
}

import { PackageItem } from '@/types/package.types';
import { formatRupiah, formatDate, createWhatsAppLink } from '@/utils/formatters';
import { Plane, Calendar, Building2, MapPin, Users, MessageCircle } from 'lucide-react';

interface PackageCardProps {
  pkg: PackageItem;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'reguler_vip':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded font-bold uppercase">Reguler VIP</span>;
      case 'plus_wisata':
        return <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded font-bold uppercase">Plus Wisata</span>;
      case 'haji_khusus':
        return <span className="bg-purple-100 text-purple-900 text-xs px-2.5 py-1 rounded font-bold uppercase">Haji Khusus</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded font-bold uppercase">Ekonomis</span>;
    }
  };

  const waMessage = `Assalamu'alaikum Admin, saya tertarik dengan:\n*${pkg.name}*\nKeberangkatan: ${formatDate(pkg.departure_date)}\nMaskapai: ${pkg.airline}\nHarga Mulai: ${formatRupiah(pkg.price_quad)}\n\nApakah seat masih tersedia untuk pendaftaran?`;
  const waUrl = createWhatsAppLink(process.env.NEXT_PUBLIC_TRAVEL_WA || '6281234567890', waMessage);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-emerald-500 transition-all duration-300 ease-out flex flex-col justify-between group">
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          {getCategoryBadge(pkg.category)}
          {pkg.remaining_seat <= 5 ? (
            <span className="text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
              Sisa {pkg.remaining_seat} Seat!
            </span>
          ) : (
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Tersedia ({pkg.remaining_seat} Seat)
            </span>
          )}
        </div>

        {/* Title & Date */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
            {pkg.name}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              {formatDate(pkg.departure_date)} ({pkg.duration_days} Hari)
            </span>
            <span className="flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-emerald-700" />
              {pkg.airline}
            </span>
          </div>
        </div>

        {/* Hotel & Facilities */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Makkah:</span> {pkg.hotel_makkah} (Bintang {pkg.hotel_makkah_rating})
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Madinah:</span> {pkg.hotel_madinah} (Bintang {pkg.hotel_madinah_rating})
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Keberangkatan:</span> {pkg.departure_city}
            </div>
          </div>
        </div>

        {/* Variant Kamar */}
        <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
          <div className="flex justify-between text-slate-600">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Sekamar Ber-4 (Quad):</span>
            <span className="font-bold text-slate-900">{formatRupiah(pkg.price_quad)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Sekamar Ber-3 (Triple):</span>
            <span className="font-semibold text-slate-800">{formatRupiah(pkg.price_triple)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Sekamar Ber-2 (Double):</span>
            <span className="font-semibold text-slate-800">{formatRupiah(pkg.price_double)}</span>
          </div>
        </div>
      </div>

      {/* Footer Card & Action */}
      <div className="p-5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] text-slate-500 font-medium">Mulai Dari (Quad)</div>
          <div className="text-lg font-bold text-emerald-900 leading-tight">
            {formatRupiah(pkg.price_quad)}
          </div>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs group-hover:bg-emerald-700"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Pesan via WA
        </a>
      </div>
    </div>
  );
}

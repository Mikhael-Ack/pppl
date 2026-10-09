import { ShieldCheck, Plane, Building2, Landmark } from 'lucide-react';

const PARTNERS = [
  { name: 'Kemenag RI (SISKOPATUH)', type: 'Legalitas Resmi', icon: ShieldCheck },
  { name: 'Garuda Indonesia', type: 'Maskapai Resmi', icon: Plane },
  { name: 'Saudia Airlines', type: 'Maskapai Resmi', icon: Plane },
  { name: 'Turkish Airlines', type: 'Maskapai Resmi', icon: Plane },
  { name: 'Pullman Zamzam Tower', type: 'Hotel Makkah (Bintang 5)', icon: Building2 },
  { name: 'Al Aqeeq Madinah', type: 'Hotel Madinah (Bintang 5)', icon: Building2 },
  { name: 'Safwah Royal Orchid', type: 'Hotel Makkah (Bintang 5)', icon: Building2 },
  { name: 'Bank Syariah Indonesia (BSI)', type: 'Mitra Pembayaran', icon: Landmark },
];

export default function PartnerMarquee() {
  const marqueeItems = [...PARTNERS, ...PARTNERS];

  return (
    <section className="bg-emerald-950 text-emerald-100 py-5 border-b border-emerald-900/40 overflow-hidden relative w-full">
      <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
        <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
          Mitra Resmi Maskapai Penerbangan, Hotel Bintang 5 &amp; Legalitas
        </span>
      </div>

      {/* Gradient Mask Fade di Kiri & Kanan */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-emerald-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-emerald-950 to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex overflow-hidden w-full">
        <div className="animate-marquee-left pause-on-hover flex items-center gap-5 cursor-pointer py-1">
          {marqueeItems.map((partner, idx) => {
            const Icon = partner.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/40 rounded-xl px-4 py-2.5 transition-all shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-800/80 flex items-center justify-center text-amber-300 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white whitespace-nowrap">{partner.name}</div>
                  <div className="text-[10px] text-emerald-300/80 whitespace-nowrap">{partner.type}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

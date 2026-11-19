import { ShieldCheck, Plane, Building2, Landmark } from 'lucide-react';

const PARTNERS = [
  { name: 'Kemenag RI (SISKOPATUH)', type: 'Izin PPIU & PIHK Resmi', icon: ShieldCheck },
  { name: 'Garuda Indonesia', type: 'Penerbangan Langsung CGK', icon: Plane },
  { name: 'Saudia Airlines', type: 'Penerbangan Reguler & Haji', icon: Plane },
  { name: 'Turkish Airlines', type: 'Program Plus Wisata', icon: Plane },
  { name: 'Pullman Zamzam Tower', type: 'Ring 1 Pelataran Makkah', icon: Building2 },
  { name: 'Al Aqeeq Madinah', type: 'Bintang 5 Jalur Nabawi', icon: Building2 },
  { name: 'Safwah Royal Orchid', type: 'Depan Pelataran Masjid', icon: Building2 },
  { name: 'Bank Syariah Indonesia (BSI)', type: 'Virtual Account & Pembiayaan', icon: Landmark },
];

export default function PartnerMarquee() {
  const marqueeItems = [...PARTNERS, ...PARTNERS];

  return (
    <section className="bg-[#081b36] text-blue-100 py-4 border-b border-[#163d73] overflow-hidden relative w-full">
      {/* Gradient Mask Fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#081b36] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#081b36] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div className="flex overflow-hidden w-full">
        <div className="animate-marquee-left pause-on-hover flex items-center gap-4 cursor-pointer py-1">
          {marqueeItems.map((partner, idx) => {
            const Icon = partner.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 bg-[#102d57] hover:bg-[#163d73] border border-[#1f5296] rounded-lg px-3.5 py-2 transition-colors shrink-0"
              >
                <div className="w-7 h-7 rounded bg-[#18437d] flex items-center justify-center text-amber-300 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-100 whitespace-nowrap">{partner.name}</div>
                  <div className="text-[10px] text-blue-200/75 whitespace-nowrap">{partner.type}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

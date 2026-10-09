import { Star } from 'lucide-react';

const REVIEWS_ROW_1 = [
  {
    name: 'H. Ahmad Subagio',
    program: 'Surabaya • VIP Pelataran 9 Hari',
    quote: 'Hotel Pullman posisinya tepat di depan pelataran. Ibu saya yang usia 72 tahun bisa bolak-balik ke masjid untuk sholat berjamaah tanpa kelelahan.',
  },
  {
    name: 'Hj. Endang Rahmawati',
    program: 'Jakarta Selatan • Umroh Reguler Bintang 4',
    quote: 'Perlengkapan koper tiba 2 minggu sebelum keberangkatan. Bimbingan manasik di asrama haji sangat tertib dan detail sesuai sunnah.',
  },
  {
    name: 'dr. Farhan Prasetyo',
    program: 'Bandung • Umroh Plus Turki 12 Hari',
    quote: 'Jadwal ziarah Istanbul dan ibadah di Makkah tidak saling berbenturan. Penerbangan Turkish Airlines tepat waktu dan penanganan bagasi rapi.',
  },
  {
    name: 'Bpk. Hendra Gunawan',
    program: 'Bekasi • Umroh Ekonomis',
    quote: 'Meskipun paket ekonomis, jarak hotel ke pelataran masih wajar (sekitar 350m jalan kaki) dan makanan katering Indonesia selalu hangat.',
  },
];

const REVIEWS_ROW_2 = [
  {
    name: 'Hj. Siti Aminah',
    program: 'Medan • VIP Pelataran 9 Hari',
    quote: 'Proses visa lewat sistem Nusuk terpantau jelas di website. Kami tidak perlu bolak-balik menanyakan status paspor ke kantor.',
  },
  {
    name: 'Ustadz M. Ridwan',
    program: 'Makassar • Umroh Syawal',
    quote: 'Muthawif pembimbing menguasai fiqh manasik dan rute sejarah di Madinah. Jamaah dibimbing dengan sabar saat thawaf dan sai.',
  },
  {
    name: 'Ibu Ratna Dewi',
    program: 'Tangerang • Umroh Keluarga',
    quote: 'Kamar quad bersih dan tidak sempit. Bus eksekutif antar kota Makkah ke Madinah nyaman untuk anak-anak.',
  },
  {
    name: 'H. Dedi Suhendar',
    program: 'Semarang • Haji Khusus Kemenag',
    quote: 'Pendaftaran nomor porsi haji khusus selesai dalam hitungan hari dengan bukti pendaftaran resmi Kemenag RI.',
  },
];

export default function TestimonialMarquee() {
  const row1 = [...REVIEWS_ROW_1, ...REVIEWS_ROW_1];
  const row2 = [...REVIEWS_ROW_2, ...REVIEWS_ROW_2];

  return (
    <section className="py-16 bg-[#061b15] text-slate-100 overflow-hidden relative border-t border-[#0d3329]">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center space-y-1">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
          Ulasan Jemaah
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Pengalaman Keberangkatan Bersama Kami
        </h2>
      </div>

      {/* Gradient Mask Fade di Kiri & Kanan */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#061b15] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#061b15] to-transparent z-10 pointer-events-none" />

      <div className="space-y-4">
        {/* Track 1: Bergerak ke Kiri */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-left-slow pause-on-hover flex items-center gap-4 cursor-pointer py-1">
            {row1.map((item, idx) => (
              <div
                key={idx}
                className="w-80 sm:w-96 bg-[#0a271f] hover:bg-[#0e332a] border border-[#144235] rounded-xl p-4.5 transition-colors shrink-0 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-300" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="pt-2.5 border-t border-[#133d31]">
                  <div className="font-semibold text-xs text-slate-100">{item.name}</div>
                  <div className="text-[11px] text-emerald-300/80 mt-0.5">{item.program}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Track 2: Bergerak ke Kanan */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-right pause-on-hover flex items-center gap-4 cursor-pointer py-1">
            {row2.map((item, idx) => (
              <div
                key={idx}
                className="w-80 sm:w-96 bg-[#0a271f] hover:bg-[#0e332a] border border-[#144235] rounded-xl p-4.5 transition-colors shrink-0 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-300" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="pt-2.5 border-t border-[#133d31]">
                  <div className="font-semibold text-xs text-slate-100">{item.name}</div>
                  <div className="text-[11px] text-emerald-300/80 mt-0.5">{item.program}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

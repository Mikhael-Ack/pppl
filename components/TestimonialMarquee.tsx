import { Star, MessageSquareQuote } from 'lucide-react';

const REVIEWS_ROW_1 = [
  {
    name: 'H. Ahmad Subagio & Keluarga',
    origin: 'Surabaya • Umroh VIP Ring 1',
    rating: 5,
    quote: 'Hotel Pullman benar-benar di depan pelataran. Ibu saya yang usia 72 tahun bisa ke masjid tiap waktu tanpa lelah. Muthawif sangat sabar membimbing.',
  },
  {
    name: 'Hj. Endang Rahmawati',
    origin: 'Jakarta Selatan • Umroh Reguler',
    rating: 5,
    quote: 'Transparan sejak awal! Tidak ada biaya siluman. Perlengkapan koper datang H-14 dan manasik sangat detail sesuai sunnah Nabi SAW.',
  },
  {
    name: 'dr. Farhan & Istri',
    origin: 'Bandung • Umroh Plus Turki 12 Hari',
    rating: 5,
    quote: 'Perjalanan ziarah Istanbul & Cappadocia sangat teratur. Penerbangan Turkish Airlines nyaman sekali. Ibadah di Makkah tetap khusyuk dan maksimal.',
  },
  {
    name: 'Bpk. Hendra Gunawan',
    origin: 'Bekasi • Umroh Ekonomis Berkah',
    rating: 5,
    quote: 'Meskipun paket ekonomis, pelayanannya seperti bintang 5. Makanan prasmanan Indonesia lezat, hotel bersih dan dekat jalur masjid.',
  },
];

const REVIEWS_ROW_2 = [
  {
    name: 'Hj. Siti Aminah',
    origin: 'Medan • Umroh VIP Ring 1',
    rating: 5,
    quote: 'Alhamdulillah visa terbit cepat lewat Nusuk. Fitur tracking di website sangat membantu keluarga memantau status koper dan tiket tanpa bolak-balik tanya admin.',
  },
  {
    name: 'Ustadz M. Ridwan',
    origin: 'Makassar • Umroh Syawal',
    rating: 5,
    quote: 'Pembimbing ibadahnya lulusan Universitas Islam Madinah, rukun dan wajib umroh dipandu dengan tertib dan tenang.',
  },
  {
    name: 'Ibu Ratna Dewi',
    origin: 'Tangerang • Umroh Reguler Keluarga',
    rating: 5,
    quote: 'Kamar quad luas dan bersih. Bus antar kota ber-AC dingin dan pengurusan paspor dibantu dengan cepat. Sangat direkomendasikan!',
  },
  {
    name: 'H. Dedi Suhendar',
    origin: 'Semarang • Haji Khusus Kemenag',
    rating: 5,
    quote: 'Nomor porsi resmi Kemenag langsung keluar dalam 3 hari kerja. Agen sangat amanah dan profesional.',
  },
];

export default function TestimonialMarquee() {
  const row1 = [...REVIEWS_ROW_1, ...REVIEWS_ROW_1];
  const row2 = [...REVIEWS_ROW_2, ...REVIEWS_ROW_2];

  return (
    <section className="py-16 bg-slate-900 text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 text-center mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-700/50 px-3.5 py-1 rounded-full uppercase tracking-wider">
          <MessageSquareQuote className="w-3.5 h-3.5" />
          Testimoni Nyata Jemaah
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Cerita Kebahagiaan dari Tanah Suci
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Lebih dari ribuan jemaah telah mempercayakan perjalanan ibadah suci mereka bersama Mitra Umroh Mandiri.
        </p>
      </div>

      {/* Gradient Mask Fade di Kiri & Kanan */}
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-36 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-36 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

      <div className="space-y-6">
        {/* Track 1: Bergerak ke Kiri */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-left-slow pause-on-hover flex items-center gap-6 cursor-pointer py-1">
            {row1.map((item, idx) => (
              <div
                key={idx}
                className="w-80 sm:w-96 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-5 shadow-lg transition-all hover:-translate-y-1 shrink-0 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="pt-3 border-t border-slate-700/60">
                  <div className="font-bold text-xs text-white">{item.name}</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">{item.origin}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Track 2: Bergerak ke Kanan */}
        <div className="flex overflow-hidden">
          <div className="animate-marquee-right pause-on-hover flex items-center gap-6 cursor-pointer py-1">
            {row2.map((item, idx) => (
              <div
                key={idx}
                className="w-80 sm:w-96 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-5 shadow-lg transition-all hover:-translate-y-1 shrink-0 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="pt-3 border-t border-slate-700/60">
                  <div className="font-bold text-xs text-white">{item.name}</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">{item.origin}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

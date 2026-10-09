'use client';

import { useState } from 'react';
import { ArrowUpRight, Check } from 'lucide-react';
import { createWhatsAppLink } from '@/utils/formatters';

export default function MLMatcher() {
  const [budget, setBudget] = useState<number>(33);
  const [hasElderly, setHasElderly] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(9);
  const [distancePriority, setDistancePriority] = useState<string>('ring1');

  const [predictedPackage, setPredictedPackage] = useState<{
    title: string;
    reason: string;
    priceEst: string;
    features: string[];
  }>({
    title: 'Paket Umroh VIP Ring 1 Pelataran 9 Hari',
    reason: 'Keberadaan jemaah lansia memprioritaskan hotel ring 1 (< 100m dari pintu masjid tanpa tanjakan) agar ibadah dapat dilakukan setiap waktu tanpa kelelahan fisik.',
    priceEst: 'Rp 33.500.000',
    features: [
      'Pullman Zamzam Tower di depan pelataran Masjidil Haram',
      'Kereta Cepat Haramain Makkah ke Madinah',
      'Muthawif pendamping & koordinasi kursi roda',
    ],
  });

  const handlePredict = () => {
    let title = 'Paket Umroh VIP Ring 1 Pelataran 9 Hari';
    let reason = '';
    let priceEst = 'Rp 33.500.000';
    let features: string[] = [];

    if (duration === 12) {
      title = 'Paket Umroh Plus Turki Cappadocia 12 Hari';
      reason = 'Durasi 12 hari dialokasikan untuk program ziarah sejarah dengan jadwal istirahat seimbang dan maskapai Turkish Airlines.';
      priceEst = 'Rp 39.500.000';
      features = [
        'Ziarah Istanbul & Cappadocia',
        'Hotel Safwah Royal Orchid Makkah',
        'Tour Leader & Muthawif tersertifikasi',
      ];
    } else if (hasElderly || distancePriority === 'ring1') {
      if (budget >= 32) {
        title = 'Paket Umroh VIP Ring 1 Pelataran 9 Hari';
        reason = 'Keberadaan jemaah lansia memprioritaskan hotel ring 1 (< 100m dari pintu masjid tanpa tanjakan) agar ibadah dapat dilakukan setiap waktu tanpa kelelahan fisik.';
        priceEst = 'Rp 33.500.000';
        features = [
          'Pullman Zamzam Tower di depan pelataran Masjidil Haram',
          'Kereta Cepat Haramain Makkah ke Madinah',
          'Muthawif pendamping & koordinasi kursi roda',
        ];
      } else {
        title = 'Paket Umroh Reguler Bintang 4 (Jarak 150m)';
        reason = 'Anggaran di bawah Rp 32 juta dengan jemaah lansia dialokasikan ke hotel bintang 4 berjarak 150m dengan akses jalan rata dan pendampingan petugas.';
        priceEst = 'Rp 29.800.000';
        features = [
          'Hotel Bintang 4 jalur utama masjid',
          'Bimbingan muthawif intensif',
          'Handling bandara & bus eksekutif',
        ];
      }
    } else {
      if (budget < 29) {
        title = 'Paket Umroh Hemat Berkah 9 Hari';
        reason = 'Fisik bugar dengan anggaran ekonomis dialokasikan ke hotel bintang 3 berjarak 350m untuk menghemat biaya secara signifikan.';
        priceEst = 'Rp 26.900.000';
        features = [
          'Grand Al Massa (350m berjalan kaki)',
          'Penerbangan langsung Lion Air',
          'Perlengkapan koper & kain ihram lengkap',
        ];
      } else {
        title = 'Paket Umroh Reguler Bintang 4 (9 Hari)';
        reason = 'Pilihan seimbang antara efisiensi biaya dan kenyamanan hotel bintang 4 di ring 2.';
        priceEst = 'Rp 30.500.000';
        features = [
          'Hotel Bintang 4 jarak 150m ke pelataran',
          'Penerbangan langsung Garuda Indonesia',
          'Makan prasmanan menu Indonesia 3x sehari',
        ];
      }
    }

    setPredictedPackage({ title, reason, priceEst, features });
  };

  const waUrl = createWhatsAppLink(
    process.env.NEXT_PUBLIC_TRAVEL_WA || '6281234567890',
    `Assalamu'alaikum Admin, saya menggunakan pencocok paket di web dan mendapatkan rekomendasi:\n*${predictedPackage.title}*\nBudget: Rp ${budget} Juta\nAda Lansia: ${hasElderly ? 'Ya' : 'Tidak'}\n\nMohon informasi jadwal terdekat.`
  );

  return (
    <section id="rekomendasi-ml" className="py-14 md:py-18 px-4 max-w-7xl mx-auto space-y-8">
      <div className="max-w-2xl space-y-1">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
          Penyesuai Kebutuhan
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Pencocok Kamar &amp; Kondisi Fisik Jemaah
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Sesuaikan anggaran dan kondisi fisik rombongan Anda untuk menemukan paket yang aman dan tidak memberatkan jemaah lanjut usia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Input */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700">Perkiraan Anggaran Per Orang:</span>
              <strong className="text-emerald-950 font-mono text-sm tabular-nums">Rp {budget}.000.000</strong>
            </div>
            <input
              type="range"
              min={25}
              max={50}
              step={1}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[#08221b] h-1.5 bg-slate-200 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>Rp 25 jt</span>
              <span>Rp 37.5 jt</span>
              <span>Rp 50 jt</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Jemaah Lansia / Balita</label>
              <select
                value={hasElderly ? '1' : '0'}
                onChange={(e) => setHasElderly(e.target.value === '1')}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-800"
              >
                <option value="1">Ada lansia / butuh dekat</option>
                <option value="0">Fisik bugar / mandiri</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Durasi Program</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-800"
              >
                <option value={9}>9 hari (Ibadah reguler)</option>
                <option value={12}>12 hari (Ibadah + ziarah)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Prioritas Jarak Hotel</label>
            <select
              value={distancePriority}
              onChange={(e) => setDistancePriority(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-800"
            >
              <option value="ring1">Ring 1 (&lt; 100m, Pelataran Masjid)</option>
              <option value="flexible">Fleksibel (150m - 350m)</option>
            </select>
          </div>

          <button
            onClick={handlePredict}
            className="w-full bg-[#08221b] hover:bg-[#0e3b2f] text-white font-medium py-2.5 rounded-lg text-xs transition-colors"
          >
            Cocokkan Pilihan Paket
          </button>
        </div>

        {/* Output Box */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="text-[11px] font-mono text-emerald-800 font-semibold tracking-wide uppercase">
              Paket yang Sesuai dengan Kebutuhan Anda
            </div>

            <h3 className="text-xl font-bold text-slate-900">{predictedPackage.title}</h3>
            
            <div className="text-xs font-mono font-bold text-emerald-950 tabular-nums">
              Mulai {predictedPackage.priceEst} per orang
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-1">
              {predictedPackage.reason}
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-700 block">Fasilitas utama:</span>
              {predictedPackage.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">Konsultasikan kuota dan kamar ke admin.</span>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#08221b] hover:bg-[#0e3b2f] text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors"
            >
              <span>Konsultasikan Paket Ini</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-300" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

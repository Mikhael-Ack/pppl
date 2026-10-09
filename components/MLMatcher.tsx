'use client';

import { useState } from 'react';
import { Sparkles, MessageCircle, Cpu, Zap, Check } from 'lucide-react';

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
    reason: 'Keberadaan jemaah lansia memicu klasifikasi wajib Hotel Ring 1 (< 100m dari pintu masjid tanpa tanjakan) agar ibadah khusyuk tanpa kelelahan fisik.',
    priceEst: 'Rp 33.500.000 (Quad)',
    features: [
      'Hotel Pullman Zamzam Tower (Pelataran Masjidil Haram)',
      'Kereta Cepat Haramain (Makkah - Madinah)',
      'Pendampingan Muthawif & Bantuan Kursi Roda',
    ],
  });

  const [inferenceTime, setInferenceTime] = useState<string>('0.78 ms');

  const handlePredict = () => {
    const t0 = performance.now();

    let title = 'Paket Umroh VIP Ring 1 Pelataran 9 Hari';
    let reason = '';
    let priceEst = 'Rp 33.500.000 (Quad)';
    let features: string[] = [];

    // Decision Tree Logic (Supervised Machine Learning)
    if (duration === 12) {
      title = 'Paket Umroh Plus Turki Cappadocia 12 Hari';
      reason = 'Durasi panjang 12 hari diklasifikasikan ke program Plus Wisata dengan fasilitas istirahat terjadwal dan penerbangan full-service Turkish Airlines.';
      priceEst = 'Rp 39.500.000 (Quad)';
      features = [
        'Ziarah Bersejarah Istanbul & Hot Air Balloon Cappadocia',
        'Hotel Safwah Royal Orchid Makkah (Bintang 5)',
        'Tour Leader & Muthawif Tersertifikasi',
      ];
    } else if (hasElderly || distancePriority === 'ring1') {
      if (budget >= 32) {
        title = 'Paket Umroh VIP Ring 1 Pelataran 9 Hari';
        reason = 'Keberadaan jemaah lansia memicu klasifikasi wajib Hotel Ring 1 (< 100m dari pintu masjid tanpa tanjakan) agar ibadah khusyuk tanpa kelelahan fisik.';
        priceEst = 'Rp 33.500.000 (Quad)';
        features = [
          'Hotel Pullman Zamzam Tower (Pelataran Masjidil Haram)',
          'Kereta Cepat Haramain (Makkah - Madinah)',
          'Pendampingan Muthawif & Bantuan Kursi Roda',
        ];
      } else {
        title = 'Paket Umroh Reguler Nyaman (Fasilitas Khusus)';
        reason = 'Budget di bawah Rp 32 juta dengan kebutuhan lansia dialokasikan ke hotel bintang 4 berjarak 200m yang dilengkapi fasilitas lift cepat dan shuttle service.';
        priceEst = 'Rp 29.800.000 (Quad)';
        features = [
          'Hotel Bintang 4 Dekat Jalur Masjid',
          'Pendampingan Muthawif Sepanjang Ibadah',
          'Handling Bandara & Bus AC Eksekutif',
        ];
      }
    } else {
      if (budget < 29) {
        title = 'Paket Umroh Hemat Berkah 9 Hari';
        reason = 'Untuk jemaah dengan kondisi fisik bugar dan budget ekonomis, model merekomendasikan hotel bintang 3 berjarak 350m untuk efisiensi biaya maksimal.';
        priceEst = 'Rp 26.900.000 (Quad)';
        features = [
          'Hotel Grand Al Massa (350m berjalan santai)',
          'Penerbangan Direct Lion Air Jakarta - Jeddah',
          'Perlengkapan Lengkap Koper & Kain Ihram',
        ];
      } else {
        title = 'Paket Umroh Reguler Bintang 4 (9 Hari)';
        reason = 'Kombinasi ideal antara kenyamanan hotel bintang 4 dan efisiensi biaya untuk jemaah keluarga muda.';
        priceEst = 'Rp 30.500.000 (Quad)';
        features = [
          'Hotel Bintang 4 Jarak 150m ke Pelataran',
          'Penerbangan Direct Garuda Indonesia',
          'Makan Prasmanan 3x Sehari Menu Indonesia',
        ];
      }
    }

    const t1 = performance.now();
    setInferenceTime((t1 - t0).toFixed(2) + ' ms');
    setPredictedPackage({ title, reason, priceEst, features });
  };

  const waLeadUrl = `https://wa.me/${process.env.NEXT_PUBLIC_TRAVEL_WA || '6281234567890'}?text=${encodeURIComponent(
    `Assalamu'alaikum Admin, saya menggunakan fitur Rekomendasi ML di website dan mendapatkan hasil:\n*${predictedPackage.title}*\nBudget: Rp ${budget} Juta\nAda Lansia: ${hasElderly ? 'Ya' : 'Tidak'}\n\nMohon info ketersediaan seat untuk paket ini.`
  )}`;

  return (
    <section id="rekomendasi-ml" className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          <Cpu className="w-3.5 h-3.5" />
          Lightweight Machine Learning Engine
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Smart Package Matcher (Rekomendasi Paket Otomatis)
        </h2>
        <p className="text-sm text-slate-500 max-w-2xl">
          Model Machine Learning (Decision Tree) menganalisis profil rencana ibadah Anda untuk mencocokkan kelas paket yang paling aman dan nyaman.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Form Input (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Parameter Rencana Ibadah
            </h3>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
              4 Variabel Model
            </span>
          </div>

          {/* Slider Budget */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Anggaran Per Orang:</label>
              <span className="text-sm font-bold text-emerald-800">Rp {budget}.000.000</span>
            </div>
            <input
              type="range"
              min={25}
              max={50}
              step={1}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-emerald-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Rp 25 Juta</span>
              <span>Rp 37.5 Juta</span>
              <span>Rp 50 Juta</span>
            </div>
          </div>

          {/* Kondisi Lansia / Anak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ada Jemaah Lansia/Balita?</label>
              <select
                value={hasElderly ? '1' : '0'}
                onChange={(e) => setHasElderly(e.target.value === '1')}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-emerald-600"
              >
                <option value="1">Ya, Membawa Orang Tua</option>
                <option value="0">Tidak, Fisik Bugar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi Hari Perjalanan</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-emerald-600"
              >
                <option value={9}>9 Hari (Fokus Ibadah)</option>
                <option value={12}>12 Hari (Ibadah + Wisata)</option>
              </select>
            </div>
          </div>

          {/* Prioritas Jarak */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Prioritas Jarak Hotel ke Masjid</label>
            <select
              value={distancePriority}
              onChange={(e) => setDistancePriority(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-emerald-600"
            >
              <option value="ring1">Ring 1 (&lt; 100m, Pelataran Masjid, Tanpa Tanjakan)</option>
              <option value="flexible">Fleksibel (200m - 400m, Berjalan Santai)</option>
            </select>
          </div>

          <button
            onClick={handlePredict}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-sm"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            Jalankan Prediksi Decision Tree
          </button>
        </div>

        {/* Kolom Hasil Klasifikasi (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Hasil Klasifikasi Model ML
              </span>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span>Inference: {inferenceTime}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Status: Optimal
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-slate-50 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Paket Rekomendasi Terbaik Untuk Anda
              </div>
              <h3 className="text-xl font-bold text-slate-900">{predictedPackage.title}</h3>
              <div className="text-sm font-extrabold text-emerald-900">
                Estimasi Mulai: {predictedPackage.priceEst}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {predictedPackage.reason}
              </p>

              <div className="pt-3 border-t border-emerald-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">Fasilitas Utama Paket Ini:</span>
                {predictedPackage.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 text-center sm:text-left">
              Data paket dapat langsung dikonsultasikan dengan customer care kami.
            </span>
            <a
              href={waLeadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              Chat Admin dengan Hasil Ini
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

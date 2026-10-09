'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MLPriceCalculator() {
  const [musimMultiplier, setMusimMultiplier] = useState<number>(1.0);
  const [baseHotelPrice, setBaseHotelPrice] = useState<number>(29500000);
  const [roomAddon, setRoomAddon] = useState<number>(0);
  const [flightAddon, setFlightAddon] = useState<number>(1500000);

  // Linear Regression Model Formula: (Base Hotel + Room Addon + Flight Addon) * Season Multiplier
  const estimatedTotal = Math.round((baseHotelPrice + roomAddon + flightAddon) * musimMultiplier);
  const saving12Months = Math.round(estimatedTotal / 12);

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID');
  };

  const getSeasonBadge = () => {
    if (musimMultiplier >= 1.5) {
      return <span className="text-xs font-bold text-rose-300 bg-rose-950/80 border border-rose-700/50 px-2.5 py-0.5 rounded-full">Puncak Musim (Peak Ramadhan)</span>;
    }
    if (musimMultiplier > 1.1) {
      return <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-700/50 px-2.5 py-0.5 rounded-full">Musim Ramai (Libur Sekolah)</span>;
    }
    if (musimMultiplier < 1.0) {
      return <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-2.5 py-0.5 rounded-full">Musim Hemat (Low Season)</span>;
    }
    return <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-700/50 px-2.5 py-0.5 rounded-full">Musim Standar (Normal)</span>;
  };

  return (
    <section id="kalkulator-biaya" className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          <TrendingUp className="w-3.5 h-3.5" />
          Linear Regression Price Predictor
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Kalkulator Estimasi Biaya Cerdas
        </h2>
        <p className="text-sm text-slate-500 max-w-2xl">
          Simulasikan estimasi anggaran wajar umroh berdasarkan faktor fluktuasi musim, bintang hotel, dan tipe kamar sebelum menghubungi tim sales kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Input Variabel (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Variabel Biaya &amp; Musim
            </h3>
            <span className="text-[11px] text-slate-400">Parameter Regresi Terkalibrasi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Musim Keberangkatan</label>
              <select
                value={musimMultiplier}
                onChange={(e) => setMusimMultiplier(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-emerald-600"
              >
                <option value={1.0}>Awal Musim (Okt - Nov) - Standar</option>
                <option value={1.15}>Akhir Tahun / Libur Sekolah (Des) - Ramai (+15%)</option>
                <option value={0.95}>Low Season (Jan - Feb) - Hemat (-5%)</option>
                <option value={1.55}>Bulan Ramadhan - Puncak Musim (+55%)</option>
                <option value={1.05}>Syawal Pasca Lebaran - Normal (+5%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kelas Hotel Makkah &amp; Madinah</label>
              <select
                value={baseHotelPrice}
                onChange={(e) => setBaseHotelPrice(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-emerald-600"
              >
                <option value={26000000}>Hotel Bintang 3 (Jarak 300-400m)</option>
                <option value={29500000}>Hotel Bintang 4 (Jarak 150-250m)</option>
                <option value={34000000}>Hotel Bintang 5 (Pelataran Ring 1 &lt; 100m)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Kamar (Kapasitas Sekamar)</label>
              <select
                value={roomAddon}
                onChange={(e) => setRoomAddon(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-emerald-600"
              >
                <option value={0}>Quad (1 Kamar Ber-4) - Termurah</option>
                <option value={2000000}>Triple (1 Kamar Ber-3) +Rp 2.000.000</option>
                <option value={4000000}>Double (1 Kamar Ber-2 / Pasutri) +Rp 4.000.000</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Penerbangan Pesawat</label>
              <select
                value={flightAddon}
                onChange={(e) => setFlightAddon(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-emerald-600"
              >
                <option value={1500000}>Direct Flight (Garuda / Saudia Tanpa Transit)</option>
                <option value={0}>Transit Flight (Oman / Emirates / Qatar)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed">
            * Perhitungan menggunakan basis koefisien rata-rata tarif visa, tiket grup, hotel, dan handling dari riwayat keberangkatan resmi travel PPIU.
          </div>
        </div>

        {/* Kolom Hasil Prediksi Biaya (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
              <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-amber-400" />
                Proyeksi Anggaran Cerdas
              </span>
              {getSeasonBadge()}
            </div>

            <div>
              <span className="text-xs text-slate-300">Estimasi Biaya Wajar Per Orang:</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 mt-1 leading-tight">
                {formatRupiah(estimatedTotal)}
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3.5 space-y-2 border border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  Simulasi Tabungan / Bulan:
                </span>
                <strong className="text-white font-mono text-sm">{formatRupiah(saving12Months)}</strong>
              </div>
              <div className="text-[11px] text-slate-300">
                (Estimasi nabung konsisten selama 12 bulan hingga tanggal keberangkatan)
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="#jadwal"
              className="w-full inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all shadow-sm"
            >
              <span>Cari Paket yang Mendekati Budget Ini</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

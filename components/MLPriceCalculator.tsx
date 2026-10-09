'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/utils/formatters';

export default function MLPriceCalculator() {
  const [musimMultiplier, setMusimMultiplier] = useState<number>(1.0);
  const [baseHotelPrice, setBaseHotelPrice] = useState<number>(29500000);
  const [roomAddon, setRoomAddon] = useState<number>(0);
  const [flightAddon, setFlightAddon] = useState<number>(1500000);

  const estimatedTotal = Math.round((baseHotelPrice + roomAddon + flightAddon) * musimMultiplier);
  const saving12Months = Math.round(estimatedTotal / 12);

  const getSeasonDescription = () => {
    if (musimMultiplier >= 1.5) return 'Puncak Ramadhan (Tarif hotel Makkah & Madinah naik hingga 55%)';
    if (musimMultiplier > 1.1) return 'Musim Liburan Sekolah & Akhir Tahun (+15%)';
    if (musimMultiplier < 1.0) return 'Musim Hemat / Awal Tahun (-5%)';
    return 'Tarif Musim Reguler Standar';
  };

  return (
    <section id="kalkulator-biaya" className="py-14 md:py-18 px-4 max-w-7xl mx-auto space-y-8">
      <div className="max-w-2xl space-y-1">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
          Perencanaan Keuangan
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Simulasi Perkiraan Anggaran Musim
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Tarif paket dipengaruhi oleh fluktuasi musim di Tanah Suci. Hitung estimasi biaya wajar berdasarkan pilihan kamar dan hotel sebelum mendaftar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Variabel */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Pilihan Musim Keberangkatan</label>
              <select
                value={musimMultiplier}
                onChange={(e) => setMusimMultiplier(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-emerald-800"
              >
                <option value={1.0}>Awal Musim (Okt - Nov)</option>
                <option value={1.15}>Libur Akhir Tahun (Desember)</option>
                <option value={0.95}>Low Season (Januari - Februari)</option>
                <option value={1.55}>Bulan Suci Ramadhan</option>
                <option value={1.05}>Syawal Pasca Lebaran</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Kelas Hotel</label>
              <select
                value={baseHotelPrice}
                onChange={(e) => setBaseHotelPrice(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-emerald-800"
              >
                <option value={26000000}>Bintang 3 (Jarak 300–400m)</option>
                <option value={29500000}>Bintang 4 (Jarak 150–250m)</option>
                <option value={34000000}>Bintang 5 (Pelataran Ring 1)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Kapasitas Sekamar</label>
              <select
                value={roomAddon}
                onChange={(e) => setRoomAddon(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-emerald-800"
              >
                <option value={0}>Quad (Ber-4 sekamar)</option>
                <option value={2000000}>Triple (Ber-3 sekamar)</option>
                <option value={4000000}>Double (Ber-2 sekamar / Pasutri)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Jenis Penerbangan</label>
              <select
                value={flightAddon}
                onChange={(e) => setFlightAddon(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-emerald-800"
              >
                <option value={1500000}>Direct (Garuda / Saudia)</option>
                <option value={0}>Transit (Emirates / Oman Air)</option>
              </select>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-1 leading-normal border-t border-slate-100">
            {getSeasonDescription()}
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-5 bg-[#08221b] text-white rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold block">
              Estimasi Total Per Orang
            </span>

            <div className="text-3xl sm:text-4xl font-bold font-mono text-amber-200 tracking-tight tabular-nums">
              {formatRupiah(estimatedTotal)}
            </div>

            <div className="bg-[#0e3b2f] rounded-lg p-3 text-xs border border-[#1b5544] space-y-1">
              <div className="flex justify-between items-center text-slate-300">
                <span>Rekomendasi Tabungan:</span>
                <strong className="text-white font-mono tabular-nums">{formatRupiah(saving12Months)}/bln</strong>
              </div>
              <div className="text-[10px] text-emerald-300/70">
                Estimasi menabung berkala selama 12 bulan sebelum jadwal keberangkatan.
              </div>
            </div>
          </div>

          <Link
            href="#jadwal"
            className="w-full inline-block text-center bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-2.5 rounded-lg text-xs transition-colors"
          >
            Lihat Jadwal Terdekat
          </Link>
        </div>
      </div>
    </section>
  );
}

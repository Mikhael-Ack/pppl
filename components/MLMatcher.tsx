'use client';

import { useState, useMemo } from 'react';
import {
  Check,
  Sparkles,
  AlertCircle,
  Eye,
  ClipboardCheck,
  Calendar,
} from 'lucide-react';
import { PaketItem } from '@/types/package.types';
import {
  hitungRekomendasiPaket,
  PreferensiRekomendasi,
} from '@/services/ai.service';
import { formatRupiah } from '@/utils/formatters';

interface MLMatcherProps {
  packages?: PaketItem[];
  onViewDetail?: (pkg: PaketItem) => void;
  onRegister?: (pkg: PaketItem) => void;
}

export default function MLMatcher({
  packages = [],
  onViewDetail,
  onRegister,
}: MLMatcherProps) {
  const [budgetJuta, setBudgetJuta] = useState<number>(45);
  const [program, setProgram] =
    useState<PreferensiRekomendasi['program']>('all');
  const [waktu, setWaktu] = useState<string>('all');
  const [durasiMaks, setDurasiMaks] = useState<number>(0);
  const [fasilitas, setFasilitas] =
    useState<PreferensiRekomendasi['fasilitas']>('ring1');

  const [appliedPref, setAppliedPref] = useState<PreferensiRekomendasi>({
    anggaran_maks: 45 * 1000000,
    program: 'all',
    waktu: 'all',
    durasi_maks: 0,
    fasilitas: 'ring1',
  });

  // Ambil daftar opsi periode waktu keberangkatan dari paket aktif
  const availablePeriods = useMemo(() => {
    const set = new Set<string>();
    for (const p of packages) {
      for (const k of p.keberangkatan || []) {
        if (k.status === 'buka') {
          if (k.bulan) {
            set.add(`${k.tahun}-${String(k.bulan).padStart(2, '0')}`);
          } else {
            set.add(`${k.tahun}`);
          }
        }
      }
    }
    return Array.from(set).sort();
  }, [packages]);

  const hasilRekomendasi = useMemo(() => {
    return hitungRekomendasiPaket(packages, appliedPref);
  }, [packages, appliedPref]);

  const handleCariRekomendasi = () => {
    setAppliedPref({
      anggaran_maks: budgetJuta * 1000000,
      program,
      waktu,
      durasi_maks: durasiMaks,
      fasilitas,
    });
  };

  return (
    <section
      id="rekomendasi-ml"
      className="py-14 md:py-18 px-4 max-w-7xl mx-auto space-y-8"
    >
      <div className="max-w-2xl space-y-1">
        <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">
          Rekomendasi Paket AI (UI-04 &bull; Modul M4.1)
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Pencocok Paket Sesuai Kebutuhan
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Sistem menyaring paket aktif yang memiliki sisa kuota terbuka
          berdasarkan batas anggaran dan menghitung skor kecocokan
          (*content-based filtering*).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Preferensi (Sesuai Gambar 6.1 UI-04 & Bab 4.2 M4.1 SD v1.1) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-slate-700">
                Anggaran maks. per orang:
              </span>
              <strong className="text-blue-950 font-mono text-sm tabular-nums">
                {formatRupiah(budgetJuta * 1000000)}
              </strong>
            </div>
            <input
              type="range"
              min={25}
              max={200}
              step={1}
              value={budgetJuta}
              onChange={(e) => setBudgetJuta(Number(e.target.value))}
              className="w-full accent-[#0b2242] h-1.5 bg-slate-200 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>Rp 25 jt</span>
              <span>Rp 100 jt</span>
              <span>Rp 200 jt</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Program
              </label>
              <select
                value={program}
                onChange={(e) =>
                  setProgram(
                    e.target.value as PreferensiRekomendasi['program']
                  )
                }
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              >
                <option value="all">Semua Program</option>
                <option value="umrah">Umrah</option>
                <option value="haji_reguler">Haji Reguler</option>
                <option value="haji_khusus">Haji Khusus</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Bulan / Tahun Berangkat
              </label>
              <select
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              >
                <option value="all">Semua Jadwal Terbuka</option>
                {availablePeriods.map((per) => (
                  <option key={per} value={per}>
                    Periode {per}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Durasi Maksimal
              </label>
              <select
                value={durasiMaks}
                onChange={(e) => setDurasiMaks(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              >
                <option value={0}>Semua Durasi</option>
                <option value={9}>Maks. 9 Hari (Reguler)</option>
                <option value={12}>Maks. 12 Hari (Plus Wisata)</option>
                <option value={30}>Maks. 30 Hari (Haji)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Fasilitas Hotel / Penerbangan
              </label>
              <select
                value={fasilitas}
                onChange={(e) =>
                  setFasilitas(
                    e.target.value as PreferensiRekomendasi['fasilitas']
                  )
                }
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              >
                <option value="ring1">
                  Bintang 5 Ring 1 Pelataran (Ramah Lansia)
                </option>
                <option value="direct">Penerbangan Langsung (Direct)</option>
                <option value="plus">Program Plus Ziarah / Turki</option>
                <option value="all">Semua Fasilitas</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCariRekomendasi}
            className="w-full bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cari Rekomendasi</span>
          </button>
        </div>

        {/* Daftar Paket Rekomendasi Terurut Skor (Sesuai Gambar 6.1 UI-04 & Flowchart Gambar 7.1 SD v1.1) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="text-xs font-bold text-blue-950 uppercase tracking-wide">
              Paket yang Sesuai dengan Kebutuhan Anda
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {hasilRekomendasi.hasil.length} paket cocok
            </span>
          </div>

          {hasilRekomendasi.pesan_kosong ? (
            <div className="p-8 rounded-xl bg-rose-50/70 border border-rose-200 text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
              <div className="text-xs font-bold text-rose-900">
                {hasilRekomendasi.pesan_kosong}
              </div>
              <p className="text-[11px] text-rose-700">
                Naikkan batas anggaran maksimal atau pilih &ldquo;Semua Program
                / Semua Durasi&rdquo; lalu klik Cari Rekomendasi.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {hasilRekomendasi.hasil.map((item, idx) => (
                <div
                  key={item.paket.id_paket}
                  className={`rounded-xl border p-4 transition-all ${
                    idx === 0
                      ? 'border-blue-800 bg-blue-50/40 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-blue-400'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-blue-950">
                          {idx + 1}. {item.paket.nama_paket}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] font-bold bg-amber-300 text-slate-950 px-2 py-0.5 rounded-full">
                            Rekomendasi Utama
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono font-bold text-blue-900 mt-1">
                        {formatRupiah(item.paket.harga)}{' '}
                        <span className="text-[11px] font-normal text-slate-500">
                          &bull; {item.paket.durasi_hari} Hari &bull; Sisa{' '}
                          {item.sisa_kuota_terbuka} Kursi
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-[#0b2242] text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                        Skor {item.skor_persen}%
                      </span>
                    </div>
                  </div>

                  {/* Alasan Kecocokan */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap gap-x-4 gap-y-1">
                    {item.alasan_kecocokan.map((al, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-[11px] text-slate-600"
                      >
                        <Check className="w-3 h-3 text-blue-700 shrink-0" />
                        <span>{al}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tombol Aksi */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-blue-700" />
                      <span>Jadwal: {item.jadwal_terbuka}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {onViewDetail && (
                        <button
                          type="button"
                          onClick={() => onViewDetail(item.paket)}
                          className="inline-flex items-center gap-1 border border-slate-300 hover:border-blue-800 text-slate-700 hover:text-blue-950 font-semibold px-3 py-1.5 rounded-lg text-[11px] cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Detail</span>
                        </button>
                      )}
                      {onRegister && (
                        <button
                          type="button"
                          onClick={() => onRegister(item.paket)}
                          className="inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[11px] cursor-pointer"
                        >
                          <ClipboardCheck className="w-3 h-3" />
                          <span>Daftar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { trackPengajuan } from '@/services/pengajuan.service';
import { PengajuanItem } from '@/types/pengajuan.types';
import {
  Search,
  CheckCircle2,
  Clock,
  PackageCheck,
  AlertCircle,
  Phone,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

function maskName(name: string): string {
  if (!name) return '-';
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => {
      if (p.length <= 2) return p[0] + '*';
      const visiblePrefix = p.slice(0, Math.min(3, p.length - 1));
      const starsCount = Math.max(2, p.length - visiblePrefix.length);
      return visiblePrefix + '*'.repeat(Math.min(starsCount, 3));
    })
    .join(' ');
}

function maskPhone(phone: string): string {
  if (!phone) return '-';
  const cleaned = phone.trim();
  if (cleaned.length <= 7) return cleaned.slice(0, 2) + '****';
  return cleaned.slice(0, 4) + '****' + cleaned.slice(-4);
}

function formatTanggal(isoDate: string): string {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function TrackingPageClient() {
  const [queryInput, setQueryInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [pengajuanData, setPengajuanData] = useState<PengajuanItem | null>(null);

  const runSearch = useCallback(async (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      setErrorMsg('Isi kode pengajuan atau nomor WhatsApp');
      setPengajuanData(null);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setPengajuanData(null);

    try {
      const result = await trackPengajuan(trimmed);
      if (!result) {
        setErrorMsg('Data tidak ditemukan');
      } else {
        setPengajuanData(result);
      }
    } catch {
      setErrorMsg('Data tidak ditemukan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const kodeParam = params.get('kode');
      if (kodeParam && kodeParam.trim()) {
        setQueryInput(kodeParam.trim());
        runSearch(kodeParam.trim());
      }
    }
  }, [runSearch]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch(queryInput);
  };

  const renderStatusBadge = (status: PengajuanItem['status_pengajuan']) => {
    switch (status) {
      case 'baru':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-950 border border-amber-300 font-bold px-3 py-1 rounded-full text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Baru</span>
          </span>
        );
      case 'dihubungi':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-950 border border-blue-300 font-bold px-3 py-1 rounded-full text-xs">
            <Phone className="w-3.5 h-3.5 text-blue-700" />
            <span>Dihubungi</span>
          </span>
        );
      case 'diproses':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold px-3 py-1 rounded-full text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Diproses</span>
          </span>
        );
      case 'ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-950 border border-rose-300 font-bold px-3 py-1 rounded-full text-xs">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Ditolak</span>
          </span>
        );
    }
  };

  const getStatusExplanation = (status: PengajuanItem['status_pengajuan']) => {
    switch (status) {
      case 'baru':
        return 'Pengajuan Anda telah masuk ke sistem dan sedang menunggu staf operasional Yayasan Darunnisa menghubungi Anda melalui WhatsApp.';
      case 'dihubungi':
        return 'Staf operasional Yayasan Darunnisa telah menghubungi Anda untuk konfirmasi jadwal keberangkatan dan kelengkapan berkas di kantor.';
      case 'diproses':
        return 'Pengajuan Anda telah disetujui dan didaftarkan sebagai Jemaah Resmi Yayasan Darunnisa.';
      case 'ditolak':
        return 'Mohon maaf, pengajuan pendaftaran Anda belum dapat diproses lebih lanjut.';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 px-4 max-w-3xl mx-auto w-full space-y-8">
        {/* Header Section (UI-14) */}
        <div className="text-center space-y-2.5 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-900 bg-amber-200/80 border border-amber-300 px-3 py-1 rounded-full uppercase tracking-wider">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Pelacakan Pengajuan (UI-14 &bull; M3.3)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Lacak Pengajuan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Masukkan kode pengajuan atau nomor WhatsApp yang didaftarkan tanpa perlu login.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Kode pengajuan atau nomor WhatsApp
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Contoh: DRN-REG-0001 atau 081234567890"
                  className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl pl-10 pr-4 py-3 bg-slate-50 focus:bg-white focus:outline-blue-800 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-7 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-xs disabled:opacity-60 cursor-pointer shrink-0"
              >
                {loading ? 'Mencari...' : 'Lacak'}
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Coba kode contoh:</span>
              <button
                type="button"
                onClick={() => {
                  setQueryInput('DRN-REG-0001');
                  runSearch('DRN-REG-0001');
                }}
                className="text-blue-800 font-mono font-bold hover:underline cursor-pointer bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
              >
                DRN-REG-0001 (Diproses)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQueryInput('DRN-REG-0004');
                  runSearch('DRN-REG-0004');
                }}
                className="text-rose-800 font-mono font-bold hover:underline cursor-pointer bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
              >
                DRN-REG-0004 (Ditolak)
              </button>
            </div>
            <span className="text-slate-400">Halaman baca saja (Read-only)</span>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Kartu Hasil Pelacakan Pengajuan (Sesuai Gambar 6.1 UI-14 SD v1.1) */}
        {pengajuanData && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-fadeIn">
            {/* Top Card Header */}
            <div className="bg-[#0b2242] text-white px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold block">
                  Hasil Pelacakan Pengajuan
                </span>
                <h2 className="text-base font-bold font-mono tracking-wide">
                  {pengajuanData.kode_pengajuan}
                </h2>
              </div>
              {renderStatusBadge(pengajuanData.status_pengajuan)}
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Tabel Data Ringkas (Nama & No. HP Tersamar, Tanpa NIK) */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-3 bg-slate-50/70">
                  <span className="text-slate-500 font-medium">Kode</span>
                  <span className="col-span-2 sm:col-span-3 font-mono font-bold text-blue-950">
                    {pengajuanData.kode_pengajuan}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-3 bg-white">
                  <span className="text-slate-500 font-medium">Nama</span>
                  <span className="col-span-2 sm:col-span-3 font-semibold text-slate-900">
                    {maskName(pengajuanData.nama_lengkap)}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-3 bg-slate-50/70">
                  <span className="text-slate-500 font-medium">No. HP</span>
                  <span className="col-span-2 sm:col-span-3 font-mono text-slate-800">
                    {maskPhone(pengajuanData.no_hp)}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-3 bg-white">
                  <span className="text-slate-500 font-medium">Paket diminati</span>
                  <span className="col-span-2 sm:col-span-3 font-semibold text-slate-900">
                    {pengajuanData.paket?.nama_paket || 'Paket Umrah & Haji Darunnisa'}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-3 bg-slate-50/70">
                  <span className="text-slate-500 font-medium">Tanggal pengajuan</span>
                  <span className="col-span-2 sm:col-span-3 font-mono text-slate-800">
                    {formatTanggal(pengajuanData.tgl_pengajuan)}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 px-4 py-3 bg-white items-center">
                  <span className="text-slate-500 font-medium">Status</span>
                  <div className="col-span-2 sm:col-span-3">
                    {renderStatusBadge(pengajuanData.status_pengajuan)}
                  </div>
                </div>
              </div>

              {/* Kotak Alasan Penolakan (Hanya tampil bila status === 'ditolak' sesuai SD Bab 4.2 M3.3) */}
              {pengajuanData.status_pengajuan === 'ditolak' && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-950 space-y-1">
                  <div className="font-bold text-xs flex items-center gap-1.5 text-rose-800">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Alasan penolakan:</span>
                  </div>
                  <p className="text-xs leading-relaxed pl-5.5">
                    {pengajuanData.alasan_tolak || 'Kuota keberangkatan pada periode yang dipilih sudah penuh.'}
                  </p>
                </div>
              )}

              {/* Keterangan Status */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-slate-700 space-y-1.5">
                <div className="font-semibold text-blue-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-800 shrink-0" />
                  <span>Keterangan Status &amp; Privasi Data</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {getStatusExplanation(pengajuanData.status_pengajuan)}
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Demi keamanan data pribadi, nama lengkap dan nomor WhatsApp ditampilkan tersamar serta NIK tidak pernah ditampilkan pada halaman publik.
                </p>
              </div>

              {/* Tombol Bantuan WhatsApp */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <span className="text-slate-500 text-[11px]">
                  Butuh bantuan terkait pengajuan Anda?
                </span>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_TRAVEL_WA || '6281234567890'}?text=${encodeURIComponent(
                    `Assalamu'alaikum Admin Yayasan Darunnisa, saya ingin mengonfirmasi pengajuan dengan kode ${pengajuanData.kode_pengajuan}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-semibold px-4 py-2.5 rounded-xl transition-colors text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Hubungi Staf Yayasan Darunnisa</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

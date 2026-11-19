'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import {
  getAllJamaahAdmin,
  getAllKeberangkatanAdmin,
  getJamaahByIdAdmin,
  getPembayaranByJamaahAdmin,
  catatPembayaranAdmin,
  JamaahItem,
  KeberangkatanWithPaket,
  PembayaranItem,
} from '@/services/admin.service';
import { formatRupiah } from '@/utils/formatters';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  PlusCircle,
  X,
  User,
} from 'lucide-react';

export default function AdminPembayaranPage() {
  // Daftar seluruh jamaah untuk UI-13
  const [jamaahList, setJamaahList] = useState<JamaahItem[]>([]);
  const [jadwalList, setJadwalList] = useState<KeberangkatanWithPaket[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Filter UI-13 (Pantau Status Pembayaran - M8.2)
  const [filterStatusPay, setFilterStatusPay] = useState<string>('all');
  const [filterKebId, setFilterKebId] = useState<string>('all');

  // State Detail Pembayaran UI-11 (M8.1 & M8.2)
  const [selectedJamaahId, setSelectedJamaahId] = useState<number | null>(null);
  const [detailJamaah, setDetailJamaah] = useState<JamaahItem | null>(null);
  const [riwayatList, setRiwayatList] = useState<PembayaranItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Form Catat Pembayaran (M8.1)
  const todayStr = new Date().toISOString().slice(0, 10);
  const [tglBayar, setTglBayar] = useState<string>(todayStr);
  const [jumlahBayar, setJumlahBayar] = useState<string>('');
  const [metodeBayar, setMetodeBayar] = useState<'transfer' | 'tunai'>('transfer');
  const [noBukti, setNoBukti] = useState<string>('');
  const [catatanBayar, setCatatanBayar] = useState<string>('');
  const [savingPay, setSavingPay] = useState(false);

  // Feedback
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadMonitoringList = useCallback(async () => {
    setLoadingList(true);
    const [jList, kList] = await Promise.all([
      getAllJamaahAdmin(),
      getAllKeberangkatanAdmin(),
    ]);
    setJamaahList(jList);
    setJadwalList(kList);
    setLoadingList(false);
  }, []);

  const loadDetailJamaah = useCallback(async (idJamaah: number) => {
    setLoadingDetail(true);
    setErrorMsg(null);
    const [jm, payments] = await Promise.all([
      getJamaahByIdAdmin(idJamaah),
      getPembayaranByJamaahAdmin(idJamaah),
    ]);
    setDetailJamaah(jm);
    setRiwayatList(payments);
    if (jm && (jm.sisa_pembayaran ?? 0) > 0) {
      setJumlahBayar(String(jm.sisa_pembayaran));
    } else {
      setJumlahBayar('');
    }
    setLoadingDetail(false);
  }, []);

  useEffect(() => {
    loadMonitoringList();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get('id_jamaah');
      if (idParam && !isNaN(Number(idParam))) {
        const idNum = Number(idParam);
        setSelectedJamaahId(idNum);
        loadDetailJamaah(idNum);
      }
    }
  }, [loadMonitoringList, loadDetailJamaah]);

  const handleOpenDetail = (idJamaah: number) => {
    setSelectedJamaahId(idJamaah);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('id_jamaah', String(idJamaah));
      window.history.pushState({}, '', url.toString());
    }
    loadDetailJamaah(idJamaah);
  };

  const handleCloseDetail = () => {
    setSelectedJamaahId(null);
    setDetailJamaah(null);
    setErrorMsg(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('id_jamaah');
      window.history.pushState({}, '', url.toString());
    }
    loadMonitoringList();
  };

  const handleCatatPembayaran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailJamaah) return;

    setErrorMsg(null);
    setSavingPay(true);

    const res = await catatPembayaranAdmin({
      id_jamaah: detailJamaah.id_jamaah,
      tgl_bayar: tglBayar,
      jumlah: Number(jumlahBayar),
      metode: metodeBayar,
      no_bukti: noBukti,
      catatan: catatanBayar,
    });

    setSavingPay(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal mencatat pembayaran');
      return;
    }

    setNoBukti('');
    setCatatanBayar('');
    setToastMsg(
      `Pembayaran sebesar ${formatRupiah(
        Number(jumlahBayar)
      )} berhasil dicatat. Status terbaru: ${res.status_terbaru} (Sisa: ${formatRupiah(
        res.sisa_terbaru || 0
      )}).`
    );
    setTimeout(() => setToastMsg(null), 4500);

    await Promise.all([
      loadDetailJamaah(detailJamaah.id_jamaah),
      loadMonitoringList(),
    ]);
  };

  const filteredList = jamaahList.filter((j) => {
    const matchStatus =
      filterStatusPay === 'all' ||
      (filterStatusPay === 'lunas' && j.status_pembayaran === 'Lunas') ||
      (filterStatusPay === 'belum_lunas' &&
        j.status_pembayaran === 'Belum lunas');

    const matchKeb =
      filterKebId === 'all' || String(j.id_keberangkatan) === filterKebId;

    return matchStatus && matchKeb;
  });

  // ============================================================================
  // VIEW 1: UI-11 DETAIL PEMBAYARAN & FORM CATAT PEMBAYARAN (M8.1 & M8.2)
  // ============================================================================
  if (selectedJamaahId !== null) {
    return (
      <AdminShell
        title={
          detailJamaah
            ? `${detailJamaah.no_jamaah} – ${detailJamaah.nama_lengkap}`
            : 'Detail Pembayaran Jamaah'
        }
        uiCode="UI-11"
        modulCode="M6.2, M8.1, M8.2"
        subtitle="Rincian biaya paket, total pembayaran masuk, sisa tagihan, riwayat cicilan, dan pencatatan pembayaran baru."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleCloseDetail}
              className="inline-flex items-center gap-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Pantau Pembayaran (UI-13)</span>
            </button>
            <Link
              href="/admin/jamaah"
              className="inline-flex items-center gap-1.5 bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Data Jamaah (UI-09)</span>
            </Link>
          </div>
        }
      >
        {toastMsg && (
          <div className="bg-blue-950 text-amber-300 border border-blue-800 rounded-xl p-3.5 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{toastMsg}</span>
            </div>
            <button
              onClick={() => setToastMsg(null)}
              className="text-blue-200 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-rose-500 hover:text-rose-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loadingDetail || !detailJamaah ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
            Memuat detail pembayaran jamaah...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Info & Status Badge (Sesuai Gambar 6.2 UI-11 SD v1.1) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs text-slate-500">
                    Paket &amp; Keberangkatan:{' '}
                  </span>
                  <strong className="text-xs font-bold text-slate-900">
                    {detailJamaah.keberangkatan?.paket?.nama_paket || '-'}{' '}
                    ({detailJamaah.keberangkatan?.tgl_berangkat ||
                      `Tahun ${detailJamaah.keberangkatan?.tahun || '-'}`})
                  </strong>
                  {detailJamaah.status_jamaah === 'batal' && (
                    <span className="ml-2 inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px] uppercase">
                      Jamaah Batal
                    </span>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    detailJamaah.status_pembayaran === 'Lunas'
                      ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                      : 'bg-amber-100 text-amber-950 border border-amber-300'
                  }`}
                >
                  {detailJamaah.status_pembayaran === 'Lunas' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-800" />
                  )}
                  <span>{detailJamaah.status_pembayaran}</span>
                </span>
              </div>

              {/* 3 Kartu Ringkasan: Total, Dibayar, Sisa */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Total Biaya
                  </span>
                  <div className="text-lg font-extrabold font-mono text-slate-900 mt-0.5">
                    {formatRupiah(detailJamaah.total_biaya)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="text-[11px] text-blue-800 font-medium block">
                    Total Dibayar
                  </span>
                  <div className="text-lg font-extrabold font-mono text-blue-950 mt-0.5">
                    {formatRupiah(detailJamaah.total_dibayar || 0)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
                  <span className="text-[11px] text-amber-900 font-medium block">
                    Sisa Pembayaran
                  </span>
                  <div className="text-lg font-extrabold font-mono text-amber-950 mt-0.5">
                    {formatRupiah(
                      detailJamaah.sisa_pembayaran ?? detailJamaah.total_biaya
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabel Riwayat Pembayaran (M8.2) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="bg-[#0b2242] text-white px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Receipt className="w-4 h-4 text-amber-300" />
                  <span>Riwayat Pembayaran</span>
                </div>
                <span className="text-[11px] font-mono text-blue-200">
                  {riwayatList.length} transaksi
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <th className="py-3 px-4 font-semibold">Tanggal</th>
                      <th className="py-3 px-4 font-semibold">Jumlah</th>
                      <th className="py-3 px-4 font-semibold">Metode</th>
                      <th className="py-3 px-4 font-semibold">No. Bukti</th>
                      <th className="py-3 px-4 font-semibold">Catatan &amp; Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {riwayatList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-slate-500"
                        >
                          Belum ada riwayat pembayaran untuk jamaah ini.
                        </td>
                      </tr>
                    ) : (
                      riwayatList.map((pay) => (
                        <tr key={pay.id_pembayaran} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono text-slate-800 whitespace-nowrap">
                            {pay.tgl_bayar}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-950 whitespace-nowrap">
                            {formatRupiah(pay.jumlah)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase bg-blue-50 text-blue-900 border border-blue-200">
                              {pay.metode}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                            {pay.no_bukti || '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div>{pay.catatan || '-'}</div>
                            {pay.admin?.nama_lengkap && (
                              <div className="text-[10px] text-slate-400">
                                Dicatat oleh: {pay.admin.nama_lengkap}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form Catat Pembayaran Baru (M8.1 - Sesuai Gambar 6.2 UI-11 & Flowchart Gambar 7.1 SD v1.1) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-blue-800" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Catat Pembayaran (M8.1)
                  </h3>
                </div>
                {(detailJamaah.sisa_pembayaran ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setJumlahBayar(String(detailJamaah.sisa_pembayaran || 0))
                    }
                    className="text-[11px] font-semibold text-blue-800 hover:underline cursor-pointer"
                  >
                    Isi Sesuai Sisa ({formatRupiah(detailJamaah.sisa_pembayaran || 0)})
                  </button>
                )}
              </div>

              {detailJamaah.status_jamaah === 'batal' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <strong>Perhatian:</strong> Jamaah ini berstatus{' '}
                  <strong>Batal</strong>. Sesuai aturan M8.1 SD, pencatatan
                  pembayaran baru untuk jamaah berstatus batal akan ditolak.
                </div>
              )}

              <form onSubmit={handleCatatPembayaran} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tanggal <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={tglBayar}
                      onChange={(e) => setTglBayar(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:bg-white focus:outline-blue-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Jumlah (Rp) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Nominal pembayaran"
                      value={jumlahBayar}
                      onChange={(e) => setJumlahBayar(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:bg-white focus:outline-blue-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Metode <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={metodeBayar}
                      onChange={(e) =>
                        setMetodeBayar(e.target.value as 'transfer' | 'tunai')
                      }
                      className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
                    >
                      <option value="transfer">Transfer</option>
                      <option value="tunai">Tunai</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      No. bukti / resi
                    </label>
                    <input
                      type="text"
                      maxLength={50}
                      value={noBukti}
                      onChange={(e) => setNoBukti(e.target.value)}
                      placeholder="Mis. TRF-0192 / RSI-0451"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:bg-white focus:outline-blue-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Catatan tambahan (opsional)
                    </label>
                    <input
                      type="text"
                      value={catatanBayar}
                      onChange={(e) => setCatatanBayar(e.target.value)}
                      placeholder="Mis. Pembayaran DP awal / Cicilan ke-2 / Pelunasan"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingPay}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    {savingPay ? 'Menyimpan...' : 'Simpan Pembayaran'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AdminShell>
    );
  }

  // ============================================================================
  // VIEW 2: UI-13 PANTAU STATUS PEMBAYARAN (M8.2)
  // ============================================================================
  return (
    <AdminShell
      title="Pemantauan Pembayaran"
      uiCode="UI-13"
      modulCode="M8.2"
      subtitle="Pantau total biaya, jumlah dibayar, sisa pembayaran, dan status pelunasan seluruh jamaah. Klik baris untuk membuka detail pembayaran (UI-11)."
    >
      {/* Filter Bar UI-13 (Sesuai Gambar 6.2 UI-13 SD v1.1) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Status:</label>
            <select
              value={filterStatusPay}
              onChange={(e) => setFilterStatusPay(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800 font-medium"
            >
              <option value="all">Semua</option>
              <option value="lunas">Lunas</option>
              <option value="belum_lunas">Belum lunas</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-semibold text-slate-700">Keberangkatan:</label>
            <select
              value={filterKebId}
              onChange={(e) => setFilterKebId(e.target.value)}
              className="border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800 font-medium"
            >
              <option value="all">Semua Keberangkatan</option>
              {jadwalList.map((k) => (
                <option key={k.id_keberangkatan} value={String(k.id_keberangkatan)}>
                  {k.paket?.nama_paket} ({k.tgl_berangkat || `Tahun ${k.tahun}`})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Menampilkan {filteredList.length} jamaah
        </div>
      </div>

      {/* Tabel Pemantauan Pembayaran (Sesuai Gambar 6.2 UI-13 SD v1.1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0b2242] text-white border-b border-[#163d73]">
                <th className="py-3.5 px-4 font-semibold">No. Jamaah</th>
                <th className="py-3.5 px-4 font-semibold">Nama</th>
                <th className="py-3.5 px-4 font-semibold">Keberangkatan</th>
                <th className="py-3.5 px-4 font-semibold text-right">Total</th>
                <th className="py-3.5 px-4 font-semibold text-right">Dibayar</th>
                <th className="py-3.5 px-4 font-semibold text-right">Sisa</th>
                <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loadingList ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Memuat data pemantauan pembayaran...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Belum ada data jamaah untuk filter pembayaran ini.
                  </td>
                </tr>
              ) : (
                filteredList.map((j) => (
                  <tr
                    key={j.id_jamaah}
                    onClick={() => handleOpenDetail(j.id_jamaah)}
                    className="hover:bg-blue-50/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-950 whitespace-nowrap">
                      {j.no_jamaah}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {j.nama_lengkap}
                      {j.status_jamaah === 'batal' && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold uppercase">
                          Batal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-medium text-slate-800">
                        {j.keberangkatan?.paket?.nama_paket || '-'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {j.keberangkatan?.tgl_berangkat ||
                          `Tahun ${j.keberangkatan?.tahun || '-'}`}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-800 whitespace-nowrap">
                      {formatRupiah(j.total_biaya)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-blue-900 whitespace-nowrap">
                      {formatRupiah(j.total_dibayar || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-950 whitespace-nowrap">
                      {formatRupiah(j.sisa_pembayaran ?? j.total_biaya)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          j.status_pembayaran === 'Lunas'
                            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                            : 'bg-amber-100 text-amber-950 border border-amber-300'
                        }`}
                      >
                        {j.status_pembayaran || 'Belum lunas'}
                      </span>
                    </td>
                    <td
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleOpenDetail(j.id_jamaah)}
                        className="inline-flex items-center gap-1 bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Detail (UI-11)</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-[11px] text-slate-500">
          Sisa pembayaran dan status lunas dihitung secara dinamis dari <strong>total_biaya</strong> dikurangi jumlah seluruh pembayaran jamaah (Bab 5.2 SD). Klik baris untuk melihat riwayat atau mencatat pembayaran baru (UI-11).
        </div>
      </div>
    </AdminShell>
  );
}

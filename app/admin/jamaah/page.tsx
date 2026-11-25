'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import {
  getAllJamaahAdmin,
  batalkanJamaahAdmin,
  aktifkanKembaliJamaahAdmin,
  JamaahItem,
} from '@/services/admin.service';
import { formatRupiah } from '@/utils/formatters';
import {
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Pencil,
  CreditCard,
  Ban,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

const BULAN_SHORT = [
  '',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export default function AdminJamaahPage() {
  const [jamaahList, setJamaahList] = useState<JamaahItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pencarian (M6.2)
  const [searchInput, setSearchInput] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterTahun, setFilterTahun] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Baris dropdown detail yang dibuka
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Notifikasi
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal Batalkan Jamaah (M6.1)
  const [batalTarget, setBatalTarget] = useState<JamaahItem | null>(null);
  const [alasanBatal, setAlasanBatal] = useState('');
  const [savingBatal, setSavingBatal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getAllJamaahAdmin();
    setJamaahList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedKeyword(searchInput.trim());
  };

  const filteredJamaah = jamaahList.filter((j) => {
    const kw = (appliedKeyword || searchInput).trim().toLowerCase();
    const matchKw =
      !kw ||
      j.nama_lengkap.toLowerCase().includes(kw) ||
      j.no_jamaah.toLowerCase().includes(kw) ||
      j.no_hp.toLowerCase().includes(kw) ||
      (j.nik && j.nik.toLowerCase().includes(kw));

    const prog = j.keberangkatan?.paket?.program || 'umrah';
    const matchProg = filterProgram === 'all' || prog === filterProgram;

    const thn = j.keberangkatan?.tahun ? String(j.keberangkatan.tahun) : '';
    const matchTahun = filterTahun === 'all' || thn === filterTahun;

    const matchStatus =
      filterStatus === 'all' || j.status_jamaah === filterStatus;

    return matchKw && matchProg && matchTahun && matchStatus;
  });

  const uniqueYears = Array.from(
    new Set(
      jamaahList
        .map((j) => j.keberangkatan?.tahun)
        .filter((y): y is number => typeof y === 'number')
    )
  ).sort();

  const handleConfirmBatal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batalTarget) return;

    if (!alasanBatal.trim()) {
      setErrorMsg('Alasan pembatalan wajib diisi');
      return;
    }

    setSavingBatal(true);
    setErrorMsg(null);
    const res = await batalkanJamaahAdmin(batalTarget.id_jamaah, alasanBatal);
    setSavingBatal(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal membatalkan jamaah');
      return;
    }

    const target = batalTarget;
    setBatalTarget(null);
    setAlasanBatal('');
    setToastMsg(
      `Jamaah ${target.no_jamaah} (${target.nama_lengkap}) berhasil dibatalkan. Kuota keberangkatan otomatis dikembalikan.`
    );
    setTimeout(() => setToastMsg(null), 4000);
    await loadData();
  };

  const handleAktifkanKembali = async (j: JamaahItem) => {
    setErrorMsg(null);
    const res = await aktifkanKembaliJamaahAdmin(j.id_jamaah);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal mengaktifkan kembali jamaah');
      return;
    }
    setToastMsg(
      `Jamaah ${j.no_jamaah} (${j.nama_lengkap}) berhasil diaktifkan kembali.`
    );
    setTimeout(() => setToastMsg(null), 4000);
    await loadData();
  };

  const formatPeriodeBerangkat = (j: JamaahItem) => {
    const keb = j.keberangkatan;
    if (!keb) return '-';
    if (keb.bulan && BULAN_SHORT[keb.bulan]) {
      return `${BULAN_SHORT[keb.bulan]} ${keb.tahun}`;
    }
    return `Tahun ${keb.tahun}`;
  };

  return (
    <AdminShell
      title="Data Jamaah"
      uiCode="UI-09"
      modulCode="M6.1, M6.2"
      subtitle="Cari, lihat detail data diri & checklist administrasi (paspor, visa, manasik), ubah data, atau batalkan jamaah."
      actions={
        <Link
          href="/admin/jamaah/form"
          className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah</span>
        </Link>
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

      {/* Search & Filter Bar (Sesuai Gambar 6.2 UI-09 SD v1.1) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 text-xs shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nama / no. jamaah / no. HP..."
              className="w-full border border-slate-300 rounded-xl pl-8 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
            />
          </div>
          <button
            type="submit"
            className="bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-bold px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Cari
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Program
            </label>
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
            >
              <option value="all">Semua Program</option>
              <option value="umrah">Umrah</option>
              <option value="haji_reguler">Haji Reguler</option>
              <option value="haji_khusus">Haji Khusus</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tahun
            </label>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
            >
              <option value="all">Semua Tahun</option>
              {uniqueYears.map((y) => (
                <option key={y} value={String(y)}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Status Jamaah
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="batal">Batal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabel Daftar & Baris Dropdown Detail Jamaah (UI-09) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0b2242] text-white border-b border-[#163d73]">
                <th className="py-3.5 px-4 font-semibold">No. Jamaah</th>
                <th className="py-3.5 px-4 font-semibold">Nama</th>
                <th className="py-3.5 px-4 font-semibold">Berangkat</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Pembayaran</th>
                <th className="py-3.5 px-4 font-semibold text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Memuat data jamaah...
                  </td>
                </tr>
              ) : filteredJamaah.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 font-semibold">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                filteredJamaah.map((j) => {
                  const isExpanded = expandedId === j.id_jamaah;
                  return (
                    <React.Fragment key={j.id_jamaah}>
                      <tr
                        onClick={() =>
                          setExpandedId(isExpanded ? null : j.id_jamaah)
                        }
                        className={`cursor-pointer transition-colors ${
                          isExpanded
                            ? 'bg-blue-50/70'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-950 whitespace-nowrap">
                          {j.no_jamaah}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {j.nama_lengkap}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                          <div>{formatPeriodeBerangkat(j)}</div>
                          <div className="text-[10px] text-slate-500">
                            {j.keberangkatan?.paket?.nama_paket}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                              j.status_jamaah === 'aktif'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300'
                            }`}
                          >
                            {j.status_jamaah === 'aktif' ? 'Aktif' : 'Batal'}
                          </span>
                        </td>
                        <td
                          className="py-3.5 px-4 whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                                j.status_pembayaran === 'Lunas'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-amber-100 text-amber-950'
                              }`}
                            >
                              {j.status_pembayaran || 'Belum lunas'}
                            </span>
                            <Link
                              href={`/admin/pembayaran?id_jamaah=${j.id_jamaah}`}
                              className="text-blue-800 font-semibold hover:underline text-[11px]"
                            >
                              Detail
                            </Link>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-blue-900 font-semibold"
                          >
                            <span>{isExpanded ? 'Tutup' : 'Buka'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Baris Dropdown Detail Data Diri & Checklist (Sesuai Gambar 6.2 UI-09 SD v1.1) */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-slate-200">
                          <td colSpan={6} className="p-5">
                            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                  <span className="text-[11px] text-slate-500 block">
                                    NIK
                                  </span>
                                  <strong className="font-mono text-slate-900">
                                    {j.nik || '- (Belum dilengkapi)'}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-500 block">
                                    Nama lengkap
                                  </span>
                                  <strong className="text-slate-900">
                                    {j.nama_lengkap}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-500 block">
                                    Nama ayah
                                  </span>
                                  <strong className="text-slate-900">
                                    {j.nama_ayah || '- (Belum dilengkapi)'}
                                  </strong>
                                </div>

                                <div>
                                  <span className="text-[11px] text-slate-500 block">
                                    Tempat, tgl. lahir
                                  </span>
                                  <strong className="text-slate-900">
                                    {j.tempat_lahir}, {j.tanggal_lahir}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-500 block">
                                    Jenis kelamin
                                  </span>
                                  <strong className="text-slate-900">
                                    {j.jenis_kelamin === 'L'
                                      ? 'Laki-laki (L)'
                                      : 'Perempuan (P)'}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-500 block">
                                    Pekerjaan
                                  </span>
                                  <strong className="text-slate-900">
                                    {j.pekerjaan || '-'}
                                  </strong>
                                </div>

                                <div>
                                  <span className="text-[11px] text-slate-500 block">
                                    Alamat
                                  </span>
                                  <strong className="text-slate-900">
                                    {j.alamat || '-'}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-500 block">
                                    Pendidikan
                                  </span>
                                  <strong className="text-slate-900">
                                    {j.pendidikan || '- (Belum dilengkapi)'}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-500 block">
                                    No. telepon
                                  </span>
                                  <strong className="font-mono text-slate-900">
                                    {j.no_hp}
                                  </strong>
                                </div>
                              </div>

                              {/* Checklist Administrasi & Ringkasan Biaya */}
                              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
                                  <span className="text-[10px] text-slate-500 block">
                                    Status paspor
                                  </span>
                                  <strong className="text-blue-950 font-mono">
                                    {j.status_paspor || 'menunggu_berkas'}
                                  </strong>
                                </div>
                                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
                                  <span className="text-[10px] text-slate-500 block">
                                    Status visa
                                  </span>
                                  <strong className="text-blue-950 font-mono">
                                    {j.status_visa || 'belum_diajukan'}
                                  </strong>
                                </div>
                                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
                                  <span className="text-[10px] text-slate-500 block">
                                    Status manasik
                                  </span>
                                  <strong className="text-blue-950 font-mono">
                                    {j.status_manasik || 'belum_manasik'}
                                  </strong>
                                </div>
                                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                                  <span className="text-[10px] text-slate-500 block">
                                    Total Biaya / Sisa
                                  </span>
                                  <strong className="text-slate-900 font-mono">
                                    {formatRupiah(j.total_biaya)} (Sisa:{' '}
                                    {formatRupiah(
                                      j.sisa_pembayaran ?? j.total_biaya
                                    )}
                                    )
                                  </strong>
                                </div>
                              </div>

                              {j.status_jamaah === 'batal' && (
                                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                                  <strong>Status Dibatalkan ({j.tgl_batal}):</strong>{' '}
                                  {j.alasan_batal}
                                </div>
                              )}

                              {/* Action Buttons pada Detail Jamaah */}
                              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                <span className="text-[11px] text-slate-500">
                                  Tgl. Daftar: <strong className="font-mono">{j.tgl_daftar}</strong>
                                  {j.catatan ? ` • Catatan: ${j.catatan}` : ''}
                                </span>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Link
                                    href={`/admin/pembayaran?id_jamaah=${j.id_jamaah}`}
                                    className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Pembayaran (UI-11)</span>
                                  </Link>
                                  <Link
                                    href={`/admin/jamaah/form?id_jamaah=${j.id_jamaah}`}
                                    className="inline-flex items-center gap-1.5 bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>Ubah (UI-10)</span>
                                  </Link>
                                  {j.status_jamaah === 'aktif' ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setBatalTarget(j);
                                        setAlasanBatal('');
                                        setErrorMsg(null);
                                      }}
                                      className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                                    >
                                      <Ban className="w-3.5 h-3.5" />
                                      <span>Batalkan Jamaah</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleAktifkanKembali(j)}
                                      className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span>Aktifkan Kembali</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Batalkan Jamaah (Sesuai Bab 4.2 M6.1 SD v1.1) */}
      {batalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0b2242] text-white p-5 border-b border-[#163d73] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 block">
                  Konfirmasi Pembatalan (M6.1 &bull; UI-09)
                </span>
                <h3 className="text-base font-bold">
                  Batalkan Jamaah &mdash; {batalTarget.no_jamaah}
                </h3>
              </div>
              <button
                onClick={() => {
                  setBatalTarget(null);
                  setErrorMsg(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBatal} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Anda akan mengubah status jamaah{' '}
                <strong>{batalTarget.nama_lengkap}</strong> menjadi{' '}
                <strong>Batal</strong>. Kursi keberangkatan akan otomatis
                dikembalikan ke sisa kuota. Pengembalian dana (bila ada)
                dilakukan manual di luar sistem.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Alasan pembatalan (wajib diisi){' '}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={alasanBatal}
                  onChange={(e) => setAlasanBatal(e.target.value)}
                  placeholder="Contoh: Berhalangan berangkat karena kondisi kesehatan."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:outline-blue-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setBatalTarget(null);
                    setErrorMsg(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingBatal}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {savingBatal ? 'Memproses...' : 'Konfirmasi Batalkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

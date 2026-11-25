'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/AdminShell';
import {
  getAllKeberangkatanAdmin,
  getAllPackagesAdmin,
  saveKeberangkatanAdmin,
  pindahkanJamaahKeberangkatanAdmin,
  KeberangkatanWithPaket,
  SaveKeberangkatanInput,
} from '@/services/admin.service';
import { PaketItem } from '@/types/package.types';
import {
  Plus,
  Pencil,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Users,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

const BULAN_NAMES = [
  '',
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export default function AdminJadwalPage() {
  const [activeTab, setActiveTab] = useState<'jadwal' | 'kelompok' | 'kalender'>('jadwal');
  const [jadwalList, setJadwalList] = useState<KeberangkatanWithPaket[]>([]);
  const [packages, setPackages] = useState<PaketItem[]>([]);
  const [loading, setLoading] = useState(true);

  // State Kalender Jadwal (M7.1 Visual Calendar)
  const [calYear, setCalYear] = useState<number>(2027);
  const [calMonth, setCalMonth] = useState<number>(3); // 1..12

  // Filter untuk Tab Jamaah per Keberangkatan (M7.2)
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterTahun, setFilterTahun] = useState<string>('all');
  const [filterBulan, setFilterBulan] = useState<string>('all');

  // Modal Tambah/Ubah Jadwal (M7.1)
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [form, setForm] = useState<SaveKeberangkatanInput>({
    id_keberangkatan: undefined,
    id_paket: 1,
    tahun: 2027,
    bulan: 3,
    tgl_berangkat: '2027-03-15',
    kuota: 45,
    status: 'buka',
  });

  // Modal Pindahkan Jamaah (M7.2)
  const [moveModal, setMoveModal] = useState<{
    id_jamaah: number;
    no_jamaah: string;
    nama_lengkap: string;
    current_id_keberangkatan: number;
  } | null>(null);
  const [targetKebId, setTargetKebId] = useState<number>(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [kebs, pkts] = await Promise.all([
      getAllKeberangkatanAdmin(),
      getAllPackagesAdmin(),
    ]);
    setJadwalList(kebs);
    setPackages(pkts);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedFormPaket = packages.find((p) => p.id_paket === Number(form.id_paket));
  const isFormUmrah = !selectedFormPaket || selectedFormPaket.program === 'umrah';

  const handleOpenAdd = () => {
    setErrorMsg(null);
    const firstPkg = packages[0];
    setForm({
      id_keberangkatan: undefined,
      id_paket: firstPkg?.id_paket || 1,
      tahun: 2027,
      bulan: firstPkg?.program === 'umrah' ? 3 : null,
      tgl_berangkat: firstPkg?.program === 'umrah' ? '2027-03-15' : null,
      kuota: 45,
      status: 'buka',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: KeberangkatanWithPaket) => {
    setErrorMsg(null);
    setForm({
      id_keberangkatan: item.id_keberangkatan,
      id_paket: item.id_paket,
      tahun: item.tahun,
      bulan: item.bulan,
      tgl_berangkat: item.tgl_berangkat,
      kuota: item.kuota,
      status: item.status,
    });
    setModalOpen(true);
  };

  const handleSaveJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    const res = await saveKeberangkatanAdmin(form);
    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menyimpan jadwal keberangkatan');
      return;
    }

    setModalOpen(false);
    setToastMsg(
      form.id_keberangkatan
        ? 'Jadwal keberangkatan berhasil diperbarui.'
        : 'Jadwal keberangkatan baru berhasil ditambahkan.'
    );
    setTimeout(() => setToastMsg(null), 4000);
    await loadData();
  };

  const handleMoveJamaah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveModal || !targetKebId) return;

    setErrorMsg(null);
    setSaving(true);
    const res = await pindahkanJamaahKeberangkatanAdmin(
      moveModal.id_jamaah,
      targetKebId
    );
    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal memindahkan jamaah');
      return;
    }

    setMoveModal(null);
    setToastMsg(`Jamaah ${moveModal.no_jamaah} (${moveModal.nama_lengkap}) berhasil dipindahkan.`);
    setTimeout(() => setToastMsg(null), 4000);
    await loadData();
  };

  const filteredKelompok = jadwalList.filter((item) => {
    const prog = item.paket?.program || 'umrah';
    const matchProg = filterProgram === 'all' || prog === filterProgram;
    const matchTahun = filterTahun === 'all' || String(item.tahun) === filterTahun;
    const matchBulan = filterBulan === 'all' || String(item.bulan || '') === filterBulan;
    return matchProg && matchTahun && matchBulan;
  });

  const uniqueYears = Array.from(new Set(jadwalList.map((k) => k.tahun))).sort();

  const paketTanpaJadwal = packages.filter(
    (p) =>
      p.status_aktif &&
      !jadwalList.some((j) => j.id_paket === p.id_paket)
  );

  return (
    <AdminShell
      title="Jadwal & Jamaah per Keberangkatan"
      uiCode="UI-12"
      modulCode="M7.1, M7.2"
      subtitle="Kelola jadwal & kuota keberangkatan (M7.1) serta kelompokkan jamaah per periode keberangkatan (M7.2)."
      actions={
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Jadwal</span>
        </button>
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

      {/* Info Paket Aktif yang Belum Memiliki Jadwal */}
      {paketTanpaJadwal.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 text-amber-950">
            <div className="font-bold">
              Ada {paketTanpaJadwal.length} paket aktif yang belum memiliki jadwal keberangkatan:
            </div>
            <div className="text-[11px] text-amber-900">
              {paketTanpaJadwal.map((p) => `${p.kode_paket} (${p.nama_paket})`).join(', ')}
            </div>
          </div>
          <button
            onClick={() => {
              const targetPkg = paketTanpaJadwal[0];
              setErrorMsg(null);
              setForm({
                id_keberangkatan: undefined,
                id_paket: targetPkg.id_paket,
                tahun: 2027,
                bulan: targetPkg.program === 'umrah' ? 3 : null,
                tgl_berangkat: targetPkg.program === 'umrah' ? '2027-03-20' : null,
                kuota: 45,
                status: 'buka',
              });
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-bold px-3.5 py-2 rounded-xl whitespace-nowrap cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Jadwal ({paketTanpaJadwal[0].kode_paket})</span>
          </button>
        </div>
      )}

      {/* Tab Switcher (Sesuai Gambar 6.2 UI-12 SD v1.1) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 inline-flex gap-2 shadow-2xs">
        <button
          onClick={() => setActiveTab('jadwal')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'jadwal'
              ? 'bg-[#0b2242] text-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Jadwal &amp; Kuota (M7.1)</span>
        </button>
        <button
          onClick={() => setActiveTab('kelompok')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'kelompok'
              ? 'bg-[#0b2242] text-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Jamaah per Keberangkatan (M7.2)</span>
        </button>
        <button
          onClick={() => setActiveTab('kalender')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'kalender'
              ? 'bg-[#0b2242] text-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Kalender Jadwal</span>
        </button>
      </div>

      {/* TAB 1: JADWAL & KUOTA (M7.1) */}
      {activeTab === 'jadwal' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0b2242] text-white border-b border-[#163d73]">
                  <th className="py-3.5 px-4 font-semibold">Paket</th>
                  <th className="py-3.5 px-4 font-semibold">Program</th>
                  <th className="py-3.5 px-4 font-semibold">Periode / Tanggal</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Kuota</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Terisi</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Sisa Kuota</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      Memuat jadwal keberangkatan...
                    </td>
                  </tr>
                ) : jadwalList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-500">
                      Belum ada jadwal keberangkatan.
                    </td>
                  </tr>
                ) : (
                  jadwalList.map((item) => (
                    <tr key={item.id_keberangkatan} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {item.paket?.nama_paket || `Paket #${item.id_paket}`}
                        </div>
                        <div className="text-[11px] font-mono text-blue-800">
                          {item.paket?.kode_paket}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-950 border border-blue-200">
                          {item.paket?.program || 'umrah'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-800">
                        {item.tgl_berangkat ? (
                          <span>
                            {item.tgl_berangkat}{' '}
                            <span className="text-slate-500 font-sans text-[11px]">
                              ({item.bulan ? BULAN_NAMES[item.bulan] : ''} {item.tahun})
                            </span>
                          </span>
                        ) : (
                          <span>
                            {item.bulan ? `${BULAN_NAMES[item.bulan]} ` : 'Alokasi Tahun '}
                            {item.tahun}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                        {item.kuota}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-blue-900 font-semibold">
                        {item.jumlah_terisi || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-800">
                        {item.sisa_kuota ?? item.kuota}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                            item.status === 'buka'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center gap-1 bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Ubah</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-[11px] text-slate-500">
            Aturan M7.1: Untuk program Umrah, bulan dan tanggal berangkat wajib diisi. Untuk program Haji, tahun alokasi kuota wajib diisi (bulan &amp; tanggal boleh kosong). Kuota tidak boleh kurang dari jumlah jamaah aktif.
          </div>
        </div>
      )}

      {/* TAB 2: JAMAAH PER KEBERANGKATAN (M7.2) */}
      {activeTab === 'kelompok' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shadow-2xs">
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
                Bulan
              </label>
              <select
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              >
                <option value="all">Semua Bulan</option>
                {BULAN_NAMES.slice(1).map((name, idx) => (
                  <option key={idx + 1} value={String(idx + 1)}>
                    {idx + 1} - {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Kelompok Keberangkatan Cards */}
          {filteredKelompok.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500 font-semibold">
              Belum ada jamaah pada periode ini &mdash; Daftar jamaah kosong.
            </div>
          ) : (
            filteredKelompok.map((kel) => (
              <div
                key={kel.id_keberangkatan}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                <div className="bg-[#0b2242] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-amber-300">
                      {kel.paket?.nama_paket || `Paket #${kel.id_paket}`}
                    </span>
                    <span>&mdash;</span>
                    <span className="font-mono text-blue-100">
                      {kel.bulan ? `${BULAN_NAMES[kel.bulan]} ` : ''}
                      {kel.tahun}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="bg-[#133666] border border-[#21579e] px-2.5 py-1 rounded-lg">
                      Terisi <strong>{kel.jumlah_terisi || 0}</strong>/{kel.kuota}
                    </span>
                    <span className="bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg">
                      Sisa {kel.sisa_kuota ?? kel.kuota}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {!kel.jamaah_list || kel.jamaah_list.length === 0 ? (
                    <div className="text-xs text-slate-500 py-4 text-center font-medium">
                      Belum ada jamaah pada periode ini &mdash; Daftar jamaah kosong.
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2 px-3">No. Jamaah</th>
                          <th className="py-2 px-3">Nama Lengkap</th>
                          <th className="py-2 px-3">No. HP</th>
                          <th className="py-2 px-3">Checklist Administrasi</th>
                          <th className="py-2 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {kel.jamaah_list.map((j) => (
                          <tr key={j.id_jamaah} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-blue-950">
                              {j.no_jamaah}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              {j.nama_lengkap}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {j.no_hp}
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-600">
                              Paspor: <strong>{j.status_paspor || 'menunggu_berkas'}</strong> &bull; Visa:{' '}
                              <strong>{j.status_visa || 'belum_diajukan'}</strong>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <button
                                onClick={() => {
                                  setErrorMsg(null);
                                  const otherKeb = jadwalList.find(
                                    (k) =>
                                      k.id_keberangkatan !== kel.id_keberangkatan &&
                                      (k.sisa_kuota ?? k.kuota) > 0
                                  );
                                  setTargetKebId(
                                    otherKeb?.id_keberangkatan || kel.id_keberangkatan
                                  );
                                  setMoveModal({
                                    id_jamaah: j.id_jamaah,
                                    no_jamaah: j.no_jamaah,
                                    nama_lengkap: j.nama_lengkap,
                                    current_id_keberangkatan: kel.id_keberangkatan,
                                  });
                                }}
                                className="inline-flex items-center gap-1 text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 font-semibold px-2.5 py-1 rounded-lg cursor-pointer"
                              >
                                <ArrowRightLeft className="w-3 h-3" />
                                <span>Pindahkan</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: KALENDER JADWAL KEBERANGKATAN */}
      {activeTab === 'kalender' && (() => {
        const firstDayOfMonth = new Date(calYear, calMonth - 1, 1).getDay(); // 0=Min..6=Sab
        const daysInMonth = new Date(calYear, calMonth, 0).getDate();
        const cells: (number | null)[] = [
          ...Array(firstDayOfMonth).fill(null),
          ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ];
        const prevMonth = () => {
          if (calMonth === 1) {
            setCalMonth(12);
            setCalYear((y) => y - 1);
          } else {
            setCalMonth((m) => m - 1);
          }
        };
        const nextMonth = () => {
          if (calMonth === 12) {
            setCalMonth(1);
            setCalYear((y) => y + 1);
          } else {
            setCalMonth((m) => m + 1);
          }
        };

        const hajiTahunIni = jadwalList.filter(
          (k) => !k.tgl_berangkat && k.tahun === calYear
        );
        const jadwalBulanIni = jadwalList.filter((k) => {
          if (!k.tgl_berangkat) return false;
          const [yStr, mStr] = k.tgl_berangkat.split('-');
          return Number(yStr) === calYear && Number(mStr) === calMonth;
        });

        const jadwalDenganTanggal = jadwalList.filter((k) => Boolean(k.tgl_berangkat));

        return (
          <div className="space-y-4">
            {/* Kontrol Navigasi Kalender */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 cursor-pointer"
                  title="Bulan Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="font-bold text-sm text-[#0b2242] min-w-[140px] text-center">
                  {BULAN_NAMES[calMonth]} {calYear}
                </div>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 cursor-pointer"
                  title="Bulan Berikutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {jadwalDenganTanggal.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Lompat ke jadwal:
                  </span>
                  {jadwalDenganTanggal.map((k) => {
                    const [yStr, mStr] = k.tgl_berangkat!.split('-');
                    return (
                      <button
                        key={k.id_keberangkatan}
                        type="button"
                        onClick={() => {
                          setCalYear(Number(yStr));
                          setCalMonth(Number(mStr));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-mono text-[11px] cursor-pointer"
                      >
                        {BULAN_NAMES[Number(mStr)]} {yStr} ({k.paket?.kode_paket})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {hajiTahunIni.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs flex flex-wrap items-center gap-2">
                <span className="font-bold text-amber-950">
                  Alokasi Haji Tahun {calYear}:
                </span>
                {hajiTahunIni.map((h) => (
                  <button
                    key={h.id_keberangkatan}
                    type="button"
                    onClick={() => handleOpenEdit(h)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 font-semibold hover:bg-amber-100 cursor-pointer"
                  >
                    {h.paket?.nama_paket} &bull; Sisa {h.sisa_kuota ?? h.kuota}/{h.kuota} kursi
                  </button>
                ))}
              </div>
            )}

            {/* Grid Kalender Bulanan */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="grid grid-cols-7 bg-[#0b2242] text-white text-center text-[11px] font-bold py-2.5">
                <div>Min</div>
                <div>Sen</div>
                <div>Sel</div>
                <div>Rab</div>
                <div>Kam</div>
                <div>Jum</div>
                <div>Sab</div>
              </div>
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 border-t border-slate-200">
                {cells.map((day, idx) => {
                  const eventsOnDay = day
                    ? jadwalBulanIni.filter(
                        (k) => Number(k.tgl_berangkat!.split('-')[2]) === day
                      )
                    : [];
                  return (
                    <div
                      key={idx}
                      className={`min-h-[88px] sm:min-h-[104px] p-1.5 sm:p-2 text-xs ${
                        day ? 'bg-white' : 'bg-slate-50/70'
                      }`}
                    >
                      {day && (
                        <>
                          <div className="font-mono text-[11px] font-bold text-slate-500 mb-1">
                            {day}
                          </div>
                          <div className="space-y-1">
                            {eventsOnDay.map((ev) => (
                              <button
                                key={ev.id_keberangkatan}
                                type="button"
                                onClick={() => handleOpenEdit(ev)}
                                className="w-full text-left p-1.5 rounded-lg bg-[#0b2242] hover:bg-[#133666] text-white text-[10px] leading-tight space-y-0.5 cursor-pointer shadow-2xs"
                              >
                                <div className="font-bold text-amber-300 truncate">
                                  {ev.paket?.kode_paket || `Paket #${ev.id_paket}`}
                                </div>
                                <div className="truncate text-blue-100">
                                  {ev.paket?.nama_paket}
                                </div>
                                <div className="font-mono text-[9px] text-emerald-300">
                                  Sisa {ev.sisa_kuota ?? ev.kuota}/{ev.kuota}
                                </div>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal Tambah / Ubah Jadwal Keberangkatan (M7.1) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0b2242] text-white p-5 border-b border-[#163d73] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 block">
                  Formulir Jadwal Keberangkatan (M7.1 &bull; UI-12)
                </span>
                <h3 className="text-base font-bold">
                  {form.id_keberangkatan ? 'Ubah Jadwal Keberangkatan' : 'Tambah Jadwal Baru'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJadwal} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Pilih Paket <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.id_paket}
                  onChange={(e) => {
                    const nextId = Number(e.target.value);
                    const nextPkg = packages.find((p) => p.id_paket === nextId);
                    const nextIsUmrah = !nextPkg || nextPkg.program === 'umrah';
                    setForm({
                      ...form,
                      id_paket: nextId,
                      bulan: nextIsUmrah ? form.bulan || 3 : null,
                      tgl_berangkat: nextIsUmrah
                        ? form.tgl_berangkat || `${form.tahun}-03-15`
                        : null,
                    });
                  }}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-blue-800"
                >
                  {packages.map((p) => (
                    <option key={p.id_paket} value={p.id_paket}>
                      [{p.kode_paket}] {p.nama_paket} ({p.program})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tahun Keberangkatan / Alokasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={2025}
                    max={2040}
                    value={form.tahun}
                    onChange={(e) =>
                      setForm({ ...form, tahun: Number(e.target.value) })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:bg-white focus:outline-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Bulan (1–12) {isFormUmrah ? <span className="text-rose-500">*</span> : <span className="text-slate-400">(kosong utk Haji)</span>}
                  </label>
                  <select
                    required={isFormUmrah}
                    disabled={!isFormUmrah}
                    value={isFormUmrah ? form.bulan || '' : ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        bulan: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800 disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    <option value="">-- Kosong (Khusus Haji) --</option>
                    {BULAN_NAMES.slice(1).map((name, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        {idx + 1} - {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tanggal Berangkat {isFormUmrah ? <span className="text-rose-500">*</span> : <span className="text-slate-400">(kosong utk Haji)</span>}
                  </label>
                  <input
                    type="date"
                    required={isFormUmrah}
                    disabled={!isFormUmrah}
                    value={isFormUmrah ? form.tgl_berangkat || '' : ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tgl_berangkat: e.target.value || null,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:bg-white focus:outline-blue-800 disabled:bg-slate-200 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kuota Kursi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.kuota}
                    onChange={(e) =>
                      setForm({ ...form, kuota: Number(e.target.value) })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:bg-white focus:outline-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Status Pendaftaran Jadwal <span className="text-rose-500">*</span>
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as 'buka' | 'tutup',
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
                >
                  <option value="buka">buka (Menerima pendaftaran jemaah)</option>
                  <option value="tutup">tutup (Pendaftaran ditutup)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pindahkan Jamaah (M7.2) */}
      {moveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0b2242] text-white p-5 border-b border-[#163d73] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 block">
                  Pindahkan Keberangkatan (M7.2)
                </span>
                <h3 className="text-base font-bold">
                  {moveModal.no_jamaah} &mdash; {moveModal.nama_lengkap}
                </h3>
              </div>
              <button
                onClick={() => setMoveModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMoveJamaah} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Pilih Jadwal Keberangkatan Tujuan
                </label>
                <select
                  value={targetKebId}
                  onChange={(e) => setTargetKebId(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-blue-800"
                >
                  {jadwalList.map((k) => (
                    <option
                      key={k.id_keberangkatan}
                      value={k.id_keberangkatan}
                      disabled={
                        k.id_keberangkatan === moveModal.current_id_keberangkatan ||
                        (k.sisa_kuota ?? k.kuota) <= 0
                      }
                    >
                      {k.paket?.nama_paket} ({k.tgl_berangkat || `Tahun ${k.tahun}`}) &mdash; Sisa{' '}
                      {k.sisa_kuota ?? k.kuota} kursi
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMoveModal(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {saving ? 'Memindahkan...' : 'Simpan Perpindahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

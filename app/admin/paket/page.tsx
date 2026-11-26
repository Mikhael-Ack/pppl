'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/AdminShell';
import {
  getAllPackagesAdmin,
  savePaketAdmin,
  togglePaketStatusAdmin,
  deletePaketAdmin,
  SavePaketInput,
} from '@/services/admin.service';
import { PaketItem } from '@/types/package.types';
import { formatRupiah } from '@/utils/formatters';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react';

export default function AdminPaketPage() {
  const [packages, setPackages] = useState<PaketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaketItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<SavePaketInput>({
    id_paket: undefined,
    kode_paket: '',
    nama_paket: '',
    program: 'umrah',
    harga: 28500000,
    maskapai: '',
    hotel: '',
    durasi_hari: 9,
    deskripsi: '',
    status_aktif: true,
    jadwal_awal: {
      buat_jadwal: true,
      tahun: 2027,
      bulan: 3,
      tgl_berangkat: '2027-03-20',
      kuota: 45,
    },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getAllPackagesAdmin();
    setPackages(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setErrorMsg(null);
    setForm({
      id_paket: undefined,
      kode_paket: '',
      nama_paket: '',
      program: 'umrah',
      harga: 28500000,
      maskapai: 'Garuda Indonesia',
      hotel: 'Makkah: Bintang 5 | Madinah: Bintang 5',
      durasi_hari: 9,
      deskripsi: '',
      status_aktif: true,
      jadwal_awal: {
        buat_jadwal: true,
        tahun: 2027,
        bulan: 3,
        tgl_berangkat: '2027-03-20',
        kuota: 45,
      },
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (pkg: PaketItem) => {
    setErrorMsg(null);
    setForm({
      id_paket: pkg.id_paket,
      kode_paket: pkg.kode_paket,
      nama_paket: pkg.nama_paket,
      program: pkg.program,
      harga: Number(pkg.harga),
      maskapai: pkg.maskapai,
      hotel: pkg.hotel,
      durasi_hari: Number(pkg.durasi_hari),
      deskripsi: pkg.deskripsi || '',
      status_aktif: pkg.status_aktif,
    });
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setErrorMsg(null);
    const res = await deletePaketAdmin(deleteTarget.id_paket);
    setDeleting(false);

    if (!res.success) {
      setDeleteTarget(null);
      setErrorMsg(res.error || 'Gagal menghapus paket');
      return;
    }

    const deletedKode = deleteTarget.kode_paket;
    setDeleteTarget(null);
    setToastMsg(`Paket ${deletedKode} berhasil dihapus.`);
    setTimeout(() => setToastMsg(null), 4000);
    await loadData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    const res = await savePaketAdmin(form);
    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menyimpan paket');
      return;
    }

    setModalOpen(false);
    setToastMsg(
      form.id_paket
        ? `Paket ${form.kode_paket} berhasil diperbarui.`
        : `Paket baru ${form.kode_paket} berhasil ditambahkan.`
    );
    setTimeout(() => setToastMsg(null), 4000);
    await loadData();
  };

  const handleToggleActive = async (pkg: PaketItem) => {
    const nextState = !pkg.status_aktif;
    const res = await togglePaketStatusAdmin(pkg.id_paket, nextState);
    if (res.success) {
      setToastMsg(
        `Status paket ${pkg.kode_paket} diubah menjadi ${
          nextState ? 'Aktif (Tampil di Katalog)' : 'Nonaktif'
        }.`
      );
      setTimeout(() => setToastMsg(null), 3500);
      await loadData();
    }
  };

  const formatProgramLabel = (prog: string) => {
    if (prog === 'umrah') return 'Umrah';
    if (prog === 'haji_reguler') return 'Haji Reguler';
    if (prog === 'haji_khusus') return 'Haji Khusus';
    return prog;
  };

  return (
    <AdminShell
      title="Kelola Data Paket"
      uiCode="UI-07"
      modulCode="M2.2"
      subtitle="Tambah, ubah, dan atur status aktif paket yang tampil pada katalog publik (UI-01)."
      actions={
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket</span>
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

      {errorMsg && !modalOpen && (
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

      {/* Tabel Data Paket (Sesuai Gambar 6.2 UI-07 SD v1.1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0b2242] text-white border-b border-[#163d73]">
                <th className="py-3.5 px-4 font-semibold">Kode</th>
                <th className="py-3.5 px-4 font-semibold">Nama Paket</th>
                <th className="py-3.5 px-4 font-semibold">Program</th>
                <th className="py-3.5 px-4 font-semibold">Harga</th>
                <th className="py-3.5 px-4 font-semibold">Durasi</th>
                <th className="py-3.5 px-4 font-semibold">Maskapai &amp; Hotel</th>
                <th className="py-3.5 px-4 font-semibold text-center">Aktif</th>
                <th className="py-3.5 px-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Memuat data paket...
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    Belum ada data paket. Klik &ldquo;+ Tambah Paket&rdquo; untuk membuat paket baru.
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr
                    key={pkg.id_paket}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-950 whitespace-nowrap">
                      {pkg.kode_paket}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {pkg.nama_paket}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                          pkg.program === 'haji_khusus'
                            ? 'bg-amber-100 text-amber-950 border-amber-300'
                            : pkg.program === 'haji_reguler'
                            ? 'bg-slate-100 text-slate-800 border-slate-300'
                            : 'bg-blue-100/90 text-blue-950 border-blue-200'
                        }`}
                      >
                        {formatProgramLabel(pkg.program)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(pkg.harga)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {pkg.durasi_hari} Hari
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <div className="font-medium text-slate-800 truncate">
                        {pkg.maskapai}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {pkg.hotel}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={pkg.status_aktif}
                        onClick={() => handleToggleActive(pkg)}
                        title={
                          pkg.status_aktif
                            ? 'Aktif (klik untuk menonaktifkan)'
                            : 'Nonaktif (klik untuk mengaktifkan)'
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                          pkg.status_aktif ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm transition-transform ${
                            pkg.status_aktif ? 'translate-x-5.5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(pkg)}
                          className="inline-flex items-center gap-1 bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Ubah</span>
                        </button>
                        <button
                          onClick={() => {
                            setErrorMsg(null);
                            setDeleteTarget(pkg);
                          }}
                          className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Hapus Paket"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            Penonaktifan paket dilakukan dengan mengubah kolom <strong>Aktif</strong> menjadi &ldquo;Tidak&rdquo; agar riwayat keberangkatan tetap utuh (SD Bab 4.2 M2.2).
          </span>
          <span className="font-mono">Total: {packages.length} paket</span>
        </div>
      </div>

      {/* Dialog Modal Tambah / Ubah Paket */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="sticky top-0 bg-[#0b2242] text-white p-5 border-b border-[#163d73] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 block">
                  Formulir Paket (M2.2 &bull; UI-07)
                </span>
                <h3 className="text-base font-bold">
                  {form.id_paket ? `Ubah Paket: ${form.kode_paket}` : 'Tambah Paket Baru'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Kode Paket (Unik) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={form.kode_paket}
                    onChange={(e) =>
                      setForm({ ...form, kode_paket: e.target.value.toUpperCase() })
                    }
                    placeholder="Mis. UMR-REG-9D"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs bg-slate-50 focus:bg-white focus:outline-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Program <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.program}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        program: e.target.value as SavePaketInput['program'],
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:outline-blue-800"
                  >
                    <option value="umrah">umrah (Umrah Reguler / Plus)</option>
                    <option value="haji_reguler">haji_reguler (Haji Reguler)</option>
                    <option value="haji_khusus">haji_khusus (Haji Khusus / Plus)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Paket pada Katalog <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.nama_paket}
                  onChange={(e) => setForm({ ...form, nama_paket: e.target.value })}
                  placeholder="Contoh: Umrah Reguler Barokah 9 Hari"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:outline-blue-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Harga Paket (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.harga}
                    onChange={(e) =>
                      setForm({ ...form, harga: Number(e.target.value) })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs bg-slate-50 focus:bg-white focus:outline-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Durasi Perjalanan (Hari) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.durasi_hari}
                    onChange={(e) =>
                      setForm({ ...form, durasi_hari: Number(e.target.value) })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-xs bg-slate-50 focus:bg-white focus:outline-blue-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Maskapai Penerbangan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.maskapai}
                  onChange={(e) => setForm({ ...form, maskapai: e.target.value })}
                  placeholder="Mis. Garuda Indonesia (Direct)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:outline-blue-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama / Klasifikasi Hotel <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={form.hotel}
                  onChange={(e) => setForm({ ...form, hotel: e.target.value })}
                  placeholder="Mis. Makkah: Pullman Zamzam (Bintang 5) | Madinah: Al Aqeeq"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:outline-blue-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Deskripsi / Fasilitas Paket <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  rows={3}
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  placeholder="Deskripsi fasilitas paket..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs bg-slate-50 focus:bg-white focus:outline-blue-800"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div>
                  <div className="font-semibold text-blue-950">
                    Tampilkan di Katalog Publik (status_aktif)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Jika dicentang, paket akan tampil pada beranda calon jemaah (UI-01).
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.status_aktif}
                  onChange={(e) =>
                    setForm({ ...form, status_aktif: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#0b2242] cursor-pointer"
                />
              </div>

              {/* Jadwal Keberangkatan Awal (saat Tambah Paket Baru agar langsung muncul di UI-12 Jadwal) */}
              {!form.id_paket && form.jadwal_awal && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">
                        Sekaligus Buat Jadwal Keberangkatan Awal (M7.1)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Agar paket baru langsung tampil di menu Jadwal &amp; bisa dikelompokkan jamaah.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.jadwal_awal.buat_jadwal}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          jadwal_awal: {
                            ...form.jadwal_awal!,
                            buat_jadwal: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-[#0b2242] cursor-pointer"
                    />
                  </div>

                  {form.jadwal_awal.buat_jadwal && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {form.program === 'umrah' ? (
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                            Tanggal Berangkat (Tahun &amp; Bulan otomatis) *
                          </label>
                          <input
                            type="date"
                            value={form.jadwal_awal.tgl_berangkat ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const parts = val.split('-');
                              setForm({
                                ...form,
                                jadwal_awal: {
                                  ...form.jadwal_awal!,
                                  tgl_berangkat: val,
                                  tahun: parts[0] ? Number(parts[0]) : form.jadwal_awal!.tahun,
                                  bulan: parts[1] ? Number(parts[1]) : form.jadwal_awal!.bulan,
                                },
                              });
                            }}
                            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono text-xs bg-white"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                            Tahun Alokasi Haji *
                          </label>
                          <input
                            type="number"
                            min={2026}
                            max={2035}
                            value={form.jadwal_awal.tahun}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                jadwal_awal: {
                                  ...form.jadwal_awal!,
                                  tahun: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono text-xs bg-white"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Kuota Kursi *
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={form.jadwal_awal.kuota}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              jadwal_awal: {
                                ...form.jadwal_awal!,
                                kuota: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full border border-slate-300 rounded-lg px-2 py-1.5 font-mono text-xs bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  {saving ? 'Menyimpan...' : 'Simpan Paket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Paket */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-[#0b2242] text-white p-5 border-b border-[#163d73] flex items-center justify-between">
              <h3 className="text-sm font-bold">Hapus Paket</h3>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-slate-700">
              <p>
                Yakin ingin menghapus paket{' '}
                <strong className="font-mono text-slate-900">
                  {deleteTarget.kode_paket}
                </strong>{' '}
                ({deleteTarget.nama_paket})?
              </p>
              <p className="text-[11px] text-slate-500">
                Catatan: Paket yang sudah memiliki jamaah terdaftar tidak dapat dihapus dan hanya bisa dinonaktifkan.
              </p>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  {deleting ? 'Menghapus...' : 'Ya, Hapus Paket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

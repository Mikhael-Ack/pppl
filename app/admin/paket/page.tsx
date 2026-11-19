'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/AdminShell';
import {
  getAllPackagesAdmin,
  savePaketAdmin,
  togglePaketStatusAdmin,
  SavePaketInput,
} from '@/services/admin.service';
import { PaketItem } from '@/types/package.types';
import { formatRupiah } from '@/utils/formatters';
import {
  Plus,
  Pencil,
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
          <span>+ Tambah Paket</span>
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
                <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
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
                        onClick={() => handleToggleActive(pkg)}
                        title="Klik untuk ubah status aktif"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          pkg.status_aktif
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300'
                        }`}
                      >
                        {pkg.status_aktif ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Ya</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                            <span>Tidak</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(pkg)}
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
    </AdminShell>
  );
}

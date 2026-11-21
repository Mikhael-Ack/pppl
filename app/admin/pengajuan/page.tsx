'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import {
  getAllPengajuanAdmin,
  updateStatusPengajuanAdmin,
} from '@/services/admin.service';
import { PengajuanItem } from '@/types/pengajuan.types';
import {
  UserPlus,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Clock,
  Phone,
  XCircle,
} from 'lucide-react';

function formatTanggal(isoDate: string): string {
  if (!isoDate) return '-';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function AdminPengajuanPage() {
  const [list, setList] = useState<PengajuanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dialog Tolak Pengajuan (Sesuai Gambar 6.2 UI-08 SD v1.1)
  const [rejectTarget, setRejectTarget] = useState<PengajuanItem | null>(null);
  const [alasanTolak, setAlasanTolak] = useState<string>('');
  const [savingReject, setSavingReject] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getAllPengajuanAdmin(statusFilter);
    setList(data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDropdownStatusChange = async (
    item: PengajuanItem,
    nextStatus: string
  ) => {
    setErrorMsg(null);

    if (nextStatus === 'ditolak') {
      setRejectTarget(item);
      setAlasanTolak(item.alasan_tolak || '');
      return;
    }

    const res = await updateStatusPengajuanAdmin(item.id_pengajuan, nextStatus);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal mengubah status pengajuan');
      return;
    }

    setToastMsg(
      `Status pengajuan ${item.kode_pengajuan} (${item.nama_lengkap}) diperbarui menjadi "${nextStatus}".`
    );
    setTimeout(() => setToastMsg(null), 4000);
    await loadData();
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;

    if (!alasanTolak.trim()) {
      setErrorMsg('Alasan penolakan wajib diisi saat menolak pengajuan');
      return;
    }

    setSavingReject(true);
    setErrorMsg(null);
    const res = await updateStatusPengajuanAdmin(
      rejectTarget.id_pengajuan,
      'ditolak',
      alasanTolak
    );
    setSavingReject(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menolak pengajuan');
      return;
    }

    const closedTarget = rejectTarget;
    setRejectTarget(null);
    setAlasanTolak('');
    setToastMsg(
      `Pengajuan ${closedTarget.kode_pengajuan} (${closedTarget.nama_lengkap}) ditolak beserta alasan penolakan.`
    );
    setTimeout(() => setToastMsg(null), 4000);
    await loadData();
  };

  return (
    <AdminShell
      title="Pengajuan Masuk"
      uiCode="UI-08"
      modulCode="M3.2"
      subtitle="Kelola pengajuan pendaftaran daring, perbarui status komunikasi, catat alasan penolakan, atau teruskan menjadi data jamaah."
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

      {/* Filter Bar Status Pengajuan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <label className="font-semibold text-slate-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800 font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="baru">Baru</option>
            <option value="dihubungi">Dihubungi</option>
            <option value="diproses">Diproses (Terdaftar Jamaah)</option>
            <option value="ditolak">Ditolak</option>
          </select>
        </div>
        <div className="text-slate-500 font-mono text-[11px]">
          Menampilkan {list.length} pengajuan (urut terbaru)
        </div>
      </div>

      {/* Tabel Pengajuan Masuk (Sesuai Gambar 6.2 UI-08 SD v1.1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0b2242] text-white border-b border-[#163d73]">
                <th className="py-3.5 px-4 font-semibold">Kode</th>
                <th className="py-3.5 px-4 font-semibold">Nama Calon Jamaah</th>
                <th className="py-3.5 px-4 font-semibold">No. HP</th>
                <th className="py-3.5 px-4 font-semibold">Paket Diminati</th>
                <th className="py-3.5 px-4 font-semibold">Tgl. Pengajuan</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Memuat data pengajuan masuk...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 font-semibold">
                    Belum ada pengajuan masuk &mdash; Daftar pengajuan kosong.
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr
                    key={item.id_pengajuan}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-950 whitespace-nowrap">
                      {item.kode_pengajuan}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">
                        {item.nama_lengkap}{' '}
                        <span className="text-[11px] font-normal text-slate-500">
                          ({item.jenis_kelamin})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {item.alamat}
                        {item.pesan ? ` • Catatan: "${item.pesan}"` : ''}
                      </div>
                      {item.status_pengajuan === 'ditolak' && item.alasan_tolak && (
                        <div className="mt-1 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-2 py-0.5 inline-block">
                          <strong>Alasan tolak:</strong> {item.alasan_tolak}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {item.no_hp}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">
                        {item.paket?.nama_paket || `Paket #${item.id_paket || '-'}`}
                      </div>
                      {item.paket?.kode_paket && (
                        <div className="text-[10px] font-mono text-blue-800">
                          {item.paket.kode_paket}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {formatTanggal(item.tgl_pengajuan)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {item.status_pengajuan === 'diproses' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Diproses</span>
                        </span>
                      ) : (
                        <select
                          value={item.status_pengajuan}
                          onChange={(e) =>
                            handleDropdownStatusChange(item, e.target.value)
                          }
                          className={`border rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer focus:outline-blue-800 ${
                            item.status_pengajuan === 'baru'
                              ? 'bg-amber-50 text-amber-950 border-amber-300'
                              : item.status_pengajuan === 'dihubungi'
                              ? 'bg-blue-50 text-blue-950 border-blue-300'
                              : 'bg-rose-50 text-rose-950 border-rose-300'
                          }`}
                        >
                          <option value="baru">Baru</option>
                          <option value="dihubungi">Dihubungi</option>
                          <option value="ditolak">Ditolak</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {item.status_pengajuan === 'baru' ||
                      item.status_pengajuan === 'dihubungi' ? (
                        <Link
                          href={`/admin/jamaah/form?pengajuan_id=${item.id_pengajuan}`}
                          className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-2xs"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Daftarkan</span>
                        </Link>
                      ) : item.status_pengajuan === 'ditolak' ? (
                        <button
                          onClick={() =>
                            handleDropdownStatusChange(item, 'dihubungi')
                          }
                          title="Buka kembali pengajuan yang ditolak dengan mengubah status ke Dihubungi"
                          className="inline-flex items-center gap-1 text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 font-semibold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Buka Kembali</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Terdaftar Jamaah
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 text-[11px] text-slate-500">
          Aturan M3.2: Status <strong>&ldquo;Diproses&rdquo;</strong> tidak dapat dipilih manual; klik <strong>&ldquo;Daftarkan&rdquo;</strong> untuk membuka form Tambah Jamaah (UI-10) dengan data terisi. Pengajuan yang ditolak dapat dibuka kembali dengan mengubah status ke <strong>&ldquo;Dihubungi&rdquo;</strong>.
        </div>
      </div>

      {/* Kotak Dialog Tolak Pengajuan (Sesuai Gambar 6.2 UI-08 SD v1.1) */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0b2242] text-white p-5 border-b border-[#163d73] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 block">
                  Konfirmasi Penolakan (M3.2 &bull; UI-08)
                </span>
                <h3 className="text-base font-bold">
                  Tolak Pengajuan &mdash; {rejectTarget.nama_lengkap}
                </h3>
              </div>
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setErrorMsg(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Alasan penolakan (catatan admin, wajib diisi){' '}
                  <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={alasanTolak}
                  onChange={(e) => setAlasanTolak(e.target.value)}
                  placeholder="Contoh: Kuota keberangkatan Maret 2027 sudah penuh."
                  className="w-full border border-slate-300 rounded-xl p-3 text-xs bg-slate-50 focus:bg-white focus:outline-blue-800"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Catatan ini akan ditampilkan kepada calon jemaah saat melacak kode{' '}
                  <strong className="font-mono">{rejectTarget.kode_pengajuan}</strong>{' '}
                  pada layar Pelacakan Pengajuan (UI-14).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setRejectTarget(null);
                    setErrorMsg(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingReject}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {savingReject ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/AdminShell';
import {
  getAdminLogs,
  clearLocalAdminLogs,
  AdminLogItem,
} from '@/services/log.service';
import {
  getAllAdmins,
  createAdminAccount,
  deleteAdminAccount,
  AdminUser,
} from '@/services/admin.service';
import {
  History,
  Search,
  RefreshCw,
  Trash2,
  Users,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export default function AdminLogPage() {
  const [activeTab, setActiveTab] = useState<'logs' | 'accounts'>('logs');
  const [logs, setLogs] = useState<AdminLogItem[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModul, setFilterModul] = useState('all');

  // Form Tambah Akun Admin Baru
  const [newUsername, setNewUsername] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [logData, adminData] = await Promise.all([
      getAdminLogs(),
      getAllAdmins(),
    ]);
    setLogs(logData);
    setAdmins(adminData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSavingAdmin(true);
    const res = await createAdminAccount({
      username: newUsername,
      nama_lengkap: newNama,
      password: newPassword,
    });
    setSavingAdmin(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal membuat akun admin');
      return;
    }

    setNewUsername('');
    setNewNama('');
    setNewPassword('');
    setToastMsg(
      `Akun admin '@${res.data?.username}' (${res.data?.nama_lengkap}) berhasil dibuat dan siap digunakan login.`
    );
    setTimeout(() => setToastMsg(null), 4000);
    await loadAll();
  };

  const handleDeleteAdmin = async (admin: AdminUser) => {
    setErrorMsg(null);
    const res = await deleteAdminAccount(admin.id_admin);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menghapus akun admin');
      return;
    }
    setToastMsg(`Akun admin '@${admin.username}' berhasil dihapus.`);
    setTimeout(() => setToastMsg(null), 4000);
    await loadAll();
  };

  const filtered = logs.filter((l) => {
    const matchModul = filterModul === 'all' || l.modul === filterModul;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      l.aksi.toLowerCase().includes(q) ||
      l.detail.toLowerCase().includes(q) ||
      l.nama_admin.toLowerCase().includes(q) ||
      l.username.toLowerCase().includes(q);
    return matchModul && matchSearch;
  });

  const uniqueModuls = Array.from(new Set(logs.map((l) => l.modul))).sort();

  const formatWaktu = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getAksiBadge = (aksi: string) => {
    if (aksi.includes('HAPUS') || aksi.includes('BATAL')) {
      return 'bg-rose-100 text-rose-900 border-rose-300';
    }
    if (aksi.includes('TAMBAH') || aksi.includes('CATAT')) {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    if (aksi.includes('LOGIN')) {
      return 'bg-amber-100 text-amber-950 border-amber-300';
    }
    return 'bg-blue-100 text-blue-950 border-blue-200';
  };

  return (
    <AdminShell
      title="Log Aktivitas & Akun Admin"
      uiCode="LOG"
      modulCode="Audit Operasional"
      subtitle="Pantau rekam jejak aktivitas setiap staf operasional dan kelola akun admin agar setiap aksi tercatat berdasarkan identitas staf masing-masing."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            className="inline-flex items-center gap-1.5 bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang</span>
          </button>
          {activeTab === 'logs' && logs.length > 0 && (
            <button
              onClick={() => {
                clearLocalAdminLogs();
                loadAll();
              }}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs px-3 py-2 rounded-xl cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Log Lokal</span>
            </button>
          )}
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

      {/* Tab Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 inline-flex gap-2 shadow-2xs">
        <button
          onClick={() => setActiveTab('logs')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-[#0b2242] text-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Riwayat Aktivitas ({logs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'accounts'
              ? 'bg-[#0b2242] text-amber-300'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Kelola Akun Admin ({admins.length})</span>
        </button>
      </div>

      {activeTab === 'logs' && (
        <>
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shadow-2xs">
            <div className="sm:col-span-2 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari aktivitas, nama admin, atau detail aksi..."
                className="w-full border border-slate-300 rounded-xl pl-8 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              />
            </div>
            <div>
              <select
                value={filterModul}
                onChange={(e) => setFilterModul(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              >
                <option value="all">Semua Modul ({logs.length})</option>
                {uniqueModuls.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabel Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0b2242] text-white border-b border-[#163d73]">
                    <th className="py-3.5 px-4 font-semibold">Waktu</th>
                    <th className="py-3.5 px-4 font-semibold">Admin</th>
                    <th className="py-3.5 px-4 font-semibold">Modul</th>
                    <th className="py-3.5 px-4 font-semibold">Aksi</th>
                    <th className="py-3.5 px-4 font-semibold">Keterangan Aktivitas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        Memuat log aktivitas admin...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-1.5">
                          <History className="w-6 h-6 text-slate-400" />
                          <span className="font-semibold">Belum ada aktivitas tercatat</span>
                          <span className="text-[11px] text-slate-400">
                            Setiap operasi admin akan otomatis terekam di sini beserta identitas staf yang login.
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id_log} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {formatWaktu(item.waktu)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">
                            {item.nama_admin}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500">
                            @{item.username}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold text-blue-900">
                          {item.modul}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getAksiBadge(
                              item.aksi
                            )}`}
                          >
                            {item.aksi}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{item.detail}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Tambah Akun Admin */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-4 h-4 text-blue-800" />
              <h3 className="text-sm font-bold text-slate-900">
                Buat Akun Admin Baru
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              Buat akun terpisah untuk tiap staf operasional (misal <code>staf_keuangan</code>, <code>staf_pendaftaran</code>) agar setiap aksi tercatat jelas pada Log Aktivitas.
            </p>
            <form onSubmit={handleCreateAdmin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nama Lengkap Staf <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  placeholder="Mis. Ersi Shaulah (Sekretaris)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Username Login <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Mis. ersi_admin (huruf kecil tanpa spasi)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:bg-white focus:outline-blue-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Password (min. 6 karakter) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
                />
              </div>
              <button
                type="submit"
                disabled={savingAdmin}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                {savingAdmin ? 'Menyimpan...' : 'Buat Akun Admin'}
              </button>
            </form>
          </div>

          {/* Daftar Akun Admin Terdaftar */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0b2242] text-white border-b border-[#163d73]">
                    <th className="py-3.5 px-4 font-semibold">ID</th>
                    <th className="py-3.5 px-4 font-semibold">Username</th>
                    <th className="py-3.5 px-4 font-semibold">Nama Lengkap Staf</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {admins.map((adm) => (
                    <tr key={adm.id_admin} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono text-slate-500">
                        #{adm.id_admin}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-950">
                        @{adm.username}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {adm.nama_lengkap}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {adm.id_admin === 1 ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Admin Utama
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDeleteAdmin(adm)}
                            className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-2.5 py-1 rounded-lg text-[11px] cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

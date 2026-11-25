'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '@/components/AdminShell';
import {
  getAdminLogs,
  clearLocalAdminLogs,
  AdminLogItem,
} from '@/services/log.service';
import { History, Search, RefreshCw, Trash2 } from 'lucide-react';

export default function AdminLogPage() {
  const [logs, setLogs] = useState<AdminLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModul, setFilterModul] = useState('all');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    const data = await getAdminLogs();
    setLogs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

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
      title="Log Aktivitas Admin"
      uiCode="LOG"
      modulCode="Audit Operasional"
      subtitle="Rekam jejak aktivitas staf operasional (login, kelola paket, jadwal, pengajuan, data jamaah, dan pencatatan pembayaran)."
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            className="inline-flex items-center gap-1.5 bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang</span>
          </button>
          {logs.length > 0 && (
            <button
              onClick={() => {
                clearLocalAdminLogs();
                loadLogs();
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
                        Setiap operasi admin (tambah/ubah/hapus data &amp; pembayaran) akan otomatis terekam di sini.
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
    </AdminShell>
  );
}

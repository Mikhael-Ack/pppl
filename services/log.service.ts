import { supabase } from '@/lib/supabase';

export interface AdminLogItem {
  id_log: string;
  waktu: string;
  id_admin: number | null;
  username: string;
  nama_admin: string;
  aksi: string;
  modul: string;
  detail: string;
}

const LOG_STORAGE_KEY = 'darunnisa_admin_logs';
const MAX_LOCAL_LOGS = 250;

function getStoredSessionInfo(): {
  id_admin: number | null;
  username: string;
  nama_admin: string;
} {
  if (typeof window === 'undefined') {
    return { id_admin: null, username: 'system', nama_admin: 'Sistem' };
  }
  try {
    const raw = localStorage.getItem('darunnisa_admin_session');
    if (!raw) {
      return { id_admin: null, username: 'admin', nama_admin: 'Staf Operasional' };
    }
    const parsed = JSON.parse(raw);
    return {
      id_admin: parsed.id_admin ?? null,
      username: parsed.username || 'admin',
      nama_admin: parsed.nama_lengkap || parsed.username || 'Staf Operasional',
    };
  } catch {
    return { id_admin: null, username: 'admin', nama_admin: 'Staf Operasional' };
  }
}

function readLocalLogs(): AdminLogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalLogs(logs: AdminLogItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      LOG_STORAGE_KEY,
      JSON.stringify(logs.slice(0, MAX_LOCAL_LOGS))
    );
  } catch {
    // Abaikan jika kuota storage penuh
  }
}

export async function recordAdminLog(params: {
  aksi: string;
  modul: string;
  detail: string;
  id_admin?: number | null;
  username?: string;
  nama_admin?: string;
}): Promise<void> {
  const session = getStoredSessionInfo();
  const entry: AdminLogItem = {
    id_log: `LOG-${Date.now()}-${Math.floor(100 + Math.random() * 899)}`,
    waktu: new Date().toISOString(),
    id_admin: params.id_admin ?? session.id_admin,
    username: params.username || session.username,
    nama_admin: params.nama_admin || session.nama_admin,
    aksi: params.aksi,
    modul: params.modul,
    detail: params.detail,
  };

  // Simpan ke localStorage agar selalu langsung tersedia di UI Log Admin
  const existing = readLocalLogs();
  writeLocalLogs([entry, ...existing]);

  // Opsional: Coba kirim ke tabel log_admin Supabase jika tersedia
  try {
    await supabase.from('log_admin').insert([
      {
        id_admin: entry.id_admin,
        username: entry.username,
        nama_admin: entry.nama_admin,
        aksi: entry.aksi,
        modul: entry.modul,
        detail: entry.detail,
        waktu: entry.waktu,
      },
    ]);
  } catch {
    // Tabel log_admin opsional di Supabase; fallback lokal sudah tersimpan
  }
}

export async function getAdminLogs(): Promise<AdminLogItem[]> {
  const localLogs = readLocalLogs();
  try {
    const { data, error } = await supabase
      .from('log_admin')
      .select('*')
      .order('waktu', { ascending: false })
      .limit(200);

    if (!error && Array.isArray(data) && data.length > 0) {
      const dbLogs: AdminLogItem[] = data.map((row: any, idx: number) => ({
        id_log: String(row.id_log ?? `DB-${idx}`),
        waktu: row.waktu || row.created_at || new Date().toISOString(),
        id_admin: row.id_admin ?? null,
        username: row.username || 'admin',
        nama_admin: row.nama_admin || 'Staf Operasional',
        aksi: row.aksi || 'AKSI',
        modul: row.modul || '-',
        detail: row.detail || '-',
      }));
      return dbLogs;
    }
  } catch {
    // Gunakan log lokal jika tabel DB tidak ada
  }

  return localLogs;
}

export function clearLocalAdminLogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOG_STORAGE_KEY);
}

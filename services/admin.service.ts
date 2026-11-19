import { supabase } from '@/lib/supabase';
import { PaketItem, KeberangkatanItem } from '@/types/package.types';

export interface AdminUser {
  id_admin: number;
  username: string;
  nama_lengkap: string;
}

const ADMIN_STORAGE_KEY = 'darunnisa_admin_session';

export async function sha256Hex(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return text;
}

export function getAdminSession(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function setAdminSession(admin: AdminUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
}

export function clearAdminSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}

/**
 * M1.1 Login Admin (UI-06)
 * Sesuai Pseudocode Bab 4.2 SD v1.1:
 * - JIKA username atau password kosong -> "Data wajib diisi"
 * - admin <- cari admin berdasarkan username
 * - JIKA admin tidak ada ATAU hash(password) != password_hash -> "Username atau password salah"
 */
export async function loginAdmin(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; admin?: AdminUser; error?: string }> {
  const username = usernameInput.trim();
  const password = passwordInput.trim();

  if (!username || !password) {
    return { success: false, error: 'Data wajib diisi' };
  }

  try {
    const { data, error } = await supabase
      .from('admin')
      .select('id_admin, username, password_hash, nama_lengkap')
      .eq('username', username)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: 'Username atau password salah' };
    }

    const hashedInput = await sha256Hex(password);
    const isMatch =
      data.password_hash === hashedInput || data.password_hash === password;

    if (!isMatch) {
      return { success: false, error: 'Username atau password salah' };
    }

    const adminUser: AdminUser = {
      id_admin: data.id_admin,
      username: data.username,
      nama_lengkap: data.nama_lengkap,
    };

    setAdminSession(adminUser);
    return { success: true, admin: adminUser };
  } catch (err: any) {
    console.error('[AdminService] Login error:', err);
    return { success: false, error: 'Username atau password salah' };
  }
}

/**
 * M2.2 Kelola Data Paket (UI-07)
 */
export async function getAllPackagesAdmin(): Promise<PaketItem[]> {
  const [{ data: paketData }, { data: jamaahData }] = await Promise.all([
    supabase
      .from('paket')
      .select('*, keberangkatan(*)')
      .order('id_paket', { ascending: true }),
    supabase
      .from('jamaah')
      .select('id_keberangkatan')
      .eq('status_jamaah', 'aktif'),
  ]);

  const countMap: Record<number, number> = {};
  if (jamaahData) {
    for (const j of jamaahData) {
      if (j.id_keberangkatan) {
        countMap[j.id_keberangkatan] = (countMap[j.id_keberangkatan] || 0) + 1;
      }
    }
  }

  return ((paketData as PaketItem[]) || []).map((pkg) => ({
    ...pkg,
    keberangkatan: (pkg.keberangkatan || []).map((k) => {
      const jumlah_terisi = countMap[k.id_keberangkatan] || 0;
      const sisa_kuota = Math.max(0, k.kuota - jumlah_terisi);
      return { ...k, jumlah_terisi, sisa_kuota };
    }),
  }));
}

export interface SavePaketInput {
  id_paket?: number;
  kode_paket: string;
  nama_paket: string;
  program: 'umrah' | 'haji_reguler' | 'haji_khusus';
  harga: number;
  maskapai: string;
  hotel: string;
  durasi_hari: number;
  deskripsi: string;
  status_aktif: boolean;
}

export async function savePaketAdmin(
  input: SavePaketInput
): Promise<{ success: boolean; data?: PaketItem; error?: string }> {
  const kode = input.kode_paket.trim().toUpperCase();
  const nama = input.nama_paket.trim();
  const maskapai = input.maskapai.trim();
  const hotel = input.hotel.trim();

  if (!kode || !nama || !maskapai || !hotel) {
    return { success: false, error: 'Kode paket, nama paket, maskapai, dan hotel wajib diisi' };
  }

  if (Number(input.harga) <= 0 || Number(input.durasi_hari) <= 0) {
    return {
      success: false,
      error: 'Harga paket dan durasi perjalanan (hari) harus lebih dari 0',
    };
  }

  try {
    // Cek keunikan kode_paket
    const { data: existing } = await supabase
      .from('paket')
      .select('id_paket, kode_paket')
      .ilike('kode_paket', kode)
      .maybeSingle();

    if (existing && existing.id_paket !== input.id_paket) {
      return { success: false, error: 'Kode paket sudah digunakan' };
    }

    const payload = {
      kode_paket: kode,
      nama_paket: nama,
      program: input.program,
      harga: Number(input.harga),
      maskapai,
      hotel,
      durasi_hari: Number(input.durasi_hari),
      deskripsi: input.deskripsi.trim() || null,
      status_aktif: input.status_aktif,
    };

    if (input.id_paket) {
      const { data, error } = await supabase
        .from('paket')
        .update(payload)
        .eq('id_paket', input.id_paket)
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data as PaketItem };
    } else {
      const { data, error } = await supabase
        .from('paket')
        .insert([payload])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'Kode paket sudah digunakan' };
        }
        return { success: false, error: error.message };
      }
      return { success: true, data: data as PaketItem };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Gagal menyimpan data paket' };
  }
}

export async function togglePaketStatusAdmin(
  id_paket: number,
  status_aktif: boolean
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('paket')
    .update({ status_aktif })
    .eq('id_paket', id_paket);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * M7.1 & M7.2 Kelola Jadwal Keberangkatan & Kelompok Jamaah (UI-12)
 */
export interface KeberangkatanWithPaket extends KeberangkatanItem {
  paket?: PaketItem;
  jamaah_list?: {
    id_jamaah: number;
    no_jamaah: string;
    nama_lengkap: string;
    no_hp: string;
    status_jamaah: string;
    status_paspor: string | null;
    status_visa: string | null;
    status_manasik: string | null;
  }[];
}

export async function getAllKeberangkatanAdmin(): Promise<KeberangkatanWithPaket[]> {
  const [{ data: kebData }, { data: jamaahData }] = await Promise.all([
    supabase
      .from('keberangkatan')
      .select('*, paket(*)')
      .order('tahun', { ascending: true })
      .order('bulan', { ascending: true }),
    supabase
      .from('jamaah')
      .select(
        'id_jamaah, no_jamaah, nama_lengkap, no_hp, id_keberangkatan, status_jamaah, status_paspor, status_visa, status_manasik'
      )
      .eq('status_jamaah', 'aktif')
      .order('no_jamaah', { ascending: true }),
  ]);

  const jamaahByKeb: Record<number, KeberangkatanWithPaket['jamaah_list']> = {};
  if (jamaahData) {
    for (const j of jamaahData) {
      if (!jamaahByKeb[j.id_keberangkatan]) {
        jamaahByKeb[j.id_keberangkatan] = [];
      }
      jamaahByKeb[j.id_keberangkatan]!.push(j);
    }
  }

  return ((kebData as KeberangkatanWithPaket[]) || []).map((k) => {
    const activeList = jamaahByKeb[k.id_keberangkatan] || [];
    const jumlah_terisi = activeList.length;
    const sisa_kuota = Math.max(0, k.kuota - jumlah_terisi);
    return {
      ...k,
      jumlah_terisi,
      sisa_kuota,
      jamaah_list: activeList,
    };
  });
}

export interface SaveKeberangkatanInput {
  id_keberangkatan?: number;
  id_paket: number;
  tahun: number;
  bulan: number | null;
  tgl_berangkat: string | null;
  kuota: number;
  status: 'buka' | 'tutup';
}

export async function saveKeberangkatanAdmin(
  input: SaveKeberangkatanInput
): Promise<{ success: boolean; error?: string }> {
  if (!input.id_paket || !input.tahun) {
    return { success: false, error: 'Paket dan tahun keberangkatan wajib diisi' };
  }

  if (Number(input.kuota) <= 0) {
    return { success: false, error: 'Kuota kursi harus lebih dari 0' };
  }

  // Ambil program paket untuk validasi aturan Umrah vs Haji (SD Bab 4.2 M7.1)
  const { data: paket } = await supabase
    .from('paket')
    .select('program')
    .eq('id_paket', input.id_paket)
    .maybeSingle();

  const isUmrah = paket?.program === 'umrah';

  if (isUmrah && (!input.bulan || !input.tgl_berangkat)) {
    return {
      success: false,
      error: 'Untuk program Umrah, bulan dan tanggal berangkat wajib diisi',
    };
  }

  // Jika mode ubah, cek jumlah jamaah aktif pada keberangkatan tersebut
  if (input.id_keberangkatan) {
    const { count } = await supabase
      .from('jamaah')
      .select('id_jamaah', { count: 'exact', head: true })
      .eq('id_keberangkatan', input.id_keberangkatan)
      .eq('status_jamaah', 'aktif');

    const activeCount = count || 0;
    if (Number(input.kuota) < activeCount) {
      return {
        success: false,
        error: `Kuota tidak boleh kurang dari jumlah jamaah aktif (${activeCount} jamaah)`,
      };
    }
  }

  const payload = {
    id_paket: Number(input.id_paket),
    tahun: Number(input.tahun),
    bulan: isUmrah ? Number(input.bulan) : input.bulan ? Number(input.bulan) : null,
    tgl_berangkat: isUmrah ? input.tgl_berangkat : input.tgl_berangkat || null,
    kuota: Number(input.kuota),
    status: input.status,
  };

  if (input.id_keberangkatan) {
    const { error } = await supabase
      .from('keberangkatan')
      .update(payload)
      .eq('id_keberangkatan', input.id_keberangkatan);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from('keberangkatan').insert([payload]);
    if (error) return { success: false, error: error.message };
  }

  return { success: true };
}

export async function pindahkanJamaahKeberangkatanAdmin(
  id_jamaah: number,
  target_id_keberangkatan: number
): Promise<{ success: boolean; error?: string }> {
  // Cek sisa kuota keberangkatan tujuan (SD Bab 4.2 M7.2)
  const [{ data: targetKeb }, { count: activeCount }] = await Promise.all([
    supabase
      .from('keberangkatan')
      .select('kuota, status')
      .eq('id_keberangkatan', target_id_keberangkatan)
      .single(),
    supabase
      .from('jamaah')
      .select('id_jamaah', { count: 'exact', head: true })
      .eq('id_keberangkatan', target_id_keberangkatan)
      .eq('status_jamaah', 'aktif'),
  ]);

  if (!targetKeb) {
    return { success: false, error: 'Jadwal keberangkatan tujuan tidak ditemukan' };
  }

  const sisa = targetKeb.kuota - (activeCount || 0);
  if (sisa <= 0) {
    return { success: false, error: 'Kuota keberangkatan tujuan sudah penuh' };
  }

  const { error } = await supabase
    .from('jamaah')
    .update({ id_keberangkatan: target_id_keberangkatan })
    .eq('id_jamaah', id_jamaah);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

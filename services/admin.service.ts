import { supabase } from '@/lib/supabase';
import { PaketItem, KeberangkatanItem } from '@/types/package.types';

export interface AdminUser {
  id_admin: number;
  username: string;
  nama_lengkap: string;
}

const ADMIN_STORAGE_KEY = 'darunnisa_admin_session';

/**
 * Pure JS SHA-256 fallback agar bekerja di semua environment
 * (Browser HTTPS, Browser HTTP LAN IP, dan Node.js testing)
 */
function sha256PureJS(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  ascii += '\x80';
  while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15],
        w2 = w[i - 2];

      const a = hash[0],
        e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

export async function sha256Hex(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return sha256PureJS(text);
    }
  }
  return sha256PureJS(text);
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
        .select();

      if (error) return { success: false, error: error.message };
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Gagal memperbarui paket: Izin RLS UPDATE pada tabel paket belum aktif di Supabase',
        };
      }
      return { success: true, data: data[0] as PaketItem };
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
  const { data, error } = await supabase
    .from('paket')
    .update({ status_aktif })
    .eq('id_paket', id_paket)
    .select();

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return {
      success: false,
      error: 'Gagal mengubah status: Izin RLS UPDATE pada tabel paket belum aktif di Supabase',
    };
  }
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

  // Ambil program paket untuk validasi aturan Umrah vs Haji (SD Bab 4.2 M7.1 & Bab 5.3)
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

  if (isUmrah && (Number(input.bulan) < 1 || Number(input.bulan) > 12)) {
    return {
      success: false,
      error: 'Bulan keberangkatan harus bernilai antara 1 sampai 12',
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
        error: 'Kuota tidak boleh kurang dari jumlah jamaah aktif',
      };
    }
  }

  // Sesuai SD Bab 5.3: bulan & tgl_berangkat wajib untuk umrah, kosong (null) untuk haji
  const payload = {
    id_paket: Number(input.id_paket),
    tahun: Number(input.tahun),
    bulan: isUmrah ? Number(input.bulan) : null,
    tgl_berangkat: isUmrah ? input.tgl_berangkat : null,
    kuota: Number(input.kuota),
    status: input.status,
  };

  if (input.id_keberangkatan) {
    const { data, error } = await supabase
      .from('keberangkatan')
      .update(payload)
      .eq('id_keberangkatan', input.id_keberangkatan)
      .select();
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'Gagal memperbarui jadwal: Izin RLS UPDATE pada tabel keberangkatan belum aktif di Supabase',
      };
    }
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

  const { data, error } = await supabase
    .from('jamaah')
    .update({ id_keberangkatan: target_id_keberangkatan })
    .eq('id_jamaah', id_jamaah)
    .select();

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return {
      success: false,
      error: 'Gagal memindahkan jamaah',
    };
  }
  return { success: true };
}

import { supabase } from '@/lib/supabase';
import { PaketItem, KeberangkatanItem } from '@/types/package.types';
import { PengajuanItem } from '@/types/pengajuan.types';

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

/**
 * M3.2 Kelola Pengajuan (UI-08)
 * Sesuai Pseudocode Bab 4.2 SD v1.1:
 * - pengajuan <- ambil data, urut tgl_pengajuan terbaru (filter status bila ada)
 * - JIKA admin mengubah status lewat dropdown menjadi "dihubungi" -> update status_pengajuan
 * - JIKA admin memilih "ditolak" -> tampilkan kotak alasan; JIKA alasan_tolak kosong ->
 *   tampilkan pesan kesalahan; SELAIN ITU update status_pengajuan <- "ditolak" dan simpan alasan_tolak
 * - Status "diproses" tidak dapat dipilih manual. Pengajuan "ditolak" dapat dibuka kembali dengan mengubah status ke "dihubungi".
 */
export async function getAllPengajuanAdmin(
  statusFilter?: string
): Promise<PengajuanItem[]> {
  let query = supabase
    .from('pengajuan')
    .select('*, paket(*)')
    .order('tgl_pengajuan', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status_pengajuan', statusFilter);
  }

  const { data } = await query;
  return (data as PengajuanItem[]) || [];
}

export async function getPengajuanByIdAdmin(
  id_pengajuan: number
): Promise<PengajuanItem | null> {
  const { data } = await supabase
    .from('pengajuan')
    .select('*, paket(*)')
    .eq('id_pengajuan', id_pengajuan)
    .maybeSingle();
  return (data as PengajuanItem) || null;
}

export async function updateStatusPengajuanAdmin(
  id_pengajuan: number,
  status_baru: string,
  alasan_tolak?: string
): Promise<{ success: boolean; error?: string }> {
  if (status_baru === 'diproses') {
    return {
      success: false,
      error: 'Status "diproses" tidak dapat dipilih manual. Gunakan tombol "Daftarkan sebagai Jamaah".',
    };
  }

  if (!['baru', 'dihubungi', 'ditolak'].includes(status_baru)) {
    return { success: false, error: 'Status pengajuan tidak valid' };
  }

  if (status_baru === 'ditolak' && (!alasan_tolak || !alasan_tolak.trim())) {
    return {
      success: false,
      error: 'Alasan penolakan wajib diisi saat menolak pengajuan',
    };
  }

  const payload: Record<string, any> = {
    status_pengajuan: status_baru,
    alasan_tolak: status_baru === 'ditolak' ? alasan_tolak!.trim() : null,
  };

  const { data, error } = await supabase
    .from('pengajuan')
    .update(payload)
    .eq('id_pengajuan', id_pengajuan)
    .select();

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return { success: false, error: 'Gagal memperbarui status pengajuan' };
  }

  return { success: true };
}

/**
 * M6.1 & M6.2 Manajemen & Pencarian Data Jamaah (UI-09 & UI-10)
 */
export interface JamaahItem {
  id_jamaah: number;
  no_jamaah: string;
  id_pengajuan: number | null;
  id_keberangkatan: number;
  nik: string | null;
  nama_lengkap: string;
  nama_ayah: string | null;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  alamat: string | null;
  pekerjaan: string | null;
  pendidikan: string | null;
  no_hp: string;
  total_biaya: number;
  tgl_daftar: string;
  status_jamaah: 'aktif' | 'batal';
  catatan: string | null;
  status_paspor:
    | 'menunggu_berkas'
    | 'verifikasi_kantor'
    | 'rekom_kemenag'
    | 'selesai'
    | null;
  status_visa: 'belum_diajukan' | 'proses_mofa' | 'visa_terbit' | null;
  status_manasik: 'belum_manasik' | 'terjadwal' | 'sudah_manasik' | null;
  alasan_batal: string | null;
  tgl_batal: string | null;
  keberangkatan?: KeberangkatanWithPaket;
  total_dibayar?: number;
  sisa_pembayaran?: number;
  status_pembayaran?: 'Lunas' | 'Belum lunas';
}

export async function getAllJamaahAdmin(): Promise<JamaahItem[]> {
  const [{ data: jamaahData }, { data: payData }] = await Promise.all([
    supabase
      .from('jamaah')
      .select('*, keberangkatan(*, paket(*))')
      .order('tgl_daftar', { ascending: false })
      .order('id_jamaah', { ascending: false }),
    supabase.from('pembayaran').select('id_jamaah, jumlah'),
  ]);

  const paidByJamaah: Record<number, number> = {};
  if (payData) {
    for (const p of payData) {
      paidByJamaah[p.id_jamaah] =
        (paidByJamaah[p.id_jamaah] || 0) + Number(p.jumlah || 0);
    }
  }

  return ((jamaahData as JamaahItem[]) || []).map((j) => {
    const total_dibayar = paidByJamaah[j.id_jamaah] || 0;
    const sisa_pembayaran = Math.max(0, Number(j.total_biaya) - total_dibayar);
    const status_pembayaran = sisa_pembayaran === 0 ? 'Lunas' : 'Belum lunas';
    return {
      ...j,
      total_dibayar,
      sisa_pembayaran,
      status_pembayaran,
    };
  });
}

export async function getJamaahByIdAdmin(
  id_jamaah: number
): Promise<JamaahItem | null> {
  const [{ data: j }, { data: payData }] = await Promise.all([
    supabase
      .from('jamaah')
      .select('*, keberangkatan(*, paket(*))')
      .eq('id_jamaah', id_jamaah)
      .maybeSingle(),
    supabase.from('pembayaran').select('jumlah').eq('id_jamaah', id_jamaah),
  ]);

  if (!j) return null;
  const total_dibayar = (payData || []).reduce(
    (acc, cur) => acc + Number(cur.jumlah || 0),
    0
  );
  const sisa_pembayaran = Math.max(0, Number(j.total_biaya) - total_dibayar);
  return {
    ...(j as JamaahItem),
    total_dibayar,
    sisa_pembayaran,
    status_pembayaran: sisa_pembayaran === 0 ? 'Lunas' : 'Belum lunas',
  };
}

export interface SaveJamaahInput {
  id_jamaah?: number;
  id_pengajuan?: number | null;
  id_keberangkatan: number;
  nik?: string | null;
  nama_lengkap: string;
  nama_ayah?: string | null;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  alamat?: string | null;
  pekerjaan?: string | null;
  pendidikan?: string | null;
  no_hp: string;
  total_biaya: number;
  catatan?: string | null;
  status_paspor?:
    | 'menunggu_berkas'
    | 'verifikasi_kantor'
    | 'rekom_kemenag'
    | 'selesai';
  status_visa?: 'belum_diajukan' | 'proses_mofa' | 'visa_terbit';
  status_manasik?: 'belum_manasik' | 'terjadwal' | 'sudah_manasik';
  simulateOffline?: boolean;
}

/**
 * M6.1 Tambah & Ubah Data Jamaah (UI-10)
 * Sesuai Pseudocode Bab 4.2 SD v1.1:
 * - JIKA kolom wajib (nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, no_hp,
 *   id_keberangkatan, total_biaya) kosong ATAU nik terisi tetapi bukan 16 digit angka / sudah terpakai
 *   -> tampilkan pesan kesalahan
 * - nik, nama_ayah, dan pendidikan boleh dikosongkan saat simpan awal
 * - JIKA sisa kuota keberangkatan <= 0 -> tampilkan "Kuota keberangkatan penuh"
 * - SELAIN ITU no_jamaah <- "JM" + tahun + nomor urut; simpan ke tabel jamaah
 * - JIKA id_pengajuan terisi -> status_pengajuan <- "diproses"
 */
export async function saveJamaahAdmin(
  input: SaveJamaahInput
): Promise<{ success: boolean; data?: JamaahItem; error?: string }> {
  try {
    if (
      input.simulateOffline ||
      (typeof navigator !== 'undefined' && navigator.onLine === false)
    ) {
      return {
        success: false,
        error:
          'Gagal menyimpan data: Koneksi jaringan ke basis data cloud terputus',
      };
    }

    const nama = (input.nama_lengkap || '').trim();
    const tempatLahir = (input.tempat_lahir || '').trim();
    const tanggalLahir = (input.tanggal_lahir || '').trim();
    const jk = input.jenis_kelamin;
    const noHp = (input.no_hp || '').trim();
    const idKeb = Number(input.id_keberangkatan || 0);
    const totalBiaya = Number(input.total_biaya || 0);
    const rawNik = (input.nik || '').trim();

    if (
      !nama ||
      !tempatLahir ||
      !tanggalLahir ||
      !jk ||
      !noHp ||
      !idKeb ||
      totalBiaya <= 0
    ) {
      return {
        success: false,
        error:
          'Kolom wajib (nama lengkap, tempat lahir, tanggal lahir, jenis kelamin, no. telepon, keberangkatan, dan total biaya > 0) harus diisi',
      };
    }

    // Validasi NIK bila diisi: harus 16 digit angka & unik
    if (rawNik) {
      if (!/^\d{16}$/.test(rawNik)) {
        return {
          success: false,
          error: 'NIK harus berupa 16 digit angka',
        };
      }

      const { data: existingNik, error: nikErr } = await supabase
        .from('jamaah')
        .select('id_jamaah')
        .eq('nik', rawNik)
        .maybeSingle();

      if (nikErr) {
        return {
          success: false,
          error: 'Gagal terhubung ke basis data cloud: ' + nikErr.message,
        };
      }

      if (existingNik && existingNik.id_jamaah !== input.id_jamaah) {
        return {
          success: false,
          error: 'NIK sudah terpakai oleh jamaah lain',
        };
      }
    }

    // Cek apakah tambah baru atau pindah jadwal keberangkatan -> validasi sisa kuota > 0
    let needQuotaCheck = !input.id_jamaah;
    if (input.id_jamaah) {
      const { data: prevJamaah } = await supabase
        .from('jamaah')
        .select('id_keberangkatan, status_jamaah')
        .eq('id_jamaah', input.id_jamaah)
        .maybeSingle();
      if (
        prevJamaah &&
        prevJamaah.id_keberangkatan !== idKeb &&
        prevJamaah.status_jamaah === 'aktif'
      ) {
        needQuotaCheck = true;
      }
    }

    if (needQuotaCheck) {
      const [{ data: kebRow }, { count: activeCount }] = await Promise.all([
        supabase
          .from('keberangkatan')
          .select('kuota, status')
          .eq('id_keberangkatan', idKeb)
          .maybeSingle(),
        supabase
          .from('jamaah')
          .select('id_jamaah', { count: 'exact', head: true })
          .eq('id_keberangkatan', idKeb)
          .eq('status_jamaah', 'aktif'),
      ]);

      if (!kebRow) {
        return { success: false, error: 'Jadwal keberangkatan tidak ditemukan' };
      }

      const sisaKuota = kebRow.kuota - (activeCount || 0);
      if (sisaKuota <= 0) {
        return {
          success: false,
          error: 'Kuota keberangkatan penuh',
        };
      }
    }

    const commonPayload = {
      nik: rawNik || null,
      nama_lengkap: nama,
      nama_ayah: input.nama_ayah?.trim() || null,
      tempat_lahir: tempatLahir,
      tanggal_lahir: tanggalLahir,
      jenis_kelamin: jk,
      alamat: input.alamat?.trim() || null,
      pekerjaan: input.pekerjaan?.trim() || null,
      pendidikan: input.pendidikan?.trim() || null,
      no_hp: noHp,
      id_keberangkatan: idKeb,
      total_biaya: totalBiaya,
      catatan: input.catatan?.trim() || null,
      status_paspor: input.status_paspor || 'menunggu_berkas',
      status_visa: input.status_visa || 'belum_diajukan',
      status_manasik: input.status_manasik || 'belum_manasik',
    };

    if (input.id_jamaah) {
      // Mode Ubah
      const { data, error } = await supabase
        .from('jamaah')
        .update(commonPayload)
        .eq('id_jamaah', input.id_jamaah)
        .select('*, keberangkatan(*, paket(*))')
        .single();

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'NIK sudah terpakai oleh jamaah lain' };
        }
        return { success: false, error: error.message };
      }

      return { success: true, data: data as JamaahItem };
    } else {
      // Mode Tambah Baru: Generate no_jamaah = "JM" + tahun + 4 digit nomor urut (mis. JM20260001)
      const currentYear = new Date().getFullYear();
      const prefix = `JM${currentYear}`;

      const { data: existingJm } = await supabase
        .from('jamaah')
        .select('id_jamaah, no_jamaah')
        .order('id_jamaah', { ascending: false })
        .limit(100);

      let maxSeq = 0;
      if (existingJm) {
        for (const row of existingJm) {
          if (row.id_jamaah > maxSeq) maxSeq = row.id_jamaah;
          if (row.no_jamaah && row.no_jamaah.startsWith(prefix)) {
            const seqPart = parseInt(row.no_jamaah.slice(prefix.length), 10);
            if (!isNaN(seqPart) && seqPart < 8000 && seqPart > maxSeq) {
              maxSeq = seqPart;
            }
          }
        }
      }

      let noJamaah = `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
      const todayStr = new Date().toISOString().slice(0, 10);

      const insertPayload = {
        ...commonPayload,
        no_jamaah: noJamaah,
        id_pengajuan: input.id_pengajuan || null,
        tgl_daftar: todayStr,
        status_jamaah: 'aktif',
      };

      let { data, error } = await supabase
        .from('jamaah')
        .insert([insertPayload])
        .select('*, keberangkatan(*, paket(*))')
        .single();

      if (error && error.code === '23505' && error.message.includes('no_jamaah')) {
        const randSeq = Math.floor(1000 + Math.random() * 7999);
        noJamaah = `${prefix}${randSeq}`;
        const retry = await supabase
          .from('jamaah')
          .insert([{ ...insertPayload, no_jamaah: noJamaah }])
          .select('*, keberangkatan(*, paket(*))')
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        if (error.code === '23505') {
          return { success: false, error: 'NIK sudah terpakai oleh jamaah lain' };
        }
        return { success: false, error: error.message };
      }

      // JIKA id_pengajuan terisi -> status_pengajuan <- "diproses" (SD Bab 4.2 M6.1)
      if (input.id_pengajuan) {
        await supabase
          .from('pengajuan')
          .update({ status_pengajuan: 'diproses', alasan_tolak: null })
          .eq('id_pengajuan', input.id_pengajuan);
      }

      return { success: true, data: data as JamaahItem };
    }
  } catch (err: any) {
    return {
      success: false,
      error:
        'Gagal menyimpan data: Koneksi jaringan ke basis data cloud terputus (' +
        (err?.message || 'Network Error') +
        ')',
    };
  }
}

export async function batalkanJamaahAdmin(
  id_jamaah: number,
  alasan_batal: string
): Promise<{ success: boolean; error?: string }> {
  const alasan = (alasan_batal || '').trim();
  if (!alasan) {
    return {
      success: false,
      error: 'Alasan pembatalan wajib diisi',
    };
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('jamaah')
    .update({
      status_jamaah: 'batal',
      alasan_batal: alasan,
      tgl_batal: todayStr,
    })
    .eq('id_jamaah', id_jamaah)
    .select();

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return { success: false, error: 'Gagal membatalkan jamaah' };
  }

  return { success: true };
}

export async function aktifkanKembaliJamaahAdmin(
  id_jamaah: number
): Promise<{ success: boolean; error?: string }> {
  // Ambil id_keberangkatan jamaah
  const { data: jamaah } = await supabase
    .from('jamaah')
    .select('id_keberangkatan')
    .eq('id_jamaah', id_jamaah)
    .maybeSingle();

  if (!jamaah) {
    return { success: false, error: 'Data jamaah tidak ditemukan' };
  }

  // JIKA sisa kuota keberangkatan <= 0 tampilkan "Kuota keberangkatan penuh" (SD Bab 4.2 M6.1)
  const [{ data: kebRow }, { count: activeCount }] = await Promise.all([
    supabase
      .from('keberangkatan')
      .select('kuota')
      .eq('id_keberangkatan', jamaah.id_keberangkatan)
      .maybeSingle(),
    supabase
      .from('jamaah')
      .select('id_jamaah', { count: 'exact', head: true })
      .eq('id_keberangkatan', jamaah.id_keberangkatan)
      .eq('status_jamaah', 'aktif'),
  ]);

  if (!kebRow || kebRow.kuota - (activeCount || 0) <= 0) {
    return {
      success: false,
      error: 'Kuota keberangkatan penuh',
    };
  }

  const { data, error } = await supabase
    .from('jamaah')
    .update({
      status_jamaah: 'aktif',
      alasan_batal: null,
      tgl_batal: null,
    })
    .eq('id_jamaah', id_jamaah)
    .select();

  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return { success: false, error: 'Gagal mengaktifkan kembali jamaah' };
  }

  return { success: true };
}

/**
 * M8.1 & M8.2 Catat Pembayaran & Pantau Status Pembayaran (UI-11 & UI-13)
 * Sesuai Pseudocode Bab 4.2 Hal. 10 & Flowchart Gambar 7.1 Hal. 16 SD v1.1:
 * - JIKA status_jamaah = "batal" -> tolak pencatatan pembayaran baru dengan pesan "Jamaah berstatus batal"
 * - JIKA jumlah <= 0 -> tampilkan pesan kesalahan
 * - sisa <- total_biaya - total pembayaran sebelumnya
 * - JIKA jumlah > sisa -> tampilkan "Jumlah melebihi sisa pembayaran"
 * - SELAIN ITU simpan ke tabel pembayaran bersama id_admin, lalu hitung ulang sisa dan status
 */
export interface PembayaranItem {
  id_pembayaran: number;
  id_jamaah: number;
  tgl_bayar: string;
  jumlah: number;
  metode: 'tunai' | 'transfer';
  no_bukti: string | null;
  catatan: string | null;
  id_admin: number | null;
  created_at?: string;
  admin?: {
    id_admin: number;
    nama_lengkap: string;
    username: string;
  } | null;
}

export async function getPembayaranByJamaahAdmin(
  id_jamaah: number
): Promise<PembayaranItem[]> {
  const { data } = await supabase
    .from('pembayaran')
    .select('*, admin(id_admin, nama_lengkap, username)')
    .eq('id_jamaah', id_jamaah)
    .order('tgl_bayar', { ascending: false })
    .order('id_pembayaran', { ascending: false });

  return (data as PembayaranItem[]) || [];
}

export interface CatatPembayaranInput {
  id_jamaah: number;
  tgl_bayar: string;
  jumlah: number;
  metode: 'tunai' | 'transfer';
  no_bukti?: string | null;
  catatan?: string | null;
  id_admin?: number | null;
  simulateOffline?: boolean;
}

export async function catatPembayaranAdmin(
  input: CatatPembayaranInput
): Promise<{
  success: boolean;
  data?: PembayaranItem;
  sisa_terbaru?: number;
  status_terbaru?: 'Lunas' | 'Belum lunas';
  error?: string;
}> {
  try {
    if (
      input.simulateOffline ||
      (typeof navigator !== 'undefined' && navigator.onLine === false)
    ) {
      return {
        success: false,
        error:
          'Gagal menyimpan data pembayaran: Koneksi jaringan ke basis data cloud terputus',
      };
    }

    const idJamaah = Number(input.id_jamaah || 0);
    const jumlah = Number(input.jumlah || 0);
    const tglBayar = (input.tgl_bayar || '').trim();
    const metode = input.metode;

    if (!idJamaah || !tglBayar || !metode) {
      return {
        success: false,
        error: 'Tanggal pembayaran, jumlah, dan metode pembayaran wajib diisi',
      };
    }

    if (jumlah <= 0) {
      return {
        success: false,
        error: 'Jumlah pembayaran harus lebih dari 0',
      };
    }

    // Ambil data jamaah & riwayat pembayaran sebelumnya
    const [{ data: jamaah, error: jmErr }, { data: prevPayments, error: payErr }] =
      await Promise.all([
        supabase
          .from('jamaah')
          .select('id_jamaah, status_jamaah, total_biaya')
          .eq('id_jamaah', idJamaah)
          .maybeSingle(),
        supabase
          .from('pembayaran')
          .select('jumlah')
          .eq('id_jamaah', idJamaah),
      ]);

    if (jmErr || payErr) {
      return {
        success: false,
        error:
          'Gagal terhubung ke basis data cloud: ' +
          (jmErr?.message || payErr?.message || 'Koneksi gagal'),
      };
    }

    if (!jamaah) {
      return { success: false, error: 'Data jamaah tidak ditemukan' };
    }

    if (jamaah.status_jamaah === 'batal') {
      return {
        success: false,
        error: 'Jamaah berstatus batal',
      };
    }

    const totalDibayarSebelumnya = (prevPayments || []).reduce(
      (acc, cur) => acc + Number(cur.jumlah || 0),
      0
    );
    const sisa = Math.max(
      0,
      Number(jamaah.total_biaya) - totalDibayarSebelumnya
    );

    if (jumlah > sisa) {
      return {
        success: false,
        error: 'Jumlah melebihi sisa pembayaran',
      };
    }

    const sessionAdmin = getAdminSession();
    const idAdmin = input.id_admin ?? sessionAdmin?.id_admin ?? 1;

    const payload = {
      id_jamaah: idJamaah,
      tgl_bayar: tglBayar,
      jumlah,
      metode,
      no_bukti: input.no_bukti?.trim() || null,
      catatan: input.catatan?.trim() || null,
      id_admin: idAdmin,
    };

    const { data, error } = await supabase
      .from('pembayaran')
      .insert([payload])
      .select('*, admin(id_admin, nama_lengkap, username)')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const sisaTerbaru = Math.max(0, sisa - jumlah);
    const statusTerbaru = sisaTerbaru === 0 ? 'Lunas' : 'Belum lunas';

    return {
      success: true,
      data: data as PembayaranItem,
      sisa_terbaru: sisaTerbaru,
      status_terbaru: statusTerbaru,
    };
  } catch (err: any) {
    return {
      success: false,
      error:
        'Gagal menyimpan data pembayaran: Koneksi jaringan ke basis data cloud terputus (' +
        (err?.message || 'Network Error') +
        ')',
    };
  }
}

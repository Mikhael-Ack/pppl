import { supabase } from '@/lib/supabase';
import { PengajuanInput, PengajuanItem } from '@/types/pengajuan.types';
import { FALLBACK_PACKAGES } from './packages.service';

export async function submitPengajuan(
  input: PengajuanInput
): Promise<{ success: boolean; data?: PengajuanItem; error?: string }> {
  try {
    let kodePengajuan = input.kode_pengajuan;
    if (!kodePengajuan) {
      const { data: latest } = await supabase
        .from('pengajuan')
        .select('id_pengajuan')
        .order('id_pengajuan', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextNum = ((latest?.id_pengajuan as number) || 0) + 1;
      kodePengajuan = `DRN-REG-${String(nextNum).padStart(4, '0')}`;
    }

    const basePayload = {
      nama_lengkap: input.nama_lengkap.trim(),
      jenis_kelamin: input.jenis_kelamin,
      no_hp: input.no_hp.trim(),
      alamat: input.alamat.trim(),
      id_paket: input.id_paket || null,
      pesan: input.pesan?.trim() || null,
      email: input.email?.trim() || null,
      status_pengajuan: 'baru',
    };

    let { data, error } = await supabase
      .from('pengajuan')
      .insert([{ ...basePayload, kode_pengajuan: kodePengajuan }])
      .select('*, paket(*)')
      .single();

    // Jika kode_pengajuan berbenturan (unique constraint), gunakan 4 digit acak
    if (error && error.code === '23505') {
      const rand4 = Math.floor(1000 + Math.random() * 9000);
      kodePengajuan = `DRN-REG-${rand4}`;
      const retry = await supabase
        .from('pengajuan')
        .insert([{ ...basePayload, kode_pengajuan: kodePengajuan }])
        .select('*, paket(*)')
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('[PengajuanService] Insert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as PengajuanItem };
  } catch (err: any) {
    console.error('[PengajuanService] Exception:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan jaringan' };
  }
}

export async function trackPengajuan(query: string): Promise<PengajuanItem | null> {
  const cleaned = query.trim();
  if (!cleaned) return null;

  try {
    const upper = cleaned.toUpperCase();
    const digitsOnly = cleaned.replace(/[^0-9+]/g, '');

    // Cari berdasarkan kode_pengajuan (case-insensitive) atau no_hp
    let queryBuilder = supabase
      .from('pengajuan')
      .select('*, paket(*)')
      .order('tgl_pengajuan', { ascending: false })
      .limit(1);

    if (upper.startsWith('DRN-') || upper.includes('REG')) {
      queryBuilder = queryBuilder.ilike('kode_pengajuan', upper);
    } else if (digitsOnly.length >= 8) {
      queryBuilder = queryBuilder.or(`no_hp.eq.${cleaned},no_hp.eq.${digitsOnly},kode_pengajuan.ilike.${upper}`);
    } else {
      queryBuilder = queryBuilder.or(`kode_pengajuan.ilike.${upper},no_hp.eq.${cleaned}`);
    }

    const { data, error } = await queryBuilder.maybeSingle();

    if (error) {
      console.warn('[PengajuanService] Track query error:', error.message);
    }

    if (data) {
      return data as PengajuanItem;
    }

    // Fallback data contoh demo sesuai Gambar 6.1 SD (UI-14 Pelacakan Pengajuan)
    if (upper === 'DRN-REG-0001') {
      return {
        id_pengajuan: 1,
        kode_pengajuan: 'DRN-REG-0001',
        nama_lengkap: 'Ahmad Subagio',
        jenis_kelamin: 'L',
        no_hp: '081234567890',
        alamat: 'Jakarta Timur',
        id_paket: 1,
        tgl_pengajuan: '2026-11-07T09:00:00Z',
        status_pengajuan: 'diproses',
        alasan_tolak: null,
        paket: FALLBACK_PACKAGES[0],
      };
    }

    if (upper === 'DRN-REG-0004') {
      return {
        id_pengajuan: 4,
        kode_pengajuan: 'DRN-REG-0004',
        nama_lengkap: 'Andi Pratama',
        jenis_kelamin: 'L',
        no_hp: '085611223344',
        alamat: 'Bekasi',
        id_paket: 1,
        tgl_pengajuan: '2026-11-08T14:20:00Z',
        status_pengajuan: 'ditolak',
        alasan_tolak: 'Kuota keberangkatan Maret 2027 sudah penuh.',
        paket: FALLBACK_PACKAGES[0],
      };
    }

    return null;
  } catch (err) {
    console.error('[PengajuanService] Track exception:', err);
    return null;
  }
}

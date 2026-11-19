import { supabase } from '@/lib/supabase';
import { PengajuanInput, PengajuanItem } from '@/types/pengajuan.types';
import { FALLBACK_PACKAGES } from './packages.service';

/**
 * M3.1 Kirim Pengajuan Pendaftaran (UI-03)
 * Sesuai Pseudocode Bab 4.2 SD v1.1:
 * - JIKA salah satu kolom wajib (nama_lengkap, jenis_kelamin, alamat, no_hp, id_paket) kosong
 *   ATAU format no_hp tidak valid -> tampilkan pesan kesalahan
 * - SELAIN ITU buat kode_pengajuan unik secara otomatis (format DRN-REG-xxxx),
 *   simpan pengajuan dengan status_pengajuan <- "baru" dan tgl_pengajuan <- waktu sekarang
 */
export async function submitPengajuan(
  input: PengajuanInput
): Promise<{ success: boolean; data?: PengajuanItem; error?: string }> {
  try {
    const nama = (input.nama_lengkap || '').trim();
    const jk = input.jenis_kelamin;
    const alamat = (input.alamat || '').trim();
    const rawHp = (input.no_hp || '').trim().replace(/\s|-/g, '');
    const idPaket = input.id_paket ? Number(input.id_paket) : 0;

    if (!nama || !jk || !alamat || !rawHp || !idPaket) {
      return {
        success: false,
        error: 'Nama lengkap, jenis kelamin, alamat, nomor WhatsApp, dan pilihan paket wajib diisi',
      };
    }

    if (!/^(\+62|62|0)8[0-9]{7,13}$/.test(rawHp)) {
      return {
        success: false,
        error: 'Format nomor WhatsApp tidak valid (gunakan awalan 08 atau 628, 10–15 digit angka)',
      };
    }

    let kodePengajuan = input.kode_pengajuan?.trim().toUpperCase();
    if (!kodePengajuan) {
      const { data: existingRows } = await supabase
        .from('pengajuan')
        .select('id_pengajuan, kode_pengajuan')
        .order('id_pengajuan', { ascending: false })
        .limit(50);

      let maxNum = 0;
      if (existingRows && existingRows.length > 0) {
        for (const row of existingRows) {
          if (row.id_pengajuan > maxNum) {
            maxNum = row.id_pengajuan;
          }
          const match = /^DRN-REG-(\d{1,6})$/i.exec(row.kode_pengajuan || '');
          if (match) {
            const num = parseInt(match[1], 10);
            if (num < 9000 && num > maxNum) {
              maxNum = num;
            }
          }
        }
      }
      const nextNum = maxNum + 1;
      kodePengajuan = `DRN-REG-${String(nextNum).padStart(4, '0')}`;
    }

    const basePayload = {
      nama_lengkap: nama,
      jenis_kelamin: jk,
      no_hp: rawHp,
      alamat,
      id_paket: idPaket,
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
      const rand4 = Math.floor(1000 + Math.random() * 8999);
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

    const item = data as PengajuanItem;
    if (!item.paket && item.id_paket) {
      item.paket =
        FALLBACK_PACKAGES.find((p) => p.id_paket === item.id_paket) ||
        FALLBACK_PACKAGES[0];
    }

    return { success: true, data: item };
  } catch (err: any) {
    console.error('[PengajuanService] Exception:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan jaringan' };
  }
}

/**
 * M3.3 Lacak Pengajuan (UI-14)
 * Sesuai Pseudocode Bab 4.2 SD v1.1:
 * - Cari berdasarkan kode_pengajuan atau no_hp
 * - Jika tidak ada -> return null ("Data tidak ditemukan")
 */
export async function trackPengajuan(query: string): Promise<PengajuanItem | null> {
  const cleaned = (query || '').trim();
  if (!cleaned) return null;

  try {
    const upper = cleaned.toUpperCase();
    const digitsOnly = cleaned.replace(/[^0-9]/g, '');

    let filterBuilder = supabase.from('pengajuan').select('*, paket(*)');

    if (upper.startsWith('DRN-') || upper.includes('REG')) {
      filterBuilder = filterBuilder.ilike('kode_pengajuan', upper);
    } else if (digitsOnly.length >= 8) {
      // Normalisasi varian nomor HP Indonesia: 08... vs 628... vs +628...
      const local08 = digitsOnly.startsWith('62')
        ? '0' + digitsOnly.slice(2)
        : digitsOnly;
      const intl62 = digitsOnly.startsWith('0')
        ? '62' + digitsOnly.slice(1)
        : digitsOnly;

      filterBuilder = filterBuilder.or(
        `no_hp.eq.${cleaned},no_hp.eq.${digitsOnly},no_hp.eq.${local08},no_hp.eq.${intl62},no_hp.eq.+${intl62},kode_pengajuan.ilike.${upper}`
      );
    } else {
      filterBuilder = filterBuilder.or(
        `kode_pengajuan.ilike.${upper},no_hp.eq.${cleaned}`
      );
    }

    const { data, error } = await filterBuilder
      .order('tgl_pengajuan', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[PengajuanService] Track query error:', error.message);
    }

    if (data) {
      const item = data as PengajuanItem;
      if (!item.paket) {
        item.paket =
          FALLBACK_PACKAGES.find((p) => p.id_paket === item.id_paket) ||
          FALLBACK_PACKAGES[0];
      }
      return item;
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

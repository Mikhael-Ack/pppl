import { supabase } from '@/lib/supabase';
import { PengajuanInput, PengajuanItem } from '@/types/pengajuan.types';

export async function submitPengajuan(
  input: PengajuanInput
): Promise<{ success: boolean; data?: PengajuanItem; error?: string }> {
  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const kodePengajuan = input.kode_pengajuan || `DRN-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const payload = {
      kode_pengajuan: kodePengajuan,
      nama_lengkap: input.nama_lengkap.trim(),
      jenis_kelamin: input.jenis_kelamin,
      no_hp: input.no_hp.trim(),
      alamat: input.alamat.trim(),
      id_paket: input.id_paket || null,
      pesan: input.pesan?.trim() || null,
      email: input.email?.trim() || null,
      status_pengajuan: 'baru',
    };

    const { data, error } = await supabase
      .from('pengajuan')
      .insert([payload])
      .select()
      .single();

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

export interface PengajuanInput {
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  no_hp: string;
  alamat: string;
  id_paket?: number;
  pesan?: string;
  email?: string;
}

export interface PengajuanItem extends PengajuanInput {
  id_pengajuan: number;
  nik?: string | null;
  nama_ayah?: string | null;
  tempat_lahir?: string | null;
  tanggal_lahir?: string | null;
  pekerjaan?: string | null;
  pendidikan?: string | null;
  tgl_pengajuan: string;
  status_pengajuan: 'baru' | 'dihubungi' | 'diproses' | 'ditolak';
}

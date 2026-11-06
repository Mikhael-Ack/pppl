export interface KeberangkatanItem {
  id_keberangkatan: number;
  id_paket: number;
  tahun: number;
  bulan: number | null;
  tgl_berangkat: string | null;
  kuota: number;
  status: 'buka' | 'tutup';
}

export interface PaketItem {
  id_paket: number;
  kode_paket: string;
  nama_paket: string;
  program: 'umrah' | 'haji_reguler' | 'haji_khusus';
  harga: number;
  maskapai: string;
  hotel: string;
  durasi_hari: number;
  deskripsi: string | null;
  status_aktif: boolean;
  keberangkatan?: KeberangkatanItem[];

  // Compatibility fields for legacy booking tracking
  id?: string | number;
  name?: string;
  slug?: string;
  category?: string;
  duration_days?: number;
  departure_date?: string;
  airline?: string;
  departure_city?: string;
  hotel_makkah?: string;
  hotel_makkah_rating?: number;
  hotel_madinah?: string;
  hotel_madinah_rating?: number;
  price_quad?: number;
  price_triple?: number;
  price_double?: number;
  quota_seat?: number;
  remaining_seat?: number;
  is_active?: boolean;
}

export type PackageItem = PaketItem;
export type RoomType = 'quad' | 'triple' | 'double';

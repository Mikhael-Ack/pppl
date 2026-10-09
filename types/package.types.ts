export interface PackageItem {
  id: string;
  name: string;
  slug: string;
  category: 'reguler_vip' | 'ekonomis' | 'plus_wisata' | 'haji_khusus';
  duration_days: number;
  departure_date: string;
  airline: string;
  departure_city: string;
  hotel_makkah: string;
  hotel_makkah_rating: number;
  hotel_madinah: string;
  hotel_madinah_rating: number;
  price_quad: number;
  price_triple: number;
  price_double: number;
  quota_seat: number;
  remaining_seat: number;
  is_active: boolean;
  created_at?: string;
}

export type RoomType = 'quad' | 'triple' | 'double';

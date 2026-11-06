import { supabase } from '@/lib/supabase';
import { PaketItem } from '@/types/package.types';

export const FALLBACK_PACKAGES: PaketItem[] = [
  {
    id_paket: 1,
    kode_paket: 'UMR-REG-9D',
    nama_paket: 'Umrah Reguler Barokah 9 Hari',
    program: 'umrah',
    harga: 28500000,
    maskapai: 'Garuda Indonesia (Direct)',
    hotel: 'Makkah: Pullman Zamzam (Bintang 5) | Madinah: Al Aqeeq (Bintang 5)',
    durasi_hari: 9,
    deskripsi: 'Hotel ring 1 pelataran masjid, bimbingan muthawif bersertifikasi Kemenag RI.',
    status_aktif: true,
    keberangkatan: [
      {
        id_keberangkatan: 1,
        id_paket: 1,
        tahun: 2027,
        bulan: 3,
        tgl_berangkat: '2027-03-15',
        kuota: 45,
        status: 'buka',
      },
    ],
  },
  {
    id_paket: 2,
    kode_paket: 'UMR-PLS-12D',
    nama_paket: 'Umrah Plus Turki & Cappadocia 12 Hari',
    program: 'umrah',
    harga: 39500000,
    maskapai: 'Turkish Airlines',
    hotel: 'Makkah: Safwah Royal Orchid | Madinah: Dallah Taibah',
    durasi_hari: 12,
    deskripsi: 'Ziarah sejarah Islam di Istanbul dan wisata alam Cappadocia.',
    status_aktif: true,
    keberangkatan: [
      {
        id_keberangkatan: 2,
        id_paket: 2,
        tahun: 2027,
        bulan: 4,
        tgl_berangkat: '2027-04-10',
        kuota: 35,
        status: 'buka',
      },
    ],
  },
  {
    id_paket: 3,
    kode_paket: 'HAJ-KHS-25D',
    nama_paket: 'Haji Khusus (Plus) Kuota Resmi Kemenag',
    program: 'haji_khusus',
    harga: 195000000,
    maskapai: 'Saudia Airlines',
    hotel: 'Makkah: Fairmont Clock Tower | Madinah: Oberoi',
    durasi_hari: 25,
    deskripsi: 'Haji kuota resmi tanpa antre bertahun-tahun, maktab VIP Mina ber-AC.',
    status_aktif: true,
    keberangkatan: [
      {
        id_keberangkatan: 3,
        id_paket: 3,
        tahun: 2027,
        bulan: 6,
        tgl_berangkat: '2027-06-01',
        kuota: 20,
        status: 'buka',
      },
    ],
  },
];

export async function getActivePackages(): Promise<PaketItem[]> {
  try {
    const { data, error } = await supabase
      .from('paket')
      .select('*, keberangkatan(*)')
      .eq('status_aktif', true)
      .order('id_paket', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('[PackagesService] Falling back to default packages:', error?.message);
      return FALLBACK_PACKAGES;
    }

    return data as PaketItem[];
  } catch (error) {
    console.error('[PackagesService] Unexpected connection error:', error);
    return FALLBACK_PACKAGES;
  }
}

export async function getPackageById(id: number): Promise<PaketItem | null> {
  try {
    const { data, error } = await supabase
      .from('paket')
      .select('*, keberangkatan(*)')
      .eq('id_paket', id)
      .single();

    if (error || !data) {
      return FALLBACK_PACKAGES.find((p) => p.id_paket === id) || null;
    }

    return data as PaketItem;
  } catch {
    return FALLBACK_PACKAGES.find((p) => p.id_paket === id) || null;
  }
}

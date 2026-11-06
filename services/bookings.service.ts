import { supabase } from '@/lib/supabase';
import { BookingItem } from '@/types/booking.types';

export async function getBookingByCode(bookingCode: string): Promise<BookingItem | null> {
  const code = bookingCode.trim().toUpperCase();

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, packages(*)')
      .ilike('booking_code', code)
      .maybeSingle();

    if (error) {
      console.error('[BookingsService] Error fetching booking:', error);
      throw error;
    }

    if (!data) {
      // Mock fallback data jika memasukkan demo code
      if (code === 'UMR-2026-08892') {
        return {
          id: 'demo-1',
          booking_code: 'UMR-2026-08892',
          full_name: 'H. Muhammad Ridwan & Hj. Siti Nurhaliza',
          phone_number: '081298765432',
          room_type: 'double',
          total_persons: 2,
          current_step: 4,
          payment_status: 'dp_paid',
          shipping_receipt_no: 'JNE-REG-0918231201',
          manasik_date: '2026-10-11',
          packages: {
            id_paket: 1,
            kode_paket: 'UMR-REG-9D',
            nama_paket: 'Umrah VIP Ring 1 Pelataran 9 Hari',
            program: 'umrah',
            harga: 33500000,
            maskapai: 'Garuda Indonesia',
            hotel: 'Makkah: Pullman Zamzam Tower | Madinah: Al Aqeeq',
            durasi_hari: 9,
            deskripsi: 'Hotel ring 1 pelataran',
            status_aktif: true,
            id: 'p1',
            name: 'Umrah VIP Ring 1 Pelataran 9 Hari',
            price_quad: 33500000,
            price_triple: 36500000,
            price_double: 39500000,
            quota_seat: 45,
            remaining_seat: 4,
          },
        };
      }
      return null;
    }

    return data as BookingItem;
  } catch (error) {
    console.error('[BookingsService] Unexpected error:', error);
    throw error;
  }
}

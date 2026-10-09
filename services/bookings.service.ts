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
            id: 'p1',
            name: 'Umroh VIP Ring 1 Pelataran 9 Hari',
            slug: 'umroh-vip-ring-1',
            category: 'reguler_vip',
            duration_days: 9,
            departure_date: '2026-10-18',
            airline: 'Garuda Indonesia',
            departure_city: 'Jakarta (CGK)',
            hotel_makkah: 'Pullman Zamzam Tower',
            hotel_makkah_rating: 5,
            hotel_madinah: 'Al Aqeeq Madinah',
            hotel_madinah_rating: 5,
            price_quad: 33500000,
            price_triple: 36500000,
            price_double: 39500000,
            quota_seat: 45,
            remaining_seat: 4,
            is_active: true,
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

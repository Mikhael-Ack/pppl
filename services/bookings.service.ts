import { supabase } from '@/lib/supabase';
import { BookingItem } from '@/types/booking.types';

export async function getBookingByCode(bookingCode: string): Promise<BookingItem | null> {
  const code = bookingCode.trim().toUpperCase();

  try {
    // 1. Cek di tabel pengajuan (pelacakan pendaftaran awal UI-14)
    const { data: pengajuanData } = await supabase
      .from('pengajuan')
      .select('*, paket(*)')
      .or(`kode_pengajuan.ilike.${code},no_hp.eq.${code}`)
      .limit(1)
      .maybeSingle();

    if (pengajuanData) {
      const stepMap: Record<string, number> = {
        baru: 1,
        dihubungi: 1,
        diproses: 2,
        ditolak: 1,
      };
      return {
        id: `pengajuan-${pengajuanData.id_pengajuan}`,
        booking_code: pengajuanData.kode_pengajuan || `DRN-REG-00${pengajuanData.id_pengajuan}`,
        full_name: pengajuanData.nama_lengkap,
        phone_number: pengajuanData.no_hp,
        room_type: 'quad',
        total_persons: 1,
        current_step: stepMap[pengajuanData.status_pengajuan] || 1,
        payment_status: pengajuanData.status_pengajuan === 'diproses' ? 'dp_paid' : 'dp_unpaid',
        packages: {
          id_paket: pengajuanData.paket?.id_paket || 1,
          kode_paket: pengajuanData.paket?.kode_paket || 'UMR-REG-9D',
          nama_paket: pengajuanData.paket?.nama_paket || 'Umrah Darunnisa',
          program: 'umrah',
          harga: pengajuanData.paket?.harga || 28500000,
          maskapai: pengajuanData.paket?.maskapai || 'Garuda Indonesia',
          hotel: pengajuanData.paket?.hotel || 'Makkah: Pullman Zamzam',
          durasi_hari: pengajuanData.paket?.durasi_hari || 9,
          deskripsi: pengajuanData.paket?.deskripsi || 'Paket resmi Yayasan Darunnisa',
          status_aktif: true,
          name: pengajuanData.paket?.nama_paket || 'Umrah Darunnisa',
          price_quad: pengajuanData.paket?.harga || 28500000,
          price_triple: (pengajuanData.paket?.harga || 28500000) + 2000000,
          price_double: (pengajuanData.paket?.harga || 28500000) + 4000000,
          quota_seat: 45,
          remaining_seat: 10,
        },
      };
    }

    // 2. Cek di tabel jamaah (jemaah resmi dengan no_jamaah misal JM20260001)
    const { data: jamaahData } = await supabase
      .from('jamaah')
      .select('*, keberangkatan(*, paket(*))')
      .or(`no_jamaah.ilike.${code},no_hp.eq.${code}`)
      .limit(1)
      .maybeSingle();

    if (jamaahData) {
      let currentStep = 2;
      if (jamaahData.status_paspor === 'rekom_kemenag' || jamaahData.status_paspor === 'selesai') currentStep = 3;
      if (jamaahData.status_visa === 'visa_terbit') currentStep = 4;
      if (jamaahData.status_manasik === 'sudah_manasik') currentStep = 5;

      const pkt = jamaahData.keberangkatan?.paket;
      return {
        id: `jamaah-${jamaahData.id_jamaah}`,
        booking_code: jamaahData.no_jamaah,
        full_name: jamaahData.nama_lengkap,
        phone_number: jamaahData.no_hp,
        room_type: 'quad',
        total_persons: 1,
        current_step: currentStep,
        payment_status: jamaahData.status_jamaah === 'aktif' ? 'dp_paid' : 'dp_unpaid',
        packages: {
          id_paket: pkt?.id_paket || 1,
          kode_paket: pkt?.kode_paket || 'UMR-REG-9D',
          nama_paket: pkt?.nama_paket || 'Umrah Darunnisa',
          program: 'umrah',
          harga: pkt?.harga || Number(jamaahData.total_biaya) || 28500000,
          maskapai: pkt?.maskapai || 'Garuda Indonesia',
          hotel: pkt?.hotel || 'Makkah: Pullman Zamzam',
          durasi_hari: pkt?.durasi_hari || 9,
          deskripsi: pkt?.deskripsi || 'Paket resmi Yayasan Darunnisa',
          status_aktif: true,
          name: pkt?.nama_paket || 'Umrah Darunnisa',
          price_quad: pkt?.harga || 28500000,
          price_triple: (pkt?.harga || 28500000) + 2000000,
          price_double: (pkt?.harga || 28500000) + 4000000,
          quota_seat: 45,
          remaining_seat: 10,
        },
      };
    }

    // Mock fallback data jika memasukkan demo code
    if (code === 'UMR-2026-08892' || code === 'DRN-DEMO') {
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
  } catch (error) {
    console.error('[BookingsService] Unexpected error:', error);
    throw error;
  }
}

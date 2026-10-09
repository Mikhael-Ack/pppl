'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBookingByCode } from '@/services/bookings.service';
import { BookingItem } from '@/types/booking.types';
import { Search, CheckCircle2, Clock, PackageCheck, AlertCircle, Calendar, Phone } from 'lucide-react';

const TRACKING_STEPS = [
  { step: 1, title: 'Booking & Pembayaran DP', desc: 'Validasi uang muka kuota seat' },
  { step: 2, title: 'Verifikasi Dokumen', desc: 'Pengecekan paspor & buku vaksin' },
  { step: 3, title: 'Penerbitan Visa Umroh', desc: 'Proses sinkronisasi sistem Nusuk KSA' },
  { step: 4, title: 'Perlengkapan Koper', desc: 'Pengiriman/pengambilan koper & seragam' },
  { step: 5, title: 'Manasik Umroh', desc: 'Bimbingan tata cara ibadah sesuai sunnah' },
  { step: 6, title: 'Keberangkatan', desc: 'Pemberangkatan rombongan di bandara' },
];

export default function TrackingPageClient() {
  const [bookingCode, setBookingCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [bookingData, setBookingData] = useState<BookingItem | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setBookingData(null);

    try {
      const result = await getBookingByCode(bookingCode);
      if (!result) {
        setErrorMsg('Nomor registrasi tidak ditemukan. Pastikan format nomor benar (contoh: UMR-2026-08892).');
      } else {
        setBookingData(result);
      }
    } catch {
      setErrorMsg('Gagal memuat status. Silakan periksa koneksi internet Anda atau hubungi customer care.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 px-4 max-w-5xl mx-auto w-full space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full uppercase tracking-wider">
            <PackageCheck className="w-3.5 h-3.5" />
            Layanan Pelacakan Mandiri Jemaah
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cek Status &amp; Progres Keberangkatan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Masukkan Nomor Registrasi / Kode Booking yang Anda terima saat pendaftaran untuk memantau status visa, kelengkapan koper, dan jadwal manasik secara transparan.
          </p>
        </div>

        {/* Search Bar Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                placeholder="Masukkan Nomor Booking (contoh: UMR-2026-08892)"
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl pl-10 pr-4 py-3 bg-white focus:outline-emerald-600 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm transition-all shadow-xs disabled:opacity-60"
            >
              {loading ? 'Mencari...' : 'Lacak Status'}
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
            <span>
              Contoh nomor demo:{' '}
              <button
                type="button"
                onClick={() => setBookingCode('UMR-2026-08892')}
                className="text-emerald-700 font-bold hover:underline"
              >
                UMR-2026-08892
              </button>
            </span>
            <span>Update data real-time</span>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 flex items-center gap-3 text-xs max-w-2xl mx-auto">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Hasil Tracking */}
        {bookingData && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8 animate-fadeIn">
            {/* Info Kartu Ringkasan */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Nama Jemaah Terdaftar:</span>
                <strong className="text-slate-900 text-sm font-semibold">{bookingData.full_name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Nomor Registrasi:</span>
                <strong className="text-emerald-800 font-mono text-sm">{bookingData.booking_code}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Paket yang Dipilih:</span>
                <strong className="text-slate-800 font-semibold">
                  {bookingData.packages?.name || 'Paket Umroh Reguler'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Status Pembayaran:</span>
                <span className="inline-block mt-0.5 bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded text-[11px]">
                  {bookingData.payment_status === 'dp_paid' ? 'DP Terverifikasi' : 'Lunas Penuh'}
                </span>
              </div>
            </div>

            {/* Stepper Progres 6 Tahap */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Tahapan Kesiapan Keberangkatan Jemaah
                </h3>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                  Tahap {bookingData.current_step} dari 6 Selesai
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {TRACKING_STEPS.map((st) => {
                  const isDone = st.step < bookingData.current_step;
                  const isCurrent = st.step === bookingData.current_step;

                  let borderClass = 'border-slate-200 bg-slate-50/50 text-slate-400';
                  let badge = <Clock className="w-3.5 h-3.5 text-slate-400" />;

                  if (isDone) {
                    borderClass = 'border-emerald-500 bg-emerald-50/60 text-slate-800';
                    badge = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                  } else if (isCurrent) {
                    borderClass = 'border-amber-400 bg-amber-50 text-slate-900 shadow-xs ring-2 ring-amber-300/40';
                    badge = (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                        {st.step}
                      </span>
                    );
                  }

                  return (
                    <div
                      key={st.step}
                      className={`rounded-2xl p-3.5 border transition-all flex flex-col justify-between space-y-2 ${borderClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold">Langkah {st.step}</span>
                        {badge}
                      </div>
                      <div>
                        <div className="font-bold text-xs leading-snug">{st.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1 leading-normal">{st.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catatan Tambahan */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Catatan Penting untuk Anda:
              </div>
              {bookingData.shipping_receipt_no && (
                <div>
                  • Perlengkapan koper Anda telah dikirim via ekspedisi dengan nomor resi:{' '}
                  <strong className="font-mono text-emerald-950 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {bookingData.shipping_receipt_no}
                  </strong>
                  .
                </div>
              )}
              {bookingData.manasik_date && (
                <div className="flex items-center gap-1.5 pt-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    Jadwal Bimbingan Manasik:{' '}
                    <strong>
                      {new Date(bookingData.manasik_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </strong>{' '}
                    di Hotel Asrama Haji.
                  </span>
                </div>
              )}
            </div>

            {/* Call Center Bantuan */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs">
              <span className="text-slate-500 text-center sm:text-left">
                Ada pertanyaan mengenai dokumen atau jadwal keberangkatan Anda?
              </span>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_TRAVEL_WA || '6281234567890'}?text=${encodeURIComponent(
                  `Halo Admin, saya ingin menanyakan status pendaftaran dengan nomor booking ${bookingData.booking_code}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                Hubungi Petugas Pendamping
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

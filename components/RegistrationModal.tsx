'use client';

import { useState } from 'react';
import { X, Send, CheckCircle, AlertCircle, Phone, User, MapPin, Mail, MessageSquare } from 'lucide-react';
import { PaketItem } from '@/types/package.types';
import { submitPengajuan } from '@/services/pengajuan.service';
import { formatRupiah } from '@/utils/formatters';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: PaketItem[];
  selectedPackage?: PaketItem | null;
}

export default function RegistrationModal({
  isOpen,
  onClose,
  packages,
  selectedPackage,
}: RegistrationModalProps) {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');
  const [paketId, setPaketId] = useState<number>(selectedPackage?.id_paket || (packages[0]?.id_paket ?? 1));
  const [pesan, setPesan] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id_pengajuan: number } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!namaLengkap.trim()) {
      setErrorMsg('Nama lengkap wajib diisi');
      return;
    }
    if (!noHp.trim() || noHp.trim().length < 9) {
      setErrorMsg('Nomor WhatsApp wajib diisi dengan benar');
      return;
    }
    if (!alamat.trim()) {
      setErrorMsg('Alamat / Kota domisili wajib diisi');
      return;
    }

    setLoading(true);
    const res = await submitPengajuan({
      nama_lengkap: namaLengkap,
      jenis_kelamin: jenisKelamin,
      no_hp: noHp,
      email: email || undefined,
      alamat: alamat,
      id_paket: Number(paketId),
      pesan: pesan || undefined,
    });
    setLoading(false);

    if (res.success && res.data) {
      setSuccessData({ id_pengajuan: res.data.id_pengajuan });
    } else {
      setErrorMsg(res.error || 'Gagal mengirim pengajuan, silakan coba lagi.');
    }
  };

  const handleReset = () => {
    setNamaLengkap('');
    setNoHp('');
    setEmail('');
    setAlamat('');
    setPesan('');
    setSuccessData(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-[#08221b] text-white p-5 border-b border-[#0d3329] flex items-start justify-between gap-4 z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 bg-[#0e3b2f] border border-[#1b5544] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <span>Formulir Daring (UI-03)</span>
              <span>&bull;</span>
              <span>Yayasan Darunnisa</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">
              Pengajuan Pendaftaran Awal
            </h3>
            <p className="text-[11px] text-emerald-200/80 mt-0.5">
              Isi data kontak awal untuk konsultasi &amp; booking kuota paket.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successData ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900">Pengajuan Berhasil Terkirim!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Terima kasih, data minat pendaftaran Anda telah tersimpan di sistem Yayasan Darunnisa dengan nomor pengajuan:
              </p>
              <div className="inline-block bg-slate-100 border border-slate-300 px-4 py-2 rounded-xl font-mono text-base font-bold text-emerald-900 tracking-wider my-2">
                DRN-REG-00{successData.id_pengajuan}
              </div>
              <p className="text-[11px] text-slate-500">
                Staf operasional Darunnisa akan menghubungi nomor WhatsApp Anda dalam 1x24 jam untuk verifikasi ketersediaan kamar dan jadwal manasik.
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="w-full bg-[#08221b] hover:bg-[#0c352a] text-amber-300 font-semibold text-xs py-3 rounded-xl transition-colors cursor-pointer"
              >
                Selesai &amp; Kembali ke Halaman Utama
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-[11px]">{errorMsg}</span>
              </div>
            )}

            {/* Nama Lengkap */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: H. Ahmad Fauzi"
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-emerald-800 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Grid 2 Kolom: Jenis Kelamin & No HP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenisKelamin('L')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      jenisKelamin === 'L'
                        ? 'border-emerald-800 bg-emerald-50 text-emerald-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Laki-laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setJenisKelamin('P')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      jenisKelamin === 'P'
                        ? 'border-emerald-800 bg-emerald-50 text-emerald-900 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Perempuan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nomor Telepon / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="081234567890"
                    className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-emerald-800 bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Pilihan Paket */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Paket yang Diminati <span className="text-rose-500">*</span>
              </label>
              <select
                value={paketId}
                onChange={(e) => setPaketId(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-emerald-800 bg-slate-50 focus:bg-white transition-colors"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id_paket} value={pkg.id_paket}>
                    {pkg.nama_paket} ({formatRupiah(pkg.harga)})
                  </option>
                ))}
              </select>
            </div>

            {/* Alamat / Kota Domisili */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Alamat / Kota Domisili <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Misal: Jl. Tebet Barat No. 12, Jakarta Selatan"
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-emerald-800 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Email (Opsional) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Alamat Email <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-emerald-800 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Pesan Tambahan */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Pesan / Kebutuhan Khusus <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Misal: rencana berangkat bersama istri & orang tua lansia, butuh kursi roda."
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-emerald-800 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
              <strong>Catatan Privasi:</strong> Sesuai SOP Yayasan Darunnisa, dokumen sensitif (KTP, paspor, dan buku nikah) tidak diunggah ke sistem digital ini dan akan diserahkan langsung saat verifikasi berkas di kantor.
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-200 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                {loading ? (
                  <span>Mengirim Data...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Pengajuan Minat</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

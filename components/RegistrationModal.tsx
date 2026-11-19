'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Send, CheckCircle, AlertCircle, Phone, User, MapPin, Mail, MessageSquare, Search } from 'lucide-react';
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
  const [successData, setSuccessData] = useState<{ id_pengajuan: number; kode_pengajuan: string } | null>(null);

  useEffect(() => {
    if (selectedPackage?.id_paket) {
      setPaketId(selectedPackage.id_paket);
    }
  }, [selectedPackage]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!namaLengkap.trim()) {
      setErrorMsg('Nama lengkap wajib diisi');
      return;
    }
    const cleanPhone = noHp.trim().replace(/\s|-/g, '');
    if (!cleanPhone || !/^(\+62|62|0)8[0-9]{7,13}$/.test(cleanPhone)) {
      setErrorMsg('Format nomor WhatsApp tidak valid (gunakan awalan 08 atau 628, min. 10 digit)');
      return;
    }
    if (!alamat.trim()) {
      setErrorMsg('Alamat / Kota domisili wajib diisi');
      return;
    }
    if (!paketId) {
      setErrorMsg('Paket yang diminati wajib dipilih');
      return;
    }

    setLoading(true);
    const res = await submitPengajuan({
      nama_lengkap: namaLengkap,
      jenis_kelamin: jenisKelamin,
      no_hp: cleanPhone,
      email: email || undefined,
      alamat: alamat,
      id_paket: Number(paketId),
      pesan: pesan || undefined,
    });
    setLoading(false);

    if (res.success && res.data) {
      const padded = String(res.data.id_pengajuan).padStart(4, '0');
      setSuccessData({
        id_pengajuan: res.data.id_pengajuan,
        kode_pengajuan: res.data.kode_pengajuan || `DRN-REG-${padded}`,
      });
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
        <div className="sticky top-0 bg-[#0b2242] text-white p-5 border-b border-[#163d73] flex items-start justify-between gap-4 z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 bg-[#133666] border border-[#21579e] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <span>Formulir Daring (UI-03)</span>
              <span>&bull;</span>
              <span>Yayasan Darunnisa</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white">
              Ajukan Minat Pendaftaran
            </h3>
            <p className="text-[11px] text-blue-200/80 mt-0.5">
              Isi data kontak awal, staf Yayasan Darunnisa akan menghubungi Anda melalui WhatsApp.
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
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-800 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-900">Pengajuan diterima</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Terima kasih. Staf Yayasan Darunnisa akan menghubungi Anda melalui WhatsApp.
              </p>
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 max-w-sm mx-auto my-3 space-y-1">
                <span className="text-[11px] text-slate-500 block">Kode pengajuan Anda</span>
                <div className="font-mono text-xl font-extrabold text-blue-950 tracking-wider">
                  {successData.kode_pengajuan}
                </div>
                <span className="text-[11px] text-slate-500 block pt-0.5">
                  Simpan kode ini untuk melacak status pengajuan Anda.
                </span>
              </div>
            </div>
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href={`/tracking?kode=${encodeURIComponent(successData.kode_pengajuan)}`}
                onClick={handleReset}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs py-3 px-4 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Lacak Pengajuan</span>
              </Link>
              <button
                onClick={handleReset}
                className="w-full bg-[#0b2242] hover:bg-[#133666] text-white font-semibold text-xs py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Kembali ke Beranda
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
                Nama lengkap <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Nama lengkap sesuai KTP"
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-blue-800 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Grid 2 Kolom: Jenis Kelamin & No HP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Jenis kelamin <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJenisKelamin('L')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      jenisKelamin === 'L'
                        ? 'border-blue-800 bg-blue-50 text-blue-950 font-semibold'
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
                        ? 'border-blue-800 bg-blue-50 text-blue-950 font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Perempuan
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  No. telepon / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-blue-800 bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Alamat / Kota Domisili */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Alamat (kota domisili) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Kota / alamat tempat tinggal"
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-blue-800 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Grid 2 Kolom: Paket & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Paket diminati <span className="text-rose-500">*</span>
                </label>
                <select
                  value={paketId}
                  onChange={(e) => setPaketId(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs focus:outline-blue-800 bg-slate-50 focus:bg-white transition-colors"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id_paket} value={pkg.id_paket}>
                      {pkg.nama_paket} ({formatRupiah(pkg.harga)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Email <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-blue-800 bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Pesan Tambahan */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Pesan / catatan kebutuhan <span className="text-slate-400 font-normal">(opsional)</span>
              </label>
              <div className="relative">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Mis. butuh kursi roda, jumlah rombongan, tipe kamar"
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-blue-800 bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-950 leading-relaxed">
              Data identitas lengkap (NIK, nama ayah, tempat/tanggal lahir) dan pemeriksaan berkas fisik (KTP, paspor) dilakukan di kantor Yayasan Darunnisa.
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-200">
              <Link
                href="/tracking"
                onClick={handleReset}
                className="text-[11px] text-blue-800 font-semibold hover:underline"
              >
                Sudah ada kode? Lacak pengajuan &rarr;
              </Link>
              <div className="flex items-center gap-2">
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
                    <span>Mengirim...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Pengajuan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/AdminShell';
import {
  getAllKeberangkatanAdmin,
  getPengajuanByIdAdmin,
  getJamaahByIdAdmin,
  saveJamaahAdmin,
  KeberangkatanWithPaket,
  SaveJamaahInput,
} from '@/services/admin.service';
import { formatRupiah } from '@/utils/formatters';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
} from 'lucide-react';

export default function AdminJamaahFormPage() {
  const router = useRouter();
  const [jadwalList, setJadwalList] = useState<KeberangkatanWithPaket[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sourceKodePengajuan, setSourceKodePengajuan] = useState<string | null>(
    null
  );
  const [editNoJamaah, setEditNoJamaah] = useState<string | null>(null);

  const [form, setForm] = useState<SaveJamaahInput>({
    id_jamaah: undefined,
    id_pengajuan: null,
    id_keberangkatan: 0,
    nik: '',
    nama_lengkap: '',
    nama_ayah: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    alamat: '',
    pekerjaan: '',
    pendidikan: '',
    no_hp: '',
    total_biaya: 28500000,
    catatan: '',
    status_paspor: 'menunggu_berkas',
    status_visa: 'belum_diajukan',
    status_manasik: 'belum_manasik',
  });

  const initPage = useCallback(async () => {
    setLoadingInit(true);
    const kebs = await getAllKeberangkatanAdmin();
    setJadwalList(kebs);

    const defaultKeb =
      kebs.find((k) => k.status === 'buka' && (k.sisa_kuota ?? k.kuota) > 0) ||
      kebs[0];

    let idJamaahParam: number | null = null;
    let pengajuanIdParam: number | null = null;

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('id_jamaah')) {
        idJamaahParam = Number(params.get('id_jamaah'));
      }
      if (params.get('pengajuan_id')) {
        pengajuanIdParam = Number(params.get('pengajuan_id'));
      }
    }

    if (idJamaahParam) {
      // Mode Ubah Jamaah (UI-10)
      const existing = await getJamaahByIdAdmin(idJamaahParam);
      if (existing) {
        setEditNoJamaah(existing.no_jamaah);
        setForm({
          id_jamaah: existing.id_jamaah,
          id_pengajuan: existing.id_pengajuan,
          id_keberangkatan: existing.id_keberangkatan,
          nik: existing.nik || '',
          nama_lengkap: existing.nama_lengkap,
          nama_ayah: existing.nama_ayah || '',
          tempat_lahir: existing.tempat_lahir || '',
          tanggal_lahir: existing.tanggal_lahir || '',
          jenis_kelamin: existing.jenis_kelamin,
          alamat: existing.alamat || '',
          pekerjaan: existing.pekerjaan || '',
          pendidikan: existing.pendidikan || '',
          no_hp: existing.no_hp,
          total_biaya: Number(existing.total_biaya),
          catatan: existing.catatan || '',
          status_paspor: existing.status_paspor || 'menunggu_berkas',
          status_visa: existing.status_visa || 'belum_diajukan',
          status_manasik: existing.status_manasik || 'belum_manasik',
        });
      }
    } else if (pengajuanIdParam) {
      // Mode Daftarkan dari Pengajuan (UI-08 -> UI-10)
      const peng = await getPengajuanByIdAdmin(pengajuanIdParam);
      if (peng) {
        setSourceKodePengajuan(peng.kode_pengajuan);
        const matchedKeb =
          kebs.find(
            (k) =>
              k.id_paket === peng.id_paket &&
              k.status === 'buka' &&
              (k.sisa_kuota ?? k.kuota) > 0
          ) ||
          kebs.find((k) => k.id_paket === peng.id_paket) ||
          defaultKeb;

        const hargaPaket =
          Number(matchedKeb?.paket?.harga) ||
          Number(peng.paket?.harga) ||
          28500000;

        setForm((prev) => ({
          ...prev,
          id_jamaah: undefined,
          id_pengajuan: peng.id_pengajuan,
          id_keberangkatan: matchedKeb?.id_keberangkatan || 1,
          nik: peng.nik || '',
          nama_lengkap: peng.nama_lengkap,
          nama_ayah: peng.nama_ayah || '',
          tempat_lahir: peng.tempat_lahir || '',
          tanggal_lahir: peng.tanggal_lahir || '',
          jenis_kelamin: peng.jenis_kelamin || 'L',
          alamat: peng.alamat || '',
          pekerjaan: peng.pekerjaan || '',
          pendidikan: peng.pendidikan || '',
          no_hp: peng.no_hp,
          total_biaya: hargaPaket,
          catatan: peng.pesan || '',
          status_paspor: 'menunggu_berkas',
          status_visa: 'belum_diajukan',
          status_manasik: 'belum_manasik',
        }));
      }
    } else if (defaultKeb) {
      setForm((prev) => ({
        ...prev,
        id_keberangkatan: defaultKeb.id_keberangkatan,
        total_biaya: Number(defaultKeb.paket?.harga) || 28500000,
      }));
    }

    setLoadingInit(false);
  }, []);

  useEffect(() => {
    initPage();
  }, [initPage]);

  const handleKeberangkatanChange = (nextIdKeb: number) => {
    const selectedKeb = jadwalList.find((k) => k.id_keberangkatan === nextIdKeb);
    const nextHarga = selectedKeb?.paket?.harga
      ? Number(selectedKeb.paket.harga)
      : form.total_biaya;

    setForm({
      ...form,
      id_keberangkatan: nextIdKeb,
      total_biaya: form.id_jamaah ? form.total_biaya : nextHarga,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    const res = await saveJamaahAdmin(form);
    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Gagal menyimpan data jamaah');
      return;
    }

    router.push('/admin/jamaah');
  };

  return (
    <AdminShell
      title={
        form.id_jamaah
          ? `Ubah Data Jamaah — ${editNoJamaah}`
          : 'Tambah / Ubah Jamaah'
      }
      uiCode="UI-10"
      modulCode="M6.1"
      subtitle="Mencatat jamaah baru secara terstruktur atau memperbarui data diri & checklist administrasi jamaah."
      actions={
        <Link
          href="/admin/jamaah"
          className="inline-flex items-center gap-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Jamaah</span>
        </Link>
      }
    >
      {sourceKodePengajuan && (
        <div className="bg-blue-950 text-amber-300 border border-blue-800 rounded-xl p-4 text-xs flex items-center gap-3 shadow-2xs">
          <ClipboardCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong>Pendaftaran dari Pengajuan {sourceKodePengajuan}:</strong>{' '}
            Data kontak awal telah diisikan otomatis. Silakan lengkapi{' '}
            <strong>Tempat Lahir</strong> dan <strong>Tanggal Lahir</strong>{' '}
            lalu klik Simpan. Status pengajuan akan otomatis berubah menjadi{' '}
            <strong>&ldquo;Diproses&rdquo;</strong>.
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {loadingInit ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
          Memuat formulir jamaah...
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs"
        >
          {/* Baris 1: NIK & Nama Lengkap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                NIK (16 digit){' '}
                <span className="text-slate-400 font-normal">
                  (boleh menyusul setelah cek berkas)
                </span>
              </label>
              <input
                type="text"
                maxLength={16}
                value={form.nik || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nik: e.target.value.replace(/[^0-9]/g, ''),
                  })
                }
                placeholder="16 digit angka NIK KTP"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:bg-white focus:outline-blue-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nama lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nama_lengkap}
                onChange={(e) =>
                  setForm({ ...form, nama_lengkap: e.target.value })
                }
                placeholder="Nama lengkap sesuai KTP / Paspor"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              />
            </div>
          </div>

          {/* Baris 2: Nama Ayah & Jenis Kelamin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nama ayah{' '}
                <span className="text-slate-400 font-normal">
                  (boleh menyusul setelah cek berkas)
                </span>
              </label>
              <input
                type="text"
                value={form.nama_ayah || ''}
                onChange={(e) =>
                  setForm({ ...form, nama_ayah: e.target.value })
                }
                placeholder="Nama ayah kandung"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Jenis kelamin <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.jenis_kelamin}
                onChange={(e) =>
                  setForm({
                    ...form,
                    jenis_kelamin: e.target.value as 'L' | 'P',
                  })
                }
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>

          {/* Baris 3: Tempat Lahir & Tanggal Lahir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tempat lahir <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.tempat_lahir}
                onChange={(e) =>
                  setForm({ ...form, tempat_lahir: e.target.value })
                }
                placeholder="Kota tempat lahir"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tanggal lahir <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.tanggal_lahir}
                onChange={(e) =>
                  setForm({ ...form, tanggal_lahir: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:bg-white focus:outline-blue-800"
              />
            </div>
          </div>

          {/* Baris 4: Pekerjaan & Pendidikan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Pekerjaan
              </label>
              <input
                type="text"
                value={form.pekerjaan || ''}
                onChange={(e) =>
                  setForm({ ...form, pekerjaan: e.target.value })
                }
                placeholder="Mis. Pegawai Swasta / Wiraswasta / Pensiunan"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Pendidikan terakhir{' '}
                <span className="text-slate-400 font-normal">
                  (boleh menyusul setelah cek berkas)
                </span>
              </label>
              <select
                value={form.pendidikan || ''}
                onChange={(e) =>
                  setForm({ ...form, pendidikan: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              >
                <option value="">-- Pilih Pendidikan (Opsional) --</option>
                <option value="SD">SD / Sederajat</option>
                <option value="SMP">SMP / Sederajat</option>
                <option value="SMA/SMK">SMA / SMK / Sederajat</option>
                <option value="D3">Diploma (D3)</option>
                <option value="S1">Sarjana (S1)</option>
                <option value="S2">Magister (S2)</option>
                <option value="S3">Doktor (S3)</option>
              </select>
            </div>
          </div>

          {/* Baris 5: No. Telepon & Keberangkatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                No. telepon / WhatsApp <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={form.no_hp}
                onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:bg-white focus:outline-blue-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Jadwal Keberangkatan <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={form.id_keberangkatan}
                onChange={(e) =>
                  handleKeberangkatanChange(Number(e.target.value))
                }
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              >
                {jadwalList.map((k) => {
                  const sisa = k.sisa_kuota ?? k.kuota;
                  return (
                    <option
                      key={k.id_keberangkatan}
                      value={k.id_keberangkatan}
                    >
                      {k.paket?.nama_paket} (
                      {k.tgl_berangkat || `Tahun ${k.tahun}`}) &mdash; Sisa{' '}
                      {sisa}/{k.kuota} kursi
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Baris 6: Alamat & Total Biaya */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Alamat lengkap
              </label>
              <input
                type="text"
                value={form.alamat || ''}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                placeholder="Alamat domisili jamaah"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Total biaya (Rp) <span className="text-rose-500">*</span>{' '}
                <span className="text-slate-400 font-normal">
                  (default harga paket: {formatRupiah(form.total_biaya)})
                </span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={form.total_biaya}
                onChange={(e) =>
                  setForm({ ...form, total_biaya: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono bg-slate-50 focus:bg-white focus:outline-blue-800"
              />
            </div>
          </div>

          {/* Baris 7: Catatan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Catatan tambahan
            </label>
            <textarea
              rows={2}
              value={form.catatan || ''}
              onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              placeholder="Catatan pendampingan, kursi roda, atau kamar..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-blue-800"
            />
          </div>

          {/* Baris 8: Checklist Administrasi (Status Paspor, Visa, Manasik — Sesuai Gambar 6.2 UI-10 SD v1.1) */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div>
              <h4 className="font-bold text-blue-950 text-xs">
                Checklist Tahapan Administrasi (M6.1)
              </h4>
              <p className="text-[11px] text-slate-600">
                Berkas KTP dan paspor tidak diunggah ke sistem; dokumen fisik
                diproses manual di kantor yayasan, sistem hanya mencatat status
                tahapan administrasinya.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Status paspor
                </label>
                <select
                  value={form.status_paspor || 'menunggu_berkas'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status_paspor:
                        e.target.value as SaveJamaahInput['status_paspor'],
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-blue-800 font-mono text-xs"
                >
                  <option value="menunggu_berkas">menunggu_berkas</option>
                  <option value="verifikasi_kantor">verifikasi_kantor</option>
                  <option value="rekom_kemenag">rekom_kemenag</option>
                  <option value="selesai">selesai</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Status visa
                </label>
                <select
                  value={form.status_visa || 'belum_diajukan'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status_visa:
                        e.target.value as SaveJamaahInput['status_visa'],
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-blue-800 font-mono text-xs"
                >
                  <option value="belum_diajukan">belum_diajukan</option>
                  <option value="proses_mofa">proses_mofa</option>
                  <option value="visa_terbit">visa_terbit</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Status manasik
                </label>
                <select
                  value={form.status_manasik || 'belum_manasik'}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status_manasik:
                        e.target.value as SaveJamaahInput['status_manasik'],
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:outline-blue-800 font-mono text-xs"
                >
                  <option value="belum_manasik">belum_manasik</option>
                  <option value="terjadwal">terjadwal</option>
                  <option value="sudah_manasik">sudah_manasik</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <Link
              href="/admin/jamaah"
              className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-medium"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </form>
      )}
    </AdminShell>
  );
}

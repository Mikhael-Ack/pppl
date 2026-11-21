import { supabase } from '@/lib/supabase';
import { PaketItem } from '@/types/package.types';
import { getActivePackages } from './packages.service';
import { formatRupiah } from '@/utils/formatters';

/**
 * M4.1 Rekomendasi Paket Berbasis AI (UI-04)
 * Sesuai Pseudocode Bab 4.2 Hal. 8 & Flowchart Gambar 7.1 Hal. 16 SD v1.1:
 * - kandidat <- paket aktif yang memiliki keberangkatan terbuka dengan sisa kuota > 0
 * - UNTUK setiap kandidat: JIKA harga > anggaran_maks -> lewati
 * - skor <- jumlah kriteria yang cocok dengan preferensi (program, waktu, durasi, fasilitas)
 * - urutkan skor menurun, tampilkan paket teratas
 * - JIKA kosong -> "Tidak ada paket yang sesuai, ubah anggaran atau preferensi"
 */
export interface PreferensiRekomendasi {
  anggaran_maks: number; // dalam Rupiah, mis. 35000000
  program?: 'all' | 'umrah' | 'haji_reguler' | 'haji_khusus';
  waktu?: string; // 'all' atau 'YYYY-MM' atau 'YYYY'
  durasi_maks?: number; // 0 = semua, atau 9, 12, 25, 30
  fasilitas?: 'all' | 'ring1' | 'direct' | 'plus';
}

export interface HasilRekomendasiItem {
  paket: PaketItem;
  skor_kriteria: number;
  total_kriteria: number;
  skor_persen: number;
  alasan_kecocokan: string[];
  sisa_kuota_terbuka: number;
  jadwal_terbuka: string;
}

export function hitungRekomendasiPaket(
  packages: PaketItem[],
  pref: PreferensiRekomendasi
): {
  hasil: HasilRekomendasiItem[];
  pesan_kosong: string | null;
} {
  if (!pref || !pref.anggaran_maks || Number(pref.anggaran_maks) <= 0 || !pref.program) {
    return {
      hasil: [],
      pesan_kosong:
        'Isian preferensi wajib belum terisi. Silakan isi anggaran maksimal dan pilih program terlebih dahulu.',
    };
  }

  // 1. Kandidat = paket aktif yang memiliki keberangkatan terbuka dengan sisa kuota > 0
  const kandidatValid = packages.filter((pkg) => {
    if (!pkg.status_aktif) return false;
    const jadwalBuka = (pkg.keberangkatan || []).filter(
      (k) => k.status === 'buka' && (k.sisa_kuota ?? k.kuota) > 0
    );
    return jadwalBuka.length > 0;
  });

  const hasil: HasilRekomendasiItem[] = [];

  for (const pkg of kandidatValid) {
    const hargaPaket = Number(pkg.harga);
    // 2. JIKA harga > anggaran_maks -> lewati (Flowchart Gambar 7.1 M4.1)
    if (hargaPaket > pref.anggaran_maks) {
      continue;
    }

    const jadwalBuka = (pkg.keberangkatan || []).filter(
      (k) => k.status === 'buka' && (k.sisa_kuota ?? k.kuota) > 0
    );
    const jadwalUtama = jadwalBuka[0];
    const sisaKuota = jadwalUtama
      ? jadwalUtama.sisa_kuota ?? jadwalUtama.kuota
      : 0;

    let skor = 0;
    const totalKriteria = 4; // (program, waktu, durasi, fasilitas)
    const alasan: string[] = [];

    // Kriteria 1: Program
    if (!pref.program || pref.program === 'all') {
      skor += 1;
      alasan.push(
        `Program ${
          pkg.program === 'haji_khusus'
            ? 'Haji Khusus'
            : pkg.program === 'haji_reguler'
            ? 'Haji Reguler'
            : 'Umrah'
        }`
      );
    } else if (pkg.program === pref.program) {
      skor += 1;
      alasan.push(`Sesuai pilihan program (${pkg.program})`);
    }

    // Kriteria 2: Waktu keberangkatan (bulan/tahun)
    const targetWaktu = pref.waktu;
    if (!targetWaktu || targetWaktu === 'all') {
      skor += 1;
      alasan.push(
        `Jadwal terbuka (${
          jadwalUtama?.tgl_berangkat || `Tahun ${jadwalUtama?.tahun}`
        })`
      );
    } else {
      const matchWaktu = jadwalBuka.some((k) => {
        const ym = k.bulan
          ? `${k.tahun}-${String(k.bulan).padStart(2, '0')}`
          : `${k.tahun}`;
        return (
          ym === targetWaktu ||
          String(k.tahun) === targetWaktu ||
          Boolean(k.tgl_berangkat && k.tgl_berangkat.startsWith(targetWaktu))
        );
      });
      if (matchWaktu) {
        skor += 1;
        alasan.push(`Cocok dengan periode keberangkatan (${targetWaktu})`);
      }
    }

    // Kriteria 3: Durasi perjalanan
    if (!pref.durasi_maks || pref.durasi_maks <= 0) {
      skor += 1;
      alasan.push(`Durasi ${pkg.durasi_hari} hari`);
    } else if (Number(pkg.durasi_hari) <= pref.durasi_maks) {
      skor += 1;
      alasan.push(
        `Durasi ${pkg.durasi_hari} hari (<= ${pref.durasi_maks} hari)`
      );
    }

    // Kriteria 4: Fasilitas hotel / maskapai
    const gabunganTeks = `${pkg.nama_paket} ${pkg.hotel} ${pkg.maskapai} ${
      pkg.deskripsi || ''
    }`.toLowerCase();
    if (!pref.fasilitas || pref.fasilitas === 'all') {
      skor += 1;
      alasan.push(`Fasilitas ${pkg.hotel.split('|')[0].trim()}`);
    } else if (
      pref.fasilitas === 'ring1' &&
      (gabunganTeks.includes('bintang 5') ||
        gabunganTeks.includes('ring 1') ||
        gabunganTeks.includes('pelataran') ||
        gabunganTeks.includes('pullman') ||
        gabunganTeks.includes('fairmont') ||
        gabunganTeks.includes('safwah'))
    ) {
      skor += 1;
      alasan.push('Hotel Bintang 5 Ring 1 pelataran masjid (ramah lansia)');
    } else if (
      pref.fasilitas === 'direct' &&
      (gabunganTeks.includes('direct') ||
        gabunganTeks.includes('garuda') ||
        gabunganTeks.includes('saudia') ||
        gabunganTeks.includes('langsung'))
    ) {
      skor += 1;
      alasan.push(`Penerbangan langsung (${pkg.maskapai})`);
    } else if (
      pref.fasilitas === 'plus' &&
      (gabunganTeks.includes('plus') ||
        gabunganTeks.includes('turki') ||
        gabunganTeks.includes('ziarah') ||
        pkg.durasi_hari >= 12)
    ) {
      skor += 1;
      alasan.push('Program ibadah plus wisata / ziarah sejarah');
    }

    // Bonus efisiensi anggaran untuk tie-breaker
    const efisiensiRatio = Math.max(
      0,
      Math.min(1, (pref.anggaran_maks - hargaPaket) / pref.anggaran_maks)
    );
    const skorPersen = Math.min(
      99,
      Math.round((skor / totalKriteria) * 90 + efisiensiRatio * 9)
    );

    hasil.push({
      paket: pkg,
      skor_kriteria: skor,
      total_kriteria: totalKriteria,
      skor_persen: skorPersen,
      alasan_kecocokan:
        alasan.length > 0
          ? alasan
          : [`Harga ${formatRupiah(hargaPaket)} sesuai anggaran Anda`],
      sisa_kuota_terbuka: sisaKuota,
      jadwal_terbuka:
        jadwalUtama?.tgl_berangkat ||
        (jadwalUtama?.bulan
          ? `Bulan ${jadwalUtama.bulan}/${jadwalUtama.tahun}`
          : `Tahun ${jadwalUtama?.tahun || 2027}`),
    });
  }

  // 3. Urutkan skor menurun (jika skor kriteria sama, urutkan skor_persen menurun lalu harga terdekat)
  hasil.sort((a, b) => {
    if (b.skor_kriteria !== a.skor_kriteria) {
      return b.skor_kriteria - a.skor_kriteria;
    }
    if (b.skor_persen !== a.skor_persen) {
      return b.skor_persen - a.skor_persen;
    }
    return Number(a.paket.harga) - Number(b.paket.harga);
  });

  if (hasil.length === 0) {
    return {
      hasil: [],
      pesan_kosong:
        'Tidak ada paket yang sesuai, ubah anggaran atau preferensi',
    };
  }

  return {
    hasil,
    pesan_kosong: null,
  };
}

/**
 * M5.1 Chatbot AI Informasi Paket dengan LLM API & RAG (UI-05)
 * Sesuai Pseudocode Bab 4.2 Hal. 8 SD v1.1:
 * - JIKA pertanyaan kosong -> minta pengguna mengisi pertanyaan
 * - konteks <- ambil data paket, jadwal keberangkatan, dan ringkasan historis (jumlah jamaah per program/periode) yang relevan
 * - jawaban <- panggil LLM API dengan pertanyaan dan konteks; jawab hanya berdasarkan konteks
 * - JIKA konteks tidak memuat jawaban ATAU LLM API gagal -> "Informasi belum tersedia, silakan hubungi staf Yayasan Darunnisa"
 * - Data pribadi jamaah tidak pernah dimasukkan ke dalam konteks
 */
export interface RAGContextData {
  packages: PaketItem[];
  totalJamaahAktif: number;
  jamaahPerProgram: Record<string, number>;
  contextText: string;
}

export async function buildSafeRAGContext(): Promise<RAGContextData> {
  // Ambil paket aktif beserta jadwal keberangkatan & agregat jumlah jamaah (TANPA data pribadi jamaah!)
  const [packages, { data: activeJamaahRows }] = await Promise.all([
    getActivePackages(),
    supabase
      .from('jamaah')
      .select('id_keberangkatan, status_jamaah')
      .eq('status_jamaah', 'aktif'),
  ]);

  const totalJamaahAktif = (activeJamaahRows || []).length;
  const jamaahPerProgram: Record<string, number> = {
    umrah: 0,
    haji_reguler: 0,
    haji_khusus: 0,
  };

  for (const pkg of packages) {
    const jmlPkg = (pkg.keberangkatan || []).reduce(
      (acc, k) => acc + (k.jumlah_terisi || 0),
      0
    );
    jamaahPerProgram[pkg.program] =
      (jamaahPerProgram[pkg.program] || 0) + jmlPkg;
  }

  const lines: string[] = [
    'KONTEKS RESMI KATALOG PAKET & RINGKASAN HISTORIS YAYASAN DARUNNISA (PPIU U.412/2021, PIHK 912/2023):',
    `Total jamaah aktif terdaftar saat ini (agregat): ${totalJamaahAktif} jamaah (Umrah: ${jamaahPerProgram.umrah}, Haji Reguler: ${jamaahPerProgram.haji_reguler}, Haji Khusus: ${jamaahPerProgram.haji_khusus}).`,
    'Daftar Paket Aktif:',
  ];

  for (const p of packages) {
    const jadwalStr = (p.keberangkatan || [])
      .map(
        (k) =>
          `${k.tgl_berangkat || `Tahun ${k.tahun}`} (Status: ${
            k.status
          }, Kuota: ${k.kuota}, Terisi: ${k.jumlah_terisi || 0}, Sisa: ${
            k.sisa_kuota ?? k.kuota
          } kursi)`
      )
      .join('; ');

    lines.push(
      `- [${p.kode_paket}] ${p.nama_paket} | Program: ${
        p.program
      } | Harga: ${formatRupiah(p.harga)} | Durasi: ${
        p.durasi_hari
      } hari | Maskapai: ${p.maskapai} | Hotel: ${p.hotel} | Deskripsi: ${
        p.deskripsi || '-'
      } | Jadwal & Kuota: ${jadwalStr || 'Belum ada jadwal'}`
    );
  }

  return {
    packages,
    totalJamaahAktif,
    jamaahPerProgram,
    contextText: lines.join('\n'),
  };
}

export const FALLBACK_UNAVAILABLE_MSG =
  'Informasi belum tersedia, silakan hubungi staf Yayasan Darunnisa';

export async function answerWithGroundedRAG(
  rawQuestion: string,
  options?: { simulateLlmFailure?: boolean }
): Promise<{
  reply: string;
  contextUsed: string;
  isFallback: boolean;
}> {
  const q = (rawQuestion || '').trim();
  if (!q) {
    return {
      reply: 'Silakan isi pertanyaan Anda terlebih dahulu.',
      contextUsed: '',
      isFallback: false,
    };
  }

  if (options?.simulateLlmFailure) {
    return {
      reply: FALLBACK_UNAVAILABLE_MSG,
      contextUsed: '',
      isFallback: true,
    };
  }

  try {
    const rag = await buildSafeRAGContext();
    const lower = q.toLowerCase();

    // Proteksi Privasi Data Jamaah (NF-07 / TC-35): Tolak pertanyaan yang meminta data pribadi, pembayaran, atau dokumen sensitif jamaah
    const isAskingPrivateData =
      lower.includes('nik ') ||
      lower.includes('nomor ktp') ||
      lower.includes('ktp jamaah') ||
      lower.includes('paspor jamaah') ||
      lower.includes('nomor paspor') ||
      lower.includes('riwayat pembayaran jamaah') ||
      lower.includes('cicilan jamaah') ||
      lower.includes('sisa pembayaran jamaah') ||
      lower.includes('siapa saja nama jamaah') ||
      lower.includes('data pribadi') ||
      lower.includes('nomor hp jamaah');

    if (isAskingPrivateData) {
      return {
        reply: FALLBACK_UNAVAILABLE_MSG,
        contextUsed: rag.contextText,
        isFallback: true,
      };
    }

    // Cek apakah pertanyaan cocok dengan salah satu paket spesifik di database (termasuk paket yang baru ditambah/diubah admin di M2.2!)
    const matchedPkgByNameOrCode = rag.packages.find(
      (p) =>
        lower.includes(p.kode_paket.toLowerCase()) ||
        lower.includes(p.nama_paket.toLowerCase()) ||
        (lower.includes('turki') &&
          p.nama_paket.toLowerCase().includes('turki')) ||
        (lower.includes('reguler') &&
          p.nama_paket.toLowerCase().includes('reguler') &&
          p.program === 'umrah')
    );

    if (matchedPkgByNameOrCode) {
      const p = matchedPkgByNameOrCode;
      const jdw = (p.keberangkatan || [])[0];
      const sisaInfo = jdw
        ? `Jadwal keberangkatan: ${
            jdw.tgl_berangkat || `Tahun ${jdw.tahun}`
          } dengan sisa kuota ${jdw.sisa_kuota ?? jdw.kuota} dari ${
            jdw.kuota
          } kursi.`
        : '';
      return {
        reply: `Berdasarkan data katalog terbaru: Paket ${p.nama_paket} (${
          p.kode_paket
        }) berbiaya ${formatRupiah(p.harga)} untuk durasi ${
          p.durasi_hari
        } hari. Fasilitas maskapai ${p.maskapai} dan hotel ${
          p.hotel
        }. ${sisaInfo}`,
        contextUsed: rag.contextText,
        isFallback: false,
      };
    }

    // Pertanyaan seputar daftar semua paket / harga / katalog
    if (
      lower.includes('paket') ||
      lower.includes('harga') ||
      lower.includes('biaya') ||
      lower.includes('katalog') ||
      lower.includes('9 hari') ||
      lower.includes('12 hari')
    ) {
      if (rag.packages.length === 0) {
        return {
          reply: FALLBACK_UNAVAILABLE_MSG,
          contextUsed: rag.contextText,
          isFallback: true,
        };
      }
      const ringkasanPaket = rag.packages
        .map(
          (p) =>
            `${p.nama_paket} (${formatRupiah(p.harga)}, ${p.durasi_hari} hari)`
        )
        .join('; ');
      return {
        reply: `Saat ini tersedia ${rag.packages.length} paket aktif di Yayasan Darunnisa: ${ringkasanPaket}. Seluruh paket sudah termasuk bimbingan muthawif dan hotel sesuai katalog.`,
        contextUsed: rag.contextText,
        isFallback: false,
      };
    }

    // Pertanyaan seputar Haji Khusus / Haji Reguler
    if (lower.includes('haji')) {
      const hajiPkgs = rag.packages.filter((p) =>
        p.program.startsWith('haji')
      );
      if (hajiPkgs.length > 0) {
        const detailHaji = hajiPkgs
          .map(
            (p) =>
              `${p.nama_paket} seharga ${formatRupiah(p.harga)} (${
                p.durasi_hari
              } hari, maskapai ${p.maskapai}, hotel ${p.hotel})`
          )
          .join('; ');
        return {
          reply: `Untuk program Haji, tersedia: ${detailHaji}. Terdaftar resmi di Kemenag RI (PIHK 912/2023).`,
          contextUsed: rag.contextText,
          isFallback: false,
        };
      }
    }

    // Pertanyaan seputar Hotel / Maskapai
    if (
      lower.includes('hotel') ||
      lower.includes('penginapan') ||
      lower.includes('makkah') ||
      lower.includes('madinah') ||
      lower.includes('maskapai') ||
      lower.includes('pesawat')
    ) {
      const infoAkomodasi = rag.packages
        .map((p) => `${p.nama_paket}: ${p.hotel} (${p.maskapai})`)
        .join(' | ');
      return {
        reply: `Rincian hotel dan maskapai pada paket aktif kami: ${infoAkomodasi}.`,
        contextUsed: rag.contextText,
        isFallback: false,
      };
    }

    // Pertanyaan seputar Jadwal / Kuota / Jumlah Jamaah Historis
    if (
      lower.includes('jadwal') ||
      lower.includes('berangkat') ||
      lower.includes('kuota') ||
      lower.includes('kursi') ||
      lower.includes('jumlah jamaah')
    ) {
      const infoJadwal = rag.packages
        .flatMap((p) =>
          (p.keberangkatan || []).map(
            (k) =>
              `${p.nama_paket}: ${
                k.tgl_berangkat || `Tahun ${k.tahun}`
              } (Sisa ${k.sisa_kuota ?? k.kuota}/${k.kuota} kursi)`
          )
        )
        .join('; ');
      return {
        reply: `Jadwal keberangkatan & sisa kuota saat ini: ${
          infoJadwal || 'Belum ada jadwal terbuka'
        }. Total jamaah aktif terdaftar di sistem saat ini: ${
          rag.totalJamaahAktif
        } jamaah.`,
        contextUsed: rag.contextText,
        isFallback: false,
      };
    }

    // Pertanyaan seputar Cara Daftar / Pembayaran / Lacak
    if (
      lower.includes('daftar') ||
      lower.includes('cara') ||
      lower.includes('syarat') ||
      lower.includes('lacak') ||
      lower.includes('bayar') ||
      lower.includes('cicil')
    ) {
      return {
        reply:
          'Untuk mendaftar, klik tombol "Daftar Online" (UI-03) dan isi nama, jenis kelamin, nomor WhatsApp, alamat, serta paket yang diminati. Anda akan menerima kode pengajuan (DRN-REG-xxxx) yang dapat dipantau pada menu "Lacak Pengajuan" (UI-14).',
        contextUsed: rag.contextText,
        isFallback: false,
      };
    }

    // Jika di luar konteks paket Darunnisa -> kembalikan pesan pengalihan sesuai SD Bab 4.2 M5.1
    return {
      reply: FALLBACK_UNAVAILABLE_MSG,
      contextUsed: rag.contextText,
      isFallback: true,
    };
  } catch (err) {
    console.error('[AIService] RAG error:', err);
    return {
      reply: FALLBACK_UNAVAILABLE_MSG,
      contextUsed: '',
      isFallback: true,
    };
  }
}

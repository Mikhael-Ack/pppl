# PANDUAN PENGGUNA & SOP PELATIHAN STAF OPERASIONAL (USER MANUAL)
**Sistem Informasi Manajemen Perjalanan Haji & Umrah — Yayasan Darunnisa**
- **Kode Dokumen**: UM-DRN-v1.1 (Pemenuhan Kebutuhan Non-Fungsional NF-04 / TC-31)
- **Mitra**: Yayasan Darunnisa (PT Darunnisa Wisata Barokah)
- **Tim Pengembang**: Tim RAM (4IA01) — Universitas Gunadarma

---

## 1. Gambaran Umum Sistem & Batasan Keamanan (NF-02)
Sistem informasi berbasis web ini terbagi menjadi dua area utama:
1. **Portal Calon Jamaah (Front-Office)**: Katalog Paket (`UI-01`, `UI-02`), Form Pengajuan Pendaftaran (`UI-03`), Pencocok Paket AI (`UI-04`), Chatbot AI (`UI-05`), dan Pelacakan Pengajuan (`UI-14`).
2. **Dasbor Admin / Staf Operasional (Back-Office)**: Login Admin (`UI-06`), Kelola Paket (`UI-07`), Kelola Pengajuan (`UI-08`), Direktori & Form Jamaah (`UI-09`, `UI-10`), Detail & Pantau Pembayaran (`UI-11`, `UI-13`), serta Jadwal & Pengelompokan Keberangkatan (`UI-12`).

> **Aturan Privasi & Dokumen Fisik (NF-02)**: Sesuai kebijakan Yayasan Darunnisa, berkas fisik sensitif seperti **KTP asli, Paspor, dan Buku Nikah** diserahkan dan diverifikasi secara manual di kantor operasional yayasan. Sistem hanya menyimpan catatan status administrasi (`status_paspor`, `status_visa`, `status_manasik`) tanpa fitur unggah file dokumen sensitif.

---

## 2. Panduan Operasional Staf Admin (Back-Office)

### 2.1 Login Dasbor Admin (`M1.1` / `UI-06`)
1. Buka halaman `/admin/login` (atau klik tautan **Login Admin (UI-06)** pada footer beranda).
2. Masukkan **Username** (`admin`) dan **Password** (`admin123`).
3. Klik tombol **Masuk**. Jika kredensial valid, sistem membuka dasbor pengelolaan. Jika salah atau kosong, sistem menolak akses dan menampilkan pesan kesalahan.

### 2.2 Mengelola Katalog Paket (`M2.2` / `UI-07`)
1. Pilih menu **Paket (UI-07)** pada bilah navigasi kiri.
2. Klik **+ Tambah Paket** untuk membuat paket Umrah, Haji Reguler, atau Haji Khusus baru.
3. Isi **Kode Paket** (unik, misal `UMR-REG-9D`), **Nama Paket**, **Program**, **Harga (> 0)**, **Durasi Hari (> 0)**, **Maskapai**, **Hotel**, dan **Deskripsi**.
4. Gunakan tombol **Nonaktifkan / Aktifkan** untuk menyembunyikan paket dari katalog publik tanpa menghapus riwayat keberangkatan jamaah lama.

### 2.3 Mengelola Jadwal & Mengelompokkan Jamaah per Keberangkatan (`M7.1`, `M7.2` / `UI-12`)
1. Pilih menu **Jadwal (UI-12)** pada navigasi kiri.
2. **Tab 1 — Jadwal & Kuota (`M7.1`)**:
   - Klik **+ Tambah Jadwal** untuk membuka angkatan keberangkatan baru.
   - **Aturan Program Umrah**: Bulan (1–12) dan Tanggal Berangkat wajib diisi.
   - **Aturan Program Haji**: Cukup mengisi Tahun Alokasi Kuota (bulan dan tanggal dikosongkan).
   - **Aturan Kuota**: Jumlah kuota kursi harus `> 0` dan tidak boleh diubah menjadi lebih kecil dari jumlah jamaah aktif yang sudah terdaftar pada jadwal tersebut.
3. **Tab 2 — Jamaah per Keberangkatan (`M7.2`)**:
   - Gunakan filter **Program**, **Tahun**, dan **Bulan** untuk melihat daftar jamaah per kloter/angkatan.
   - Klik tombol **Pindahkan** pada baris jamaah jika jamaah perlu dipindah ke jadwal lain yang masih memiliki sisa kuota `> 0`.

### 2.4 Memproses Pengajuan Minat Calon Jamaah (`M3.2` / `UI-08`)
1. Pilih menu **Pengajuan (UI-08)** untuk melihat daftar pendaftaran online yang masuk dari portal publik (diurutkan dari yang terbaru).
2. Setelah staf menghubungi calon jamaah via WhatsApp/telepon, ubah dropdown status dari **Baru** menjadi **Dihubungi**.
3. Jika calon jamaah batal atau kuota tidak cocok, pilih status **Ditolak** dan isi **Alasan Penolakan** (wajib diisi). Pengajuan yang ditolak dapat dibuka kembali ke status **Dihubungi**.
4. Jika calon jamaah menyerahkan berkas ke kantor dan siap didaftarkan resmi, klik tombol **Daftarkan** pada baris pengajuan tersebut. Sistem otomatis membuka formulir `UI-10` dengan data awal terisi.

### 2.5 Mendaftarkan, Mencari, & Mengelola Data Jamaah (`M6.1`, `M6.2` / `UI-09`, `UI-10`)
1. **Tambah / Konversi Jamaah (`M6.1` / `UI-10`)**:
   - Isi kolom wajib: **Nama Lengkap**, **Tempat Lahir**, **Tanggal Lahir**, **Jenis Kelamin**, **No. HP**, **Jadwal Keberangkatan**, dan **Total Biaya**.
   - Kolom **NIK (16 digit angka)**, **Nama Ayah**, dan **Pendidikan** boleh dikosongkan pada penyimpanan awal dan dilengkapi menyusul. Jika NIK diisi, sistem memvalidasi 16 digit angka dan memastikan tidak ganda.
   - Klik **Simpan Data Jamaah**. Sistem otomatis menerbitkan nomor induk `JM2026xxxx`, mengurangi sisa kuota keberangkatan sebanyak 1 kursi, dan mengubah status pengajuan asal menjadi **Diproses**.
2. **Pencarian Jamaah Baru & Lama (`M6.2` / `UI-09`)**:
   - Gunakan kotak pencarian di menu **Jamaah (UI-09)** untuk mencari berdasarkan **Nama**, **No. Jamaah (`JM...`)**, **No. HP**, atau **NIK**, serta filter Program, Tahun, dan Status.
   - Klik baris jamaah untuk membuka panel detail akordeon yang memuat biodata lengkap dan checklist administrasi (**Status Paspor**, **Status Visa**, **Status Manasik**).
3. **Pembatalan & Pengaktifan Kembali**:
   - Klik **Batalkan Jamaah** dan isi alasan pembatalan wajib jika jamaah mengundurkan diri. Kuota kursi otomatis dikembalikan.

### 2.6 Mencatat & Memantau Pembayaran Jamaah (`M8.1`, `M8.2` / `UI-11`, `UI-13`)
1. Pilih menu **Pembayaran (UI-13)** untuk memantau rekap seluruh jamaah (**Total Biaya**, **Total Dibayar**, **Sisa Pembayaran**, dan status **Lunas / Belum lunas**).
2. Klik **Detail / Bayar** pada baris jamaah untuk membuka halaman rincian (`UI-11`).
3. Pada formulir **Catat Pembayaran Baru (`M8.1`)**:
   - Isi **Tanggal Bayar**, **Jumlah Pembayaran (Rp)**, **Metode (`tunai` / `transfer`)**, **No. Bukti / Kwitansi**, dan **Catatan**.
   - Sistem menolak pembayaran jika jamaah berstatus `batal`, nominal `<= 0`, atau nominal melebihi `sisa_pembayaran`.
   - Setelah disimpan, sisa tagihan dan status (`Lunas` jika sisa = `Rp 0`, atau `Belum lunas`) langsung diperbarui secara otomatis di basis data terpusat (Cloud Supabase).

---

## 3. Panduan Portal Publik Calon Jamaah (Front-Office)
1. **Katalog & Detail Paket (`UI-01`, `UI-02`)**: Calon jamaah dapat melihat daftar paket aktif beserta sisa kuota secara *real-time* dan menekan **Lihat Detail** untuk melihat jadwal keberangkatan, maskapai, dan fasilitas hotel.
2. **Form Pengajuan Pendaftaran (`UI-03`)**: Calon jamaah mengisi Nama Lengkap, Jenis Kelamin, Nomor WhatsApp, Alamat Domisili, dan Paket Pilihan, lalu menerima kode unik `DRN-REG-xxxx`.
3. **Pelacakan Status Pengajuan (`UI-14`)**: Buka halaman `/tracking`, masukkan kode `DRN-REG-xxxx` atau Nomor HP. Demi privasi, nama dan nomor HP ditampilkan sebagian disamarkan (*masked*).
4. **Rekomendasi Paket AI (`UI-04`) & Chatbot AI (`UI-05`)**: Membantu calon jamaah menyaring paket berdasarkan anggaran/preferensi dan menjawab pertanyaan seputar katalog tanpa mengakses data pribadi jamaah.

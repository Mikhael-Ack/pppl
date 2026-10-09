# Panduan Step-by-Step Implementasi Website Umroh & Haji (Next.js + ML)

Dokumen ini adalah acuan kerja berurutan bagi developer / coding agent untuk membangun sistem dari nol hingga siap rilis.

---

## Ringkasan Alur Kerja

```
[ Fase 1: Database Supabase ] 
             │
             ▼
[ Fase 2: Integrasi DB di Next.js ] 
             │
             ▼
[ Fase 3: UI Homepage, Jadwal & Paket ] 
             │
             ▼
[ Fase 4: Engine Machine Learning (Matcher & Kalkulator) ] 
             │
             ▼
[ Fase 5: Tracking Jemaah & Direct WA Leads ] 
             │
             ▼
[ Fase 6: Build & Deploy ke Vercel ]
```

---

## Fase 1: Setup Skema Database (Supabase PostgreSQL)

Jalankan skrip SQL berikut di SQL Editor Supabase untuk membuat tabel yang dibutuhkan:

```sql
-- 1. Tabel Paket Umroh & Haji
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'reguler_vip', 'ekonomis', 'plus_wisata', 'haji_khusus'
    duration_days INT NOT NULL,
    departure_date DATE NOT NULL,
    airline VARCHAR(100) NOT NULL,
    departure_city VARCHAR(100) NOT NULL,
    hotel_makkah VARCHAR(100) NOT NULL,
    hotel_makkah_rating INT NOT NULL,
    hotel_madinah VARCHAR(100) NOT NULL,
    hotel_madinah_rating INT NOT NULL,
    price_quad NUMERIC(15, 2) NOT NULL,
    price_triple NUMERIC(15, 2) NOT NULL,
    price_double NUMERIC(15, 2) NOT NULL,
    quota_seat INT NOT NULL,
    remaining_seat INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel Pendaftaran & Tracking Jemaah
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(50) UNIQUE NOT NULL, -- Contoh: UMR-2026-08892
    package_id UUID REFERENCES packages(id),
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    room_type VARCHAR(20) NOT NULL, -- 'quad', 'triple', 'double'
    total_persons INT NOT NULL DEFAULT 1,
    current_step INT NOT NULL DEFAULT 1, -- 1 s/d 6
    payment_status VARCHAR(50) DEFAULT 'dp_unpaid', -- 'dp_unpaid', 'dp_paid', 'fully_paid'
    shipping_receipt_no VARCHAR(100), -- Nomor resi pengiriman koper
    manasik_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Data Awal untuk Uji Coba
INSERT INTO packages (name, slug, category, duration_days, departure_date, airline, departure_city, hotel_makkah, hotel_makkah_rating, hotel_madinah, hotel_madinah_rating, price_quad, price_triple, price_double, quota_seat, remaining_seat)
VALUES 
('Umroh VIP Ring 1 Pelataran 9 Hari', 'umroh-vip-ring-1', 'reguler_vip', 9, '2026-10-18', 'Garuda Indonesia (Direct)', 'Jakarta (CGK)', 'Pullman Zamzam Tower', 5, 'Al Aqeeq Madinah', 5, 33500000, 36500000, 39500000, 45, 4),
('Umroh Hemat Berkah 9 Hari', 'umroh-hemat-berkah', 'ekonomis', 9, '2026-11-25', 'Lion Air (Direct)', 'Jakarta (CGK)', 'Grand Al Massa', 3, 'Mirage Al Salam', 3, 26900000, 28900000, 31900000, 45, 12),
('Umroh Plus Turki Cappadocia 12 Hari', 'umroh-plus-turki-12h', 'plus_wisata', 12, '2026-12-12', 'Turkish Airlines', 'Jakarta (CGK)', 'Safwah Royal Orchid', 5, 'Dallah Taibah', 4, 39500000, 42500000, 46000000, 35, 8);
```

---

## Fase 2: Integrasi Database di Next.js

1. **Install Package Supabase & Icons**:
   Jalankan di terminal proyek:
   ```bash
   npm install @supabase/supabase-js lucide-react
   ```

2. **Buat File Konfigurasi Environment (`.env.local`)**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
   NEXT_PUBLIC_TRAVEL_WA=6281234567890
   NEXT_PUBLIC_ML_API_URL=http://your-vps-ip:8000
   ```

3. **Buat Supabase Client Singleton (`lib/supabase.ts`)**:
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

---

## Fase 3: Pembuatan Antarmuka UI (Frontend Next.js)

Buat struktur komponen modular di folder `components/`:

1. `components/Navbar.tsx`:
   - Logo biro travel.
   - Badge status izin resmi Kemenag (PPIU & PIHK) dan sinkronisasi SISKOPATUH.
   - Menu: Home, Jadwal Paket, Rekomendasi ML, Cek Status Jemaah.
2. `components/Hero.tsx`:
   - Value proposition utama ("Ibadah Umroh Nyaman, Transparan, Sesuai Sunnah").
   - Tombol CTA langsung menuju filter jadwal & kalkulator.
3. `components/PackageCard.tsx`:
   - Tampilan kartu paket (durasi, nama hotel Makkah/Madinah, maskapai, harga Quad, sisa seat).
   - Tombol direct chat WhatsApp dengan template pesan otomatis.
4. `components/PackageFilter.tsx`:
   - Filter dinamis berdasarkan bulan keberangkatan, kota asal, dan kategori program.
5. `app/page.tsx`:
   - Mengambil data paket langsung dari Supabase (SSR/Server Component).
   - Menampilkan susunan Hero $\rightarrow$ Filter $\rightarrow$ Daftar Paket $\rightarrow$ Footer Legalitas.

---

## Fase 4: Integrasi Machine Learning Ringan

### A. Model 1: Smart Package Matcher (Decision Tree)
- **Tujuan**: Mengklasifikasikan pilihan paket paling ideal bagi jemaah lansia/keluarga.
- **File Komponen**: `components/MLMatcher.tsx`.
- **Parameter Input**: Budget (slider), bawa lansia (ya/tidak), durasi hari (9/12), prioritas jarak hotel.
- **Logika Internal (Fallback Ringan di `lib/ml-matcher.ts`)**:
  ```typescript
  export interface MatcherInput {
    budget: number;
    hasElderly: boolean;
    duration: number;
    distancePriority: 'ring1' | 'flexible';
  }

  export function predictPackage(input: MatcherInput) {
    if (input.duration === 12) {
      return {
        packageName: "Umroh Plus Turki 12 Hari",
        reason: "Durasi panjang 12 hari ideal untuk program ibadah sekaligus ziarah sejarah.",
      };
    }
    if (input.hasElderly || input.distancePriority === 'ring1') {
      if (input.budget >= 32000000) {
        return {
          packageName: "Umroh VIP Ring 1 Pelataran 9 Hari",
          reason: "Kondisi jemaah lansia mewajibkan hotel ring 1 (< 100m) tanpa tanjakan demi kenyamanan fisik.",
        };
      }
    }
    return {
      packageName: "Umroh Hemat Berkah 9 Hari",
      reason: "Pilihan paling hemat dengan efisiensi biaya maksimal.",
    };
  }
  ```

### B. Model 2: Kalkulator Estimasi Biaya Cerdas (Linear Regression)
- **Tujuan**: Menghitung estimasi biaya wajar berdasarkan faktor musim (*seasonality multiplier*).
- **File Komponen**: `components/MLPriceCalculator.tsx`.
- **Variabel**: Musim (Ramadhan 1.55x, Libur Sekolah 1.15x, Low season 0.95x), Kelas Hotel, Tipe Kamar, Maskapai.

---

## Fase 5: Sistem Tracking Jemaah & Lead WhatsApp

1. **Halaman Tracking (`app/tracking/page.tsx`)**:
   - Kolom pencarian kode booking (contoh: `UMR-2026-08892`).
   - Route Handler `app/api/tracking/route.ts` untuk query tabel `bookings` di Supabase.
   - Stepper visual 6 tahap:
     1. Booking & DP
     2. Verifikasi Dokumen
     3. Penerbitan Visa Nusuk
     4. Pengiriman Perlengkapan Koper (dilengkapi nomor resi)
     5. Jadwal Manasik
     6. Keberangkatan di Bandara

2. **Template Pesan WhatsApp Otomatis (`lib/whatsapp.ts`)**:
   - Fungsi untuk menyusun tautan `https://wa.me/628xxx?text=...` dengan format pesan rapi ketika jemaah memilih paket.

---

## Fase 6: Testing, Build & Deployment

1. **Pengujian Lokal**:
   ```bash
   npm run build
   npm run start
   ```
   Pastikan tidak ada error TypeScript atau kegagalan import.

2. **Deploy ke Vercel**:
   - Push repository ke GitHub.
   - Hubungkan repository ke akun Vercel.
   - Tambahkan Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TRAVEL_WA`).
   - Klik **Deploy**.

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  getAdminSession,
  clearAdminSession,
  AdminUser,
} from '@/services/admin.service';
import {
  Package,
  ClipboardList,
  Users,
  CreditCard,
  Calendar,
  LogOut,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  X,
} from 'lucide-react';

interface AdminShellProps {
  title: string;
  uiCode: string;
  modulCode: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    label: 'Paket',
    href: '/admin/paket',
    ui: 'UI-07',
    icon: Package,
  },
  {
    label: 'Pengajuan',
    href: '/admin/pengajuan',
    ui: 'UI-08',
    icon: ClipboardList,
  },
  {
    label: 'Jamaah',
    href: '/admin/jamaah',
    ui: 'UI-09 / UI-10',
    icon: Users,
  },
  {
    label: 'Pembayaran',
    href: '/admin/pembayaran',
    ui: 'UI-13 / UI-11',
    icon: CreditCard,
  },
  {
    label: 'Jadwal',
    href: '/admin/jadwal',
    ui: 'UI-12',
    icon: Calendar,
  },
];

export default function AdminShell({
  title,
  uiCode,
  modulCode,
  subtitle,
  actions,
  children,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [checked, setChecked] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      router.replace('/admin/login');
    } else {
      setAdmin(session);
      setChecked(true);
    }
  }, [router]);

  const handleLogout = () => {
    clearAdminSession();
    router.replace('/admin/login');
  };

  if (!checked || !admin) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-xs text-slate-500">
        Memverifikasi sesi login admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 text-slate-800">
      {/* Sidebar Admin (Sesuai Gambar 6.2 SD v1.1) */}
      <aside className="w-full md:w-60 bg-[#0b2242] text-slate-100 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-[#163d73]">
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-[#163d73] flex items-center justify-between md:block">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-blue-900/60 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src="/images/logo-darunnisa.jpg"
                  alt="Logo Yayasan Darunnisa"
                  width={30}
                  height={30}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm leading-tight">
                  Darunnisa Travel
                </div>
                <div className="text-[10px] text-amber-300 font-medium">
                  Dasbor Admin / Staf
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="md:hidden inline-flex items-center gap-1 text-[11px] bg-rose-900/60 hover:bg-rose-800 text-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-700/50 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>

          {/* Admin Identity Strip */}
          <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-[#07162c] border-b border-[#163d73] text-[11px] text-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <div className="truncate">
              <span className="text-slate-400">Login: </span>
              <strong className="text-white">{admin.nama_lengkap}</strong>
            </div>
          </div>

          {/* Menu Samping */}
          <nav className="p-2 md:p-3 flex md:flex-col gap-1.5 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                      : 'text-blue-100 hover:bg-[#133666] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`hidden md:inline text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-amber-500/30 text-slate-950 font-bold'
                        : 'text-blue-300/70 bg-[#07162c]/60'
                    }`}
                  >
                    {item.ui}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions (Desktop) */}
        <div className="hidden md:block p-3 border-t border-[#163d73] space-y-1.5">
          <button
            onClick={() => setManualOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-medium text-amber-300 bg-[#133666]/80 hover:bg-[#133666] border border-[#21579e] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Panduan Staf (User Manual)</span>
            </span>
          </button>
          <Link
            href="/"
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] text-blue-200 hover:bg-[#133666] hover:text-white transition-colors"
          >
            <span>Lihat Portal Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-200 hover:bg-rose-950/80 hover:text-white border border-transparent hover:border-rose-800/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-900 bg-amber-200/80 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <span>{uiCode}</span>
              <span>&bull;</span>
              <span>Modul {modulCode}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setManualOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 bg-[#0b2242] text-amber-300 font-semibold text-xs px-3 py-2 rounded-xl cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Panduan Staf</span>
            </button>
            {actions}
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Modal User Manual & SOP Pelatihan Staf Operasional (NF-04 / TC-31) */}
      {manualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-[#0b2242] text-white p-5 border-b border-[#163d73] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 block">
                  Dokumentasi Operasional (NF-04 &bull; TC-31)
                </span>
                <h3 className="text-base font-bold">
                  Panduan Pengguna (User Manual) &amp; SOP Staf Darunnisa
                </h3>
              </div>
              <button
                onClick={() => setManualOpen(false)}
                className="p-1.5 rounded-lg bg-[#133666] hover:bg-[#1c4b8c] text-blue-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-slate-700 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                <strong>Kebijakan Keamanan &amp; Privasi (NF-02):</strong> Berkas fisik sensitif (KTP asli, Paspor, Buku Nikah) diserahkan dan diverifikasi secara manual di kantor Yayasan Darunnisa. Sistem ini hanya mencatat status checklist administrasi tanpa unggah file dokumen sensitif.
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">1. Kelola Paket &amp; Jadwal Keberangkatan (UI-07 &amp; UI-12)</h4>
                <p>
                  Tambahkan atau ubah paket Umrah, Haji Reguler, dan Haji Khusus di menu <strong>Paket</strong>. Buka angkatan keberangkatan di menu <strong>Jadwal</strong> (program Umrah wajib mengisi bulan &amp; tanggal berangkat; program Haji cukup tahun alokasi kuota). Gunakan tab <strong>Jamaah per Keberangkatan</strong> untuk mengelompokkan dan memindahkan jamaah antarkloter.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">2. Verifikasi Pengajuan &amp; Pendaftaran Jamaah (UI-08, UI-09, UI-10)</h4>
                <p>
                  Periksa calon jamaah yang mendaftar dari website di menu <strong>Pengajuan</strong>. Ubah status ke <em>Dihubungi</em> setelah tindak lanjut WhatsApp, atau klik <strong>Daftarkan</strong> untuk mengonversi pengajuan menjadi jamaah resmi di <strong>UI-10</strong> (status pengajuan otomatis berubah menjadi <em>Diproses</em> dan nomor induk <code>JM2026xxxx</code> diterbitkan).
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">3. Pencatatan &amp; Pemantauan Pembayaran (UI-11 &amp; UI-13)</h4>
                <p>
                  Pantau tagihan seluruh jamaah di menu <strong>Pembayaran</strong>. Klik <strong>Detail / Bayar</strong> untuk mencatat pembayaran tunai atau transfer antarbank. Sistem otomatis menghitung ulang sisa tagihan dan memperbarui status menjadi <em>Lunas</em> atau <em>Belum lunas</em> di basis data terpusat (Cloud Supabase).
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Berkas lengkap: docs/USER_MANUAL.md (v1.1)
              </span>
              <button
                onClick={() => setManualOpen(false)}
                className="bg-[#0b2242] hover:bg-[#133666] text-amber-300 font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

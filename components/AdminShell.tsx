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
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

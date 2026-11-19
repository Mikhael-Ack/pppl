'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAdmin, getAdminSession } from '@/services/admin.service';
import { Lock, User, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const existing = getAdminSession();
    if (existing) {
      router.replace('/admin/paket');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Data wajib diisi');
      return;
    }

    setLoading(true);
    const res = await loginAdmin(username, password);
    setLoading(false);

    if (res.success) {
      router.replace('/admin/paket');
    } else {
      setErrorMsg(res.error || 'Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07162c] via-[#0b2242] to-[#11315e] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Banner */}
        <div className="bg-[#0b2242] text-white p-6 text-center border-b border-[#163d73] space-y-2">
          <div className="w-11 h-11 rounded-xl bg-[#133666] border border-[#21579e] text-amber-300 font-serif font-bold text-xl flex items-center justify-center mx-auto">
            D
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-300 bg-[#133666] border border-[#21579e] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3 h-3" />
              <span>UI-06 &bull; Modul M1.1</span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Darunnisa Hajj &amp; Umrah
            </h1>
            <p className="text-xs text-blue-200/80">
              Dasbor Admin / Staf Operasional
            </p>
          </div>
        </div>

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 text-xs">
          <h2 className="text-base font-bold text-slate-900">Masuk</h2>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="username"
                className="w-full border border-slate-300 rounded-xl pl-8 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-blue-800 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Kata sandi
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full border border-slate-300 rounded-xl pl-8 pr-3 py-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-blue-800 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 disabled:bg-amber-200 text-slate-950 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            {loading ? 'Memverifikasi...' : 'Masuk'}
          </button>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-blue-800 font-semibold hover:underline"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Kembali ke Portal Publik</span>
            </Link>
            <span className="font-mono text-[10px] text-slate-400">
              Yayasan Darunnisa
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

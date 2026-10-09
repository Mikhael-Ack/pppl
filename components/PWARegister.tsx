'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWARegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.error('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // 2. Capture beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted the install prompt');
      setShowBanner(false);
    }
    setInstallPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-fadeIn">
      <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 font-bold flex items-center justify-center shrink-0">
        M
      </div>
      <div className="flex-1">
        <div className="text-xs font-bold text-white leading-tight">Install Aplikasi Umroh</div>
        <div className="text-[10px] text-slate-300 mt-0.5">Akses cepat jadwal &amp; tracking langsung di HP/Desktop.</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Install
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-slate-400 hover:text-white p-1 rounded-md"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

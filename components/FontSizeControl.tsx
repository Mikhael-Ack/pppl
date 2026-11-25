'use client';

import { useEffect, useState } from 'react';
import { Type } from 'lucide-react';

type FontScale = 'normal' | 'large' | 'xlarge';

const FONT_SIZE_KEY = 'darunnisa_font_scale';

interface FontSizeControlProps {
  variant?: 'dark' | 'light';
}

export default function FontSizeControl({
  variant = 'dark',
}: FontSizeControlProps) {
  const [scale, setScale] = useState<FontScale>('normal');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FONT_SIZE_KEY) as FontScale | null;
      if (saved === 'normal' || saved === 'large' || saved === 'xlarge') {
        setScale(saved);
        document.documentElement.dataset.fontSize = saved;
      } else {
        document.documentElement.dataset.fontSize = 'normal';
      }
    } catch {
      document.documentElement.dataset.fontSize = 'normal';
    }
  }, []);

  const applyScale = (next: FontScale) => {
    setScale(next);
    document.documentElement.dataset.fontSize = next;
    try {
      localStorage.setItem(FONT_SIZE_KEY, next);
    } catch {
      // Abaikan error storage
    }
  };

  const isDark = variant === 'dark';

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border px-1.5 py-1 text-[11px] ${
        isDark
          ? 'bg-[#133666] border-[#1f5296] text-blue-100'
          : 'bg-slate-100 border-slate-200 text-slate-700'
      }`}
      title="Atur Ukuran Huruf (Font Size)"
    >
      <Type className={`w-3 h-3 ml-1 ${isDark ? 'text-amber-300' : 'text-blue-800'}`} />
      <button
        type="button"
        onClick={() => applyScale('normal')}
        className={`px-1.5 py-0.5 rounded font-semibold cursor-pointer transition-colors ${
          scale === 'normal'
            ? 'bg-amber-400 text-slate-950'
            : isDark
            ? 'hover:bg-[#1a4785] text-blue-100'
            : 'hover:bg-slate-200 text-slate-700'
        }`}
        title="Ukuran Huruf Standar"
      >
        A
      </button>
      <button
        type="button"
        onClick={() => applyScale('large')}
        className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
          scale === 'large'
            ? 'bg-amber-400 text-slate-950'
            : isDark
            ? 'hover:bg-[#1a4785] text-blue-100'
            : 'hover:bg-slate-200 text-slate-700'
        }`}
        title="Ukuran Huruf Besar"
      >
        A+
      </button>
      <button
        type="button"
        onClick={() => applyScale('xlarge')}
        className={`px-1.5 py-0.5 rounded font-extrabold cursor-pointer transition-colors ${
          scale === 'xlarge'
            ? 'bg-amber-400 text-slate-950'
            : isDark
            ? 'hover:bg-[#1a4785] text-blue-100'
            : 'hover:bg-slate-200 text-slate-700'
        }`}
        title="Ukuran Huruf Ekstra Besar"
      >
        A++
      </button>
    </div>
  );
}

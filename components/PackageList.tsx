'use client';

import { useState } from 'react';
import { PaketItem } from '@/types/package.types';
import PackageCard from './PackageCard';
import { Search } from 'lucide-react';

interface PackageListProps {
  initialPackages: PaketItem[];
  onViewDetail?: (pkg: PaketItem) => void;
  onRegister?: (pkg: PaketItem) => void;
}

export default function PackageList({
  initialPackages,
  onViewDetail,
  onRegister,
}: PackageListProps) {
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPackages = initialPackages.filter((pkg) => {
    const matchProgram = selectedProgram === 'all' || pkg.program === selectedProgram;
    const matchSearch =
      searchQuery === '' ||
      pkg.nama_paket.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.maskapai.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.kode_paket.toLowerCase().includes(searchQuery.toLowerCase());

    return matchProgram && matchSearch;
  });

  return (
    <section id="jadwal" className="py-14 md:py-18 px-4 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Katalog Resmi (UI-01)
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Jadwal Paket Umrah &amp; Haji Khusus Darunnisa
          </h2>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Tersedia {filteredPackages.length} paket aktif
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Cari Paket / Hotel / Maskapai
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama paket, hotel, atau maskapai..."
                className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-emerald-800 transition-colors"
              />
            </div>
          </div>

          {/* Program Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Kategori Program
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-800 transition-colors"
            >
              <option value="all">Semua Program</option>
              <option value="umrah">Umrah (Reguler &amp; Plus)</option>
              <option value="haji_khusus">Haji Khusus (Plus)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Paket */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id_paket}
              pkg={pkg}
              onViewDetail={onViewDetail}
              onRegister={onRegister}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
          <div className="text-xs font-semibold text-slate-700">Tidak ada paket yang cocok dengan filter pencarian.</div>
          <button
            onClick={() => {
              setSelectedProgram('all');
              setSearchQuery('');
            }}
            className="text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
          >
            Reset filter pencarian
          </button>
        </div>
      )}
    </section>
  );
}

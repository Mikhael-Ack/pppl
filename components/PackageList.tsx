'use client';

import { useState } from 'react';
import { PackageItem } from '@/types/package.types';
import PackageCard from './PackageCard';
import { Filter, Search } from 'lucide-react';

interface PackageListProps {
  initialPackages: PackageItem[];
}

export default function PackageList({ initialPackages }: PackageListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPackages = initialPackages.filter((pkg) => {
    const matchCategory = selectedCategory === 'all' || pkg.category === selectedCategory;
    const matchCity = selectedCity === 'all' || pkg.departure_city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchSearch =
      searchQuery === '' ||
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.hotel_makkah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.airline.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchCity && matchSearch;
  });

  return (
    <section id="jadwal" className="py-14 md:py-18 px-4 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Katalog Keberangkatan
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Daftar Paket Umroh &amp; Haji Khusus
          </h2>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Tersedia {filteredPackages.length} pilihan paket
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cari Paket / Hotel / Maskapai</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Misal: Pullman, Garuda..."
                className="w-full text-xs border border-slate-200 rounded-lg pl-8 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-emerald-700 transition-colors"
              />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kategori Program</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-700 transition-colors"
            >
              <option value="all">Semua Kategori</option>
              <option value="reguler_vip">VIP Pelataran</option>
              <option value="ekonomis">Ekonomis</option>
              <option value="plus_wisata">Plus Wisata (Turki / Thaif)</option>
              <option value="haji_khusus">Haji Khusus Kemenag</option>
            </select>
          </div>

          {/* Kota Keberangkatan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kota Keberangkatan</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-emerald-700 transition-colors"
            >
              <option value="all">Semua Embarkasi</option>
              <option value="Jakarta">Jakarta (CGK)</option>
              <option value="Surabaya">Surabaya (SUB)</option>
              <option value="Makassar">Makassar (UPG)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Paket */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-2">
          <div className="text-xs font-semibold text-slate-700">Tidak ada paket yang cocok dengan filter.</div>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedCity('all');
              setSearchQuery('');
            }}
            className="text-xs text-emerald-800 font-semibold hover:underline"
          >
            Reset filter pencarian
          </button>
        </div>
      )}
    </section>
  );
}

'use client';

import { useState } from 'react';
import { PackageItem } from '@/types/package.types';
import PackageCard from './PackageCard';
import { Filter, Calendar, MapPin, Search } from 'lucide-react';

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
    <section id="jadwal" className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          Jadwal Resmi Musim 1448 H
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Katalog Paket Umroh &amp; Haji Khusus
        </h2>
        <p className="text-sm text-slate-500 max-w-2xl">
          Pilih jadwal keberangkatan dan jenis program sesuai kebutuhan ibadah Anda dan keluarga.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Filter Jadwal &amp; Keberangkatan</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Ditemukan {filteredPackages.length} Paket
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Filter Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Cari Paket / Hotel / Maskapai</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Contoh: Pullman, Garuda..."
                className="w-full text-xs border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 bg-white focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Filter Kategori */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kategori Program</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-emerald-600"
            >
              <option value="all">Semua Kategori</option>
              <option value="reguler_vip">Reguler VIP (Ring 1 Pelataran)</option>
              <option value="ekonomis">Ekonomis Berkah</option>
              <option value="plus_wisata">Plus Wisata (Turki / Thaif)</option>
              <option value="haji_khusus">Haji Khusus Kemenag</option>
            </select>
          </div>

          {/* Filter Kota Keberangkatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Kota Keberangkatan</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 bg-white focus:outline-emerald-600"
              >
                <option value="all">Semua Bandara</option>
                <option value="Jakarta">Jakarta (CGK)</option>
                <option value="Surabaya">Surabaya (SUB)</option>
                <option value="Makassar">Makassar (UPG)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Paket */}
      {filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Tidak ada paket yang sesuai dengan filter</h4>
          <p className="text-xs text-slate-500">Coba ubah opsi pencarian atau pilih kategori lain.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedCity('all');
              setSearchQuery('');
            }}
            className="text-xs text-emerald-800 font-bold hover:underline"
          >
            Reset Semua Filter
          </button>
        </div>
      )}
    </section>
  );
}

'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import PartnerMarquee from '@/components/PartnerMarquee';
import PackageList from '@/components/PackageList';
import MLMatcher from '@/components/MLMatcher';
import MLPriceCalculator from '@/components/MLPriceCalculator';
import TestimonialMarquee from '@/components/TestimonialMarquee';
import Footer from '@/components/Footer';
import { PackageItem } from '@/types/package.types';

interface HomePageClientProps {
  initialPackages: PackageItem[];
}

export default function HomePageClient({ initialPackages }: HomePageClientProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Section 1: Hero Banner (Dark Gradient) */}
        <Hero />

        {/* Section 2: Partner Marquee (Menyatu tanpa celah putih dengan Hero) */}
        <PartnerMarquee />

        {/* Section 3: Katalog Paket Dinamis */}
        <PackageList initialPackages={initialPackages} />

        {/* Section 4: Feature ML 1 - Smart Matcher */}
        <div className="bg-slate-100/90 border-y border-slate-200">
          <MLMatcher />
        </div>

        {/* Section 5: Feature ML 2 - Kalkulator Biaya */}
        <MLPriceCalculator />

        {/* Section 6: Marquee Testimoni 2 Jalur */}
        <TestimonialMarquee />
      </main>

      <Footer />
    </div>
  );
}

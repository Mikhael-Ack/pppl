'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminSession } from '@/services/admin.service';

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      router.replace('/admin/paket');
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-xs text-slate-500">
      Mengarahkan ke dasbor admin...
    </div>
  );
}

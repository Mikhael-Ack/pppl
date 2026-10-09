import HomePageClient from './HomePageClient';
import { getActivePackages } from '@/services/packages.service';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const packages = await getActivePackages();

  return <HomePageClient initialPackages={packages} />;
}

import { supabase } from '@/lib/supabase';
import { PackageItem } from '@/types/package.types';

export async function getActivePackages(): Promise<PackageItem[]> {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('departure_date', { ascending: true });

    if (error || !data) {
      console.error('[PackagesService] Error fetching packages:', error);
      return [];
    }

    return data as PackageItem[];
  } catch (error) {
    console.error('[PackagesService] Unexpected connection error:', error);
    return [];
  }
}

export async function getPackageBySlug(slug: string): Promise<PackageItem | null> {
  try {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return null;
    }

    return data as PackageItem;
  } catch {
    return null;
  }
}

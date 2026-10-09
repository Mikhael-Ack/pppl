import { PackageItem } from './package.types';

export interface BookingItem {
  id: string;
  booking_code: string;
  package_id?: string;
  full_name: string;
  phone_number: string;
  email?: string;
  room_type: string;
  total_persons: number;
  current_step: number;
  payment_status: 'dp_unpaid' | 'dp_paid' | 'fully_paid';
  shipping_receipt_no?: string;
  manasik_date?: string;
  created_at?: string;
  packages?: PackageItem;
}

export interface TrackingStep {
  step: number;
  title: string;
  desc: string;
}

import TrackingPageClient from './TrackingPageClient';

export const metadata = {
  title: 'Tracking Status Keberangkatan Jemaah | Mitra Umroh Mandiri',
  description: 'Layanan pelacakan mandiri status visa, tiket, dan perlengkapan koper jemaah umroh.',
};

export default function Page() {
  return <TrackingPageClient />;
}

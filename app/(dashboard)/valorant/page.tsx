import { Metadata } from 'next';
import ValorantMatches from '@/components/valorant/ValorantMatches';

export const metadata: Metadata = {
  title: 'Valorant Matches',
  description: 'Live and upcoming Valorant matches',
};

export default function ValorantPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Valorant Matches</h1>
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <ValorantMatches />
        </div>
      </div>
    </div>
  );
}

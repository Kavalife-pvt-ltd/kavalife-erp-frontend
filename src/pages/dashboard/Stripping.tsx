import { useNavigate } from 'react-router-dom';
import { StrippingCard } from '@/components/ui/StrippingCard';

export interface StrippingTask {
  id: number;
  productName: string;
  batchNo: string;
  date: string; // ISO format
  operator: string;
  status: 'in-progress' | 'completed';
}

export default function StrippingPage() {
  const navigate = useNavigate();

  // TODO: Replace with API fetch
  const dummyLogs: StrippingTask[] = [
    {
      id: 1,
      productName: 'Paprika Crude',
      batchNo: 'KPC248',
      date: '2025-04-26',
      operator: 'Nizam',
      status: 'completed',
    },
    {
      id: 2,
      productName: 'Paprika Crude',
      batchNo: 'KPC249',
      date: '2025-04-27',
      operator: 'Sujan',
      status: 'in-progress',
    },
  ];

  return (
    <section className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stripping Logs</h1>
        <button
          onClick={() => navigate('/stripping/form')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate new Stripping Log
        </button>
      </div>

      <div className="space-y-4">
        {dummyLogs.map((log) => (
          <div
            key={log.id}
            className="cursor-pointer"
            onClick={() => navigate(`/stripping/form?id=${log.id}`)}
          >
            <StrippingCard {...log} />
          </div>
        ))}
      </div>
    </section>
  );
}

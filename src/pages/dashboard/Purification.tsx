import { useNavigate } from 'react-router-dom';
import { PurificationCard } from '@/components/ui/PurificationCard';

export interface PurificationTask {
  id: number;
  batchNo: string;
  date: string;
  solvent: string;
  operator: string;
  status: 'in-progress' | 'completed';
}

export default function PurificationPage() {
  const navigate = useNavigate();

  const dummyLogs: PurificationTask[] = [
    {
      id: 1,
      batchNo: 'KPP243',
      date: '2025-07-03',
      solvent: 'DIPA',
      operator: 'Pawan',
      status: 'completed',
    },
    {
      id: 2,
      batchNo: 'KPP244',
      date: '2025-07-05',
      solvent: 'IPA',
      operator: 'Sujan',
      status: 'in-progress',
    },
  ];

  return (
    <section className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purification Logs</h1>
        <button
          onClick={() => navigate('/purification/form')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate new Purification Log
        </button>
      </div>

      <div className="space-y-4">
        {dummyLogs.map((log) => (
          <div
            key={log.id}
            className="cursor-pointer"
            onClick={() => navigate(`/purification/form?id=${log.id}`)}
          >
            <PurificationCard {...log} />
          </div>
        ))}
      </div>
    </section>
  );
}

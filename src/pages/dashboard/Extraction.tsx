import { useNavigate } from 'react-router-dom';
import { ExtractionCard } from '@/components/ui/ExtractionCard';

export interface ExtractionTask {
  id: number;
  grnNo: string;
  date: string; // ISO date string
  solvent: string;
  operator: string;
  status: 'in-progress' | 'completed';
}

export default function ExtractionPage() {
  const navigate = useNavigate();
  // undefined = modal closed
  // null      = “create new” mode
  // ExtractionTask = “view/edit existing” mode

  // TODO: replace with real fetch
  const dummyLogs: ExtractionTask[] = [
    {
      id: 1,
      grnNo: 'GRN-236',
      date: '2025-04-25',
      solvent: 'KLPD1 EXT004',
      operator: 'Sujan',
      status: 'completed',
    },
    {
      id: 2,
      grnNo: 'GRN-237',
      date: '2025-04-26',
      solvent: 'KLPD1 EXT005',
      operator: 'Amit',
      status: 'in-progress',
    },
  ];

  return (
    <section className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Extraction Logs</h1>
        <button
          onClick={() => navigate('/extraction/form')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate new Extraction Log
        </button>
      </div>

      <div className="space-y-4">
        {dummyLogs.map((log) => (
          <div
            key={log.id}
            className="cursor-pointer"
            onClick={() => navigate(`/extraction/form?id=${log.id}`)}
          >
            <ExtractionCard {...log} />
          </div>
        ))}
      </div>
    </section>
  );
}

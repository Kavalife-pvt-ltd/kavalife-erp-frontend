import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PurificationForm } from '@/components/forms/PurificationForm';
import { PurificationTask } from '@/pages/dashboard/Purification';

export default function PurificationFormPage() {
  const [params] = useSearchParams();
  const id = params.get('id');

  const [purificationData, setPurificationData] = useState<PurificationTask | null | undefined>(
    undefined
  );

  useEffect(() => {
    if (!id) {
      setPurificationData(null);
    } else {
      // Fetch existing data
      fetch(`/api/purification/${id}`)
        .then((res) => res.json())
        .then((data) => setPurificationData(data))
        .catch((err) => {
          console.error('Failed to fetch purification log', err);
          setPurificationData(null); // fallback to create mode
        });
    }
  }, [id]);

  return (
    <section className="p-6">
      {purificationData !== undefined && <PurificationForm existingTask={purificationData} />}
    </section>
  );
}

import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { StrippingForm } from '@/components/forms/StrippingForm';
import { StrippingTask } from '@/pages/dashboard/Stripping';

export default function StrippingFormPage() {
  const [params] = useSearchParams();
  const id = params.get('id');

  const [strippingData, setStrippingData] = useState<StrippingTask | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setStrippingData(null); // Create mode
    } else {
      fetch(`/api/stripping/${id}`)
        .then((res) => res.json())
        .then((data) => setStrippingData(data))
        .catch((err) => {
          console.error('Failed to fetch stripping log', err);
          setStrippingData(null); // fallback to create mode
        });
    }
  }, [id]);

  return (
    <section className="p-6">
      {strippingData !== undefined && <StrippingForm existingLog={strippingData} />}
    </section>
  );
}

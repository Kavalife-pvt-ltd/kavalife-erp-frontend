import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ExtractionForm } from '@/components/forms/ExtractionForm';
import { ExtractionTask } from '@/pages/dashboard/Extraction';

export default function ExtractionFormPage() {
  const [params] = useSearchParams();
  const id = params.get('id');

  const [extractionData, setExtractionData] = useState<ExtractionTask | null | undefined>(
    undefined
  );

  useEffect(() => {
    if (!id) {
      setExtractionData(null); // Create mode
    } else {
      // Fetch existing data
      fetch(`/api/extraction/${id}`)
        .then((res) => res.json())
        .then((data) => setExtractionData(data))
        .catch((err) => {
          console.error('Failed to fetch extraction', err);
          setExtractionData(null); // fallback to create mode
        });
    }
  }, [id]);

  return (
    <section className="p-6">
      {extractionData !== undefined && <ExtractionForm existingTask={extractionData} />}
    </section>
  );
}

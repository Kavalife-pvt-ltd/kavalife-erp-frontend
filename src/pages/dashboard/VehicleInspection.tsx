// pages/dashboard/VehicleInspection.tsx
import { useState } from 'react';
import { VIRFormModal } from '@/components/forms/VIRFormModal';
import { VIRCard } from '@/components/ui/VIRCard';

export const VehicleInspection = () => {
  const [formOpen, setFormOpen] = useState(false);

  // Dummy VIR data for now
  const dummyVirList = [
    {
      id: 1,
      createdAt: '2024-05-01',
      vendor: 'ABC Ltd.',
      product: 'Chilli Powder',
      status: 'pending',
      remarks: 'Inspection required before approval',
      doneBy: 'John Doe',
      checkedBy: 'Jane Smith',
      imageUrl: 'https://kavalife.in/wp-content/uploads/2024/07/Capsicum-Oleoresin-1.png.png',
    },
    {
      id: 2,
      createdAt: '2024-05-04',
      vendor: 'XYZ Enterprises',
      product: 'Wheat Flour',
      status: 'in-progress',
      remarks: 'Inspection required before approval',
      doneBy: 'John Doe',
      checkedBy: 'Jane Smith',
      imageUrl: 'https://kavalife.in/wp-content/uploads/2024/05/img03.png',
    },
  ] as const;

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vehicle Inspection Reports</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate new VIR
        </button>
      </div>

      {formOpen && <VIRFormModal onClose={() => setFormOpen(false)} />}

      <div className="space-y-4">
        {dummyVirList.map((vir) => (
          <VIRCard key={vir.id} {...vir} />
        ))}
      </div>
    </section>
  );
};

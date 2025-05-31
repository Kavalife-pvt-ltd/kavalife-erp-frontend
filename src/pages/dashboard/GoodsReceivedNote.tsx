// pages/dashboard/GoodsReceivedNote.tsx
import { useState } from 'react';
import { GRNFormModal } from '@/components/forms/GRNFormModal';
import { GRNCard } from '@/components/ui/GRNCard';

export const GoodsReceivedNote = () => {
  const [formOpen, setFormOpen] = useState(false);

  // Dummy GRN data for now
  const dummyGrnList = [
    {
      id: 101,
      createdAt: '2024-05-10',
      vendor: 'ABC Ltd.',
      product: 'Chilli Powder',
      status: 'pending',
      quantity: 100,
      containerQuantity: 10,
      batchNo: 5678,
      invoice: 2323,
      invoiceDate: '2024-05-09',
      invoiceImg:
        'https://fastly.picsum.photos/id/237/200/300.jpg?hmac=TmmQSbShHz9CdQm0NkEjx1Dyh_Y984R9LpNrpvH2D_U',
      doneBy: 'John Doe',
      checkedBy: 'Jane Smith',
    },
    {
      id: 102,
      createdAt: '2024-05-12',
      vendor: 'XYZ Enterprises',
      product: 'Wheat Flour',
      status: 'in-progress',
      quantity: 200,
      containerQuantity: 20,
      batchNo: 4321,
      invoice: 4455,
      invoiceDate: '2024-05-11',
      invoiceImg:
        'https://fastly.picsum.photos/id/866/200/300.jpg?hmac=rcadCENKh4rD6MAp6V_ma-AyWv641M4iiOpe1RyFHeI',
      doneBy: 'Alice',
      checkedBy: 'Bob',
    },
  ] as const;

  return (
    <section className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Goods Received Notes</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate new GRN
        </button>
      </div>

      {formOpen && <GRNFormModal onClose={() => setFormOpen(false)} />}

      <div className="space-y-4">
        {dummyGrnList.map((grn) => (
          <GRNCard key={grn.id} {...grn} />
        ))}
      </div>
    </section>
  );
};

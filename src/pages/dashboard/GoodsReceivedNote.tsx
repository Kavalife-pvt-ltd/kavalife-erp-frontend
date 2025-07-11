// src/pages/dashboard/GoodsReceivedNote.tsx
import { useState } from 'react';
import type { GRN } from '@/types/grn';
import { GRNCard } from '@/components/ui/GRNCard';
import { GRNFormModal } from '@/components/forms/GRNFormModal';
import { QAQCModal } from '@/components/forms/QAQCModal';

type ModalType = 'create' | 'edit' | 'qaqc' | null;

export const GoodsReceivedNote = () => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [activeGRN, setActiveGRN] = useState<GRN | null>(null);

  // === dummy data ===
  const grns: GRN[] = [
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
      packagingStatus: 'packed',
      doneBy: 'John Doe',
      checkedBy: 'Jane Smith',
      qaqc: undefined,
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
      packagingStatus: 'loose',
      doneBy: 'Alice',
      checkedBy: 'Bob',
      qaqc: undefined,
    },
  ];

  const openCreate = () => {
    setActiveGRN(null);
    setModalType('create');
  };
  const openEdit = (grn: GRN) => {
    setActiveGRN(grn);
    setModalType('edit');
  };
  const openQAQC = (grn: GRN) => {
    setActiveGRN(grn);
    setModalType('qaqc');
  };
  const closeAll = () => {
    setActiveGRN(null);
    setModalType(null);
  };

  return (
    <section className="space-y-6 p-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Goods Received Notes</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate new GRN
        </button>
      </header>

      <div className="space-y-4">
        {grns.map((g) => (
          <GRNCard key={g.id} grn={g} onClick={() => openEdit(g)} onQAQCClick={() => openQAQC(g)} />
        ))}
      </div>

      {/* modals */}
      {modalType === 'create' && <GRNFormModal onClose={closeAll} />}
      {modalType === 'edit' && activeGRN && (
        <GRNFormModal grnToEdit={activeGRN} onClose={closeAll} />
      )}
      {modalType === 'qaqc' && activeGRN && (
        <QAQCModal grnId={activeGRN.id} existingData={activeGRN.qaqc} onClose={closeAll} />
      )}
    </section>
  );
};

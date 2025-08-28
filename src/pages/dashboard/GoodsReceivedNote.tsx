// src/pages/dashboard/GoodsReceivedNote.tsx
import { useState, useEffect } from 'react';
import type { GRN } from '@/types/grn';
import { GRNCard } from '@/components/ui/GRNCard';
import { GRNFormModal } from '@/components/forms/GRNFormModal';
import { QAQCModal } from '@/components/forms/QAQCModal';
import { fetchGRNs } from '@/api/grn';

type ModalType = 'create' | 'edit' | 'qaqc' | null;

export const GoodsReceivedNote = () => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [grnData, setGrnData] = useState<GRN | null>(null);
  const [grns, setGRNs] = useState<GRN[]>([]);

  useEffect(() => {
    console.log('Fetching GRNs...');

    fetchGRNs()
      .then(setGRNs)
      .catch((err: unknown) => {
        console.error('Failed to fetch GRNs', err);
      });
  }, []);

  const openCreate = () => {
    setGrnData(null);
    setModalType('create');
  };
  const openEdit = (grn: GRN) => {
    setGrnData(grn);
    setModalType('edit');
  };
  const openQAQC = (grn: GRN) => {
    console.log('===============', grn);
    setGrnData(grn);
    setModalType('qaqc');
  };
  const closeAll = () => {
    setGrnData(null);
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
          <GRNCard
            key={g.id}
            grn={g}
            onClick={() => openEdit(g)}
            onQAQCClick={(type) => {
              if (type === 'qaqc') openQAQC(g);
              else if (type === 'create') openCreate();
            }}
          />
        ))}
      </div>

      {modalType === 'create' && <GRNFormModal onClose={closeAll} />}
      {modalType === 'edit' && grnData && <GRNFormModal grnData={grnData} onClose={closeAll} />}
      {modalType === 'qaqc' && grnData && (
        <QAQCModal
          grnId={grnData.id}
          grnNumber={grnData.grn_number}
          mode={grnData.qaqcStatus === 'not_created' ? 'create' : 'view'}
          onClose={closeAll}
        />
      )}
    </section>
  );
};

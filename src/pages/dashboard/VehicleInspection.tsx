// src/pages/dashboard/VehicleInspection.tsx
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VIRFormModal } from '@/components/forms/VIRFormModal';
import { VIRCard } from '@/components/ui/VIRCard';
import { getAllVIRs } from '@/api/vir';
import type { VIR } from '@/types/vir';

export const VehicleInspection = () => {
  // undefined = modal closed; null = create; VIR = verify/view
  const [selectedVir, setSelectedVir] = useState<VIR | null | undefined>(undefined);
  const [virList, setVirList] = useState<VIR[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // load all VIRs once
  useEffect(() => {
    (async () => {
      const list = await getAllVIRs();
      setVirList(list);
    })();
  }, []);

  // derive lookup maps for fast find (by id or vir_number)
  const byId = useMemo(() => {
    const m = new Map<number, VIR>();
    virList.forEach((v) => m.set(v.id, v));
    return m;
  }, [virList]);

  const byNumber = useMemo(() => {
    const m = new Map<string, VIR>();
    virList.forEach((v) => m.set(v.vir_number, v));
    return m;
  }, [virList]);

  // open modal from URL, but only after list is loaded
  useEffect(() => {
    if (!virList.length) return;

    const virnum = searchParams.get('vir'); // preferred: vir_number (e.g., VIR-072025-001)
    const virid = searchParams.get('virid'); // legacy: numeric id

    let match: VIR | undefined;
    if (virnum) match = byNumber.get(virnum);
    else if (virid) match = byId.get(Number(virid));

    if (match) setSelectedVir(match);
    else setSelectedVir(undefined); // silently no-op if not found in current list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [virList, searchParams]);

  const toCardProps = (vir: VIR) => ({
    id: vir.id,
    vir_number: vir.vir_number,
    vendorId: vir.vendor_name ?? String(vir.vendor_id ?? ''),
    productId: vir.product_name ?? String(vir.product_id ?? ''),
    status: vir.checked_by ? 'verified' : 'pending verification',
    remarks: vir.remarks,
    imageUrl: undefined,
    checklist: vir.checklist,
    createdAt: vir.created_at,
    verifiedBy: typeof vir.checked_by === 'number' ? String(vir.checked_by) : undefined,
    verifiedAt: vir.checked_at,
  });

  const openCreate = () => {
    setSelectedVir(null);
    // set a clean URL (no selection)
    if (searchParams.get('vir') || searchParams.get('virid')) {
      const next = new URLSearchParams(searchParams);
      next.delete('vir');
      next.delete('virid');
      setSearchParams(next, { replace: true });
    }
  };

  const openFromClick = (vir: VIR) => {
    setSelectedVir(vir); // instant open
    const next = new URLSearchParams(searchParams);
    // prefer vir_number for shareable links
    next.set('vir', vir.vir_number);
    next.delete('virid');
    setSearchParams(next, { replace: false });
  };

  const closeModal = () => {
    setSelectedVir(undefined);
    const next = new URLSearchParams(searchParams);
    next.delete('vir');
    next.delete('virid');
    setSearchParams(next, { replace: true });
  };

  return (
    <section className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Vehicle Inspection Reports</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate new VIR
        </button>
      </div>

      {selectedVir !== undefined && (
        <VIRFormModal onClose={closeModal} virData={selectedVir || undefined} />
      )}

      <div className="space-y-4">
        {virList.map((vir) => (
          <div key={vir.id} className="cursor-pointer" onClick={() => openFromClick(vir)}>
            <VIRCard {...toCardProps(vir)} />
          </div>
        ))}
      </div>
    </section>
  );
};

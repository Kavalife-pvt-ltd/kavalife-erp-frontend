// src/pages/dashboard/SalesMyPOsView.tsx
import React from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { listSalesPO } from '@/api/sales';
// import { useAuthContext } from '@/hooks/useAuthContext';
// import { SalesPOCard } from '@/components/ui/SalesPOCard';

const SalesMyPOsView: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">My POs</h2>
        {/* TODO: filters, search */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* TODO: map over my POs and render <SalesPOCard /> */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          My POs card list goes here.
        </div>
      </div>
    </div>
  );
};

export default SalesMyPOsView;

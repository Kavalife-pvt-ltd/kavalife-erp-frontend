// src/pages/dashboard/SalesProductionQueueView.tsx
import React from 'react';

const SalesProductionQueueView: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Production Queue</h2>
        <p className="text-sm text-slate-500">
          POs routed to production, with masked client identity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* TODO: use <SalesPOCard maskedClient /> */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          Production queue POs card list goes here.
        </div>
      </div>
    </div>
  );
};

export default SalesProductionQueueView;

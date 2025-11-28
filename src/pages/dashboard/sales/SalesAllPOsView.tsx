// src/pages/dashboard/SalesAllPOsView.tsx
import React from 'react';

const SalesAllPOsView: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">All POs</h2>
        {/* TODO: filters, export CSV, etc. */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* TODO: list all POs as cards */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          All POs card list goes here.
        </div>
      </div>
    </div>
  );
};

export default SalesAllPOsView;

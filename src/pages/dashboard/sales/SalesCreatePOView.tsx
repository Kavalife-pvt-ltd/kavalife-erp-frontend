// src/pages/dashboard/SalesCreatePOView.tsx
import React from 'react';

const SalesCreatePOView: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Create Sales PO</h2>
        <p className="text-sm text-slate-500">
          Fill in client and product details to create a new sales PO.
        </p>
      </div>

      {/* TODO: replace with actual form component */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        Sales PO form goes here.
      </div>
    </div>
  );
};

export default SalesCreatePOView;

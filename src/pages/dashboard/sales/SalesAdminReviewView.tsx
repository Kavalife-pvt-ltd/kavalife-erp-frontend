// src/pages/dashboard/SalesAdminReviewView.tsx
import React from 'react';

const SalesAdminReviewView: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Admin Review</h2>
        {/* TODO: filters, status chips, etc. */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* TODO: list POs that need admin attention */}
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          Admin review POs card list goes here.
        </div>
      </div>
    </div>
  );
};

export default SalesAdminReviewView;

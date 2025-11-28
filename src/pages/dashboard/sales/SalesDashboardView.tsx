// src/pages/dashboard/SalesDashboardView.tsx
import React from 'react';

const SalesDashboardView: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-900">Sales Dashboard</h2>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total POs (This Month)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">–</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Pending Admin Approval</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">–</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Under Purchase</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">–</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Under Production</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">–</p>
        </div>
      </div>

      {/* TODO: charts / recent activity cards */}
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        Charts and recent activity will go here.
      </div>
    </div>
  );
};

export default SalesDashboardView;

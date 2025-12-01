// src/pages/dashboard/sales/Sales.tsx
import React, { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuthContext';

import SalesCreatePOView from './SalesCreatePOView';
import SalesMyPOsView from './SalesMyPOsView';
import SalesAdminReviewView from './SalesAdminReviewView';
import SalesPurchaseQueueView from './SalesPurchaseQueueView';
import SalesProductionQueueView from './SalesProductionQueueView';
import SalesAllPOsView from './SalesAllPOsView';
import SalesDashboardView from './SalesDashboardView';

type Role = 'admin' | 'sales' | 'purchase' | 'production';

type SalesTabId =
  | 'create'
  | 'my-pos'
  | 'admin-review'
  | 'purchase-queue'
  | 'production-queue'
  | 'all-pos'
  | 'dashboard';

interface SalesTabConfig {
  id: SalesTabId;
  label: string;
  roles: Role[];
}

const SALES_TABS: SalesTabConfig[] = [
  { id: 'create', label: 'Create PO', roles: ['sales', 'admin'] },
  { id: 'my-pos', label: 'My POs', roles: ['sales', 'admin'] },
  { id: 'admin-review', label: 'Admin Review', roles: ['admin'] },
  { id: 'purchase-queue', label: 'Purchase Queue', roles: ['admin', 'purchase'] },
  { id: 'production-queue', label: 'Production Queue', roles: ['admin', 'production'] },
  { id: 'all-pos', label: 'All POs', roles: ['admin'] },
  { id: 'dashboard', label: 'Sales Dashboard', roles: ['admin'] },
];

const SalesPage: React.FC = () => {
  const { authUser } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const role: Role = (authUser?.role as Role) || 'sales';

  const availableTabs = useMemo(() => SALES_TABS.filter((t) => t.roles.includes(role)), [role]);

  // If no tabs at all (shouldn't happen, but just in case)
  if (availableTabs.length === 0) {
    return <div className="text-sm text-slate-500">No sales views available for your role.</div>;
  }

  const rawView = searchParams.get('view') as SalesTabId | null;

  // If URL has ?view=create and the role can access it, use it.
  // Otherwise, fall back to first available tab for this role.
  const activeTab: SalesTabId =
    rawView && availableTabs.some((t) => t.id === rawView) ? rawView : availableTabs[0].id;

  const handleTabClick = (id: SalesTabId) => {
    const params = new URLSearchParams(location.search);
    params.set('view', id);
    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'create':
        return <SalesCreatePOView />;
      case 'my-pos':
        return <SalesMyPOsView />;
      case 'admin-review':
        return <SalesAdminReviewView />;
      case 'purchase-queue':
        return <SalesPurchaseQueueView />;
      case 'production-queue':
        return <SalesProductionQueueView />;
      case 'all-pos':
        return <SalesAllPOsView />;
      case 'dashboard':
        return <SalesDashboardView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sales</h1>
          <p className="text-sm text-slate-500">
            Manage sales POs, approvals, and routing to purchase/production.
          </p>
        </div>
      </header>

      {/* Internal tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`rounded-full px-4 py-1 text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-auto pb-4">{renderActiveTab()}</main>
    </div>
  );
};

export default SalesPage;

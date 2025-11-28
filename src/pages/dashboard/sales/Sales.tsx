// src/pages/dashboard/sales/Sales.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuthContext';

import SalesCreatePOView from './SalesCreatePOView';
import SalesMyPOsView from './SalesMyPOsView';
import SalesAdminReviewView from './SalesAdminReviewView';
import SalesPurchaseQueueView from './SalesPurchaseQueueView';
import SalesProductionQueueView from './SalesProductionQueueView';
import SalesAllPOsView from './SalesAllPOsView';
import SalesDashboardView from './SalesDashboardView';

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
  roles: Array<'admin' | 'sales' | 'purchase' | 'production'>;
}

const SALES_TABS: SalesTabConfig[] = [
  { id: 'create', label: 'Create PO', roles: ['sales'] },
  { id: 'my-pos', label: 'My POs', roles: ['sales', 'admin'] },
  { id: 'admin-review', label: 'Admin Review', roles: ['admin'] },
  { id: 'purchase-queue', label: 'Purchase Queue', roles: ['admin', 'purchase'] },
  { id: 'production-queue', label: 'Production Queue', roles: ['admin', 'production'] },
  { id: 'all-pos', label: 'All POs', roles: ['admin'] },
  { id: 'dashboard', label: 'Sales Dashboard', roles: ['admin'] },
];

const SalesPage: React.FC = () => {
  const { authUser } = useAuthContext();
  const role = (authUser?.role || 'sales') as 'admin' | 'sales' | 'purchase' | 'production';

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const availableTabs = useMemo(() => SALES_TABS.filter((t) => t.roles.includes(role)), [role]);

  const defaultTab: SalesTabId = availableTabs[0]?.id ?? 'my-pos';

  const [activeTab, setActiveTab] = useState<SalesTabId>(defaultTab);

  // Sync from URL -> state
  useEffect(() => {
    const viewParam = searchParams.get('view') as SalesTabId | null;
    if (viewParam && availableTabs.some((t) => t.id === viewParam)) {
      setActiveTab(viewParam);
    } else {
      // If invalid view in URL, normalize it to default for this role
      if (availableTabs.length > 0) {
        const params = new URLSearchParams(location.search);
        params.set('view', defaultTab);
        navigate(
          {
            pathname: location.pathname,
            search: params.toString(),
          },
          { replace: true }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, availableTabs.length]);

  const handleTabClick = (id: SalesTabId) => {
    setActiveTab(id);

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

import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuthContext';

import SalesCreatePOView from './SalesCreatePOView';
import SalesMyPOsView from './SalesMyPOsView';
import SalesAdminReviewView from './SalesAdminReviewView';
import SalesPurchaseQueueView from './SalesPurchaseQueueView';
import SalesProductionQueueView from './SalesProductionQueueView';
import SalesAllPOsView from './SalesAllPOsView';
import SalesDashboardView from './SalesDashboardView';

type EffectiveRole = 'admin' | 'sales' | 'purchase' | 'production';

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
  roles: EffectiveRole[];
}

const SALES_TABS: SalesTabConfig[] = [
  // Sales team + admin
  { id: 'create', label: 'Create PO', roles: ['sales', 'admin'] },
  { id: 'my-pos', label: 'My POs', roles: ['sales', 'admin'] },

  // Admin only
  { id: 'admin-review', label: 'Admin Review', roles: ['admin'] },
  { id: 'all-pos', label: 'All POs', roles: ['admin'] },
  { id: 'dashboard', label: 'Sales Dashboard', roles: ['admin'] },

  // Queues for specific departments + admin
  { id: 'purchase-queue', label: 'Purchase Queue', roles: ['admin', 'purchase'] },
  { id: 'production-queue', label: 'Production Queue', roles: ['admin', 'production'] },
];

// default view per effective role
const DEFAULT_VIEW: Record<EffectiveRole, SalesTabId> = {
  admin: 'dashboard',
  sales: 'create',
  purchase: 'purchase-queue',
  production: 'production-queue',
};

const SalesPage: React.FC = () => {
  const { authUser } = useAuthContext() as {
    authUser?: { role?: string; department?: string };
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // ── 1) Compute effective role (unconditional, no early return) ──
  const appRole = authUser?.role ?? 'user';
  const department = authUser?.department ?? '';

  let effectiveRole: EffectiveRole;
  if (appRole === 'admin') {
    effectiveRole = 'admin';
  } else if (department === 'sales') {
    effectiveRole = 'sales';
  } else if (department === 'purchase') {
    effectiveRole = 'purchase';
  } else if (department === 'production') {
    effectiveRole = 'production';
  } else {
    // fallback – you can tighten this later
    effectiveRole = 'sales';
  }

  // ── 2) Tabs allowed for this role ─────────────────────────────
  const availableTabs = useMemo(
    () => SALES_TABS.filter((t) => t.roles.includes(effectiveRole)),
    [effectiveRole]
  );

  const requestedViewParam = searchParams.get('view') as SalesTabId | null;

  const isAllowedView = (view: SalesTabId) => availableTabs.some((t) => t.id === view);

  const defaultView = DEFAULT_VIEW[effectiveRole];

  let activeView: SalesTabId = defaultView;
  if (requestedViewParam && isAllowedView(requestedViewParam)) {
    activeView = requestedViewParam;
  }

  // ── 3) Normalize URL (?view) if needed ────────────────────────
  useEffect(() => {
    if (!requestedViewParam || !isAllowedView(requestedViewParam)) {
      const params = new URLSearchParams(location.search);
      params.set('view', defaultView);
      navigate(
        {
          pathname: location.pathname,
          search: params.toString(),
        },
        { replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedViewParam, defaultView, location.pathname]);

  // ── 4) Decide what to render ──────────────────────────────────
  const renderActiveView = () => {
    switch (activeView) {
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

  // If user is not logged in, show a guard message *inside* the component,
  // but AFTER all hooks have been called.
  if (!authUser) {
    return (
      <div className="p-4 text-sm text-red-600">
        You are not logged in. Please log in again to access the Sales module.
      </div>
    );
  }

  if (availableTabs.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500">
        No sales views available for your role/department.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Sales</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage sales POs, approvals, and routing to purchase/production.
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-4">{renderActiveView()}</main>
    </div>
  );
};

export default SalesPage;

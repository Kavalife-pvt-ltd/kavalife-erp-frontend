// src/pages/dashboard/sales/Sales.tsx
import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuthContext';

import SalesCreateInquiryView from './SalesCreateInquiryView';
import SalesMyInquiriesView from './SalesMyInquiriesView';
import SalesAdminReviewView from './SalesAdminReviewView';
import SalesAdminFinalReviewView from './SalesAdminFinalReviewView';
import SalesPurchaseQueueView from './SalesPurchaseQueueView';
import SalesProductionQueueView from './SalesProductionQueueView';
import SalesDashboardView from './SalesDashboardView';
import SalesAllPOsView from './SalesAllPOsView'; // ✅ ADD (your file exists)

type EffectiveRole = 'admin' | 'sales' | 'purchase' | 'production';

export type SalesViewId =
  | 'create-inquiry'
  | 'my-inquiries'
  | 'my-pos'
  | 'all-pos' // ✅ ADD
  | 'admin-review'
  | 'final-review'
  | 'purchase-queue'
  | 'production-queue'
  | 'dashboard';

interface ViewConfig {
  id: SalesViewId;
  roles: EffectiveRole[];
}

const SALES_VIEWS: ViewConfig[] = [
  // sales + admin
  { id: 'create-inquiry', roles: ['sales', 'admin'] },
  { id: 'my-inquiries', roles: ['sales', 'admin'] },
  { id: 'my-pos', roles: ['sales', 'admin'] },

  // admin only
  { id: 'admin-review', roles: ['admin'] },
  { id: 'final-review', roles: ['admin'] },
  { id: 'dashboard', roles: ['admin'] },
  { id: 'all-pos', roles: ['admin'] }, // ✅ ADD

  // queues
  { id: 'purchase-queue', roles: ['purchase', 'admin'] },
  { id: 'production-queue', roles: ['production', 'admin'] },
];

const DEFAULT_VIEW: Record<EffectiveRole, SalesViewId> = {
  admin: 'dashboard',
  sales: 'create-inquiry',
  purchase: 'purchase-queue',
  production: 'production-queue',
};

// ✅ Old URL compatibility → new URL (EXPAND THIS)
const LEGACY_VIEW_MAP: Record<string, SalesViewId> = {
  // sidebar old values
  create: 'create-inquiry',
  'create-po': 'create-inquiry',
  'create-inquiry': 'create-inquiry',

  'my-inquiries': 'my-inquiries',
  'my-pos': 'my-pos',

  'all-pos': 'all-pos',

  admin: 'admin-review',
  'admin-review': 'admin-review',
  'final-review': 'final-review',
  dashboard: 'dashboard',

  'purchase-queue': 'purchase-queue',
  'production-queue': 'production-queue',
};

const SalesPage: React.FC = () => {
  const { authUser } = useAuthContext() as { authUser?: { role?: string; department?: string } };

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const appRole = authUser?.role ?? 'user';
  const department = authUser?.department ?? '';

  let effectiveRole: EffectiveRole;
  if (appRole === 'admin') effectiveRole = 'admin';
  else if (department === 'sales') effectiveRole = 'sales';
  else if (department === 'purchase') effectiveRole = 'purchase';
  else if (department === 'production') effectiveRole = 'production';
  else effectiveRole = 'sales';

  const availableViews = useMemo(
    () => SALES_VIEWS.filter((v) => v.roles.includes(effectiveRole)),
    [effectiveRole]
  );

  const isAllowed = (view: SalesViewId) => availableViews.some((v) => v.id === view);

  const rawView = searchParams.get('view') ?? undefined;
  const mappedView = rawView ? LEGACY_VIEW_MAP[rawView] : undefined;
  const defaultView = DEFAULT_VIEW[effectiveRole];

  const activeView: SalesViewId = mappedView && isAllowed(mappedView) ? mappedView : defaultView;

  // ✅ Normalize URL (include location.search/rawView so it updates correctly)
  useEffect(() => {
    const canonical = activeView;
    const current = rawView ? (LEGACY_VIEW_MAP[rawView] ?? rawView) : null;

    if (current !== canonical) {
      const params = new URLSearchParams(location.search);
      params.set('view', canonical);
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, location.pathname, location.search, rawView]);

  if (!authUser) {
    return (
      <div className="p-4 text-sm text-red-600">
        You are not logged in. Please log in again to access the Sales module.
      </div>
    );
  }

  if (availableViews.length === 0) {
    return (
      <div className="p-4 text-sm text-slate-500">
        No sales views available for your role/department.
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'create-inquiry':
        return <SalesCreateInquiryView />;

      case 'my-inquiries':
        return <SalesMyInquiriesView />;

      case 'my-pos':
        // ✅ TEMP: if you don’t have a dedicated MyPOs page yet, don’t render null.
        // Later you can swap this to <SalesMyPOsView />
        return <SalesMyInquiriesView />;

      case 'all-pos':
        return <SalesAllPOsView />;

      case 'admin-review':
        return <SalesAdminReviewView />;

      case 'final-review':
        return <SalesAdminFinalReviewView />;

      case 'purchase-queue':
        return <SalesPurchaseQueueView />;

      case 'production-queue':
        return <SalesProductionQueueView />;

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
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Sales</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto pb-4">{renderActiveView()}</main>
    </div>
  );
};

export default SalesPage;

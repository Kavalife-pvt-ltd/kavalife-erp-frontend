import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/hooks/useAuthContext';
import {
  Home as HomeIcon,
  ClipboardList,
  Truck,
  Factory,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type ActionItem = {
  title: string;
  subtitle: string;
  tag: string;
  onClick: () => void;
  disabled?: boolean;
};

// pages/dashboard/Home.tsx
export const DashboardHome = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthContext() as {
    authUser?: { username?: string; role?: string; department?: string };
  };

  const name = authUser?.username ?? 'there';
  const role = authUser?.role ?? 'user';
  const department = authUser?.department ?? '';

  const isAdmin = role === 'admin';
  const isSales = department === 'sales';
  const isProduction = department === 'production';
  const isPurchase = department === 'purchase';

  const quickActions = [
    ...(isAdmin || isProduction
      ? [
          { label: 'Create VIR', icon: ClipboardList, onClick: () => navigate('/vir') },
          { label: 'Create GRN', icon: Truck, onClick: () => navigate('/grn') },
          { label: 'Process Logs', icon: Factory, onClick: () => navigate('/extraction') },
        ]
      : []),
    ...(isAdmin || isSales
      ? [
          {
            label: 'Create Inquiry',
            icon: ShieldCheck,
            onClick: () => navigate('/sales?view=create-inquiry'),
          },
        ]
      : []),
    ...(isAdmin || isPurchase
      ? [
          {
            label: 'Purchase Queue',
            icon: ShoppingCart,
            onClick: () => navigate('/sales?view=purchase-queue'),
          },
        ]
      : []),
  ].slice(0, 6);

  const suggestedNext = (() => {
    if (isAdmin)
      return {
        title: 'Admin overview',
        subtitle: 'Review approvals + keep queues moving',
        to: '/sales?view=admin-review',
      };
    if (isSales)
      return {
        title: 'Sales flow',
        subtitle: 'Create inquiries, follow up, and push approvals',
        to: '/sales?view=my-inquiries',
      };
    if (isPurchase)
      return {
        title: 'Purchase flow',
        subtitle: 'Prioritize items in the purchase queue',
        to: '/sales?view=purchase-queue',
      };
    if (isProduction)
      return {
        title: 'Production flow',
        subtitle: 'Keep VIR/GRN/process logs updated',
        to: '/vir',
      };
    return { title: 'Get started', subtitle: 'Open a module from the sidebar to begin', to: '/' };
  })();

  const actionItems: ActionItem[] = [
    {
      title: suggestedNext.title,
      subtitle: suggestedNext.subtitle,
      tag: 'Suggested',
      onClick: () => navigate(suggestedNext.to),
    },
    {
      title: 'Recently opened modules',
      subtitle: 'We’ll show your recent navigation here.',
      tag: 'Placeholder',
      onClick: () => {},
      disabled: true,
    },
    {
      title: 'Pending approvals / verifications',
      subtitle: 'Hook this up to API once employee approvals + QAQC are wired.',
      tag: 'Placeholder',
      onClick: () => {},
      disabled: true,
    },
  ];

  return (
    <section className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-stroke bg-accent/5 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-primaryText/70">
              <HomeIcon className="h-5 w-5" />
              <span className="text-sm">Home</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold text-primaryText">
              Welcome back, <span className="capitalize">{name}</span>
            </h1>

            <p className="mt-1 text-sm text-primaryText/70">
              {isAdmin
                ? 'You have full access. This page will eventually become your command center.'
                : 'Here’s a quick snapshot to help you start fast.'}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-stroke bg-background px-3 py-1 text-xs text-primaryText/80">
                Role: <span className="font-medium text-primaryText">{role}</span>
              </span>
              <span className="rounded-full border border-stroke bg-background px-3 py-1 text-xs text-primaryText/80">
                Department:{' '}
                <span className="font-medium text-primaryText">
                  {department ? department : '—'}
                </span>
              </span>
              <span className="rounded-full border border-stroke bg-background px-3 py-1 text-xs text-primaryText/80">
                Status: <span className="font-medium text-primaryText">Online</span>
              </span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2">
            <Button
              className="bg-accent text-primaryText hover:opacity-90"
              onClick={() => navigate(suggestedNext.to)}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <button
              className="rounded-lg border border-stroke px-3 py-2 text-xs text-primaryText/80 hover:bg-accent/10"
              onClick={() => navigate('/sales?view=dashboard')}
            >
              View Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Action Queue (placeholder) */}
        <div className="lg:col-span-2 rounded-2xl border border-stroke bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-primaryText">Your action queue</h2>
              <p className="mt-1 text-sm text-primaryText/60">
                This is a placeholder for now — later it will show pending items by priority.
              </p>
            </div>

            <span className="rounded-full bg-accent/10 px-3 py-1 text-xs text-primaryText/80 border border-stroke">
              Coming soon
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {actionItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                disabled={item.disabled}
                className={`w-full rounded-xl border border-stroke p-4 text-left transition-colors ${
                  item.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-primaryText">{item.title}</div>
                    <div className="mt-1 text-sm text-primaryText/60">{item.subtitle}</div>
                  </div>

                  <span className="shrink-0 rounded-full border border-stroke bg-background px-2.5 py-1 text-xs text-primaryText/70">
                    {item.tag}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-stroke bg-background p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-primaryText">Quick actions</h2>
          <p className="mt-1 text-sm text-primaryText/60">
            Jump straight into the work you do most.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2">
            {quickActions.length > 0 ? (
              quickActions.map(({ label, icon: Icon, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex items-center justify-between rounded-xl border border-stroke px-4 py-3 text-left hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 border border-stroke">
                      <Icon className="h-5 w-5 text-primaryText" />
                    </span>
                    <span className="text-sm font-medium text-primaryText">{label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-primaryText/60" />
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-stroke bg-accent/5 p-4 text-sm text-primaryText/70">
                No quick actions for your role yet. Use the sidebar to navigate.
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-stroke bg-accent/5 p-4">
            <div className="text-sm font-semibold text-primaryText">Tip</div>
            <div className="mt-1 text-sm text-primaryText/70">
              This Home screen is intentionally lightweight. Once employee approvals + QA/QC are
              wired, we’ll show real pending tasks here.
            </div>
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="rounded-2xl border border-stroke bg-background p-4 text-sm text-primaryText/70">
        <span className="font-medium text-primaryText">Next step:</span> hook “Action queue” to:
        pending employee approvals, QA/QC pending, and Sales PO queues.
      </div>
    </section>
  );
};

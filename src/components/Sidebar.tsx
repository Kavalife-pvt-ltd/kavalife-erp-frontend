// components/Sidebar.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Truck,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PlusCircle,
  ListChecks,
  ShieldCheck,
  ShoppingCart,
  Settings2,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import Tooltip from './ui/Tooltip';
import { useAuthContext } from '@/hooks/useAuthContext';

type SidebarProps = {
  onSelect?: () => void;
  collapsed?: boolean;
  toggleCollapsed?: () => void;
};

type NavLink = {
  to: string;
  label: string;
  icon: LucideIcon;
};

type NavSection = {
  title: string;
  links: NavLink[];
};

const PRODUCTION_SECTION: NavSection = {
  title: 'Production',
  links: [
    { to: '/vir', label: 'VIR', icon: ClipboardList },
    { to: '/grn', label: 'GRN', icon: Truck },
    { to: '/extraction', label: 'Extraction', icon: Truck },
    { to: '/stripping', label: 'Stripping', icon: Truck },
    { to: '/purification', label: 'Purification', icon: Truck },
    { to: '/decolorisation', label: 'Decolorisation', icon: Truck },
  ],
};

const BASE_SALES_LINKS: NavSection = {
  title: 'Sales',
  links: [
    { to: '/sales?view=create-inquiry', label: 'Create Inquiry', icon: PlusCircle },
    { to: '/sales?view=my-inquiries', label: 'My Inquiries', icon: ListChecks },
    { to: '/sales?view=all-pos', label: 'All POs', icon: ClipboardList },
    { to: '/sales?view=admin-review', label: 'Admin Review', icon: ShieldCheck },
    { to: '/sales?view=purchase-queue', label: 'Purchase Queue', icon: ShoppingCart },
    { to: '/sales?view=production-queue', label: 'Production Queue', icon: Settings2 },
    { to: '/sales?view=dashboard', label: 'Sales Dashboard', icon: BarChart3 },
  ],
};

const ADMIN_SECTION: NavSection = {
  title: 'Admin',
  links: [{ to: '/employees', label: 'Employees', icon: Users }],
};

const Sidebar = ({ onSelect, collapsed = false, toggleCollapsed }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuthContext() as {
    authUser?: { role?: string; department?: string };
  };

  // role from backend: "admin" | "user"
  const role = authUser?.role ?? 'user';
  const department = authUser?.department ?? '';

  const isAdmin = role === 'admin';
  const isSales = department === 'sales';
  const isProduction = department === 'production';
  const isPurchase = department === 'purchase';

  /**
   * PRODUCTION SECTION VISIBILITY
   * - Admin → sees Production
   * - Production → sees Production
   * - Purchase → ❌ does NOT see Production
   */
  const canSeeProductionSection = isAdmin || isProduction;

  /**
   * SALES SECTION LINKS BASED ON ROLE/DEPARTMENT
   */
  let salesLinks: NavLink[] = [];

  if (isAdmin) {
    // Admin sees everything under Sales
    salesLinks = BASE_SALES_LINKS.links;
  } else if (isSales) {
    // Sales → only Create + My POs
    salesLinks = BASE_SALES_LINKS.links.filter((link) =>
      ['/sales?view=create-inquiry', '/sales?view=my-inquiries'].includes(link.to)
    );
  } else if (isPurchase) {
    // Purchase → only Purchase Queue
    salesLinks = BASE_SALES_LINKS.links.filter((link) => link.to === '/sales?view=purchase-queue');
  } else if (isProduction) {
    // Production → only Production Queue
    salesLinks = BASE_SALES_LINKS.links.filter(
      (link) => link.to === '/sales?view=production-queue'
    );
  }

  const canSeeSalesSection = salesLinks.length > 0;

  const isActive = (to: string) => {
    const url = new URL(to, window.location.origin);
    const targetPath = url.pathname;
    const targetSearch = url.search;
    return location.pathname === targetPath && location.search === targetSearch;
  };

  const renderLinkButton = ({ to, label, icon: Icon }: NavLink) => (
    <li key={to}>
      <Tooltip label={label}>
        <button
          onClick={() => {
            navigate(to);
            onSelect?.();
          }}
          title={label}
          className={clsx(
            'flex w-full items-center rounded-lg px-3 py-2 text-left transition-colors',
            isActive(to)
              ? 'bg-stroke text-primaryText'
              : 'bg-transparent hover:bg-accent/10 text-primaryText',
            'focus:outline-none focus:ring-0'
          )}
        >
          <Icon className="h-5 w-5" />
          {!collapsed && <span className="ml-3">{label}</span>}
        </button>
      </Tooltip>
    </li>
  );

  const renderSection = (section: NavSection) => (
    <div key={section.title} className="mb-3">
      {!collapsed && (
        <div className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {section.title}
        </div>
      )}
      <ul className="space-y-1 px-2">{section.links.map(renderLinkButton)}</ul>
    </div>
  );

  const salesSection: NavSection = {
    title: BASE_SALES_LINKS.title,
    links: salesLinks,
  };

  return (
    <nav
      className={clsx(
        'flex h-screen flex-col bg-background text-primaryText shadow-md transition-all duration-300',
        'sticky top-0',
        'flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse Toggle Button */}
      <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} p-2`}>
        <button
          onClick={toggleCollapsed}
          className="rounded p-1 hover:bg-stroke/60 focus:outline-none focus:ring-0"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-3 mb-2 border-t border-stroke" />

        {canSeeProductionSection && renderSection(PRODUCTION_SECTION)}
        {canSeeSalesSection && renderSection(salesSection)}
        {isAdmin && renderSection(ADMIN_SECTION)}
      </div>
    </nav>
  );
};

export default Sidebar;

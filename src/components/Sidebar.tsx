// components/Sidebar.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  ClipboardList,
  Truck,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import Tooltip from './ui/Tooltip';

type SidebarProps = {
  onSelect?: () => void;
  collapsed?: boolean;
  toggleCollapsed?: () => void;
};

type NavLink = {
  to: string; // can include query string, e.g. "/sales?view=create"
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  title: string;
  links: NavLink[];
};

// Top-level single links
const topLinks: NavLink[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
];

// Grouped sections for production + sales
const sections: NavSection[] = [
  {
    title: 'Production',
    links: [
      { to: '/vir', label: 'VIR', icon: ClipboardList },
      { to: '/grn', label: 'GRN', icon: Truck },
      { to: '/extraction', label: 'Extraction', icon: Truck },
      { to: '/stripping', label: 'Stripping', icon: Truck },
      { to: '/purification', label: 'Purification', icon: Truck },
      { to: '/decolorisation', label: 'Decolorisation', icon: Truck },
    ],
  },
  {
    title: 'Sales',
    links: [
      { to: '/sales?view=create', label: 'Create PO', icon: BarChart3 },
      { to: '/sales?view=my-pos', label: 'My POs', icon: BarChart3 },
      { to: '/sales?view=admin-review', label: 'Admin Review', icon: BarChart3 },
      { to: '/sales?view=purchase-queue', label: 'Purchase Queue', icon: BarChart3 },
      { to: '/sales?view=production-queue', label: 'Production Queue', icon: BarChart3 },
      { to: '/sales?view=dashboard', label: 'Sales Dashboard', icon: BarChart3 },
    ],
  },
];

const Sidebar = ({ onSelect, collapsed = false, toggleCollapsed }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (to: string) => {
    // Normalize "to" into pathname + search for comparison
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
            isActive(to) ? 'bg-stroke text-primaryText' : 'bg-accent hover:bg-hover'
          )}
        >
          <Icon className="h-5 w-5" />
          {!collapsed && <span className="ml-3">{label}</span>}
        </button>
      </Tooltip>
    </li>
  );

  return (
    <nav
      className={clsx(
        'flex min-h-full flex-col bg-gray-50 text-primaryText shadow-md transition-all duration-300 dark:bg-gray-900',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse Toggle Button */}
      <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} p-2`}>
        <button
          onClick={toggleCollapsed}
          className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Top-level links */}
      <ul className="flex-0 space-y-2 px-2 pb-4">{topLinks.map(renderLinkButton)}</ul>

      <div className="mx-3 mb-2 border-t border-gray-200 dark:border-gray-800" />

      {/* Grouped sections: Production & Sales */}
      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="mb-3">
            {!collapsed && (
              <div className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {section.title}
              </div>
            )}
            <ul className="space-y-1 px-2">{section.links.map(renderLinkButton)}</ul>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Sidebar;

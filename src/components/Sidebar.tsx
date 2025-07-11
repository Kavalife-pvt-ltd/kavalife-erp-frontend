// components/Sidebar.tsx
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  ListTodo,
  ClipboardList,
  Truck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import Tooltip from './ui/Tooltip';

type SidebarProps = {
  onSelect?: () => void;
  collapsed?: boolean;
  toggleCollapsed?: () => void;
};

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/vir', label: 'VIR', icon: ClipboardList },
  { to: '/grn', label: 'GRN', icon: Truck },
  { to: '/extraction', label: 'Extraction', icon: Truck },
  { to: '/stripping', label: 'Stripping', icon: Truck },
  { to: '/purification', label: 'Purification', icon: Truck },
  { to: '/decolorisation', label: 'Decolorisation', icon: Truck },
];

const Sidebar = ({ onSelect, collapsed = false, toggleCollapsed }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className={clsx(
        'bg-gray-50 dark:bg-gray-900 text-primaryText min-h-full shadow-md transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Collapse Toggle Button */}
      <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} p-2`}>
        <button
          onClick={toggleCollapsed}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Links */}
      <ul className="space-y-2 px-2 flex-1">
        {links.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Tooltip label={label}>
              <button
                onClick={() => {
                  navigate(to);
                  onSelect?.();
                }}
                title={label}
                className={clsx(
                  'flex items-center w-full text-left px-3 py-2 rounded-lg transition-colors',
                  location.pathname === to
                    ? 'bg-stroke text-primaryText'
                    : 'bg-accent hover:bg-hover'
                )}
              >
                <Icon className="w-5 h-5" />
                {!collapsed && <span className="ml-3">{label}</span>}
              </button>
            </Tooltip>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;

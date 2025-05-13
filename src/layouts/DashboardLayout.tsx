import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const Sidebar = () => (
  <nav className="w-64 bg-gray-200 text-black min-h-full p-4">
    <ul className="space-y-4">
      <li>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? 'text-primary font-semibold' : 'hover:text-primary'
          }
        >
          Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/inventory"
          className={({ isActive }) =>
            isActive ? 'text-primary font-semibold' : 'hover:text-primary'
          }
        >
          Inventory
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            isActive ? 'text-primary font-semibold' : 'hover:text-primary'
          }
        >
          Tasks
        </NavLink>
      </li>
    </ul>
  </nav>
);

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-400 shadow-sm px-4 py-3 flex justify-between items-center ">
        <div className="text-xl font-bold flex items-center gap-2">
          <img
            src="https://kavalife.in/wp-content/uploads/2024/05/logo.png"
            alt="Kavalife logo"
            className="h-8 w-auto"
          />
        </div>

        {/* Mobile Sidebar Toggle */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </header>

      {/* Body Layout */}
      <div className="flex flex-1">
        <aside className="hidden md:block">
          <Sidebar />
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import toast from 'react-hot-toast';
import { logoutUser } from '@/api/auth';
import { useAuthContext } from '@/hooks/useAuthContext';
import Header from '../Header';
import Sidebar from '../Sidebar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();

  const handleLogout = async () => {
    await logoutUser();
    setAuthUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    // ✅ Make the whole app height-bounded (critical for independent scroll)
    <div className="flex h-dvh flex-col bg-background text-primaryText">
      <Header onLogout={handleLogout} onOpenSidebar={() => setSidebarOpen(true)} />

      {/* ✅ min-h-0 is the secret sauce so children can scroll */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden h-full min-h-0 overflow-hidden md:block">
          {/* ✅ sidebar itself becomes the scroll container */}
          <div className="h-full min-h-0 overflow-y-auto">
            <Sidebar collapsed={collapsed} toggleCollapsed={() => setCollapsed((prev) => !prev)} />
          </div>
        </aside>

        {/* Mobile sidebar (Sheet) */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            {/* In mobile sheet, sidebar scrolls naturally */}
            <div className="h-dvh overflow-y-auto">
              <Sidebar onSelect={() => setSidebarOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Main content scrolls independently */}
        <main className="min-h-0 flex-1 min-w-0 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

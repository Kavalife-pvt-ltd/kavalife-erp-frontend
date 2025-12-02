// components/layout/DashboardLayout.tsx
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
    <div className="flex min-h-screen flex-col bg-background text-primaryText">
      <Header onLogout={handleLogout} onOpenSidebar={() => setSidebarOpen(true)} />

      {/* 🔹 This flex row is now height-bound and prevents body scroll */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden h-full overflow-y-auto md:block">
          <Sidebar collapsed={collapsed} toggleCollapsed={() => setCollapsed((prev) => !prev)} />
        </aside>

        {/* Mobile sidebar (Sheet) */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar onSelect={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main content scrolls independently */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

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
  const [collapsed, setCollapsed] = useState(false); // ➕ new state
  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();

  const handleLogout = async () => {
    await logoutUser();
    setAuthUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-primaryText flex flex-col">
      <Header onLogout={handleLogout} onOpenSidebar={() => setSidebarOpen(true)} />

      <div className="flex flex-1">
        <aside className="hidden md:block sticky top-20 h-[calc(100vh-5rem)]">
          <Sidebar collapsed={collapsed} toggleCollapsed={() => setCollapsed((prev) => !prev)} />
        </aside>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar onSelect={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

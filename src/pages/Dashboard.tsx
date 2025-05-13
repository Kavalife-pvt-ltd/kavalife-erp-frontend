// pages/dashboard.tsx
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LogOut } from 'lucide-react';
import { TaskList } from './dashboard/Tasks';
import { Inventory } from './dashboard/Inventory';
import { DashboardHome } from './dashboard/Home';
import { supabase } from '@/services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({
  selected,
  onSelect,
}: {
  selected: 'home' | 'tasks' | 'inventory';
  onSelect: (section: 'home' | 'tasks' | 'inventory') => void;
}) => (
  <nav className="w-64 bg-gray-50 dark:bg-gray-900 text-primaryText min-h-full p-6 shadow-md">
    <h2 className="text-xl font-bold mb-8">Kavalife ERP</h2>
    <ul className="space-y-3">
      {(['home', 'inventory', 'tasks'] as const).map((key) => (
        <li key={key}>
          <button
            onClick={() => onSelect(key)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selected === key ? 'bg-stroke text-primaryText' : 'bg-accent hover:bg-hover'
            }`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [section, setSection] = useState<'home' | 'tasks' | 'inventory'>('home');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-primaryText flex flex-col">
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 shadow-sm px-6 py-6 flex justify-between items-center">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar
              selected={section}
              onSelect={(s) => {
                setSection(s);
                setSidebarOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-3 text-2xl font-bold overflow-hidden">
          <img
            src="https://kavalife.in/wp-content/uploads/2024/05/logo.png"
            alt="Kavalife logo"
            className="h-10 w-auto max-w-[180px] object-contain"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Logout button */}
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>

          {/* Mobile Sidebar Toggle */}
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden md:block">
          <Sidebar selected={section} onSelect={setSection} />
        </aside>

        <main className="flex-1 p-6 overflow-y-auto">
          {section === 'home' && <DashboardHome />}
          {section === 'inventory' && <Inventory />}
          {section === 'tasks' && <TaskList />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

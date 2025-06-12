// components/Header.tsx
import { Menu, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuthContext } from '@/contexts/useAuthContext';

type HeaderProps = {
  onLogout: () => void;
  onOpenSidebar: () => void;
};

const Header = ({ onLogout, onOpenSidebar }: HeaderProps) => {
  const { authUser } = useAuthContext();

  const username = authUser?.username ?? 'User';

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 shadow-sm px-6 py-6 flex justify-between items-center">
      <Button variant="ghost" size="icon" onClick={onOpenSidebar} className="md:hidden">
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex items-center gap-3 text-2xl font-bold overflow-hidden">
        <img
          src="https://kavalife.in/wp-content/uploads/2024/05/logo.png"
          alt="Kavalife logo"
          className="h-10 w-auto max-w-[180px] object-contain"
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
          Welcome, {username}
        </span>
        <Button variant="ghost" size="icon" onClick={onLogout} title="Logout">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;

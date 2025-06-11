import { useState, useEffect } from 'react';
import { AuthContext, User } from './AuthContext';
import { checkUser, logoutUser } from '@/api/auth';
import { useNavigate } from 'react-router-dom';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async () => {
    await logoutUser();
    setIsAuthenticated(null);
    navigate('/login');
  };

  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await checkUser();
        setIsAuthenticated(res.data.data); // Assumes API returns `{ data: { id, username, role } }`
      } catch {
        setIsAuthenticated(null);
      } finally {
        setIsLoading(false);
      }
    };
    validateSession();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, logout, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

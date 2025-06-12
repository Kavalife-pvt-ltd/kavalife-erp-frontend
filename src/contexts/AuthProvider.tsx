import { useState, useEffect } from 'react';
import { AuthContext, User } from './AuthContext';
import { checkUser, logoutUser } from '@/api/auth';
import { useNavigate } from 'react-router-dom';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const logout = async () => {
    await logoutUser();
    setAuthUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await checkUser();
        setAuthUser(res.data.data); // Assumes API returns `{ data: { id, username, role } }`
      } catch {
        setAuthUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    validateSession();
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, isLoading, logout, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};

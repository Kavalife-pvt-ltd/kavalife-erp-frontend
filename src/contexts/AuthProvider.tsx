import { useState, useEffect, useCallback } from 'react';
import { AuthContext, User } from './AuthContext';
import { checkUser, logoutUser } from '@/api/auth';
import { useNavigate } from 'react-router-dom';
import type { AxiosResponse } from 'axios';

type ApiSuccess<T> = {
  data: T;
};

// Your backend returns: utils.SuccessWithData(c, user)
// Most of your frontend assumes: res.data.data
type CheckUserResponse = ApiSuccess<User>;

const extractUser = (res: AxiosResponse<CheckUserResponse | User>): User | null => {
  // Case 1: { data: { ...user } }
  if ('data' in res.data && res.data.data && typeof res.data.data === 'object') {
    return res.data.data as User;
  }

  // Case 2: directly { ...user }
  if (res.data && typeof res.data === 'object' && 'id' in res.data) {
    return res.data as User;
  }

  return null;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = (await checkUser()) as AxiosResponse<CheckUserResponse | User>;
      const user = extractUser(res);
      setAuthUser(user);
    } catch {
      setAuthUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setAuthUser(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const res = (await checkUser()) as AxiosResponse<CheckUserResponse | User>;
        const user = extractUser(res);
        if (!cancelled) setAuthUser(user);
      } catch {
        if (!cancelled) setAuthUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, isLoading, logout, setAuthUser, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

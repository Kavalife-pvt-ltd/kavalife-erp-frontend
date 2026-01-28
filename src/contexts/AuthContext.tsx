import { createContext } from 'react';

export interface User {
  id: number;
  username: string;
  role: string;
  department: string;
}

export interface AuthContextType {
  authUser: User | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  setAuthUser: (user: User | null) => void;
  refreshSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

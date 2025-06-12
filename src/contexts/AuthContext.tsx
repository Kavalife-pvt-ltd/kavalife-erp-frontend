import { createContext } from 'react';

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface AuthContextType {
  authUser: User | null;
  isLoading: boolean;
  logout: () => void;
  setAuthUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

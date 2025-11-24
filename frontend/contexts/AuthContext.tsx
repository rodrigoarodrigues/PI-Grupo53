import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cliente';
  wallet?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  updateWallet: (newBalance: number) => void;
  refreshWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStorage = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'localStorage' in window) {
    return {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
    };
  }
  return {
    getItem: (key: string) => AsyncStorage.getItem(key),
    setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
    removeItem: (key: string) => AsyncStorage.removeItem(key),
  };
};

const storage = getStorage();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await storage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const userData = await response.json();
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        wallet: userData.wallet || 0,
      };

      await storage.setItem('user', JSON.stringify(user));
      setUser(user);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem('user');
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  };

  const updateWallet = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, wallet: newBalance };
      setUser(updatedUser);
      storage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const refreshWallet = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:3000/users/${user.id}/wallet`);
      if (response.ok) {
        const data = await response.json();
        updateWallet(data.wallet);
      }
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isClient = user?.role === 'cliente';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isClient,
        updateWallet,
        refreshWallet,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}


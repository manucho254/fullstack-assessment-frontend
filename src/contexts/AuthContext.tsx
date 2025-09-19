import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { apiService } from '@/services/apiService';
import { User, LoginCredentials, RegisterCredentials } from '@/types/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    // Check for existing token on app startup
    const savedToken = Cookies.get('auth_token');
    if (savedToken) {
      setToken(savedToken);
      // Verify token and get user data
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      const userData = await apiService.verifyToken(authToken);
      setUser(userData);
      setToken(authToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      const { access: authToken, user: userData } = response;
      
      // Store token in secure cookie (7 days expiry)
      Cookies.set('auth_token', authToken, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(credentials);
      const { access: authToken, user: userData } = response;
      
      // Store token in secure cookie (7 days expiry)
      Cookies.set('auth_token', authToken, { 
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear token from cookie
    Cookies.remove('auth_token');
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
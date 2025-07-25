import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthData, RegisterData } from '@/types';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: AuthData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const API_URL =  'http://localhost:5000/api';

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // In a real app, you'd verify the token with your backend
      // For now, we'll decode the stored user data
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: AuthData) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: data.email,
        password: data.password,
      });

      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Please check your credentials';
      toast({
        title: 'Login failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      const response = await axios.post(`${API_URL}/auth/register`, {
        email: data.email,
        password: data.password,
        name: data.name,
      });

      const { token, user: userData } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      
      toast({
        title: 'Welcome!',
        description: 'Account created successfully',
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'See you next time!',
    });
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
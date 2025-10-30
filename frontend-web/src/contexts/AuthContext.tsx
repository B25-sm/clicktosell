'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import toast from 'react-hot-toast';

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePicture?: { url?: string };
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
} | null;

type AuthContextValue = {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  verifyPhone: (otp: string) => Promise<void>;
  resendPhoneOTP: () => Promise<void>;
  refreshToken: () => Promise<void>;
};

type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  state: string;
  country?: string;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  verifyEmail: async () => {},
  resendEmailVerification: async () => {},
  verifyPhone: async () => {},
  resendPhoneOTP: async () => {},
  refreshToken: async () => {}
});

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('accessToken');
      if (token) {
        try {
          const response = await axios.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.data.user);
        } catch (error) {
          // Token is invalid, clear it
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && error.config && !error.config._retry) {
          error.config._retry = true;
          
          try {
            const refreshToken = Cookies.get('refreshToken');
            if (refreshToken) {
              const response = await axios.post('/auth/refresh-token', {
                refreshToken
              });
              
              const { accessToken } = response.data.data;
              Cookies.set('accessToken', accessToken, { expires: 7 });
              
              // Retry the original request
              error.config.headers.Authorization = `Bearer ${accessToken}`;
              return axios(error.config);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            router.push('/auth/login');
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [router]);

  const login = async (identifier: string, password: string, rememberMe = false) => {
    try {
      const response = await axios.post('/auth/login', {
        identifier,
        password,
        rememberMe
      });

      const { accessToken, refreshToken: refreshTokenValue, user: userData } = response.data.data;
      
      // Set cookies
      Cookies.set('accessToken', accessToken, { expires: rememberMe ? 30 : 1 });
      Cookies.set('refreshToken', refreshTokenValue, { expires: rememberMe ? 30 : 7 });
      
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      const { accessToken, refreshToken: refreshTokenValue, user: newUser } = response.data.data;
      
      // Set cookies
      Cookies.set('accessToken', accessToken, { expires: 1 });
      Cookies.set('refreshToken', refreshTokenValue, { expires: 7 });
      
      setUser(newUser);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    const refreshToken = Cookies.get('refreshToken');
    
    // Call logout API
    if (refreshToken) {
      axios.post('/auth/logout', { refreshToken }).catch(() => {
        // Ignore errors on logout
      });
    }
    
    // Clear local state
    setUser(null);
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    
    router.push('/auth/login');
  };

  const forgotPassword = async (email: string) => {
    try {
      await axios.post('/auth/forgot-password', { email });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email');
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await axios.post('/auth/reset-password', { token, password });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await axios.post('/auth/verify-email', { token });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify email');
    }
  };

  const resendEmailVerification = async () => {
    try {
      await axios.post('/auth/resend-email-verification');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  const verifyPhone = async (otp: string) => {
    try {
      await axios.post('/auth/verify-phone', { otp });
      // Refresh user data to get updated verification status
      const response = await axios.get('/auth/me');
      setUser(response.data.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify phone');
    }
  };

  const resendPhoneOTP = async () => {
    try {
      await axios.post('/auth/resend-phone-otp');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = Cookies.get('refreshToken');
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post('/auth/refresh-token', {
        refreshToken: refreshTokenValue
      });

      const { accessToken } = response.data.data;
      Cookies.set('accessToken', accessToken, { expires: 7 });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to refresh token');
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendEmailVerification,
    verifyPhone,
    resendPhoneOTP,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



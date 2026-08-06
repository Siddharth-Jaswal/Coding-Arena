import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { userApi } from '@/api/users';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('arena_token'));
  const queryClient = useQueryClient();

  // Fetch current user if token exists
  const { data: userResponse, isLoading, isError, error } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userApi.getMe(),
    enabled: !!token,
    retry: false,
    staleTime: Infinity, // Keep user data fresh during session
  });

  const user = userResponse?.data;

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    onSuccess: (response) => {
      const newToken = response.data.token;
      localStorage.setItem('arena_token', newToken);
      setToken(newToken);
      queryClient.setQueryData(['user', 'me'], { data: response.data.user });
    },
  });

  // Register Mutation
  const registerMutation = useMutation({
    mutationFn: (userData) => authApi.register(userData),
    onSuccess: (response) => {
      const newToken = response.data.token;
      localStorage.setItem('arena_token', newToken);
      setToken(newToken);
      queryClient.setQueryData(['user', 'me'], { data: response.data.user });
    },
  });

  const logout = () => {
    localStorage.removeItem('arena_token');
    setToken(null);
    queryClient.clear(); // Clear all cached data
    // Router navigation must happen in components or hooks that use useNavigate, 
    // or we can just let state updates re-render protected routes which will redirect.
  };

  // Global 401 Listener
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [queryClient]);

  // If token is invalid on mount
  useEffect(() => {
    if (isError && error?.status === 401) {
      logout();
    }
  }, [isError, error]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading && !!token, // Only loading if we have a token and are checking it
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

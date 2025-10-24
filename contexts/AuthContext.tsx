import { useEffect, useState, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { SecureStorage } from '@/utils/secureStorage';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'coach';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string, role: 'client' | 'coach') => Promise<void>;
  register: (name: string, email: string, password: string, role: 'client' | 'coach') => Promise<void>;
  logout: () => Promise<void>;
}

export const [AuthProvider, useAuth] = createContextHook((): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStorage.getToken(),
        SecureStorage.getUser<User>(),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      await SecureStorage.clearAll();
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string, role: 'client' | 'coach') => {
    try {
      const response = await loginMutation.mutateAsync({
        email,
        password,
        role,
      });

      await Promise.all([
        SecureStorage.setToken(response.token),
        SecureStorage.setUser(response.user),
      ]);

      setToken(response.token);
      setUser(response.user);

      if (response.user.role === 'client') {
        router.replace('/client/dashboard' as never);
      } else {
        router.replace('/coach/dashboard' as never);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [loginMutation]);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: 'client' | 'coach'
  ) => {
    try {
      const response = await registerMutation.mutateAsync({
        name,
        email,
        password,
        role,
      });

      await Promise.all([
        SecureStorage.setToken(response.token),
        SecureStorage.setUser(response.user),
      ]);

      setToken(response.token);
      setUser(response.user);

      if (role === 'client') {
        router.replace('/client/onboarding/welcome' as never);
      } else {
        router.replace('/coach/dashboard' as never);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, [registerMutation]);

  const logout = useCallback(async () => {
    try {
      await SecureStorage.clearAll();
      setUser(null);
      setToken(null);
      router.replace('/' as never);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };
});

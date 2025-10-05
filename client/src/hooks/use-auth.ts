import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: string;
  tenantId: string;
  onboarded?: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First check localStorage for user info (fallback for Replit iframe environment)
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          setUser(userData);
          setIsLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
      
      // Try session-based auth
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  // Show setup if no user OR if user exists but not onboarded
  const needsSetup = !user || !user.onboarded;

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    needsSetup,
    refetch: checkAuth,
  };
}

import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  role: string;
  tenantId: string;
  onboarded?: boolean;
  pincode?: string | null;
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
          // Migration: If user exists but onboarded is undefined, set it to true
          if (userData && userData.id && userData.onboarded === undefined) {
            userData.onboarded = true;
            localStorage.setItem('user', JSON.stringify(userData));
          }
          setUser(userData);
          setIsLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
      
      // Try session-based auth (but don't clear localStorage if it fails)
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (res.ok) {
        const userData = await res.json();
        // Add onboarded flag if missing
        if (userData && userData.id && userData.onboarded === undefined) {
          userData.onboarded = true;
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Session failed, but don't clear localStorage - rely on cached user
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Network error - don't clear localStorage, rely on cached user
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Show setup only if no user
  const needsSetup = !user;

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    needsSetup,
    refetch: checkAuth,
  };
}

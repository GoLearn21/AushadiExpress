import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [pharmacyName, setPharmacyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedBusinessName = localStorage.getItem('lastBusinessName');
    if (savedBusinessName) {
      setPharmacyName(savedBusinessName);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pharmacyName.trim() || !password) {
      toast({
        title: 'Error',
        description: 'Please enter your pharmacy name and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: pharmacyName,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('lastBusinessName', pharmacyName);

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${pharmacyName}`,
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pharmacyName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your pharmacy name',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: pharmacyName,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const updatedUser = { ...data, onboarded: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('lastBusinessName', pharmacyName);
      
      toast({
        title: 'Welcome!',
        description: `${pharmacyName} is ready to go!`,
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-border/50 backdrop-blur-sm bg-card/95 shadow-xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-bold">
          {mode === 'register' ? 'Create Account' : 'Welcome Back'}
        </CardTitle>
        <CardDescription>
          {mode === 'register' ? (
            'Set up your pharmacy account to get started'
          ) : (
            'Log in to access your dashboard'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pharmacyName" className="text-sm font-medium">
              Business Name
            </Label>
            <Input
              id="pharmacyName"
              type="text"
              placeholder="Enter your pharmacy name"
              value={pharmacyName}
              onChange={(e) => setPharmacyName(e.target.value)}
              disabled={isLoading}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={mode === 'register' ? 'Min. 6 characters' : 'Enter password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="h-11"
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
                className="h-11"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 font-medium"
            disabled={isLoading}
          >
            {isLoading 
              ? (mode === 'login' ? 'Logging in...' : 'Setting up...') 
              : (mode === 'login' ? 'Log In' : 'Complete Setup')
            }
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
              disabled={isLoading}
            >
              {mode === 'login' 
                ? "Don't have an account? Register" 
                : 'Already have an account? Log in'
              }
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

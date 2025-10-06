import { useState } from 'react';
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
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {mode === 'register' ? 'Welcome to AushadiExpress' : 'Welcome Back'}
        </CardTitle>
        <CardDescription className="space-y-2">
          {mode === 'register' ? (
            <>
              <p className="font-medium text-base">Complete this one-time setup to unlock your dashboard</p>
              <p className="text-xs text-muted-foreground">Create your secure account with a unique pharmacy ID</p>
            </>
          ) : (
            <p className="font-medium text-base">Log in to access your pharmacy dashboard</p>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pharmacyName">Pharmacy Name</Label>
            <Input
              id="pharmacyName"
              type="text"
              placeholder="Enter your pharmacy name"
              value={pharmacyName}
              onChange={(e) => setPharmacyName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={mode === 'register' ? 'Create a password (min. 6 characters)' : 'Enter your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading 
              ? (mode === 'login' ? 'Logging in...' : 'Setting up...') 
              : (mode === 'login' ? 'Log In' : 'Complete Setup')
            }
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-primary hover:underline"
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

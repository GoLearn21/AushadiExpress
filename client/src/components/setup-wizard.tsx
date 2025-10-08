import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SetupWizardProps {
  onComplete: () => void;
}

type UserRole = 'customer' | 'retailer' | 'wholesaler' | 'distributor';

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  
  const [username, setUsername] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedBusinessName = localStorage.getItem('lastBusinessName');
    if (savedBusinessName) {
      setUsername(savedBusinessName);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      toast({
        title: 'Error',
        description: 'Please enter your username and password',
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
          username: username,
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('lastBusinessName', username);

      toast({
        title: 'Welcome back!',
        description: `Logged in successfully`,
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

    if (selectedRole === 'customer') {
      if (!username.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter your name',
          variant: 'destructive',
        });
        return;
      }
    } else {
      if (!businessName.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter your business name',
          variant: 'destructive',
        });
        return;
      }
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
      const payload: any = {
        password: password,
        role: selectedRole,
      };

      if (selectedRole === 'customer') {
        payload.username = username;
      } else {
        payload.tenantName = businessName;
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('user', JSON.stringify(data));
      
      if (selectedRole !== 'customer') {
        localStorage.setItem('lastBusinessName', businessName);
      }
      
      toast({
        title: 'Welcome!',
        description: selectedRole === 'customer' 
          ? `Welcome ${username}!`
          : `${businessName} is ready to go!`,
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

  const roleOptions = [
    { 
      value: 'customer' as UserRole, 
      label: 'Customer', 
      emoji: '🛒',
      description: 'Search and order medicines'
    },
    { 
      value: 'retailer' as UserRole, 
      label: 'Retailer', 
      emoji: '🏪',
      description: 'Manage pharmacy inventory'
    },
    { 
      value: 'wholesaler' as UserRole, 
      label: 'Wholesaler', 
      emoji: '📦',
      description: 'Distribute to pharmacies'
    },
    { 
      value: 'distributor' as UserRole, 
      label: 'Distributor', 
      emoji: '🚚',
      description: 'Supply to wholesalers'
    },
  ];

  const switchToRegister = () => {
    setMode('register');
    setStep('role');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setBusinessName('');
  };

  const switchToLogin = () => {
    setMode('login');
    setPassword('');
    setConfirmPassword('');
  };

  if (mode === 'login') {
    return (
      <Card className="w-full border-0 bg-white dark:bg-gray-900 shadow-2xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Log in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={switchToRegister}
                className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
                disabled={isLoading}
              >
                Don't have an account? Register
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === 'role') {
    return (
      <Card className="w-full border-0 bg-white dark:bg-gray-900 shadow-2xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Choose Account Type
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Select how you'll use AushadiExpress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRole(option.value)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedRole === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                  {selectedRole === option.value && (
                    <div className="text-primary">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={() => setStep('details')}
            className="w-full h-11 font-medium"
          >
            Continue
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchToLogin}
              className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
            >
              Already have an account? Log in
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 bg-white dark:bg-gray-900 shadow-2xl">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep('role')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            ←
          </button>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Create {roleOptions.find(r => r.value === selectedRole)?.label} Account
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {selectedRole === 'customer' 
                ? 'Enter your details to start ordering medicines'
                : 'Set up your business account to get started'
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleRegister} className="space-y-4">
          {selectedRole === 'customer' ? (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Your Name
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                className="h-11"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-medium">
                Business Name
              </Label>
              <Input
                id="businessName"
                type="text"
                placeholder="Enter your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                disabled={isLoading}
                required
                className="h-11"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="h-11"
            />
          </div>

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

          <Button
            type="submit"
            className="w-full h-11 font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Setting up...' : 'Complete Setup'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={switchToLogin}
              className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
              disabled={isLoading}
            >
              Already have an account? Log in
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SetupWizardProps {
  onComplete: () => void;
}

type UserRole = 'customer' | 'retailer' | 'wholesaler' | 'doctor';

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

  const [username, setUsername] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Wholesaler-specific fields
  const [gstNumber, setGstNumber] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  // Doctor-specific fields
  const [specialization, setSpecialization] = useState('');
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
          role: selectedRole,
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

    // Wholesaler-specific validations
    if (selectedRole === 'wholesaler') {
      if (!gstNumber.trim()) {
        toast({
          title: 'Error',
          description: 'GST number is required for wholesaler registration',
          variant: 'destructive',
        });
        return;
      }
      // Basic GST format validation
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gstNumber.toUpperCase())) {
        toast({
          title: 'Error',
          description: 'Please enter a valid GST number',
          variant: 'destructive',
        });
        return;
      }
      if (!businessAddress.trim()) {
        toast({
          title: 'Error',
          description: 'Business address is required',
          variant: 'destructive',
        });
        return;
      }
      if (!contactPhone.trim()) {
        toast({
          title: 'Error',
          description: 'Contact phone is required',
          variant: 'destructive',
        });
        return;
      }
      // Basic phone validation (Indian mobile)
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(contactPhone)) {
        toast({
          title: 'Error',
          description: 'Please enter a valid 10-digit mobile number',
          variant: 'destructive',
        });
        return;
      }
    }

    if (selectedRole === 'doctor') {
      if (!contactPhone.trim()) {
        toast({
          title: 'Error',
          description: 'Contact phone is required',
          variant: 'destructive',
        });
        return;
      }
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(contactPhone)) {
        toast({
          title: 'Error',
          description: 'Please enter a valid 10-digit mobile number',
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

      // Add wholesaler-specific fields
      if (selectedRole === 'wholesaler') {
        payload.gstNumber = gstNumber.toUpperCase();
        payload.businessAddress = businessAddress;
        payload.contactPhone = contactPhone;
      }

      if (selectedRole === 'doctor') {
        payload.contactPhone = contactPhone;
        payload.specialization = specialization;
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

      if (selectedRole === 'customer') {
        // For customers: redirect to login after registration
        toast({
          title: 'Registration Successful!',
          description: 'Please log in to continue',
        });

        setMode('login');
        setUsername(username);
        setPassword('');
        setConfirmPassword('');
        setIsLoading(false);
      } else {
        // For businesses (retailer & wholesaler): auto-login
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('lastBusinessName', businessName);
        localStorage.setItem('userRole', selectedRole);

        toast({
          title: 'Welcome!',
          description: `${businessName} is ready to go!`,
        });

        onComplete();
      }
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
      emoji: '🏭',
      description: 'Sell medicines to retailers'
    },
    {
      value: 'doctor' as UserRole,
      label: 'Doctor',
      emoji: '⚕️',
      description: 'Manage patients & write prescriptions'
    },
  ];

  const switchToRegister = () => {
    setMode('register');
    setStep('role');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setBusinessName('');
    // Reset wholesaler fields
    setGstNumber('');
    setBusinessAddress('');
    setContactPhone('');
    // Reset doctor fields
    setSpecialization('');
  };

  const switchToLogin = () => {
    setMode('login');
    setPassword('');
    setConfirmPassword('');
  };

  if (mode === 'login') {
    return (
      <Card className="w-full border-0 bg-white dark:bg-gray-900 shadow-2xl">
        <CardHeader className="space-y-0.5 pb-2">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-xs text-gray-600 dark:text-gray-400">
            Log in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleLogin} className="space-y-3">
            {/* Role Selector - Compact horizontal pills */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">I am a</Label>
              <div className="flex gap-2">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedRole(option.value)}
                    className={`flex-1 py-2 px-3 rounded-full border-2 transition-all ${
                      selectedRole === option.value
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <span className={`text-sm font-medium ${
                      selectedRole === option.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">
                {selectedRole === 'customer' ? 'Username' : 'Business Name'}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={selectedRole === 'customer' ? 'Enter your username' : 'Enter your business name'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
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
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </Button>

            <div className="text-center pt-0.5">
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
        <CardHeader className="space-y-0.5 pb-2">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
            Choose Account Type
          </CardTitle>
          <CardDescription className="text-xs text-gray-600 dark:text-gray-400">
            Select how you'll use AushadiExpress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2.5">
            {roleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRole(option.value)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  selectedRole === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">{option.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {option.description}
                    </div>
                  </div>
                  {selectedRole === option.value && (
                    <div className="text-primary text-sm">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={() => setStep('details')}
            className="w-full h-10 font-medium"
          >
            Continue
          </Button>

          <div className="text-center pt-0.5">
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
      <CardHeader className="space-y-0.5 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep('role')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-lg"
          >
            ←
          </button>
          <div>
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
              Create {roleOptions.find(r => r.value === selectedRole)?.label} Account
            </CardTitle>
            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">
              {selectedRole === 'customer'
                ? 'Enter your details to start ordering'
                : 'Set up your business account'
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <form onSubmit={handleRegister} className="space-y-3">
          {selectedRole === 'customer' ? (
            <div className="space-y-1.5">
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
                className="h-10"
              />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
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
                  className="h-10"
                />
              </div>

              {/* Wholesaler-specific fields */}
              {selectedRole === 'wholesaler' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="gstNumber" className="text-sm font-medium">
                      GST Number
                    </Label>
                    <Input
                      id="gstNumber"
                      type="text"
                      placeholder="e.g., 22AAAAA0000A1Z5"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      disabled={isLoading}
                      required
                      className="h-10 uppercase"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="businessAddress" className="text-sm font-medium">
                      Business Address
                    </Label>
                    <Input
                      id="businessAddress"
                      type="text"
                      placeholder="Full business address"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      disabled={isLoading}
                      required
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contactPhone" className="text-sm font-medium">
                      Contact Phone
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      disabled={isLoading}
                      required
                      className="h-10"
                      maxLength={10}
                    />
                  </div>
                </>
              )}

              {selectedRole === 'doctor' && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="specialization" className="text-sm font-medium">
                      Specialization
                    </Label>
                    <Input
                      id="specialization"
                      type="text"
                      placeholder="e.g., General Physician, Cardiologist"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      disabled={isLoading}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contactPhone" className="text-sm font-medium">
                      Contact Phone
                    </Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      disabled={isLoading}
                      required
                      className="h-10"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="space-y-1.5">
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
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
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
              className="h-10"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-10 font-medium"
            disabled={isLoading}
          >
            {isLoading ? 'Setting up...' : 'Complete Setup'}
          </Button>

          <div className="text-center pt-0.5">
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

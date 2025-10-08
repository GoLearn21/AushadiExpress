import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PincodeOnboardingProps {
  onComplete: () => void;
}

export function PincodeOnboarding({ onComplete }: PincodeOnboardingProps) {
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(pincode)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit pincode',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          pincode: pincode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update pincode');
      }

      localStorage.setItem('user', JSON.stringify(data));

      toast({
        title: 'Success!',
        description: 'Your pincode has been saved',
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-primary">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-2">
            <svg className="w-12 h-12" viewBox="0 0 32 32" fill="none">
              <rect x="7" y="9" width="18" height="20" rx="2" fill="white" />
              <rect x="9" y="6" width="14" height="4" rx="1" fill="white" />
              <rect x="12" y="17" width="8" height="2" rx="0.5" fill="#3B82F6" />
              <rect x="15" y="14" width="2" height="8" rx="0.5" fill="#3B82F6" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white">
            One More Step
          </h1>
          <p className="text-white/80 text-sm font-medium">Enter your pincode to start searching for medicines</p>
        </div>
        
        <Card className="w-full border-0 bg-white dark:bg-gray-900 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Your Pincode
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              We need your pincode to show you nearby pharmacies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pincode" className="text-sm font-medium">
                  Pincode
                </Label>
                <Input
                  id="pincode"
                  type="text"
                  placeholder="Enter 6-digit pincode"
                  value={pincode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPincode(value);
                  }}
                  disabled={isLoading}
                  required
                  maxLength={6}
                  className="h-11"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

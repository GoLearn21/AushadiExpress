import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'retailer'>('customer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      toast({
        title: isLogin ? 'Welcome back!' : 'Account created!',
        description: isLogin
          ? `Logged in as ${data.username}`
          : role === 'retailer' ? `Your pharmacy is ready!` : `Your customer account is ready!`,
      });

      // Wait a moment for session to save, then reload
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center">
              <span className="material-icons text-white text-4xl">local_pharmacy</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            AushadiExpress
          </CardTitle>
          <CardDescription className="text-center">
            Smart Pharmacy. Simplified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">I am a</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'customer'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className={`material-icons text-3xl ${
                      role === 'customer' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      person
                    </span>
                    <span className={`font-medium ${
                      role === 'customer' ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      Customer
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      Order medicines
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('retailer')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'retailer'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className={`material-icons text-3xl ${
                      role === 'retailer' ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      storefront
                    </span>
                    <span className={`font-medium ${
                      role === 'retailer' ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      Pharmacy
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      Manage store
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">
                {role === 'customer' ? 'Username' : 'Pharmacy Name'}
              </Label>
              <Input
                id="username"
                type="text"
                placeholder={role === 'customer' ? 'Enter your username' : 'Enter your pharmacy name'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {!isLogin && role === 'retailer' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              <strong>Note:</strong> When you create an account, a unique tenant ID will be automatically generated for your pharmacy. All your data will be completely isolated from other pharmacies.
            </div>
          )}

          {!isLogin && role === 'customer' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
              <strong>Note:</strong> Create your account to start ordering medicines from nearby pharmacies with ease.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

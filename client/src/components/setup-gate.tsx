import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { SetupWizard } from './setup-wizard';
import { PincodeOnboarding } from './pincode-onboarding';

interface SetupGateProps {
  children: ReactNode;
}

export function SetupGate({ children }: SetupGateProps) {
  const { user, needsSetup, refetch } = useAuth();

  if (needsSetup) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-primary">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-2">
              <svg className="w-12 h-12" viewBox="0 0 32 32" fill="none">
                {/* Jar body */}
                <rect x="7" y="9" width="18" height="20" rx="2" fill="white" />
                {/* Jar lid/cap */}
                <rect x="9" y="6" width="14" height="4" rx="1" fill="white" />
                {/* Blue cross - horizontal */}
                <rect x="12" y="17" width="8" height="2" rx="0.5" fill="#3B82F6" />
                {/* Blue cross - vertical */}
                <rect x="15" y="14" width="2" height="8" rx="0.5" fill="#3B82F6" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white">
              AushadiExpress
            </h1>
            <p className="text-white/80 text-sm font-medium">Smart Pharmacy. Simplified.</p>
          </div>
          <SetupWizard onComplete={refetch} />
        </div>
      </div>
    );
  }

  // Check if user is a customer without pincode
  if (user && user.role === 'customer' && !user.pincode) {
    return <PincodeOnboarding onComplete={refetch} />;
  }

  return <>{children}</>;
}

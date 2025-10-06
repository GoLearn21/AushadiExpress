import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { SetupWizard } from './setup-wizard';

interface SetupGateProps {
  children: ReactNode;
}

export function SetupGate({ children }: SetupGateProps) {
  const { needsSetup, refetch } = useAuth();

  if (needsSetup) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-primary">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-2">
              <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="12" height="16" rx="1.5" />
                <rect x="8" y="2" width="8" height="3" rx="0.5" />
                <path d="M10 12h4M12 10v4" stroke="rgb(59, 130, 246)" strokeWidth="1.5" strokeLinecap="round" />
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

  return <>{children}</>;
}

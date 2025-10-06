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
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg">
              <span className="text-3xl">🏪</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              AushadiExpress
            </h1>
            <p className="text-muted-foreground text-sm">Smart Pharmacy. Simplified.</p>
          </div>
          <SetupWizard onComplete={refetch} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

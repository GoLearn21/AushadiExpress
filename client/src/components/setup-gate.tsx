import { ReactNode } from 'react';
import { SetupWizard } from './setup-wizard';
import { useAuth } from '@/hooks/use-auth';

interface SetupGateProps {
  children: ReactNode;
}

export function SetupGate({ children }: SetupGateProps) {
  const { needsSetup, refetch } = useAuth();

  if (needsSetup) {
    return (
      <div className="relative">
        {/* Background content (blurred and disabled) */}
        <div className="opacity-20 pointer-events-none" aria-hidden="true">
          {children}
        </div>
        
        {/* Setup wizard overlay */}
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <SetupWizard onComplete={refetch} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

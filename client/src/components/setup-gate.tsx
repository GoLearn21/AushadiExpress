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
      <div className="flex flex-col h-screen">
        {/* Setup wizard centered on screen */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
          <SetupWizard onComplete={refetch} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

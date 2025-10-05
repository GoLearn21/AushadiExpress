import { ReactNode } from 'react';
import { SetupWizard } from './setup-wizard';
import { useAuth } from '@/hooks/use-auth';

interface SetupGateProps {
  children: ReactNode;
}

export function SetupGate({ children }: SetupGateProps) {
  const { needsSetup, refetch } = useAuth();

  return (
    <>
      {/* Always render the home screen */}
      {children}
      
      {/* Show setup wizard as a full-screen overlay when needed */}
      {needsSetup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <SetupWizard onComplete={refetch} />
        </div>
      )}
    </>
  );
}

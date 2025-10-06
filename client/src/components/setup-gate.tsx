import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { SetupWizard } from './setup-wizard';

interface SetupGateProps {
  children: ReactNode;
}

export function SetupGate({ children }: SetupGateProps) {
  const { needsSetup, refetch } = useAuth();

  if (needsSetup) {
    return <SetupWizard onComplete={refetch} />;
  }

  return <>{children}</>;
}

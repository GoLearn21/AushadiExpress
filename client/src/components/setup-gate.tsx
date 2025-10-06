import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface SetupGateProps {
  children: ReactNode;
}

export function SetupGate({ children }: SetupGateProps) {
  return <>{children}</>;
}

import { tw } from '@/lib/theme';

interface AppHeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function AppHeader({ title, showLogo = true }: AppHeaderProps) {
  return (
    <header className="app-bar text-primary-foreground px-4 py-3 elevation-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showLogo && (
            <>
              <span className="material-icons text-xl">medication</span>
              <h1 className={`${tw.headingLg} text-primary-foreground`}>AushadiExpress</h1>
            </>
          )}
          {title && !showLogo && (
            <h1 className={`${tw.headingLg} text-primary-foreground`}>{title}</h1>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className={tw.statusOnline}></div>
          <span className={`${tw.bodySm} text-primary-foreground/80`}>Online</span>
        </div>
      </div>
    </header>
  );
}

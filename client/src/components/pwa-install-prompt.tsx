import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                               (window.navigator as any).standalone === true;

    console.log('[PWA] Device check - iOS:', isIOSDevice, 'Standalone:', isInStandaloneMode);
    console.log('[PWA] User Agent:', navigator.userAgent);

    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode);

    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');

    if (isInStandaloneMode || hasBeenDismissed) {
      console.log('[PWA] Not showing prompt - Standalone or dismissed');
      return;
    }

    const handler = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    console.log('[PWA] Event listener added for beforeinstallprompt');

    // Check for actual iOS by testing if it's a mobile device AND matches iOS pattern
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Show prompt after delay for iOS or if service worker is registered
    setTimeout(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          if (registration && registration.active) {
            console.log('[PWA] Service worker active - showing install prompt');
            setShowPrompt(true);
          }
        });
      }

      // Also show for iOS devices
      if (isIOSDevice && isMobile && !isInStandaloneMode && !hasBeenDismissed) {
        console.log('[PWA] Real iOS device detected - showing installation instructions');
        setShowPrompt(true);
      }
    }, 3000); // Show after 3 seconds if service worker is ready

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pb-4 md:bottom-4 md:left-auto md:right-4 md:max-w-md">
      <Card className="p-4 shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1">
              Install AushadiExpress
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {isIOS
                ? 'Tap the Share button and select "Add to Home Screen"'
                : deferredPrompt
                ? 'Install this app for offline access and a better experience'
                : 'Install via Chrome menu (⋮) → "Install AushadiExpress" for offline access'}
            </p>

            <div className="flex gap-2">
              {!isIOS && (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="flex-1"
                  disabled={!deferredPrompt}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Install
                </Button>
              )}
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
              >
                Later
              </Button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}

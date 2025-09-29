import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Props = {
  visible: boolean;
  onAction: (action: 'settings' | 'retry' | 'cancel') => void;
};

export default function PermissionModal({ visible, onAction }: Props) {
  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onAction('cancel')}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="material-icons text-orange-500">camera_alt</span>
            <span>Camera Permission Needed</span>
          </DialogTitle>
          <DialogDescription className="text-left space-y-3">
            <p>We need camera access to scan barcodes and invoices for you.</p>
            <p className="text-sm text-muted-foreground">
              Please enable camera access in your browser settings, then try again.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-2 pt-4">
          <Button
            onClick={() => onAction('settings')}
            className="w-full"
            data-testid="button-open-settings"
          >
            <span className="material-icons mr-2">settings</span>
            Open Browser Settings
          </Button>

          <Button
            variant="outline"
            onClick={() => onAction('retry')}
            className="w-full"
            data-testid="button-retry-camera"
          >
            <span className="material-icons mr-2">refresh</span>
            Try Again
          </Button>

          <Button
            variant="ghost"
            onClick={() => onAction('cancel')}
            className="w-full"
            data-testid="button-cancel-camera"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
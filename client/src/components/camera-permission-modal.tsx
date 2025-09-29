import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

interface CameraPermissionModalProps {
  isOpen: boolean;
  onOpenSettings: () => void;
  onCancel: () => void;
  onRetry: () => void;
}

export function CameraPermissionModal({ 
  isOpen, 
  onOpenSettings, 
  onCancel, 
  onRetry 
}: CameraPermissionModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span className="material-icons text-amber-500">videocam_off</span>
            <span>Camera Permission Required</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <span className="material-icons text-primary mt-1">info</span>
            <div className="text-sm space-y-2">
              <p>
                Camera access is needed to scan barcodes for quick product lookup.
              </p>
              <p className="text-muted-foreground">
                You can still add products manually using the search function.
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="font-medium text-sm mb-2">To enable camera:</h4>
            <ol className="text-sm text-muted-foreground space-y-1">
              <li>1. Click "Open Settings" below</li>
              <li>2. Find "Camera" or "Permissions"</li>
              <li>3. Allow camera access for this site</li>
              <li>4. Return and click "Try Again"</li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onOpenSettings}
            data-testid="open-camera-settings"
          >
            <span className="material-icons mr-2 text-sm">settings</span>
            Open Settings
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
            data-testid="continue-without-camera"
          >
            Continue Without Camera
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={onOpenSettings}
              className="flex-1 sm:flex-none"
              data-testid="open-settings"
            >
              Open Settings
            </Button>
            <Button
              onClick={onRetry}
              className="flex-1 sm:flex-none"
              data-testid="retry-camera"
            >
              Try Again
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: Array<{
    label: string;
    icon?: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline';
    disabled?: boolean;
  }>;
}

export function ActionSheet({ isOpen, onClose, title, actions }: ActionSheetProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-0 gap-0">
        {title && (
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-center">{title}</h3>
          </div>
        )}
        <div className="p-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'ghost'}
              className="w-full justify-start h-12 text-left"
              onClick={() => {
                action.onClick();
                onClose();
              }}
              disabled={action.disabled}
              data-testid={`action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {action.icon && (
                <span className="material-icons mr-3 text-lg">{action.icon}</span>
              )}
              {action.label}
            </Button>
          ))}
        </div>
        <div className="p-2 pt-0">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
            data-testid="action-cancel"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
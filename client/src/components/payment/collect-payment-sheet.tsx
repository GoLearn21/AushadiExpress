import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface CollectPaymentSheetProps {
  amount: number;
  onPaymentComplete: (method: 'cash' | 'upi' | 'card') => void;
  onCancel: () => void;
  isOpen: boolean;
  acceptOnlyCash?: boolean;
}

export function CollectPaymentSheet({ 
  amount, 
  onPaymentComplete, 
  onCancel, 
  isOpen,
  acceptOnlyCash = false 
}: CollectPaymentSheetProps) {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'cash' as const,
      label: 'Cash',
      icon: 'payments',
      description: 'Cash payment',
      available: true,
      default: true
    },
    {
      id: 'upi' as const,
      label: 'UPI',
      icon: 'smartphone',
      description: 'UPI payment',
      available: !acceptOnlyCash,
      default: false
    },
    {
      id: 'card' as const,
      label: 'Card',
      icon: 'credit_card',
      description: 'Card payment',
      available: !acceptOnlyCash,
      default: false
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsProcessing(false);
    onPaymentComplete(selectedMethod);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Collect Payment</span>
            <Badge variant="outline" className="text-xs">
              OFFLINE
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Amount Display */}
          <div className="text-center py-4 bg-muted/30 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">
              {formatAmount(amount)}
            </div>
            <p className="text-sm text-muted-foreground">Amount to collect</p>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
            <div className="grid gap-2">
              {paymentMethods.filter(method => method.available).map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={isProcessing}
                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center justify-between ${
                    selectedMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  data-testid={`payment-method-${method.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="material-icons text-lg">
                      {method.icon}
                    </span>
                    <div className="text-left">
                      <div className="font-medium">{method.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {method.description}
                      </div>
                    </div>
                  </div>
                  
                  {selectedMethod === method.id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <span className="material-icons text-white text-sm">check</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Specific Info */}
          {selectedMethod === 'cash' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <span className="material-icons text-blue-600 text-sm mt-0.5">info</span>
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Cash Payment</p>
                  <p className="text-blue-700">Ensure you have the correct change ready</p>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'upi' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <span className="material-icons text-green-600 text-sm mt-0.5">smartphone</span>
                <div className="text-sm">
                  <p className="font-medium text-green-900">UPI Payment</p>
                  <p className="text-green-700">Customer will pay via UPI app</p>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'card' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <span className="material-icons text-purple-600 text-sm mt-0.5">credit_card</span>
                <div className="text-sm">
                  <p className="font-medium text-purple-900">Card Payment</p>
                  <p className="text-purple-700">Swipe or insert customer's card</p>
                </div>
              </div>
            </div>
          )}

          {/* Accept Only Cash Warning */}
          {acceptOnlyCash && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <span className="material-icons text-yellow-600 text-sm mt-0.5">warning</span>
                <div className="text-sm">
                  <p className="font-medium text-yellow-900">Cash Only Mode</p>
                  <p className="text-yellow-700">Digital payments are disabled in settings</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
              data-testid="cancel-payment"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1"
              data-testid="confirm-payment"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `Collect ${formatAmount(amount)}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
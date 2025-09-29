import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface UpiLiteMockProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UpiLiteMock({ amount, onSuccess, onCancel }: UpiLiteMockProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('upi');

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Payment
            <Badge variant="outline">OFFLINE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              ₹{amount.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Amount to pay</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('upi')}
                className="flex items-center space-x-2"
                data-testid="payment-upi"
              >
                <span className="material-icons text-sm">smartphone</span>
                <span>UPI</span>
              </Button>
              <Button
                variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('cash')}
                className="flex items-center space-x-2"
                data-testid="payment-cash"
              >
                <span className="material-icons text-sm">payments</span>
                <span>Cash</span>
              </Button>
            </div>
          </div>

          {paymentMethod === 'upi' && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="material-icons text-green-600">check_circle</span>
                <span className="text-sm font-medium">UPI Lite Available</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Instant payment without PIN for amounts under ₹500
              </p>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="material-icons text-blue-600">info</span>
                <span className="text-sm font-medium">Cash Payment</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Make sure to provide correct change
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isProcessing}
              data-testid="cancel-payment"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={isProcessing}
              data-testid="confirm-payment"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `Pay ₹${amount.toFixed(2)}`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
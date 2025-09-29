import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useLocation } from "wouter";

export default function EnterPOScreen() {
  const [, navigate] = useLocation();
  const [poData, setPOData] = useState({
    poNumber: '',
    vendor: '',
    invoiceNumber: '',
    invoiceDate: '',
    totalAmount: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setPOData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Placeholder for PO submission
    console.log('PO Data:', poData);
    
    // Navigate back to ops
    navigate('/ops');
  };

  const handleCancel = () => {
    navigate('/ops');
  };

  return (
    <div className="h-screen overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="enter-po-title">
              Enter Purchase Order
            </h1>
            <p className="text-sm text-muted-foreground">
              Manually enter PO and invoice details
            </p>
          </div>
          <button 
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
            data-testid="cancel-po-entry"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* PO Entry Form */}
        <Card className="elevation-1">
          <CardHeader>
            <CardTitle>Purchase Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poNumber">PO Number</Label>
              <Input
                id="poNumber"
                placeholder="Enter PO number"
                value={poData.poNumber}
                onChange={(e) => handleInputChange('poNumber', e.target.value)}
                data-testid="input-po-number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor Name</Label>
              <Input
                id="vendor"
                placeholder="Enter vendor name"
                value={poData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                data-testid="input-vendor"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                placeholder="Enter invoice number"
                value={poData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                data-testid="input-invoice-number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={poData.invoiceDate}
                onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                data-testid="input-invoice-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                placeholder="Enter total amount"
                value={poData.totalAmount}
                onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                data-testid="input-total-amount"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleCancel}
            data-testid="cancel-po-button"
          >
            Cancel
          </Button>
          <Button 
            className="flex-1"
            onClick={handleSubmit}
            disabled={!poData.poNumber || !poData.vendor}
            data-testid="submit-po-button"
          >
            Submit PO
          </Button>
        </div>

        {/* Placeholder for future item entry */}
        <Card className="elevation-1 bg-muted/30">
          <CardContent className="p-6 text-center">
            <span className="material-icons text-4xl text-muted-foreground mb-2">inventory_2</span>
            <h3 className="font-semibold text-muted-foreground">Item Details Entry</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Individual item scanning and entry coming in Iteration 2
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
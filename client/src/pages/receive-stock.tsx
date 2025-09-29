import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { tw, getTint } from "../lib/theme";
import { useLocation } from "wouter";

export default function ReceiveStockScreen() {
  const [, navigate] = useLocation();
  const [scanMode, setScanMode] = useState<'invoice' | 'po'>('invoice');
  const [scannedData, setScannedData] = useState('');
  
  // Check for route params to auto-scroll and trigger actions
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    
    if (action === 'scan') {
      setScanMode('invoice');
      // Auto-scroll to scan card and trigger it
      setTimeout(() => {
        const scanCard = document.querySelector('[data-testid="scan-invoice-card"]');
        scanCard?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (action === 'enter') {
      setScanMode('po');
      // Auto-scroll to PO card
      setTimeout(() => {
        const poCard = document.querySelector('[data-testid="enter-po-card"]');
        poCard?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  const handleScanInvoice = () => {
    // Placeholder for invoice scanning
    console.log('Invoice scan initiated');
    
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'receiving_beta_opened', {
        scan_type: 'invoice'
      });
    }
  };

  const handleEnterPO = () => {
    // Placeholder for PO entry
    console.log('PO entry initiated');
    
    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'receiving_beta_opened', {
        scan_type: 'po'
      });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-6 pb-28">
      
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate('/ops')}
              className="text-muted-foreground hover:text-foreground"
              data-testid="back-to-ops"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <h1 className={`${tw.headingXl}`} data-testid="receive-stock-title">Receive Stock</h1>
          </div>
          <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
            BETA
          </div>
        </div>
        
        {/* Hero Banner - 72dp height */}
        <div 
          className="rounded-lg p-6 mb-6 cursor-pointer"
          style={{ 
            height: '72px',
            background: `linear-gradient(135deg, ${getTint(200)}, ${getTint(100)})` 
          }}
          onClick={() => {
            // Auto-scroll to action cards on banner click
            const actionSection = document.querySelector('[data-testid="action-cards"]');
            actionSection?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <div className="flex items-center space-x-4 h-full">
            <div className="w-16 h-16 bg-white/80 rounded-xl flex items-center justify-center relative">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="material-icons text-blue-600">inbox</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="material-icons text-xs text-blue-600">add</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className={`${tw.headingLg} font-bold text-blue-900 mb-1`}>Stock Inward made easy</h2>
              <p className={`${tw.body} text-blue-700`}>Scan supplier invoices or enter purchase orders</p>
            </div>
          </div>
        </div>

        {/* Action Cards Section */}
        <div data-testid="action-cards" className="grid grid-cols-2 gap-4 mb-6">
          <Card 
            className="elevation-1 cursor-pointer hover:elevation-2 transition-all"
            onClick={() => {
              console.log('[RECEIVE-STOCK] Scan Invoice button clicked');
              setScanMode('invoice');
              navigate('/capture?mode=invoice');
            }}
            data-testid="scan-invoice-card"
          >
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
                  <span className="material-icons text-2xl text-blue-600">document_scanner</span>
                </div>
                <div>
                  <h3 className={`${tw.headingMd} font-semibold`}>Scan Invoice</h3>
                  <p className={`${tw.bodySm} text-muted-foreground mt-1`}>Use camera to scan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className="elevation-1 cursor-pointer hover:elevation-2 transition-all"
            onClick={() => {
              setScanMode('po');
              navigate('/enter-po');
            }}
            data-testid="enter-po-card"
          >
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center">
                  <span className="material-icons text-2xl text-green-600">receipt_long</span>
                </div>
                <div>
                  <h3 className={`${tw.headingMd} font-semibold`}>Enter PO</h3>
                  <p className={`${tw.bodySm} text-muted-foreground mt-1`}>Manual entry</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracker */}
        <Card className="elevation-1">
          <CardContent className="p-4">
            <h3 className={`${tw.headingMd} mb-4`}>Processing Status</h3>
            <div className="flex space-x-4">
              <div className="flex-1 text-center">
                <div className={`${tw.headingXl} font-bold text-blue-600`}>0</div>
                <p className={`${tw.bodySm} text-muted-foreground`}>Invoices pending sync</p>
              </div>
              <div className="w-px bg-border"></div>
              <div className="flex-1 text-center">
                <div className={`${tw.headingXl} font-bold text-green-600`}>0</div>
                <p className={`${tw.bodySm} text-muted-foreground`}>POs open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Empty State Illustration */}
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg width="120" height="120" viewBox="0 0 120 120" className="mb-4 opacity-60">
            <rect x="20" y="30" width="80" height="60" rx="8" fill="none" stroke="currentColor" strokeWidth="2"/>
            <rect x="30" y="40" width="60" height="8" rx="2" fill="currentColor" opacity="0.3"/>
            <rect x="30" y="55" width="40" height="6" rx="1" fill="currentColor" opacity="0.2"/>
            <rect x="30" y="65" width="50" height="6" rx="1" fill="currentColor" opacity="0.2"/>
            <circle cx="60" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2"/>
            <path d="M56 20 L60 16 L64 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h3 className={`${tw.headingMd} text-muted-foreground mb-2`}>Ready to receive stock</h3>
          <p className={`${tw.body} text-muted-foreground max-w-sm`}>Start by scanning an invoice or entering a purchase order to begin the receiving process.</p>
        </div>
        
        {/* Bottom spacing for navigation */}
        <div className="h-16"></div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { capabilityService, DeviceTier } from "@/services/capability";
import { CollectPaymentSheet } from "@/components/payment/collect-payment-sheet";
import { CameraPermissionModal } from "@/components/camera-permission-modal";
import type { Product, Stock } from "@shared/schema";

interface BillItem {
  product: Product;
  stock: Stock;
  quantity: number;
  price: number;
}

interface BarcodeResult {
  code: string;
  productId?: string;
}

export default function PosScreen() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [deviceTier, setDeviceTier] = useState<DeviceTier>(DeviceTier.VALUE);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBillDrawer, setShowBillDrawer] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showCameraPermission, setShowCameraPermission] = useState(false);
  const [acceptOnlyCash, setAcceptOnlyCash] = useState(false);

  // Fetch products and stock data
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products']
  });

  const { data: stockData = [] } = useQuery<Stock[]>({
    queryKey: ['/api/stock']
  });

  // Barcode lookup mutation
  const barcodeLookup = useMutation({
    mutationFn: async (barcode: string) => {
      const response = await fetch('/api/barcode/lookup', {
        method: 'POST',
        body: JSON.stringify({ barcode }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.productId) {
        addProductToBill(data.productId);
      } else {
        toast({
          title: "Product not found",
          description: `No product found for barcode: ${data.barcode}`,
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "Scan failed",
        description: "Unable to lookup barcode. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Complete sale mutation
  const completeSale = useMutation({
    mutationFn: async (saleData: any) => {
      const response = await fetch('/api/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      setBillItems([]);
      setShowBillDrawer(false);
      toast({
        title: "Sale completed",
        description: "Payment processed successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sales'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stock'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sales/today'] });
    }
  });

  // Initialize device capabilities and settings
  useEffect(() => {
    const initCapabilities = async () => {
      const tier = await capabilityService.getTier();
      setDeviceTier(tier);
    };
    
    const cashOnlySettings = localStorage.getItem('acceptOnlyCash');
    setAcceptOnlyCash(cashOnlySettings === 'true');
    
    initCapabilities();
    
    // Check for barcode result from scanner page
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('productId');
    const barcode = urlParams.get('barcode');
    const productName = urlParams.get('productName');
    
    if (productId && barcode) {
      // Clear URL params
      window.history.replaceState({}, '', '/pos');
      
      // Add product to bill
      addProductToBill(productId);
      
      toast({
        title: "Product scanned successfully!",
        description: `Added ${productName || 'product'} to your bill`,
      });
    }
  }, []);

  // Start camera for barcode scanning
  const startCamera = async () => {
    try {
      const hasCamera = await capabilityService.hasCamera();
      if (!hasCamera) {
        toast({
          title: "Camera not available",
          description: "No camera detected on this device",
          variant: "destructive"
        });
        return;
      }

      // Set video constraints based on device tier
      const constraints = {
        video: {
          facingMode: 'environment',
          width: deviceTier === DeviceTier.VALUE ? 720 : 1080,
          height: deviceTier === DeviceTier.VALUE ? 480 : 720
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsScanning(true);
      
      // Start barcode detection
      if (deviceTier !== DeviceTier.VALUE) {
        startContinuousScanning();
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setShowCameraPermission(true);
      } else {
        toast({
          title: "Camera error",
          description: "Unable to access camera. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
  };

  const startContinuousScanning = () => {
    // Simplified barcode detection for demo
    // In production, this would use a library like ZXing or QuaggaJS
    const detectBarcode = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Simulate barcode detection (in real app, use proper barcode library)
        // For demo, we'll simulate finding a barcode after 3 seconds
        setTimeout(() => {
          if (isScanning) {
            const mockBarcode = "1234567890123";
            barcodeLookup.mutate(mockBarcode);
            stopCamera();
          }
        }, 3000);
      }

      if (isScanning) {
        requestAnimationFrame(detectBarcode);
      }
    };

    detectBarcode();
  };

  const captureFrame = () => {
    // Single frame capture for VALUE tier devices
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Simulate barcode detection
        const mockBarcode = "1234567890123";
        barcodeLookup.mutate(mockBarcode);
        stopCamera();
      }
    }
  };

  const addProductToBill = (productId: string) => {
    const product = products.find(p => p.id === productId);
    const availableStock = stockData.filter(s => s.productId === productId && s.quantity > 0);
    
    if (!product || availableStock.length === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock",
        variant: "destructive"
      });
      return;
    }

    // Use FEFO (First Expired, First Out) - find stock with earliest expiry
    const stock = availableStock.sort((a, b) => {
      const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
      return dateA - dateB;
    })[0];

    const existingItem = billItems.find(item => 
      item.product.id === productId && item.stock.id === stock.id
    );

    if (existingItem) {
      if (existingItem.quantity < stock.quantity) {
        setBillItems(items => 
          items.map(item =>
            item.product.id === productId && item.stock.id === stock.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        toast({
          title: "Insufficient stock",
          description: `Only ${stock.quantity} units available`,
          variant: "destructive"
        });
      }
    } else {
      setBillItems(items => [...items, {
        product,
        stock,
        quantity: 1,
        price: product.price
      }]);
    }

    setShowBillDrawer(true);
  };

  const updateQuantity = (productId: string, stockId: string, change: number) => {
    setBillItems(items => 
      items.map(item => {
        if (item.product.id === productId && item.stock.id === stockId) {
          const newQuantity = Math.max(0, item.quantity + change);
          const maxQuantity = item.stock.quantity;
          
          if (newQuantity > maxQuantity) {
            toast({
              title: "Insufficient stock",
              description: `Only ${maxQuantity} units available`,
              variant: "destructive"
            });
            return item;
          }
          
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const getBillTotal = () => {
    return billItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const handlePaymentComplete = (method: 'cash' | 'upi' | 'card') => {
    const tenantId = localStorage.getItem('currentTenantId') || 'default';
    const saleData = {
      total: getBillTotal(),
      items: JSON.stringify(billItems.map(item => ({
        productId: item.product.id,
        stockId: item.stock.id,
        quantity: item.quantity,
        price: item.price,
        paymentMethod: method,
        productName: item.product.name
      }))),
      tenantId
    };
    
    setShowPayment(false);
    completeSale.mutate(saleData);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleOpenCameraSettings = () => {
    // Try to open system camera settings
    if (typeof window !== 'undefined') {
      // For browsers, we can't directly open camera settings
      // but we can provide guidance
      window.open('chrome://settings/content/camera', '_blank');
    }
  };

  const handleCameraPermissionRetry = () => {
    setShowCameraPermission(false);
    // Small delay before retrying
    setTimeout(() => {
      startCamera();
    }, 500);
  };


  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="md:hidden"
              aria-label="Go back"
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <h1 className="text-xl font-bold" data-testid="pos-title">Point of Sale</h1>
          </div>
          <Badge variant="outline" className="text-xs">
            {deviceTier} TIER
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${showBillDrawer ? 'hidden md:flex' : ''}`}>
          {/* Search and Scan Bar */}
          <div className="p-4 border-b border-border">
            <div className="flex space-x-2">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
                data-testid="search-products"
              />
              <Button
                onClick={() => {
                  console.log('[POS] Camera button clicked - navigating to barcode capture');
                  navigate('/capture?mode=barcode');
                }}
                variant="default"
                data-testid="scan-button"
              >
                <span className="material-icons">qr_code_scanner</span>
              </Button>
            </div>
          </div>

          {/* Camera View */}
          {isScanning && (
            <div className="p-4 bg-black">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover rounded"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {deviceTier === DeviceTier.VALUE && (
                  <Button
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                    onClick={captureFrame}
                    data-testid="capture-frame"
                  >
                    Capture
                  </Button>
                )}
                
                <div className="absolute top-4 right-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={stopCamera}
                    data-testid="close-camera"
                  >
                    <span className="material-icons">close</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1 p-4 overflow-y-auto pb-20">
            <div className="grid grid-cols-3 gap-3">
              {filteredProducts.map((product) => {
                const availableStock = stockData.filter(s => s.productId === product.id && s.quantity > 0);
                const totalStock = availableStock.reduce((sum, stock) => sum + stock.quantity, 0);
                
                return (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:elevation-2 transition-all"
                    onClick={() => addProductToBill(product.id)}
                    data-testid={`product-tile-${product.id}`}
                  >
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold text-primary">
                        ₹{product.price.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {totalStock}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {showBillDrawer && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-background/70 md:hidden"
            onClick={() => setShowBillDrawer(false)}
            aria-label="Close bill"
          />
        )}

        {/* Bill Drawer */}
        {showBillDrawer && (
          <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-card shadow-lg border-l border-border flex flex-col md:relative md:inset-auto md:z-auto md:w-80 md:max-w-none md:shadow-none">
            <div className="flex items-center justify-between mb-4 p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Current Bill</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowBillDrawer(false)}
                data-testid="close-bill"
              >
                <span className="material-icons">close</span>
              </Button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto mb-4 p-4 pt-0">
              {billItems.map((item, index) => (
                <Card key={`${item.product.id}-${item.stock.id}-${index}`} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <span className="text-sm font-bold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product.id, item.stock.id, -1)}
                        data-testid={`decrease-${item.product.id}`}
                      >
                        <span className="material-icons text-xs">remove</span>
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product.id, item.stock.id, 1)}
                        data-testid={`increase-${item.product.id}`}
                      >
                        <span className="material-icons text-xs">add</span>
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ₹{item.price.toFixed(2)} each
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="border-t border-border pt-4 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  ₹{getBillTotal().toFixed(2)}
                </span>
              </div>
              
              <Button
                className="w-full py-3"
                onClick={() => setShowPayment(true)}
                disabled={billItems.length === 0}
                data-testid="checkout-button"
              >
                Pay & Complete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Charge Bar - shows when bill has items but drawer is closed */}
      {billItems.length > 0 && !showBillDrawer && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 elevation-3">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-bold text-primary">₹{getBillTotal().toFixed(2)}</span>
            </div>
            <Button 
              onClick={() => setShowPayment(true)}
              className="px-6"
              data-testid="sticky-charge-button"
            >
              Charge ₹{getBillTotal().toFixed(2)}
            </Button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <CollectPaymentSheet
        isOpen={showPayment}
        amount={getBillTotal()}
        onPaymentComplete={handlePaymentComplete}
        onCancel={handlePaymentCancel}
        acceptOnlyCash={acceptOnlyCash}
      />

      {/* Camera Permission Modal */}
      <CameraPermissionModal
        isOpen={showCameraPermission}
        onRetry={handleCameraPermissionRetry}
        onOpenSettings={handleOpenCameraSettings}
        onCancel={() => setShowCameraPermission(false)}
      />
    </div>
  );
}

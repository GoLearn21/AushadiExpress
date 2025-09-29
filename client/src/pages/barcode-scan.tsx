import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { ensureCamera, createFileInputCapture, removeFileInput } from "../services/camera";
import { capabilityService, DeviceTier } from "../services/capability";
import { push } from "../utils/dev-logger";
import type { Product, Stock } from "@shared/schema";

export default function BarcodeScannerScreen() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [deviceTier, setDeviceTier] = useState<DeviceTier>(DeviceTier.VALUE);
  const [showWebFallback, setShowWebFallback] = useState(false);

  // Fetch products for barcode lookup
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
        // Navigate back to POS with barcode result
        navigate(`/pos?barcode=${data.barcode}&productId=${data.productId}&productName=${encodeURIComponent(data.productName || 'Unknown Product')}`);
        toast({
          title: "Product found!",
          description: `Added ${data.productName || 'product'} to bill`,
        });
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

  // Initialize camera with self-test retry logic
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 2;
    
    const tryCameraInit = async () => {
      push(`BarcodeScannerScreen: Camera init attempt ${attempts + 1}/${maxAttempts}`);
      const tier = await capabilityService.getTier();
      setDeviceTier(tier);
      
      ensureCamera({
        onGranted: () => {
          push('Camera granted → starting barcode scanner');
          startCameraStream();
        },
        onDenied: () => {
          push('Camera still denied in barcode scanner');
          attempts++;
          if (attempts < maxAttempts) {
            push(`Retrying camera init (${attempts}/${maxAttempts})`);
            setTimeout(tryCameraInit, 1000);
          } else {
            push('Max camera attempts reached - showing fallback');
            setShowWebFallback(true);
            toast({
              title: "Camera blocked",
              description: "You can still take photos using the capture button below",
              variant: "default"
            });
          }
        }
      });
    };

    tryCameraInit();

    // Cleanup on unmount
    return () => {
      stopCamera();
      if (fileInputRef.current) {
        removeFileInput(fileInputRef.current);
      }
    };
  }, [navigate]);

  const startCameraStream = async () => {
    try {
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
      console.error('Camera stream error:', error);
      setShowWebFallback(true);
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
    const detectBarcode = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Simulate barcode detection (in real app, use ZXing or QuaggaJS)
        // For demo, we'll simulate finding a barcode after 2 seconds
        setTimeout(() => {
          if (isScanning) {
            const mockBarcode = "1234567890123";
            barcodeLookup.mutate(mockBarcode);
            stopCamera();
          }
        }, 2000);
      }

      if (isScanning) {
        requestAnimationFrame(detectBarcode);
      }
    };

    detectBarcode();
  };

  const captureFrame = () => {
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

  const handleWebFallback = () => {
    if (!fileInputRef.current) {
      fileInputRef.current = createFileInputCapture((file) => {
        // Process the captured image file
        const reader = new FileReader();
        reader.onload = () => {
          // In a real app, this would analyze the image for barcodes
          // For demo, simulate finding a barcode
          const mockBarcode = "1234567890123";
          barcodeLookup.mutate(mockBarcode);
        };
        reader.readAsDataURL(file);
      });
    }
    
    fileInputRef.current.click();
  };

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                stopCamera();
                navigate('/pos');
              }}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              data-testid="back-to-pos"
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <h1 className="text-white font-semibold" data-testid="scanner-title">
              Barcode Scanner
            </h1>
          </div>
          
          {showWebFallback && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleWebFallback}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              data-testid="capture-image"
            >
              <span className="material-icons mr-2">photo_camera</span>
              Take Photo
            </Button>
          )}
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        {isScanning && cameraStream ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
              data-testid="camera-video"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="w-64 h-40 border-2 border-white rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400"></div>
                  
                  {/* Scanning Line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-400 animate-pulse"></div>
                </div>
                
                <p className="text-white text-center mt-4 text-sm">
                  Position barcode within the frame
                </p>
              </div>
            </div>

            {/* Capture Button for VALUE tier */}
            {deviceTier === DeviceTier.VALUE && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <Button
                  size="lg"
                  onClick={captureFrame}
                  className="rounded-full w-16 h-16"
                  data-testid="capture-frame"
                >
                  <span className="material-icons text-2xl">photo_camera</span>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <span className="material-icons text-6xl mb-4 opacity-60">qr_code_scanner</span>
              <h2 className="text-xl font-semibold mb-2">Starting Camera...</h2>
              <p className="text-white/80">Please allow camera access to scan barcodes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
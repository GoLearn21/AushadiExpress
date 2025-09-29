import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileInputCapture, removeFileInput } from "../services/camera";
import { cameraCapture } from "../services/camera-capture";
import { push } from "../utils/dev-logger";
import type { Product } from "@shared/schema";

interface QuickCaptureProps {
  mode: 'barcode' | 'invoice' | 'prescription';
  saleId?: string;
}

export default function QuickCaptureScreen() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Get mode from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const mode = (urlParams.get('mode') || 'barcode') as 'barcode' | 'invoice' | 'prescription';
  const saleId = urlParams.get('saleId') || undefined;
  
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showWebFallback, setShowWebFallback] = useState(false);

  // Mock user context - in real app this would come from auth
  const user = {
    id: 'user-1',
    role: localStorage.getItem('userRole') || 'retailer'
  };

  // Save capture mutation
  const saveCapture = useMutation({
    mutationFn: async (captureData: {
      uri: string;
      mode: string;
      ownerId: string;
      persona: string;
      saleId?: string;
    }) => {
      push(`Saving capture: ${captureData.mode}`);
      const response = await fetch('/api/captures', {
        method: 'POST',
        body: JSON.stringify(captureData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save capture: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      push(`Capture saved successfully: ${data.id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/captures'] });
    }
  });

  // Process barcode data
  const processBarcode = async (data: string) => {
    push(`Processing barcode: ${data}`);
    await persistCapture(`BARCODE:${data}`, data);
  };

  // Handle photo capture
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    push(`Taking ${mode} photo`);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Save with enhanced feedback
    await persistCapture(dataUrl);
  };

  // Handle file input capture (fallback)
  const handleFileCapture = (file: File) => {
    push(`File capture: ${file.name}`);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      await persistCapture(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Universal capture persistence with proper feedback
  const persistCapture = async (uri: string, barcodeData?: string) => {
    try {
      // Save the main capture
      const captureResult = await saveCapture.mutateAsync({
        uri,
        mode,
        ownerId: user.id,
        persona: user.role,
        saleId
      });
      
      // Handle mode-specific actions with success feedback
      if (mode === 'barcode' && barcodeData) {
        push(`Barcode captured: ${barcodeData}`);
        toast({
          title: "Barcode Scanned ✅",
          description: `Product barcode captured successfully`,
        });
        // Navigate to POS with barcode data after brief delay
        setTimeout(() => navigate(`/pos?barcode=${barcodeData}&source=capture`), 500);
        return;
      }
      
      if (mode === 'invoice') {
        push('Invoice capture saved for receiving');
        toast({
          title: "Invoice Captured ✅",
          description: "Invoice saved for stock receiving",
        });
      }
      
      if (mode === 'prescription') {
        push('Prescription capture saved for compliance');
        toast({
          title: "Prescription Captured ✅", 
          description: "Prescription saved for compliance",
        });
      }
      
      // Navigate back after showing success toast
      setTimeout(() => {
        window.history.back();
      }, 800);
      
    } catch (error) {
      push(`Capture persistence failed: ${error}`);
      toast({
        title: "Capture Failed",
        description: "Failed to save capture. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Start camera stream
  const startCameraStream = async () => {
    try {
      push('Starting camera stream for capture');
      
      const constraints = {
        video: {
          facingMode: 'environment',
          width: 1080,
          height: 720
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsScanning(true);
      
      // Auto barcode scanning for barcode mode
      if (mode === 'barcode') {
        startBarcodeDetection();
      }
    } catch (error) {
      push(`Camera stream failed: ${error}`);
      setShowWebFallback(true);
    }
  };

  // Simple barcode detection simulation
  const startBarcodeDetection = () => {
    // In real app, this would use a barcode scanning library
    // For now, we'll just show the capture button
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsScanning(false);
  };

  // Enhanced camera initialization using universal service
  useEffect(() => {
    console.log(`[QUICK-CAPTURE] Initializing ${mode} capture`);
    push(`[QUICK-CAPTURE] Initializing ${mode} capture`);
    
    const initCapture = async () => {
      try {
        // Use simplified capture service for seamless experience
        console.log(`[QUICK-CAPTURE] Using simplified capture service...`);
        
        if (mode === 'barcode') {
          // For barcode mode, show the web fallback UI instead of direct capture
          // since barcode scanning needs the camera stream for real-time detection
          console.log(`[QUICK-CAPTURE] Barcode mode - showing camera UI`);
          setShowWebFallback(true);
          setIsScanning(false);
        } else {
          // For invoice/prescription, use direct OCR capture
          // Use enhanced capture service for document processing
          const { enhancedCapture } = await import('../services/enhanced-capture');
          await SimpleCaptureService.capture(mode as 'invoice' | 'prescription');
          
          // Navigate back after successful capture
          console.log(`[QUICK-CAPTURE] ${mode} capture completed - navigating back`);
          push(`[QUICK-CAPTURE] ${mode} capture completed - navigating back`);
          setTimeout(() => window.history.back(), 800);
        }
      } catch (error) {
        console.error(`[QUICK-CAPTURE] Capture failed:`, error);
        push(`[QUICK-CAPTURE] Capture failed: ${error}`);
        
        // Always show fallback UI as last resort
        setShowWebFallback(true);
        setIsScanning(false);
      }
    };
    
    initCapture();

    // Cleanup on unmount
    return () => {
      stopCamera();
      if (fileInputRef.current) {
        removeFileInput(fileInputRef.current);
      }
    };
  }, [mode]);

  // Set up file input fallback
  useEffect(() => {
    if (showWebFallback && !fileInputRef.current) {
      fileInputRef.current = createFileInputCapture(handleFileCapture);
    }
  }, [showWebFallback]);

  const getModeTitle = () => {
    switch (mode) {
      case 'barcode': return 'Scan Barcode';
      case 'invoice': return 'Capture Invoice';
      case 'prescription': return 'Capture Prescription';
      default: return 'Quick Capture';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'barcode': return 'Point camera at product barcode';
      case 'invoice': return 'Capture supplier invoice for receiving';
      case 'prescription': return 'Capture prescription for compliance';
      default: return 'Capture document';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            push('QuickCapture: Back button clicked');
            window.history.back();
          }}
          className="text-white hover:bg-white/20"
          data-testid="button-back"
        >
          <span className="material-icons mr-2">arrow_back</span>
          Back
        </Button>
        <div className="text-center">
          <h1 className="font-semibold">{getModeTitle()}</h1>
          <p className="text-sm text-white/60">{getModeDescription()}</p>
        </div>
        <div className="w-20"></div>
      </header>

      {/* Camera View */}
      <div className="flex-1 relative">
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Capture overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-white rounded-lg w-64 h-64 opacity-50"></div>
            </div>
          </>
        ) : showWebFallback ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center space-y-6">
              <span className="material-icons text-white text-6xl mb-4">photo_camera</span>
              <p className="text-lg font-medium">Camera not available</p>
              <p className="text-sm text-white/60">Use file upload to capture images</p>
              
              {/* Always show upload button in fallback mode */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-black hover:bg-gray-100 px-8 py-3"
                data-testid="button-upload-fallback"
              >
                <span className="material-icons mr-2">upload</span>
                Upload Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-lg font-medium">Initializing camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls - only show for camera mode */}
      {isScanning && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleCapture}
              size="lg"
              className="bg-white text-black hover:bg-white/90 px-8"
              data-testid="button-capture"
              disabled={saveCapture.isPending}
            >
              <span className="material-icons mr-2">camera_alt</span>
              {mode === 'barcode' ? 'Scan Barcode' : 'Take Photo'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
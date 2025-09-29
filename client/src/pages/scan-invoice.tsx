import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ensureCamera, createFileInputCapture, removeFileInput } from "../services/camera";
import { capabilityService, DeviceTier } from "../services/capability";

export default function InvoiceScannerScreen() {
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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Process invoice mutation
  const processInvoice = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await fetch('/api/invoices/process', {
        method: 'POST',
        body: JSON.stringify({ imageData }),
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Invoice processed!",
        description: `Found ${data.itemCount || 0} items in invoice`,
      });
      
      // Navigate back to receive stock
      navigate('/receive-stock');
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/purchase-orders'] });
    },
    onError: () => {
      toast({
        title: "Processing failed",
        description: "Unable to process invoice. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Initialize camera on mount
  useEffect(() => {
    const initCamera = async () => {
      const tier = await capabilityService.getTier();
      setDeviceTier(tier);
      
      ensureCamera({
        onOK: startCameraStream,
        onFail: () => {
          setShowWebFallback(true);
          navigate('/receive-stock');
        },
        showPermissionModal: async () => {
          return new Promise((resolve) => {
            // Show browser-native permission dialog
            setTimeout(() => resolve('settings'), 100);
          });
        }
      });
    };

    initCamera();

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

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        
        // Process the captured image
        processInvoice.mutate(imageData);
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
          const imageData = reader.result as string;
          setCapturedImage(imageData);
          processInvoice.mutate(imageData);
        };
        reader.readAsDataURL(file);
      });
    }
    
    fileInputRef.current.click();
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCameraStream();
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
                navigate('/receive-stock');
              }}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              data-testid="back-to-receive-stock"
            >
              <span className="material-icons">arrow_back</span>
            </Button>
            <h1 className="text-white font-semibold" data-testid="scanner-title">
              Invoice Scanner
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

      {/* Camera View or Captured Image */}
      <div className="flex-1 relative">
        {capturedImage ? (
          // Show captured image with options
          <div className="flex-1 flex flex-col">
            <img 
              src={capturedImage} 
              alt="Captured invoice" 
              className="flex-1 object-contain"
              data-testid="captured-image"
            />
            
            <div className="p-4 bg-black/80 border-t border-white/10">
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={retakePhoto}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
                  data-testid="retake-photo"
                >
                  <span className="material-icons mr-2">refresh</span>
                  Retake
                </Button>
                
                <Button
                  onClick={() => processInvoice.mutate(capturedImage)}
                  disabled={processInvoice.isPending}
                  className="flex-1"
                  data-testid="process-invoice"
                >
                  {processInvoice.isPending ? (
                    <>
                      <span className="material-icons mr-2 animate-spin">sync</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="material-icons mr-2">send</span>
                      Process Invoice
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : isScanning && cameraStream ? (
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
            
            {/* Invoice Capture Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Document Frame */}
                <div className="w-80 h-56 border-2 border-white rounded-lg relative">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-400"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-400"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-400"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-400"></div>
                  
                  {/* Document Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-icons text-white text-4xl opacity-30">description</span>
                  </div>
                </div>
                
                <p className="text-white text-center mt-4 text-sm">
                  Position invoice within the frame
                </p>
                <p className="text-white/80 text-center mt-1 text-xs">
                  Ensure all text is clearly visible
                </p>
              </div>
            </div>

            {/* Capture Button */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <Button
                size="lg"
                onClick={captureImage}
                className="rounded-full w-16 h-16"
                data-testid="capture-invoice"
              >
                <span className="material-icons text-2xl">photo_camera</span>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <span className="material-icons text-6xl mb-4 opacity-60">document_scanner</span>
              <h2 className="text-xl font-semibold mb-2">Starting Camera...</h2>
              <p className="text-white/80">Please allow camera access to scan invoices</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, Share2, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AppQRCodeProps {
  url?: string;
  title?: string;
  description?: string;
  size?: number;
}

export function AppQRCode({
  url = window.location.origin,
  title = "Install AushadiExpress",
  description = "Scan this QR code to install the app on your device",
  size = 256
}: AppQRCodeProps) {
  const { toast } = useToast();

  const handleDownload = () => {
    const svg = document.getElementById('app-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'aushadi-express-qr-code.png';
          link.click();
          URL.revokeObjectURL(url);

          toast({
            title: 'QR Code Downloaded',
            description: 'QR code saved to your downloads folder',
          });
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AushadiExpress App',
          text: 'Scan this QR code to install AushadiExpress pharmacy management app',
          url: url,
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Link Copied',
          description: 'App link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not share the app link',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="flex justify-center p-6 bg-white rounded-lg">
          <QRCodeSVG
            id="app-qr-code"
            value={url}
            size={size}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: '/favicon.svg',
              height: 32,
              width: 32,
              excavate: true,
            }}
          />
        </div>

        {/* App URL */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">App URL:</p>
          <code className="text-xs bg-muted px-3 py-2 rounded-md break-all">
            {url}
          </code>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="w-full"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2 text-blue-900 dark:text-blue-100">
            Installation Instructions:
          </h4>
          <ol className="text-xs space-y-1 text-blue-800 dark:text-blue-200 list-decimal list-inside">
            <li>Open the camera app on your phone</li>
            <li>Point it at the QR code above</li>
            <li>Tap the notification that appears</li>
            <li>Click "Add to Home Screen" or "Install"</li>
            <li>The app will be installed on your device!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

import { createModuleLogger } from '../utils/app-logger';

const log = createModuleLogger('CameraCapture');

export interface CaptureResult {
  success: boolean;
  file?: File;
  error?: string;
  imageDataUrl?: string;
}

class CameraCaptureService {
  private isCapturing = false;

  async captureImage(): Promise<CaptureResult> {
    if (this.isCapturing) {
      return {
        success: false,
        error: 'Another capture is already in progress'
      };
    }

    this.isCapturing = true;

    try {
      log.info('Starting camera capture');

      // Create camera capture interface
      const result = await this.createCameraCapture();
      
      if (result.success && result.file) {
        // Convert to data URL for immediate use
        const imageDataUrl = await this.fileToDataUrl(result.file);
        
        log.info('Camera capture successful', {
          fileName: result.file.name,
          size: result.file.size,
          type: result.file.type
        });

        return {
          success: true,
          file: result.file,
          imageDataUrl
        };
      }

      return result;

    } catch (error) {
      log.error('Camera capture failed', error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown camera error'
      };
    } finally {
      this.isCapturing = false;
    }
  }

  private async createCameraCapture(): Promise<CaptureResult> {
    return new Promise((resolve) => {
      try {
        // Use file input with camera capture
        this.createFileInput().then(resolve);
      } catch (error) {
        log.error('Camera capture setup failed', error as Error);
        resolve({
          success: false,
          error: 'Camera capture setup failed'
        });
      }
    });
  }

  private async createFileInput(): Promise<CaptureResult> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      
      input.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (file) {
          log.debug('File selected via input', {
            name: file.name,
            size: file.size,
            type: file.type
          });
          
          resolve({
            success: true,
            file
          });
        } else {
          resolve({
            success: false,
            error: 'No file selected'
          });
        }
      };
      
      input.oncancel = () => {
        resolve({
          success: false,
          error: 'File selection cancelled'
        });
      };
      
      // Trigger file picker
      input.click();
    });
  }

  private async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  isCurrentlyCapturing(): boolean {
    return this.isCapturing;
  }
}

export const cameraCapture = new CameraCaptureService();
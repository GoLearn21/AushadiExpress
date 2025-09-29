import { push } from "../utils/dev-logger";

// Universal camera or file picker function
export async function getCameraOrPicker(): Promise<'camera' | string> {
  try {
    // Direct camera permission request
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    if (stream) {
      // Stop the stream immediately since we just wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      push('Camera permission granted - returning camera mode');
      return 'camera';
    }
  } catch (error) {
    push(`Camera failed: ${error} - trying file picker`);
    
    // If we're on web and camera failed, show file picker
    if (typeof window !== 'undefined') {
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            push(`File selected: ${file.name}`);
            resolve(url);
          } else {
            reject(new Error('NO_FILE'));
          }
          document.body.removeChild(input);
        };
        
        input.oncancel = () => {
          push('File picker cancelled');
          reject(new Error('CANCELLED'));
          document.body.removeChild(input);
        };
        
        document.body.appendChild(input);
        input.click();
      });
    }
  }
  
  throw new Error('NO_CAM');
}

// Legacy function for compatibility - now just redirects to universal function
export async function ensureCamera(options: any): Promise<void> {
  push('ensureCamera() called (legacy mode)');
  
  try {
    const result = await getCameraOrPicker();
    
    if (result === 'camera') {
      push('Camera granted - calling success callback');
      // Call the appropriate success callback
      if (options.onGranted) {
        options.onGranted();
      } else if (options.onOK) {
        options.onOK();
      }
    } else {
      push('File picker used - calling success callback with file');
      // For file picker, also call success
      if (options.onGranted) {
        options.onGranted();
      } else if (options.onOK) {
        options.onOK();
      }
    }
  } catch (error) {
    push(`Camera/picker failed: ${error}`);
    // Call the appropriate failure callback
    if (options.onDenied) {
      options.onDenied();
    } else if (options.onFail) {
      options.onFail();
    }
  }
}

// Web fallback: file input capture
export function createFileInputCapture(onCapture: (file: File) => void): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment' as any; // Use rear camera on mobile
  input.style.display = 'none';
  
  input.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      onCapture(file);
    }
  });
  
  document.body.appendChild(input);
  return input;
}

// Cleanup file input
export function removeFileInput(input: HTMLInputElement) {
  if (input.parentNode) {
    input.parentNode.removeChild(input);
  }
}
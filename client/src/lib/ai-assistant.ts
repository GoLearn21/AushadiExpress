// AI Assistant hooks for future on-device LLM integration
export interface AIAssistantContext {
  currentScreen?: string;
  recentActions?: string[];
  inventory?: any[];
  currentSale?: any;
}

export interface AIAssistant {
  ask(text: string, context?: AIAssistantContext): Promise<string>;
}

// Stubbed local AI implementation
export class LocalAIAssistant implements AIAssistant {
  async ask(text: string, context?: AIAssistantContext): Promise<string> {
    // TODO: Implement on-device LLM integration
    console.log('Local AI Assistant - Question:', text, 'Context:', context);
    
    // For now, return a placeholder response
    return "AI Assistant is not yet implemented. This will integrate with on-device LLM in future iterations.";
  }
}

// Remote OpenAI implementation
export class RemoteOpenAIAssistant implements AIAssistant {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";
  }

  async ask(text: string, context?: AIAssistantContext): Promise<string> {
    console.log('Remote AI Assistant - Question:', text, 'Context:', context);
    
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          systemPrompt,
          context
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.response || 'Sorry, I couldn\'t process your request.';
      
    } catch (error) {
      console.error('AI Assistant error:', error);
      return 'I\'m having trouble connecting right now. Please try again in a moment.';
    }
  }
  
  private buildSystemPrompt(context?: AIAssistantContext): string {
    let prompt = `You are an AI assistant for AushadiExpress, a pharmacy Point of Sale system. You help pharmacists with:\n\n- Medicine information and drug interactions\n- Inventory management and stock levels\n- Prescription validation and compliance\n- Sales analytics and reporting\n- OCR document processing insights\n\nProvide helpful, accurate, and professional responses. Keep answers concise and actionable.`;
    
    if (context) {
      if (context.currentScreen) {
        prompt += `\n\nUser is currently on: ${context.currentScreen} screen`;
      }
      if (context.inventory && context.inventory.length > 0) {
        prompt += `\n\nCurrent inventory items: ${context.inventory.slice(0, 5).map(item => item.name).join(', ')}`;
      }
      if (context.currentSale) {
        prompt += `\n\nCurrent sale in progress with ${context.currentSale.items?.length || 0} items`;
      }
      if (context.recentActions && context.recentActions.length > 0) {
        prompt += `\n\nRecent actions: ${context.recentActions.slice(0, 3).join(', ')}`;
      }
    }
    
    return prompt;
  }
}

// Voice recognition implementation
export class VoiceAssistant {
  private recognition: any = null;
  private isListening = false;
  private onResult?: (text: string) => void;
  private onError?: (error: any) => void;

  async startListening(onResult?: (text: string) => void, onError?: (error: any) => void): Promise<void> {
    console.log('Voice Assistant - Starting to listen...');
    
    if (!await this.isSupported()) {
      throw new Error('Speech recognition not supported');
    }
    
    this.onResult = onResult;
    this.onError = onError;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    
    this.recognition.onstart = () => {
      console.log('Voice recognition started');
      this.isListening = true;
    };
    
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice recognition result:', transcript);
      if (this.onResult) {
        this.onResult(transcript);
      }
    };
    
    this.recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      this.isListening = false;
      if (this.onError) {
        this.onError(event.error);
      }
    };
    
    this.recognition.onend = () => {
      console.log('Voice recognition ended');
      this.isListening = false;
    };
    
    this.recognition.start();
  }

  async stopListening(): Promise<void> {
    console.log('Voice Assistant - Stopped listening');
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  async isSupported(): Promise<boolean> {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
  
  getListeningState(): boolean {
    return this.isListening;
  }
}

// OCR (Optical Character Recognition) implementation
export class OCRAssistant {
  async scanText(imageData: string | File): Promise<string> {
    console.log('OCR Assistant - Scanning image:', imageData);
    
    try {
      // Use existing OCR infrastructure
      const { ocrImage } = await import('../platform/ocr');
      
      let imageUri: string;
      if (typeof imageData === 'string') {
        imageUri = imageData;
      } else {
        // Convert File to data URL
        imageUri = await this.fileToDataUrl(imageData);
      }
      
      const extractedText = await ocrImage(imageUri);
      console.log('OCR Assistant - Text extracted:', extractedText.length, 'characters');
      
      return extractedText;
      
    } catch (error) {
      console.error('OCR Assistant - Scan failed:', error);
      throw new Error(`OCR scan failed: ${error}`);
    }
  }

  async scanBarcode(imageData: string | File): Promise<string> {
    console.log('OCR Assistant - Scanning barcode:', imageData);
    
    try {
      // First extract text using OCR
      const text = await this.scanText(imageData);
      
      // Look for barcode patterns in the extracted text
      const barcodePatterns = [
        /\b\d{12,14}\b/, // EAN-13, UPC-A
        /\b\d{8}\b/,     // EAN-8
        /\b[A-Z0-9]{6,}\b/ // General alphanumeric codes
      ];
      
      for (const pattern of barcodePatterns) {
        const match = text.match(pattern);
        if (match) {
          console.log('OCR Assistant - Barcode found:', match[0]);
          return match[0];
        }
      }
      
      throw new Error('No barcode pattern found in image');
      
    } catch (error) {
      console.error('OCR Assistant - Barcode scan failed:', error);
      throw new Error(`Barcode scan failed: ${error}`);
    }
  }
  
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Export instances
export const localAI = new LocalAIAssistant();
export const remoteAI = new RemoteOpenAIAssistant();
export const voiceAssistant = new VoiceAssistant();
export const ocrAssistant = new OCRAssistant();

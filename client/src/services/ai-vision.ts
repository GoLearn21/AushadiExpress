import OpenAI from 'openai';
import { createModuleLogger } from "../utils/app-logger";

const log = createModuleLogger('AI-Vision');

// the newest OpenAI model is "gpt-4o" which supports vision capabilities
const openai = new OpenAI({ 
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export interface DocumentAnalysis {
  documentType: 'bill' | 'prescription' | 'invoice' | 'other';
  confidence: number;
  extractedData: {
    medicines?: Array<{
      name: string;
      quantity?: number;
      price?: number;
      batch?: string;
      expiry?: string;
    }>;
    total?: number;
    date?: string;
    customerInfo?: {
      name?: string;
      contact?: string;
    };
    doctorInfo?: {
      name?: string;
      registration?: string;
    };
    pharmacyInfo?: {
      name?: string;
      license?: string;
    };
  };
  rawText: string;
  metadata: {
    timestamp: Date;
    processingTime: number;
  };
}

export class AIVisionService {
  private hasApiKey(): boolean {
    // For browser-based apps, we'll use the server endpoint instead
    return true; // Always return true since we'll use server-side processing
  }

  async analyzeDocument(imageFile: File): Promise<DocumentAnalysis> {
    const startTime = Date.now();
    log.info('Starting document analysis', { fileName: imageFile.name, fileSize: imageFile.size });

    try {
      // Use server-side API endpoint for vision analysis
      const formData = new FormData();
      formData.append('image', imageFile);

      log.debug('Sending image to server for analysis');
      
      // Use the proxy path which will be handled by Vite
      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for authentication if needed
      });
      
      log.debug('Received response from server', { 
        status: response.status, 
        statusText: response.statusText 
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server analysis failed: ${errorText}`);
      }

      const result = await response.json() as DocumentAnalysis;
      
      // Update processing time
      result.metadata.processingTime = Date.now() - startTime;
      
      log.info('Document analysis completed', { 
        type: result.documentType, 
        processingTime: result.metadata.processingTime 
      });

      return result;

    } catch (error) {
      log.error('Document analysis failed', error as Error, { fileName: imageFile.name });
      throw new Error(`Document analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async classifyDocument(base64Image: string): Promise<{ documentType: DocumentAnalysis['documentType'], confidence: number }> {
    log.debug('Starting document classification');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this pharmacy-related document and classify it. Return a JSON response with:
{
  "documentType": "bill" | "prescription" | "invoice" | "other",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Types:
- "bill": Customer receipt/bill from pharmacy sale
- "prescription": Doctor's prescription with medicines
- "invoice": Supplier invoice for pharmacy inventory
- "other": Any other document type`
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    log.debug('Classification result', result);

    return {
      documentType: result.documentType || 'other',
      confidence: result.confidence || 0.5
    };
  }

  private async extractDataByType(base64Image: string, documentType: string): Promise<{ extractedData: DocumentAnalysis['extractedData'], rawText: string }> {
    log.debug('Starting data extraction', { documentType });

    let extractionPrompt = '';
    
    switch (documentType) {
      case 'bill':
        extractionPrompt = `Extract data from this pharmacy bill/receipt. Return JSON with:
{
  "medicines": [{"name": "string", "quantity": number, "price": number}],
  "total": number,
  "date": "YYYY-MM-DD",
  "customerInfo": {"name": "string", "contact": "string"},
  "pharmacyInfo": {"name": "string", "license": "string"},
  "rawText": "all visible text"
}`;
        break;
        
      case 'prescription':
        extractionPrompt = `Extract data from this doctor's prescription. Return JSON with:
{
  "medicines": [{"name": "string", "quantity": number}],
  "date": "YYYY-MM-DD",
  "customerInfo": {"name": "string"},
  "doctorInfo": {"name": "string", "registration": "string"},
  "rawText": "all visible text"
}`;
        break;
        
      case 'invoice':
        extractionPrompt = `Extract data from this supplier invoice. Return JSON with:
{
  "medicines": [{"name": "string", "quantity": number, "price": number, "batch": "string", "expiry": "YYYY-MM-DD"}],
  "total": number,
  "date": "YYYY-MM-DD",
  "pharmacyInfo": {"name": "string"},
  "rawText": "all visible text"
}`;
        break;
        
      default:
        extractionPrompt = `Extract any readable text and data from this document. Return JSON with:
{
  "rawText": "all visible text",
  "extractedData": {}
}`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: extractionPrompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    log.debug('Extraction result', { resultKeys: Object.keys(result) });

    return {
      extractedData: result,
      rawText: result.rawText || ''
    };
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async testConnection(): Promise<boolean> {
    if (!this.hasApiKey()) {
      return false;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Hello, are you working?" }],
        max_tokens: 10
      });
      
      return Boolean(response.choices[0].message.content);
    } catch (error) {
      log.error('Connection test failed', error as Error);
      return false;
    }
  }
}

export const aiVision = new AIVisionService();
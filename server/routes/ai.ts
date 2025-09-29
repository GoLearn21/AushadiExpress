import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import OpenAI from 'openai';
import { ImageAnnotatorClient } from '@google-cloud/vision';

// Type for multer request with file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Load service account key from file
const serviceAccountPath = path.join(__dirname, '../../inner-period.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: Service account key file not found at', serviceAccountPath);
  process.exit(1);
}

// Initialize Google Vision API client
const visionClient = new ImageAnnotatorClient({
  keyFilename: serviceAccountPath,
  projectId: 'inner-period-472511-s9' // From your service account file
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

const router = Router();

// Document analysis endpoint
router.post('/analyze-document', upload.single('image'), async (req: MulterRequest, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert the image to base64
    const base64Image = req.file.buffer.toString('base64');

    // Use Google Cloud Vision API to detect text
    const [result] = await visionClient.textDetection({
      image: { content: base64Image },
      imageContext: {
        languageHints: ['en-t-i0-handwrit'],
        textDetectionParams: {
          enableTextDetectionConfidenceScore: true,
        },
      },
    });

    // Extract all text from the document
    const detections = result.textAnnotations;
    if (!detections || detections.length === 0) {
      console.error('[VISION-API] No text detected in the document');
      return res.status(400).json({ error: 'No text detected in the document' });
    }

    const fullText = detections[0].description || '';
    console.log(`[VISION-API] Extracted text length: ${fullText.length} characters`);

    // Send the extracted text to GPT-4o-mini for parsing
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at parsing pharmacy invoices and extracting structured data. 
          
          INSTRUCTIONS:
          1. Carefully analyze the provided document text which contains tabular data
          2. Extract ALL line items including product details, quantities, prices, discounts, and tax information
          3. Pay special attention to the following fields for each line item:
             - Product name and description
             - Pack size and manufacturer
             - Batch number and expiry date
             - MRP, PTR, PTS values
             - Quantity and units
             - Discount percentage and amount
             - Tax information (IGST/CGST/SGST)
             - Total amount
          
          4. For the invoice header, extract:
             - Supplier details (name, address, GSTIN, DL number)
             - Buyer details (name, address, GSTIN, phone)
             - Invoice number and dates
             - Payment terms and conditions
          
          5. For the invoice footer, extract:
             - Subtotal, tax totals, and grand total
             - Any additional charges or discounts
             - Payment information
             - Any terms and conditions
          
          6. Format all monetary values as strings with 2 decimal places
          7. If a field is not present, omit it from the output
          
          Return a well-structured JSON object with all extracted information.`
        },
        {
          role: "user",
          content: `Extract the invoice information from the following text. Be very careful with the numbers and make sure to extract all line items with their quantities and amounts. If any information is missing, leave it as an empty string.\n\n${fullText}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    // Parse the JSON response from GPT
    const extractedData = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    // Add the raw text to the response
    extractedData.rawText = fullText;
    
    // Log the extracted data for debugging
    console.log('[DOCUMENT-PARSER] Extracted data:', JSON.stringify(extractedData, null, 2));
    
    // Send the response
    res.json(extractedData);
  } catch (error) {
    console.error('[ERROR] Failed to process document:', error);
    res.status(500).json({ 
      error: 'Failed to process document', 
      details: error.message,
      //rawText: fullText || ''
    });
  }
});

// Define types for the extracted data
interface LineItem {
  srNo: string;
  name: string;
  pack: string;
  mrp: string;
  ptr: string;
  pts: string;
  qty: string;
  amount: string;
  gstPct: string;
  batch?: string;
  expiry?: string;
}

interface Totals {
  taxableValue: string;
  cgstAmount: string;
  sgstAmount: string;
  igstAmount: string;
  totalTax: string;
  discount: string;
  roundOff: string;
  grandTotal: string;
  grandTotalInWords: string;
}

interface ExtractedData {
  documentType: string;
  supplier: {
    name: string;
    gstin: string;
    address: string;
    state: string;
    phone: string;
  };
  buyer: {
    name: string;
    gstin: string;
    address: string;
    state: string;
  };
  metadata: {
    invoiceNumber: string;
    date: string;
    dueDate: string;
  };
  lineItems: LineItem[];
  totals: Totals;
  rawText: string;
}

// Define types for business entities
interface BusinessEntity {
  type: 'supplier' | 'buyer';
  name: string;
  gstn: string;
  address: string;
  dlNumbers?: string[];
  phone?: string;
}

export default router;
import * as XLSX from 'xlsx';
import { GoogleGenAI } from "@google/genai";

export interface StockItem {
  name: string;
  batch: string;
  qty: number;
  exp: string;
  mrp: number;
}

export interface ParsedExcelResult {
  success: boolean;
  items: StockItem[];
  error?: string;
  rawDataSample?: any[];
  aiMapping?: any;
}

/**
 * Parse Excel file buffer and use AI to intelligently map columns
 * to standardized stock item format
 */
export async function parseExcelWithAI(fileBuffer: Buffer): Promise<ParsedExcelResult> {
  try {
    // Step 1: Parse Excel file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        items: [],
        error: 'No sheets found in Excel file'
      };
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON (array of objects with headers as keys)
    const rawData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // Get formatted values
      defval: '' // Default value for empty cells
    });

    if (!rawData || rawData.length === 0) {
      return {
        success: false,
        items: [],
        error: 'Excel file is empty'
      };
    }

    // Step 2: Send to AI for intelligent column mapping
    const prompt = `You are a pharmacy inventory data parser. Analyze this Excel data and extract inventory information.

The Excel data has ${rawData.length} rows. Here's a sample of the first 3 rows:
${JSON.stringify(rawData.slice(0, 3), null, 2)}

Your task:
1. Identify which columns represent:
   - Product/Medicine Name (could be named: "Product", "Medicine", "Drug", "Item", "Name", etc.)
   - Batch Number (could be named: "Batch", "Batch No", "Lot", "Lot Number", etc.)
   - Quantity/Stock (could be named: "Quantity", "Qty", "Stock", "Units", "Count", etc.)
   - Expiry Date (could be named: "Expiry", "Exp", "Expiry Date", "Exp Date", "Expiration", etc.)
   - Price/MRP (could be named: "Price", "MRP", "Rate", "Cost", "Amount", etc.)

2. Extract ALL rows and convert them to this exact JSON format:
{
  "mapping": {
    "productName": "actual_column_name_used",
    "batch": "actual_column_name_used",
    "quantity": "actual_column_name_used",
    "expiry": "actual_column_name_used",
    "price": "actual_column_name_used"
  },
  "items": [
    {
      "name": "product name here",
      "batch": "batch number here",
      "qty": 100,
      "exp": "2025-12-31",
      "mrp": 25.50
    }
  ]
}

Important rules:
- "qty" must be a NUMBER (parse from string if needed)
- "mrp" must be a NUMBER (parse from string if needed, remove currency symbols)
- "exp" must be in YYYY-MM-DD format (convert dates like "31/12/2025" or "Dec 2025" to "2025-12-31")
- If a required field is missing, use reasonable defaults: batch="UNKNOWN", qty=0, exp="2099-12-31", mrp=0
- Process ALL ${rawData.length} rows, not just the sample

Return ONLY valid JSON, no explanations.`;

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback: Try basic column name matching if AI is not available
    let aiResponse = '';

    if (!apiKey || apiKey === 'undefined' || !apiKey.trim() || apiKey.length < 20) {
      console.log('[EXCEL-PARSER] Gemini API key not properly configured, using fallback column detection');

      // Fallback: Simple column name matching
      const firstRow = rawData[0];
      const columnNames = Object.keys(firstRow);

      // Try to detect columns by common names
      const mapping: any = {
        productName: columnNames.find(col =>
          /product|medicine|drug|item|name/i.test(col)
        ) || columnNames[0],
        batch: columnNames.find(col =>
          /batch|lot/i.test(col)
        ) || 'UNKNOWN',
        quantity: columnNames.find(col =>
          /qty|quantity|stock|units|count/i.test(col)
        ) || columnNames[1],
        expiry: columnNames.find(col =>
          /exp|expiry|expiration/i.test(col)
        ) || '2099-12-31',
        price: columnNames.find(col =>
          /price|mrp|rate|cost|amount/i.test(col)
        ) || columnNames[2]
      };

      // Extract items using detected columns
      const items = rawData.map((row: any) => ({
        name: row[mapping.productName] || 'Unknown Product',
        batch: row[mapping.batch] || 'UNKNOWN',
        qty: parseInt(row[mapping.quantity]) || 0,
        exp: row[mapping.expiry] || '2099-12-31',
        mrp: parseFloat(row[mapping.price]) || 0
      }));

      aiResponse = JSON.stringify({ mapping, items });
    } else {
      // Use AI for intelligent column detection
      try {
        const genai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const geminiResponse = await genai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        aiResponse = geminiResponse.text || '';
      } catch (aiError: any) {
        console.error('[EXCEL-PARSER] Gemini API error, falling back to basic detection:', aiError.message);

        // Fallback if AI fails
        const firstRow = rawData[0];
        const columnNames = Object.keys(firstRow);

        const mapping: any = {
          productName: columnNames.find(col =>
            /product|medicine|drug|item|name/i.test(col)
          ) || columnNames[0],
          batch: columnNames.find(col =>
            /batch|lot/i.test(col)
          ) || 'UNKNOWN',
          quantity: columnNames.find(col =>
            /qty|quantity|stock|units|count/i.test(col)
          ) || columnNames[1],
          expiry: columnNames.find(col =>
            /exp|expiry|expiration/i.test(col)
          ) || '2099-12-31',
          price: columnNames.find(col =>
            /price|mrp|rate|cost|amount/i.test(col)
          ) || columnNames[2]
        };

        const items = rawData.map((row: any) => ({
          name: row[mapping.productName] || 'Unknown Product',
          batch: row[mapping.batch] || 'UNKNOWN',
          qty: parseInt(row[mapping.quantity]) || 0,
          exp: row[mapping.expiry] || '2099-12-31',
          mrp: parseFloat(row[mapping.price]) || 0
        }));

        aiResponse = JSON.stringify({ mapping, items });
      }
    }

    // Step 3: Parse AI response
    let parsedResponse: any;
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('[EXCEL-PARSER] Failed to parse AI response:', parseError);
      return {
        success: false,
        items: [],
        error: 'AI failed to parse Excel structure. Please ensure columns include: Product Name, Batch, Quantity, Expiry, Price',
        rawDataSample: rawData.slice(0, 3)
      };
    }

    // Step 4: Validate and return items
    if (!parsedResponse.items || !Array.isArray(parsedResponse.items)) {
      return {
        success: false,
        items: [],
        error: 'Invalid AI response format',
        rawDataSample: rawData.slice(0, 3)
      };
    }

    // Validate each item has required fields
    const validatedItems: StockItem[] = parsedResponse.items
      .filter((item: any) => item.name && item.name.trim())
      .map((item: any) => ({
        name: String(item.name).trim(),
        batch: String(item.batch || 'UNKNOWN').trim(),
        qty: Number(item.qty) || 0,
        exp: item.exp || '2099-12-31',
        mrp: Number(item.mrp) || 0
      }));

    if (validatedItems.length === 0) {
      return {
        success: false,
        items: [],
        error: 'No valid items found in Excel file',
        rawDataSample: rawData.slice(0, 3),
        aiMapping: parsedResponse.mapping
      };
    }

    return {
      success: true,
      items: validatedItems,
      aiMapping: parsedResponse.mapping,
      rawDataSample: rawData.slice(0, 3)
    };

  } catch (error) {
    console.error('[EXCEL-PARSER] Error parsing Excel:', error);
    return {
      success: false,
      items: [],
      error: error instanceof Error ? error.message : 'Unknown error parsing Excel file'
    };
  }
}

/**
 * Helper function to validate Excel file format
 */
export function isValidExcelFile(filename: string): boolean {
  const validExtensions = ['.xlsx', '.xls', '.xlsm', '.xlsb'];
  const lowerFilename = filename.toLowerCase();
  return validExtensions.some(ext => lowerFilename.endsWith(ext));
}

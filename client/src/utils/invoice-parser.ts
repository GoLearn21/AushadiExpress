// Invoice OCR text parser for extracting line items
export interface InvoiceLine {
  name: string;
  batch: string;
  qty: number;
  exp: string;
  mrp: number;
}

export function parseInvoiceText(text: string): InvoiceLine[] {
  console.log('[INVOICE-PARSER] Processing text:', text.substring(0, 100) + '...');
  
  // Split into lines and clean up
  const lines = text
    .split(/\n/)
    .map(line => line.trim())
    .filter(line => line.length > 5); // Remove short lines
  
  console.log('[INVOICE-PARSER] Found potential lines:', lines.length);
  
  const results: InvoiceLine[] = [];
  
  for (const line of lines) {
    // Indian pharma invoice pattern with pipes and brackets
    // Example: "MOXEL-D 3000 I'S |ETS415016 127.10] 500] 0.0 81.70] 4.00] 12 4.085.00"
    // Pattern: PRODUCT |BATCH PRICE] QTY] ... MRP] DISCOUNT] TAX AMOUNT
    
    const patterns = [
      // Pattern 1: Indian pharma format with pipes and brackets
      /^([A-Z0-9\s\-\.\/]+?)\s*\|([A-Z0-9]+)\s+([\d\.]+)\]\s*(\d+)\]/i,
      
      // Pattern 2: Tab-separated columns (common format)
      /^([A-Z0-9\s\-\.\/]+?)\s+([A-Z0-9]+)\s+([\d\.]+)\s+(\d+)/i,
      
      // Pattern 3: Space-separated with clear medicine names
      /^([A-Z][A-Z0-9\s\-\.\/]{3,}?)\s+([A-Z0-9]{4,})\s+.*?(\d+\.\d+).*?(\d+)/i,
      
      // Pattern 4: Simple medicine name with quantity
      /^([A-Z][A-Z0-9\s\-\.\/]{4,})\s+.*?(\d+)\s*$/i
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let name: string, batch: string, qty: number, exp: string, mrp: number;
        
        if (pattern === patterns[0] || pattern === patterns[1] || pattern === patterns[2]) {
          // Full pattern match with all fields
          name = match[1];
          batch = match[2] || 'B' + Date.now().toString().slice(-6);
          mrp = parseFloat(match[3]);
          qty = parseInt(match[4]);
          exp = '2025-12-31'; // Default expiry
        } else {
          // Simple pattern - extract what we can
          name = match[1];
          qty = parseInt(match[2]);
          mrp = 10.0; // Default price
          batch = 'B' + Date.now().toString().slice(-6);
          exp = '2025-12-31';
        }
        
        // Clean up product name - remove common prefixes and suffixes
        name = name
          .replace(/^(AL|m3|TK|ALIV)\s+\d+\s*/, '') // Remove code prefixes
          .replace(/\s*(I'S|IS)\s*$/, '') // Remove I'S suffix
          .replace(/\s+/g, ' ')
          .trim();
        
        // Validate extracted data
        if (name && name.length > 2 && qty > 0 && qty < 10000 && mrp > 0 && mrp < 10000) {
          results.push({
            name,
            batch: batch || 'UNKNOWN',
            qty,
            exp,
            mrp
          });
          console.log('[INVOICE-PARSER] Extracted:', { name, batch, qty, exp, mrp });
          break; // Found a match, move to next line
        }
      }
    }
  }
  
  console.log('[INVOICE-PARSER] Total extracted items:', results.length);
  return results;
}
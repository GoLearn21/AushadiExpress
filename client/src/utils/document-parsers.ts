// Category-specific document parsers
export interface InvoiceParseResult {
  header: {
    invoiceNo: string;
    vendor: string;
    date: string;
    total: number;
  };
  lines: Array<{
    name: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

export interface PrescriptionParseResult {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  medications: string[];
}

export interface BillParseResult {
  id: string;
  billNo: string;
  vendor: string;
  date: string;
  total: number;
}

export async function parseInvoice(rawText: string): Promise<InvoiceParseResult> {
  console.log('[PARSER] Parsing invoice text:', rawText.substring(0, 50) + '...');
  
  // Extract invoice number
  const invoiceNoMatch = rawText.match(/(?:invoice|inv|bill)[\s#:]*([A-Z0-9-]+)/i);
  const invoiceNo = invoiceNoMatch?.[1] || `INV-${Date.now()}`;
  
  // Extract vendor
  const lines = rawText.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
  const vendor = lines[0] || 'Unknown Vendor';
  
  // Extract date
  const dateMatch = rawText.match(/(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})/);
  const date = dateMatch?.[1] || new Date().toLocaleDateString();
  
  // Extract total
  const totalMatch = rawText.match(/(?:total|amount|sum)[\\s:]*₹?\\s*([\\d,]+(?:\\.\\d{2})?)/i);
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 0;
  
  // Extract line items using enhanced parser from previous implementation
  const { parseInvoiceText } = await import('./invoice-parser');
  const lineItems = parseInvoiceText(rawText);
  
  const result: InvoiceParseResult = {
    header: {
      invoiceNo,
      vendor,
      date,
      total
    },
    lines: lineItems.map((item: any) => ({
      name: item.name,
      quantity: item.qty,
      rate: item.mrp,
      amount: item.qty * item.mrp
    }))
  };
  
  console.log('[PARSER] Invoice parsed:', result.header);
  return result;
}

export function parsePrescription(rawText: string): PrescriptionParseResult {
  console.log('[PARSER] Parsing prescription text:', rawText.substring(0, 50) + '...');
  
  // Extract patient name
  const patientMatch = rawText.match(/(?:patient|name)[\\s:]*([A-Za-z\\s]+)/i);
  const patientName = patientMatch?.[1]?.trim() || 'Unknown Patient';
  
  // Extract doctor name
  const doctorMatch = rawText.match(/(?:dr|doctor)[\\s:]*([A-Za-z\\s]+)/i);
  const doctorName = doctorMatch?.[1]?.trim() || 'Unknown Doctor';
  
  // Extract date
  const dateMatch = rawText.match(/(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})/);
  const date = dateMatch?.[1] || new Date().toLocaleDateString();
  
  // Extract medications (simple pattern matching)
  const medicationLines = rawText
    .split('\\n')
    .map(line => line.trim())
    .filter(line => 
      line.length > 5 && 
      /(?:tab|cap|mg|ml|syrup|tablet|capsule)/i.test(line) &&
      !/(?:doctor|patient|date|clinic)/i.test(line)
    )
    .slice(0, 10); // Limit to reasonable number
  
  const result: PrescriptionParseResult = {
    id: `RX-${Date.now()}`,
    patientName,
    doctorName, 
    date,
    medications: medicationLines
  };
  
  console.log('[PARSER] Prescription parsed:', result);
  return result;
}

export function parseBill(rawText: string): BillParseResult {
  console.log('[PARSER] Parsing bill text:', rawText.substring(0, 50) + '...');
  
  // Extract bill number
  const billNoMatch = rawText.match(/(?:bill|receipt|ref)[\s#:]*([A-Z0-9-]+)/i);
  const billNo = billNoMatch?.[1] || `BILL-${Date.now()}`;
  
  // Extract vendor
  const lines = rawText.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
  const vendor = lines[0] || 'Unknown Vendor';
  
  // Extract date
  const dateMatch = rawText.match(/(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})/);
  const date = dateMatch?.[1] || new Date().toLocaleDateString();
  
  // Extract total
  const totalMatch = rawText.match(/(?:total|amount|sum)[\\s:]*₹?\\s*([\\d,]+(?:\\.\\d{2})?)/i);
  const total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : 0;
  
  const result: BillParseResult = {
    id: `BILL-${Date.now()}`,
    billNo,
    vendor,
    date,
    total
  };
  
  console.log('[PARSER] Bill parsed:', result);
  return result;
}
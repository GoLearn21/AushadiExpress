import { z } from "zod";

export interface NormalizedInvoiceSummary {
  supplierName: string | null;
  buyerName: string | null;
  invoiceNumber: string | null;
  lineItemCount: number;
  grandTotal: number | null;
}

export interface NormalizedTotals {
  subtotal: number | null;
  grandTotal: number | null;
  additionalCharges: number | null;
  discounts: number | null;
  paymentInformation: string | null;
  termsAndConditions: string | null;
  taxTotals: {
    igst: number | null;
    cgst: number | null;
    sgst: number | null;
  };
}

export interface NormalizedHeader {
  supplierName: string | null;
  supplierAddress: string | null;
  supplierGstin: string | null;
  supplierDlNumber: string | null;
  buyerName: string | null;
  buyerAddress: string | null;
  buyerGstin: string | null;
  buyerPhone: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  paymentTerms: string | null;
  paymentConditions: string | null;
}

export interface NormalizedLineItem {
  lineIndex: number;
  productName: string | null;
  packSize: string | null;
  manufacturer: string | null;
  hsnSac: string | null;
  batchNumber: string | null;
  expiryDate: string | null;
  mrp: number | null;
  ptr: number | null;
  pts: number | null;
  quantity: number | null;
  units: string | null;
  discountPercentage: number | null;
  discountAmount: number | null;
  igst: number | null;
  cgst: number | null;
  sgst: number | null;
  totalAmount: number | null;
  extra: Record<string, unknown>;
}

export interface NormalizedInvoice {
  header: NormalizedHeader;
  totals: NormalizedTotals;
  lineItems: NormalizedLineItem[];
  summary: NormalizedInvoiceSummary;
  raw: {
    header: Record<string, unknown>;
    totals: Record<string, unknown>;
    lineItems: Record<string, unknown>[];
  };
  gstins: string[];
}

const numberField = z
  .string()
  .or(z.number())
  .or(z.null())
  .or(z.undefined())
  .transform((value) => {
    if (value === undefined || value === null) return null;
    const cleaned = String(value).replace(/[^0-9.\-]/g, "").trim();
    if (!cleaned) return null;
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  });

const stringField = z
  .string()
  .or(z.number())
  .or(z.null())
  .or(z.undefined())
  .transform((value) => {
    if (value === undefined || value === null) return null;
    const str = String(value).trim();
    return str.length > 0 ? str : null;
  });

const dateField = stringField.transform((value) => {
  if (!value) return null;
  return parseDate(value);
});

function parseDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const iso = new Date(trimmed);
  if (!Number.isNaN(iso.getTime())) {
    return iso.toISOString().slice(0, 10);
  }

  const match = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = match[2].padStart(2, "0");
    let year = match[3];
    if (year.length === 2) {
      year = Number.parseInt(year, 10) > 50 ? `19${year}` : `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  return null;
}

const TaxTotalsSchema = z
  .object({
    igst: numberField,
    cgst: numberField,
    sgst: numberField,
    IGST: numberField.optional(),
    CGST: numberField.optional(),
    SGST: numberField.optional()
  })
  .partial();

const SupplierSchema = z
  .object({
    name: stringField,
    address: stringField,
    gstin: stringField,
    GSTIN: stringField.optional(),
    dl_number: stringField,
    DL_number: stringField.optional()
  })
  .passthrough();

const BuyerSchema = z
  .object({
    name: stringField,
    address: stringField,
    gstin: stringField,
    GSTIN: stringField.optional(),
    phone: stringField
  })
  .passthrough();

const InvoiceHeaderSchema = z
  .object({
    supplier_details: SupplierSchema.optional(),
    buyer_details: BuyerSchema.optional(),
    supplier: stringField.optional(),
    buyer: stringField.optional(),
    supplierAddress: stringField.optional(),
    buyerAddress: stringField.optional(),
    supplierGstn: stringField.optional(),
    buyerGstn: stringField.optional(),
    invoice_number: stringField.optional(),
    invoice_no: stringField.optional(),
    invoiceDate: stringField.optional(),
    invoice_date: stringField.optional(),
    date: stringField.optional(),
    due_date: stringField.optional(),
    payment_terms: stringField.optional(),
    payment_conditions: stringField.optional()
  })
  .passthrough();

const InvoiceFooterSchema = z
  .object({
    subtotal: numberField,
    sub_total: numberField.optional(),
    total: numberField.optional(),
    net: numberField.optional(),
    grand_total: numberField,
    grandTotal: numberField.optional(),
    additional_charges: numberField,
    additionalCharges: numberField.optional(),
    discounts: numberField.optional(),
    discount: numberField.optional(),
    payment_information: stringField,
    paymentInformation: stringField.optional(),
    terms_and_conditions: stringField,
    terms: stringField.optional(),
    tax_totals: TaxTotalsSchema.optional(),
    taxTotals: TaxTotalsSchema.optional()
  })
  .passthrough();

const LineItemSchema = z
  .object({
    product_name: stringField,
    name: stringField.optional(),
    description: stringField.optional(),
    pack_size: stringField,
    manufacturer: stringField,
    hsn_sac: stringField,
    batch_number: stringField,
    expiry_date: stringField,
    mrp: numberField,
    ptr: numberField,
    pts: numberField,
    quantity: numberField,
    qty: numberField.optional(),
    units: stringField,
    discount_percentage: numberField,
    discount_percent: numberField.optional(),
    discount_amount: numberField,
    tax_information: z
      .object({
        igst: numberField,
        cgst: numberField,
        sgst: numberField,
        IGST: numberField.optional(),
        CGST: numberField.optional(),
        SGST: numberField.optional()
      })
      .partial()
      .optional(),
    total_amount: numberField,
    amount: numberField.optional()
  })
  .passthrough();

const ExtractionSchema = z
  .object({
    invoice_header: InvoiceHeaderSchema.optional(),
    invoice_footer: InvoiceFooterSchema.optional(),
    header: InvoiceHeaderSchema.optional(),
    totals: InvoiceFooterSchema.optional(),
    lineItems: z.array(LineItemSchema).optional(),
    line_items: z.array(LineItemSchema).optional(),
    extractedData: z.any().optional()
  })
  .passthrough();

export function normalizeInvoiceExtraction(extractedData: any, rawText = ""): NormalizedInvoice | null {
  const parsed = ExtractionSchema.safeParse(extractedData);
  if (!parsed.success) {
    return null;
  }
  const data = parsed.data;

  const headerSource = data.invoice_header || data.header || data.extractedData?.invoice_header || data.extractedData?.header || {};
  const footerSource = data.invoice_footer || data.totals || data.extractedData?.invoice_footer || data.extractedData?.totals || {};
  const lineItemSource = data.lineItems || data.line_items || data.extractedData?.lineItems || data.extractedData?.line_items || [];

  const supplier = SupplierSchema.safeParse(headerSource.supplier_details || headerSource.supplier || {}).data || {};
  const buyer = BuyerSchema.safeParse(headerSource.buyer_details || headerSource.buyer || {}).data || {};
  const footer = InvoiceFooterSchema.safeParse(footerSource).data || {
    subtotal: null,
    grand_total: null,
    additional_charges: null,
    payment_information: null,
    terms_and_conditions: null,
    tax_totals: {}
  };

  const normalizedHeader: NormalizedHeader = {
    supplierName: supplier.name ?? headerSource.supplier ?? null,
    supplierAddress: supplier.address ?? headerSource.supplierAddress ?? null,
    supplierGstin: supplier.gstin ?? supplier.GSTIN ?? headerSource.supplierGstn ?? null,
    supplierDlNumber: supplier.dl_number ?? supplier.DL_number ?? null,
    buyerName: buyer.name ?? headerSource.buyer ?? null,
    buyerAddress: buyer.address ?? headerSource.buyerAddress ?? null,
    buyerGstin: buyer.gstin ?? buyer.GSTIN ?? headerSource.buyerGstn ?? null,
    buyerPhone: buyer.phone ?? null,
    invoiceNumber: headerSource.invoice_number ?? headerSource.invoice_no ?? null,
    invoiceDate: dateField.parse(headerSource.invoice_date ?? headerSource.invoiceDate ?? headerSource.date ?? null),
    dueDate: dateField.parse(headerSource.due_date ?? null),
    paymentTerms: headerSource.payment_terms ?? null,
    paymentConditions: headerSource.payment_conditions ?? null
  };

  const normalizedTotals: NormalizedTotals = {
    subtotal: footer.subtotal ?? footer.sub_total ?? footer.total ?? footer.net ?? null,
    grandTotal: footer.grand_total ?? footer.grandTotal ?? footer.total ?? footer.net ?? null,
    additionalCharges: footer.additional_charges ?? footer.additionalCharges ?? null,
    discounts: footer.discounts ?? footer.discount ?? null,
    paymentInformation: footer.payment_information ?? footer.paymentInformation ?? null,
    termsAndConditions: footer.terms_and_conditions ?? footer.terms ?? null,
    taxTotals: {
      igst: footer.tax_totals?.igst ?? footer.tax_totals?.IGST ?? null,
      cgst: footer.tax_totals?.cgst ?? footer.tax_totals?.CGST ?? null,
      sgst: footer.tax_totals?.sgst ?? footer.tax_totals?.SGST ?? null
    }
  };

  const normalizedLineItems: NormalizedLineItem[] = lineItemSource.map((item, index) => {
    const parsedItem = LineItemSchema.safeParse(item).data || ({} as any);
    const taxes = parsedItem.tax_information || {};

    return {
      lineIndex: index,
      productName: parsedItem.product_name ?? parsedItem.name ?? parsedItem.description ?? null,
      packSize: parsedItem.pack_size ?? null,
      manufacturer: parsedItem.manufacturer ?? null,
      hsnSac: parsedItem.hsn_sac ?? null,
      batchNumber: parsedItem.batch_number ?? null,
      expiryDate: parsedItem.expiry_date ?? null,
      mrp: parsedItem.mrp ?? null,
      ptr: parsedItem.ptr ?? null,
      pts: parsedItem.pts ?? null,
      quantity: parsedItem.quantity ?? parsedItem.qty ?? null,
      units: parsedItem.units ?? null,
      discountPercentage: parsedItem.discount_percentage ?? parsedItem.discount_percent ?? null,
      discountAmount: parsedItem.discount_amount ?? null,
      igst: taxes.igst ?? taxes.IGST ?? null,
      cgst: taxes.cgst ?? taxes.CGST ?? null,
      sgst: taxes.sgst ?? taxes.SGST ?? null,
      totalAmount: parsedItem.total_amount ?? parsedItem.amount ?? null,
      extra: item as Record<string, unknown>
    };
  });

  const summary: NormalizedInvoiceSummary = {
    supplierName: normalizedHeader.supplierName,
    buyerName: normalizedHeader.buyerName,
    invoiceNumber: normalizedHeader.invoiceNumber,
    lineItemCount: normalizedLineItems.length,
    grandTotal: normalizedTotals.grandTotal
  };

  const gstins = collectGstins(normalizedHeader, normalizedLineItems, rawText);

  return {
    header: normalizedHeader,
    totals: normalizedTotals,
    lineItems: normalizedLineItems,
    summary,
    raw: {
      header: headerSource as Record<string, unknown>,
      totals: footerSource as Record<string, unknown>,
      lineItems: lineItemSource as Record<string, unknown>[]
    },
    gstins
  };
}

function collectGstins(
  header: NormalizedHeader,
  lineItems: NormalizedLineItem[],
  rawText: string
): string[] {
  const gstns = new Set<string>();

  const maybeAdd = (value: string | null) => {
    if (!value) return;
    const cleaned = value.trim();
    if (cleaned.length === 15) {
      gstns.add(cleaned.toUpperCase());
    }
  };

  maybeAdd(header.supplierGstin);
  maybeAdd(header.buyerGstin);

  lineItems.forEach((item) => {
    const extraGstin = typeof item.extra?.gstin === "string" ? item.extra.gstin : undefined;
    if (extraGstin) maybeAdd(extraGstin);
  });

  if (rawText) {
    const upper = rawText.toUpperCase();
    const pattern = /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z][Z][0-9A-Z]/g;
    const matches = upper.match(pattern);
    if (matches) {
      matches.forEach((match) => maybeAdd(match));
    }

    const labelPattern = /GSTIN?\s*[:\-]?\s*([0-9A-Z]{15})/gi;
    let m: RegExpExecArray | null;
    while ((m = labelPattern.exec(upper)) !== null) {
      maybeAdd(m[1]);
    }
  }

  return Array.from(gstns);
}

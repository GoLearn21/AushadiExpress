import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";

// Helper function to format currency
const formatCurrency = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

interface LineItem {
  product_name: string;
  pack_size: string;
  manufacturer: string;
  hsn_sac: string;
  batch_number: string;
  expiry_date: string;
  mrp: string;
  ptr: string;
  pts: string;
  quantity: string;
  discount_percentage: string;
  discount_amount: string;
  tax_information: {
    igst: string;
    cgst: string;
    sgst: string;
  };
  total_amount: string;
  units?: string;
}

interface InvoiceViewerProps {
  invoiceData: {
    invoice_header: {
      supplier_details: {
        name: string;
        address: string;
        gstin: string;
        dl_number: string;
      };
      buyer_details: {
        name: string;
        address: string;
        gstin: string;
        phone: string;
      };
      invoice_number: string;
      invoice_date: string;
      due_date: string;
      payment_terms?: string;
      payment_conditions?: string;
    };
    line_items: LineItem[];
    invoice_footer: {
      subtotal: string;
      tax_totals: {
        igst: string;
        cgst: string;
        sgst: string;
      };
      grand_total: string;
      additional_charges?: string;
      payment_information?: string;
      terms_and_conditions: string;
    };
    rawText?: string;
  };
}

export function InvoiceViewer({ invoiceData }: InvoiceViewerProps) {
  const { invoice_header, line_items, invoice_footer } = invoiceData;
  
  // Calculate totals
  const subtotal = parseFloat(invoice_footer.subtotal) || 0;
  const grandTotal = parseFloat(invoice_footer.grand_total) || 0;
  const totalDiscount = line_items.reduce((sum, item) => {
    return sum + (parseFloat(item.discount_amount) || 0);
  }, 0);
  
  // Get tax rates from the first line item that has taxes
  const firstItemWithTax = line_items.find(item => 
    item.tax_information && 
    (parseFloat(item.tax_information.igst) > 0 || 
     parseFloat(item.tax_information.cgst) > 0 || 
     parseFloat(item.tax_information.sgst) > 0)
  );
  
  const igstAmount = firstItemWithTax ? parseFloat(firstItemWithTax.tax_information.igst) || 0 : 0;
  const cgstAmount = firstItemWithTax ? parseFloat(firstItemWithTax.tax_information.cgst) || 0 : 0;
  const sgstAmount = firstItemWithTax ? parseFloat(firstItemWithTax.tax_information.sgst) || 0 : 0;

  return (
    <div className="space-y-6 p-4">
      {/* Main Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Header Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">TAX INVOICE</h2>
                <div className="text-sm text-muted-foreground">
                  Invoice #: {invoice_header.invoice_number}
                </div>
              </div>
              <div className="mt-2 md:mt-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Date:</span> {new Date(invoice_header.invoice_date).toLocaleDateString('en-IN')}
                </div>
                {invoice_header.due_date && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Due Date:</span> {new Date(invoice_header.due_date).toLocaleDateString('en-IN')}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Supplier and Buyer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Supplier Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Supplier</h3>
            <div className="space-y-1">
              <p className="font-medium text-gray-900 dark:text-white">{invoice_header.supplier_details.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {invoice_header.supplier_details.address}
              </p>
              <div className="grid grid-cols-2 gap-x-4 mt-2">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">GSTIN:</span>
                  <span className="text-sm ml-1">{invoice_header.supplier_details.gstin}</span>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">DL No:</span>
                  <span className="text-sm ml-1">{invoice_header.supplier_details.dl_number}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Buyer Details */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Bill To</h3>
            <div className="space-y-1">
              <p className="font-medium text-gray-900 dark:text-white">{invoice_header.buyer_details.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {invoice_header.buyer_details.address}
              </p>
              <div className="grid grid-cols-2 gap-x-4 mt-2">
                <div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">GSTIN:</span>
                  <span className="text-sm ml-1">{invoice_header.buyer_details.gstin || 'N/A'}</span>
                </div>
                {invoice_header.buyer_details.phone && (
                  <div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Phone:</span>
                    <span className="text-sm ml-1">{invoice_header.buyer_details.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
          
          {/* Line Items */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Batch</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expiry</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">MRP</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PTR</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PTS</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Disc. %</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {line_items.map((item, index) => {
              const itemTotal = parseFloat(item.total_amount) || 0;
              return (
                <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.product_name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.manufacturer} • {item.pack_size}
                      {item.hsn_sac && ` • HSN: ${item.hsn_sac}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.batch_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.expiry_date || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                    {formatCurrency(item.mrp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                    {formatCurrency(item.ptr)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                    {formatCurrency(item.pts)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                    {item.quantity} {item.units || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                    {parseFloat(item.discount_percentage || '0') > 0 ? `${item.discount_percentage}%` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900 dark:text-white">
                    {formatCurrency(itemTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {line_items.map((item, index) => {
          const itemTotal = parseFloat(item.total_amount) || 0;
          return (
            <div key={index} className="rounded-xl border border-border bg-background shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">#{index + 1}</span>
                <span className="text-sm font-bold text-primary">{formatCurrency(itemTotal)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.manufacturer} • {item.pack_size}
                  {item.hsn_sac && ` • HSN: ${item.hsn_sac}`}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Batch</span><span>{item.batch_number || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Expiry</span><span>{item.expiry_date || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Qty</span><span>{item.quantity} {item.units || ''}</span></div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">MRP</span><span>{formatCurrency(item.mrp)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">PTR</span><span>{formatCurrency(item.ptr)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Disc.</span><span>{parseFloat(item.discount_percentage || '0') > 0 ? `${item.discount_percentage}%` : '-'}</span></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
          
          {/* Invoice Footer */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 sm:px-6 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              {/* Terms and Conditions */}
              {invoice_footer.terms_and_conditions && (
                <div className="w-full md:w-1/2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Terms & Conditions</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{invoice_footer.terms_and_conditions}</p>
                </div>
              )}
              
              {/* Totals */}
              <div className="w-full md:w-1/3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                      <span className="text-red-600 dark:text-red-400">-{formatCurrency(totalDiscount)}</span>
                    </div>
                  )}
                  
                  {igstAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">IGST ({igstAmount}%):</span>
                      <span>{formatCurrency((subtotal * igstAmount) / 100)}</span>
                    </div>
                  )}
                  
                  {cgstAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">CGST ({cgstAmount}%):</span>
                      <span>{formatCurrency((subtotal * cgstAmount) / 100)}</span>
                    </div>
                  )}
                  
                  {sgstAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">SGST ({sgstAmount}%):</span>
                      <span>{formatCurrency((subtotal * sgstAmount) / 100)}</span>
                    </div>
                  )}
                  
                  {invoice_footer.additional_charges && parseFloat(invoice_footer.additional_charges) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Additional Charges:</span>
                      <span>{formatCurrency(parseFloat(invoice_footer.additional_charges))}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  
                  <div className="flex justify-between text-base font-bold">
                    <span>Grand Total:</span>
                    <span className="text-lg">{formatCurrency(grandTotal)}</span>
                  </div>
                  
                  {invoice_footer.payment_information && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Payment Info:</span> {invoice_footer.payment_information}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          
          </div>
          
          {/* Footer */}
          <div className="bg-gray-100 dark:bg-gray-800 px-6 py-3 -mx-6 -mb-6 mt-6 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              This is an AI-generated invoice. Please double confirm it before submitting.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

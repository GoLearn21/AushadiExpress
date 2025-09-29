import { useState, useRef, useEffect, useMemo, useCallback, ComponentProps } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { Textarea } from "../components/ui/textarea";
import { Send, Upload, Mic, MicOff, Sparkles, Camera, FileText, X, Zap, User, Plus, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { cameraCapture } from "../services/camera-capture";
import { IntelligentPharmacyAgent } from "../services/intelligent-pharmacy-agent";
import { InvoiceViewer } from "../components/invoice-viewer";

type InvoiceData = ComponentProps<typeof InvoiceViewer>["invoiceData"];
type SubmissionState = 'idle' | 'submitting' | 'submitted' | 'error';

// Format timestamp for messages
const formatTimestamp = (date: Date | string | number) => {
  try {
    const validDate = new Date(date);
    if (isNaN(validDate.getTime())) {
      return 'Just now';
    }
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(validDate);
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Just now';
  }
};

const formatCurrency = (value: string | number | undefined | null) => {
  const numeric = typeof value === 'number' ? value : parseFloat(value ?? '');
  if (isNaN(numeric)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numeric);
};

const toAmountString = (value: unknown) => {
  if (value === null || value === undefined) return '0.00';
  const numeric = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.\-]/g, ''));
  if (isNaN(numeric)) return '0.00';
  return numeric.toFixed(2);
};

const ensureInvoiceData = (data: any): InvoiceData | null => {
  if (!data || !data.invoice_header || !Array.isArray(data.line_items)) {
    return null;
  }

  return {
    invoice_header: {
      supplier_details: {
        name: data.invoice_header?.supplier_details?.name || 'Unknown Supplier',
        address: data.invoice_header?.supplier_details?.address || '',
        gstin: data.invoice_header?.supplier_details?.gstin || '',
        dl_number: data.invoice_header?.supplier_details?.dl_number || ''
      },
      buyer_details: {
        name: data.invoice_header?.buyer_details?.name || 'Unknown Buyer',
        address: data.invoice_header?.buyer_details?.address || '',
        gstin: data.invoice_header?.buyer_details?.gstin || '',
        phone: data.invoice_header?.buyer_details?.phone || ''
      },
      invoice_number: data.invoice_header?.invoice_number || '',
      invoice_date: data.invoice_header?.invoice_date || '',
      due_date: data.invoice_header?.due_date || '',
      payment_terms: data.invoice_header?.payment_terms || '',
      payment_conditions: data.invoice_header?.payment_conditions || ''
    },
    line_items: data.line_items.map((item: any) => ({
      product_name: item.product_name || '',
      pack_size: item.pack_size || '',
      manufacturer: item.manufacturer || '',
      hsn_sac: item.hsn_sac || '',
      batch_number: item.batch_number || '',
      expiry_date: item.expiry_date || '',
      mrp: toAmountString(item.mrp),
      ptr: toAmountString(item.ptr),
      pts: toAmountString(item.pts),
      quantity: item.quantity || '',
      units: item.units || '',
      discount_percentage: item.discount_percentage || '',
      discount_amount: toAmountString(item.discount_amount),
      tax_information: {
        igst: toAmountString(item.tax_information?.igst),
        cgst: toAmountString(item.tax_information?.cgst),
        sgst: toAmountString(item.tax_information?.sgst)
      },
      total_amount: toAmountString(item.total_amount)
    })),
    invoice_footer: {
      subtotal: toAmountString(data.invoice_footer?.subtotal),
      tax_totals: {
        igst: toAmountString(data.invoice_footer?.tax_totals?.igst),
        cgst: toAmountString(data.invoice_footer?.tax_totals?.cgst),
        sgst: toAmountString(data.invoice_footer?.tax_totals?.sgst)
      },
      grand_total: toAmountString(data.invoice_footer?.grand_total),
      additional_charges: data.invoice_footer?.additional_charges || '',
      payment_information: data.invoice_footer?.payment_information || '',
      terms_and_conditions: data.invoice_footer?.terms_and_conditions || ''
    },
    rawText: data.rawText || ''
  };
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const base64ToFile = async (base64: string, fileName: string): Promise<File> => {
  const response = await fetch(base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
};

const extractStructuredData = (analysisResult: any) => {
  if (!analysisResult) return null;
  if (analysisResult.invoice_header || analysisResult.line_items) {
    return analysisResult;
  }
  if (analysisResult.extractedData) {
    return analysisResult.extractedData;
  }
  return null;
};

const buildInvoiceSummary = (invoiceData: InvoiceData | null) => {
  const summary = {
    lineItemCount: invoiceData?.line_items?.length || 0,
    grandTotal: invoiceData?.invoice_footer?.grand_total || '',
    supplierName: invoiceData?.invoice_header?.supplier_details?.name || '',
    invoiceNumber: invoiceData?.invoice_header?.invoice_number || ''
  };

  const lines: string[] = ['📄 Invoice generated — ready for submission.'];
  if (summary.invoiceNumber) {
    lines.push(`Invoice #: ${summary.invoiceNumber}`);
  }
  if (summary.supplierName) {
    lines.push(`Supplier: ${summary.supplierName}`);
  }
  if (summary.lineItemCount) {
    lines.push(`Line items: ${summary.lineItemCount}`);
  }
  if (summary.grandTotal) {
    lines.push(`Grand total: ${formatCurrency(summary.grandTotal)}`);
  }

  lines.push('Tip: Review & submit from a desktop for detailed editing.');

  return {
    text: lines.join('\n'),
    summary
  };
};

const buildSubmissionPayload = (invoiceData: InvoiceData | null, rawAnalysis: any, fallbackType = 'invoice') => {
  if (rawAnalysis) {
    const payload = { ...rawAnalysis };
    if (!payload.documentType) {
      payload.documentType = fallbackType;
    }

    payload.extractedData = payload.extractedData || {};
    if (invoiceData?.invoice_header) {
      payload.extractedData.invoice_header = invoiceData.invoice_header;
    }

    const resolvedLineItems = invoiceData?.line_items || payload.extractedData.lineItems || payload.extractedData.line_items;
    if (resolvedLineItems) {
      payload.extractedData.lineItems = resolvedLineItems;
      if ('line_items' in payload.extractedData) {
        delete payload.extractedData.line_items;
      }
    }

    if (invoiceData?.invoice_footer) {
      payload.extractedData.invoice_footer = invoiceData.invoice_footer;
      payload.extractedData.totals = invoiceData.invoice_footer;
    }
    if (!payload.rawText && invoiceData?.rawText) {
      payload.rawText = invoiceData.rawText;
    }
    if (!payload.confidence && typeof invoiceData?.confidence === 'number') {
      payload.confidence = invoiceData.confidence;
    }

    if ('line_items' in payload) {
      delete (payload as any).line_items;
    }

    return payload;
  }

  return {
    documentType: fallbackType,
    extractedData: {
      invoice_header: invoiceData?.invoice_header || {},
      invoice_footer: invoiceData?.invoice_footer || {},
      lineItems: invoiceData?.line_items || [],
      totals: invoiceData?.invoice_footer || {}
    },
    rawText: invoiceData?.rawText || ''
  };
};

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'document' | 'confirmation';
  imageUrl?: string;
  extractedData?: any; // For storing structured data like invoice information
  documentInfo?: {
    type: string;
    medicines?: string[];
    total?: number | string;
    confidence?: number;
    invoiceData?: InvoiceData | null;
    summary?: {
      lineItemCount?: number;
      grandTotal?: string;
      supplierName?: string;
      invoiceNumber?: string;
    };
    rawAnalysis?: any;
    imageFileName?: string;
    submissionState?: SubmissionState;
    submissionError?: string;
    submittedAt?: string;
    isCollapsed?: boolean;
  };
  pendingConfirmation?: {
    messageId: string;
    aiClassification: string;
    extractedData: any;
    confidence: number;
    imageFile: File;
  };
}

// Extract clickable suggestions from assistant messages
const extractSuggestions = (content: string): string[] => {
  const lines = content.split('\n');
  const suggestions: string[] = [];
  let inSuggestionsSection = false;

  for (const line of lines) {
    // Check for Quick Actions line with pipe-separated format
    if (line.includes('Quick Actions:')) {
      const actionsText = line.split('Quick Actions:')[1]?.trim();
      if (actionsText) {
        const actions = actionsText.split('|').map(action => action.trim()).filter(Boolean);
        suggestions.push(...actions);
      }
      continue;
    }

    // Legacy support for bullet-point suggestions  
    if (line.includes('💡') && (line.includes('Try asking') || line.includes('Try these') || line.includes('asking:'))) {
      inSuggestionsSection = true;
      continue;
    }

    if (inSuggestionsSection) {
      const trimmed = line.trim();
      if (trimmed.startsWith('• "') && trimmed.endsWith('"')) {
        const suggestion = trimmed.slice(3, -1);
        suggestions.push(suggestion);
      } else if (trimmed.startsWith('• ')) {
        const suggestion = trimmed.slice(2);
        if (suggestion && !suggestion.includes('**') && suggestion.length > 5) {
          suggestions.push(suggestion);
        }
      } else if (trimmed === '' || (!trimmed.startsWith('•') && trimmed.length > 0 && !trimmed.includes('💡'))) {
        break;
      }
    }
  }

  return suggestions.filter(s => s.length > 2 && s.length < 80);
};

type InvoiceSummary = ReturnType<typeof buildInvoiceSummary>["summary"];

interface PendingInvoiceEntry {
  messageId: string;
  summaryText: string;
  summary: InvoiceSummary;
  invoiceData: InvoiceData;
  rawAnalysis?: any;
  imageFileName?: string;
  imageData?: string | null;
  createdAt: string;
  isCollapsed: boolean;
  submissionState?: SubmissionState;
  serverId?: string;
}

interface PendingInvoiceDTO {
  id: string;
  tenantId: string;
  messageId: string;
  summaryText: string | null;
  summary: InvoiceSummary | null;
  invoiceData: InvoiceData | null;
  rawAnalysis: any;
  imageFileName: string | null;
  imageData: string | null;
  submissionState: SubmissionState;
  createdAt: string;
  updatedAt: string;
}

// Component for rendering individual chat messages
const ChatMessage = ({
  message,
  onSuggestionClick,
  onUpdateMessage,
  onSubmitInvoice,
  onInvoiceVisibilityChange,
  onInvoiceDataChange
}: {
  message: Message;
  onSuggestionClick: (suggestion: string) => void;
  onUpdateMessage: (id: string, updater: (prev: Message) => Message) => Message | undefined;
  onSubmitInvoice: (id: string) => void;
  onInvoiceVisibilityChange?: (id: string, isCollapsed: boolean) => void;
  onInvoiceDataChange?: (id: string, payload: { invoiceData?: InvoiceData | null; rawAnalysis?: any; summary?: InvoiceSummary; summaryText?: string; submissionState?: SubmissionState; imageFileName?: string; }) => void;
}) => {
  const suggestions = message.role === 'assistant' ? extractSuggestions(message.content) : [];
  const isInvoiceDocument = message.type === 'document' && message.documentInfo?.type === 'invoice' && message.documentInfo.invoiceData;
  const containerClasses = isInvoiceDocument
    ? 'max-w-[95%] w-full text-foreground'
    : `max-w-[85%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'} rounded-2xl px-4 py-3`;
  const submissionState = message.documentInfo?.submissionState || 'idle';
  const [isEditing, setIsEditing] = useState(false);
  const [editableInvoice, setEditableInvoice] = useState<InvoiceData | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const isCollapsed = message.documentInfo?.isCollapsed !== false;
  const summary = message.documentInfo?.summary;
  const lineItemCount = summary?.lineItemCount ?? message.documentInfo?.invoiceData?.line_items?.length ?? 0;
  const grandTotalValue = summary?.grandTotal ?? message.documentInfo?.invoiceData?.invoice_footer?.grand_total;

  useEffect(() => {
    if (isEditing) {
      const sourceObject = message.documentInfo?.invoiceData;
      if (sourceObject) {
        setEditableInvoice(JSON.parse(JSON.stringify(sourceObject)));
        setEditError(null);
      } else {
        setEditableInvoice(null);
        setEditError('No invoice data available to edit.');
      }
    } else {
      setEditableInvoice(null);
      setEditError(null);
    }
  }, [isEditing, message.documentInfo?.invoiceData, message.id]);

  const mutateInvoice = (mutator: (draft: InvoiceData) => void) => {
    setEditableInvoice(prev => {
      if (!prev) {
        return prev;
      }
      const draft: InvoiceData = JSON.parse(JSON.stringify(prev));
      mutator(draft);
      return draft;
    });
  };

  const handleHeaderFieldChange = (field: keyof InvoiceData['invoice_header'], value: string) => {
    mutateInvoice(draft => {
      (draft.invoice_header as any)[field] = value;
    });
  };

  const handlePartyFieldChange = (
    party: 'supplier_details' | 'buyer_details',
    field: keyof InvoiceData['invoice_header']['supplier_details'],
    value: string
  ) => {
    mutateInvoice(draft => {
      (draft.invoice_header[party] as any)[field] = value;
    });
  };

  const handleLineItemFieldChange = (
    index: number,
    field: keyof InvoiceData['line_items'][number],
    value: string
  ) => {
    mutateInvoice(draft => {
      if (!draft.line_items[index]) return;
      (draft.line_items[index] as any)[field] = value;
    });
  };

  const handleLineItemTaxChange = (
    index: number,
    field: keyof InvoiceData['line_items'][number]['tax_information'],
    value: string
  ) => {
    mutateInvoice(draft => {
      if (!draft.line_items[index]) return;
      draft.line_items[index].tax_information = draft.line_items[index].tax_information || { igst: '', cgst: '', sgst: '' };
      (draft.line_items[index].tax_information as any)[field] = value;
    });
  };

  const handleAddLineItem = () => {
    mutateInvoice(draft => {
      draft.line_items.push({
        product_name: '',
        pack_size: '',
        manufacturer: '',
        hsn_sac: '',
        batch_number: '',
        expiry_date: '',
        mrp: '',
        ptr: '',
        pts: '',
        quantity: '',
        units: '',
        discount_percentage: '',
        discount_amount: '',
        tax_information: { igst: '', cgst: '', sgst: '' },
        total_amount: ''
      });
    });
  };

  const handleRemoveLineItem = (index: number) => {
    mutateInvoice(draft => {
      draft.line_items.splice(index, 1);
    });
  };

  const handleFooterFieldChange = (
    field: keyof InvoiceData['invoice_footer'],
    value: string
  ) => {
    mutateInvoice(draft => {
      (draft.invoice_footer as any)[field] = value;
    });
  };

  const handleFooterTaxChange = (
    field: keyof InvoiceData['invoice_footer']['tax_totals'],
    value: string
  ) => {
    mutateInvoice(draft => {
      draft.invoice_footer.tax_totals = draft.invoice_footer.tax_totals || { igst: '', cgst: '', sgst: '' };
      (draft.invoice_footer.tax_totals as any)[field] = value;
    });
  };

  const handleApplyEdits = () => {
    if (!editableInvoice) {
      setEditError('Invoice data is not available.');
      return;
    }

    const normalized = ensureInvoiceData(editableInvoice);
    if (!normalized) {
      setEditError('Invoice data is missing required sections.');
      return;
    }

    const { text: summaryText, summary } = buildInvoiceSummary(normalized);
    const updatedRawAnalysis = buildSubmissionPayload(
      normalized,
      message.documentInfo?.rawAnalysis,
      message.documentInfo?.type || 'invoice'
    );

    const updated = onUpdateMessage(message.id, prev => ({
      ...prev,
      content: summaryText,
      documentInfo: prev.documentInfo ? {
        ...prev.documentInfo,
        invoiceData: normalized,
        summary,
        rawAnalysis: updatedRawAnalysis,
        submissionState: 'idle',
        submissionError: undefined,
        submittedAt: undefined
      } : prev.documentInfo
    }));
    void onInvoiceDataChange?.(message.id, {
      invoiceData: normalized,
      rawAnalysis: updatedRawAnalysis,
      summary,
      summaryText,
      submissionState: 'idle',
      imageFileName: message.documentInfo?.imageFileName
    });
    setIsEditing(false);
    setEditError(null);
  };

  const handleSubmitInvoice = () => {
    setIsEditing(false);
    onSubmitInvoice(message.id);
  };

  const handleToggleCollapsed = (collapsed: boolean) => {
    setIsEditing(false);
    const updated = onUpdateMessage(message.id, prev => {
      if (!prev.documentInfo) return prev;
      return {
        ...prev,
        documentInfo: {
          ...prev.documentInfo,
          isCollapsed: collapsed
        }
      };
    });
    onInvoiceVisibilityChange && onInvoiceVisibilityChange(message.id, collapsed);
    if (updated?.documentInfo?.invoiceData) {
      void onInvoiceDataChange?.(message.id, {
        invoiceData: updated.documentInfo.invoiceData,
        rawAnalysis: updated.documentInfo.rawAnalysis,
        summary: updated.documentInfo.summary,
        summaryText: updated.content,
        submissionState: updated.documentInfo.submissionState,
        imageFileName: updated.documentInfo.imageFileName
      });
    }
  };

  return (
    <div id={`message-${message.id}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      {message.role !== 'user' && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
          {message.role === 'assistant' ? (
            <Sparkles className="w-4 h-4 text-primary" />
          ) : (
            <FileText className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      )}
      
      <div className={containerClasses}>
        {message.type === 'document' && message.documentInfo && !isInvoiceDocument && (
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs capitalize">
                {message.documentInfo.type || 'document'}
              </Badge>
              {message.documentInfo.confidence && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(message.documentInfo.confidence * 100)}% confidence
                </span>
              )}
            </div>
            
            {message.documentInfo.medicines && message.documentInfo.medicines.length > 0 && (
              <div className="text-sm mb-2">
                <div className="font-medium">Medicines:</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {message.documentInfo.medicines.slice(0, 3).map((med: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {med}
                    </Badge>
                  ))}
                  {message.documentInfo.medicines.length > 3 && (
                    <span className="text-xs text-muted-foreground self-center">
                      +{message.documentInfo.medicines.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {message.documentInfo.total && (
              <div className="text-sm">
                <span className="font-medium">Total:</span> {formatCurrency(message.documentInfo.total)}
              </div>
            )}
          </div>
        )}

        {isInvoiceDocument && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs uppercase tracking-wide">Invoice</Badge>
              {message.documentInfo.summary?.invoiceNumber && (
                <span className="text-sm text-muted-foreground">#{message.documentInfo.summary.invoiceNumber}</span>
              )}
              {typeof message.documentInfo.confidence === 'number' && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(message.documentInfo.confidence * 100)}% confidence
                </span>
              )}
              {submissionState === 'submitting' && (
                <Badge variant="secondary" className="text-xs">Submitting…</Badge>
              )}
              {submissionState === 'submitted' && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-100/30">
                  Submitted
                </Badge>
              )}
              {submissionState === 'error' && (
                <Badge variant="destructive" className="text-xs">Submit failed</Badge>
              )}
            </div>

            {!isEditing && isCollapsed && (
              <div className="rounded-2xl border border-border bg-background shadow-sm p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {summary?.supplierName || 'Invoice ready'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {summary?.invoiceNumber ? `#${summary.invoiceNumber} · ` : ''}
                      {lineItemCount} items
                      {grandTotalValue ? ` · ${formatCurrency(grandTotalValue)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {submissionState === 'submitting' && (
                      <Badge variant="secondary" className="text-xs">Submitting…</Badge>
                    )}
                    {submissionState === 'submitted' && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-100/30">
                        Submitted
                      </Badge>
                    )}
                    {submissionState === 'error' && (
                      <Badge variant="destructive" className="text-xs">Submit failed</Badge>
                    )}
                  </div>
                </div>
                {message.content && (
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {message.content}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleToggleCollapsed(false)}
                    data-testid={`invoice-review-${message.id}`}
                    disabled={submissionState === 'submitting'}
                  >
                    Review & Submit
                  </Button>
                  {submissionState !== 'submitted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSubmitInvoice()}
                      disabled={submissionState === 'submitting'}
                    >
                      Submit blindly
                    </Button>
                  )}
                </div>
              </div>
            )}

            {!isEditing && !isCollapsed && (
              <div className="rounded-2xl border border-border bg-background shadow-sm">
                <InvoiceViewer invoiceData={message.documentInfo.invoiceData} />
              </div>
            )}

            {isEditing && (
              <div className="space-y-6 border border-dashed border-border rounded-2xl p-4 bg-background/60">
                {!editableInvoice ? (
                  <div className="text-sm text-destructive">
                    {editError || 'Invoice data is not available for editing.'}
                  </div>
                ) : (
                  <>
                    {editError && (
                      <div className="text-sm text-destructive">{editError}</div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Supplier</h4>
                        <Input
                          value={editableInvoice.invoice_header.supplier_details.name || ''}
                          onChange={(e) => handlePartyFieldChange('supplier_details', 'name', e.target.value)}
                          placeholder="Supplier name"
                        />
                        <Textarea
                          value={editableInvoice.invoice_header.supplier_details.address || ''}
                          onChange={(e) => handlePartyFieldChange('supplier_details', 'address', e.target.value)}
                          placeholder="Supplier address"
                          className="min-h-[72px]"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={editableInvoice.invoice_header.supplier_details.gstin || ''}
                            onChange={(e) => handlePartyFieldChange('supplier_details', 'gstin', e.target.value)}
                            placeholder="GSTIN"
                          />
                          <Input
                            value={editableInvoice.invoice_header.supplier_details.dl_number || ''}
                            onChange={(e) => handlePartyFieldChange('supplier_details', 'dl_number', e.target.value)}
                            placeholder="DL number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Buyer</h4>
                        <Input
                          value={editableInvoice.invoice_header.buyer_details.name || ''}
                          onChange={(e) => handlePartyFieldChange('buyer_details', 'name', e.target.value)}
                          placeholder="Buyer name"
                        />
                        <Textarea
                          value={editableInvoice.invoice_header.buyer_details.address || ''}
                          onChange={(e) => handlePartyFieldChange('buyer_details', 'address', e.target.value)}
                          placeholder="Buyer address"
                          className="min-h-[72px]"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={editableInvoice.invoice_header.buyer_details.gstin || ''}
                            onChange={(e) => handlePartyFieldChange('buyer_details', 'gstin', e.target.value)}
                            placeholder="GSTIN"
                          />
                          <Input
                            value={editableInvoice.invoice_header.buyer_details.phone || ''}
                            onChange={(e) => handlePartyFieldChange('buyer_details', 'phone', e.target.value)}
                            placeholder="Phone"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Invoice number</label>
                        <Input
                          value={editableInvoice.invoice_header.invoice_number || ''}
                          onChange={(e) => handleHeaderFieldChange('invoice_number', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Invoice date</label>
                        <Input
                          value={editableInvoice.invoice_header.invoice_date || ''}
                          onChange={(e) => handleHeaderFieldChange('invoice_date', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Due date</label>
                        <Input
                          value={editableInvoice.invoice_header.due_date || ''}
                          onChange={(e) => handleHeaderFieldChange('due_date', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-muted-foreground">Payment terms</label>
                        <Input
                          value={editableInvoice.invoice_header.payment_terms || ''}
                          onChange={(e) => handleHeaderFieldChange('payment_terms', e.target.value)}
                          placeholder="e.g. Net 30"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-1">
                        <label className="text-xs text-muted-foreground">Conditions</label>
                        <Input
                          value={editableInvoice.invoice_header.payment_conditions || ''}
                          onChange={(e) => handleHeaderFieldChange('payment_conditions', e.target.value)}
                          placeholder="Special conditions"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Line items</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddLineItem}
                        >
                          <Plus className="mr-1 h-4 w-4" /> Add item
                        </Button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] border border-border text-xs">
                          <thead className="bg-muted/50 text-[10px] uppercase tracking-wide text-muted-foreground">
                            <tr>
                              <th className="p-2 text-left">#</th>
                              <th className="p-2 text-left">Product</th>
                              <th className="p-2 text-left">Pack</th>
                              <th className="p-2 text-left">Batch</th>
                              <th className="p-2 text-left">Expiry</th>
                              <th className="p-2 text-left">MRP</th>
                              <th className="p-2 text-left">PTR</th>
                              <th className="p-2 text-left">PTS</th>
                              <th className="p-2 text-left">Qty</th>
                              <th className="p-2 text-left">Disc %</th>
                              <th className="p-2 text-left">Amount</th>
                              <th className="p-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {editableInvoice.line_items.map((item, index) => (
                              <tr key={index} className="border-t border-border">
                                <td className="p-2 align-top text-muted-foreground">{index + 1}</td>
                                <td className="p-2 align-top">
                                  <Input
                                    value={item.product_name || ''}
                                    onChange={(e) => handleLineItemFieldChange(index, 'product_name', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                  <div className="mt-1 grid grid-cols-2 gap-1">
                                    <Input
                                      value={item.manufacturer || ''}
                                      onChange={(e) => handleLineItemFieldChange(index, 'manufacturer', e.target.value)}
                                      placeholder="Manufacturer"
                                      className="h-8 text-xs"
                                    />
                                    <Input
                                      value={item.hsn_sac || ''}
                                      onChange={(e) => handleLineItemFieldChange(index, 'hsn_sac', e.target.value)}
                                      placeholder="HSN/SAC"
                                      className="h-8 text-xs"
                                    />
                                  </div>
                                </td>
                                <td className="p-2 align-top">
                                  <Input
                                    value={item.pack_size || ''}
                                    onChange={(e) => handleLineItemFieldChange(index, 'pack_size', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                <td className="p-2 align-top">
                                  <Input
                                    value={item.batch_number || ''}
                                    onChange={(e) => handleLineItemFieldChange(index, 'batch_number', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                <td className="p-2 align-top">
                                  <Input
                                    value={item.expiry_date || ''}
                                    onChange={(e) => handleLineItemFieldChange(index, 'expiry_date', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                <td className="p-2 align-top">
                                  <Input
                                    value={item.mrp || ''}
                                    onChange={(e) => handleLineItemFieldChange(index, 'mrp', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                <td className="p-2 align-top">
                                  <Input
                                    value={item.ptr || ''}
                                    onChange={(e) => handleLineItemFieldChange(index, 'ptr', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                <td className="p-2 align-top">
                                  <Input
                                    value={item.pts || ''}
                                    onChange={(e) => handleLineItemFieldChange(index, 'pts', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                <td className="p-2 align-top">
                                  <Input
                                    value={item.quantity || ''}
                                    onChange={(e) => handleLineItemFieldChange(index, 'quantity', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                <td className="p-2 align-top">
                                  <Input
                                    value={item.discount_percentage || ''}
                                    onChange={(e) => handleLineItemFieldChange(index, 'discount_percentage', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                <td className="p-2 align-top">
                                  <Input
                                    value={item.total_amount || ''}
                                    onChange={(e) => handleLineItemFieldChange(index, 'total_amount', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                <td className="p-2 align-top">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveLineItem(index)}
                                    className="h-8 w-8"
                                    disabled={editableInvoice.line_items.length <= 1}
                                  >
                                    <span className="sr-only">Remove line item</span>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Subtotal</label>
                          <Input
                            value={editableInvoice.invoice_footer.subtotal || ''}
                            onChange={(e) => handleFooterFieldChange('subtotal', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Grand total</label>
                          <Input
                            value={editableInvoice.invoice_footer.grand_total || ''}
                            onChange={(e) => handleFooterFieldChange('grand_total', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Additional charges</label>
                          <Input
                            value={editableInvoice.invoice_footer.additional_charges || ''}
                            onChange={(e) => handleFooterFieldChange('additional_charges', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">IGST</label>
                          <Input
                            value={editableInvoice.invoice_footer.tax_totals.igst || ''}
                            onChange={(e) => handleFooterTaxChange('igst', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">CGST</label>
                          <Input
                            value={editableInvoice.invoice_footer.tax_totals.cgst || ''}
                            onChange={(e) => handleFooterTaxChange('cgst', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">SGST</label>
                          <Input
                            value={editableInvoice.invoice_footer.tax_totals.sgst || ''}
                            onChange={(e) => handleFooterTaxChange('sgst', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Payment information</label>
                          <Textarea
                            value={editableInvoice.invoice_footer.payment_information || ''}
                            onChange={(e) => handleFooterFieldChange('payment_information', e.target.value)}
                            className="min-h-[72px]"
                            placeholder="Bank details, payment references, etc."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Terms & conditions</label>
                          <Textarea
                            value={editableInvoice.invoice_footer.terms_and_conditions || ''}
                            onChange={(e) => handleFooterFieldChange('terms_and_conditions', e.target.value)}
                            className="min-h-[72px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={handleApplyEdits}>
                        Apply changes
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {!isCollapsed && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="space-y-1 text-xs">
                  {submissionState === 'submitted' && message.documentInfo?.submittedAt && (
                    <div className="text-muted-foreground">
                      Submitted on {new Date(message.documentInfo.submittedAt).toLocaleString()}
                    </div>
                  )}
                  {submissionState === 'error' && message.documentInfo?.submissionError && (
                    <div className="text-destructive">
                      {message.documentInfo.submissionError}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleCollapsed(true)}
                  >
                    Close preview
                  </Button>
                  <Button
                    variant={isEditing ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setIsEditing(prev => !prev)}
                    data-testid={`invoice-edit-toggle-${message.id}`}
                  >
                    {isEditing ? 'Cancel edit' : 'Edit invoice'}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSubmitInvoice}
                    disabled={submissionState === 'submitting'}
                    data-testid={`invoice-submit-${message.id}`}
                  >
                    {submissionState === 'submitting' ? 'Confirming…' : 'Confirm Invoice'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {!isInvoiceDocument && (
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
        )}
        
        {suggestions.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs text-muted-foreground font-medium">
              💡 Quick actions:
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300"
                  onClick={() => onSuggestionClick(suggestion)}
                  data-testid={`suggestion-button-${index}`}
                >
                  {suggestion.length > 35 ? `${suggestion.slice(0, 32)}...` : suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className={`text-xs mt-2 ${
          message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
      
      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ml-2 flex-shrink-0">
          <User className="w-4 h-4 text-primary" />
        </div>
      )}
    </div>
  );
};

export default function AIAssistantFullscreenPage() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [loadingContext, setLoadingContext] = useState<'analysis' | 'pendingInvoice' | null>(null);
  const [agent] = useState(() => new IntelligentPharmacyAgent());
  const [isUploading, setIsUploading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const invoiceAssetsRef = useRef<{ files: Map<string, File> }>({ files: new Map() });
  const { toast } = useToast();

  const tenantId = useMemo(() => localStorage.getItem('currentTenantId') || 'default', []);
  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoiceEntry[]>([]);

  const buildImagePayload = useCallback(async (messageId: string, fallbackName?: string) => {
    const file = invoiceAssetsRef.current.files.get(messageId);
    if (!file) {
      return { imageData: undefined, imageFileName: fallbackName };
    }
    const base64 = await fileToBase64(file);
    return {
      imageData: base64,
      imageFileName: fallbackName || file.name
    };
  }, []);

  const loadPendingInvoices = useCallback(async () => {
    try {
      const response = await fetch(`/api/pending-invoices?tenantId=${encodeURIComponent(tenantId)}`);
      if (!response.ok) {
        throw new Error(`Failed to load pending invoices: ${response.status}`);
      }
      const data = await response.json() as PendingInvoiceDTO[];

      const entries: PendingInvoiceEntry[] = data
        .map(item => {
          const invoiceData = item.invoiceData || ensureInvoiceData(item.rawAnalysis);
          if (!invoiceData) return null;
          return {
            serverId: item.id,
            messageId: item.messageId,
            summaryText: item.summaryText ?? 'Invoice generated — ready for submission.',
            summary: item.summary ?? buildInvoiceSummary(invoiceData).summary,
            invoiceData,
            rawAnalysis: item.rawAnalysis,
            imageFileName: item.imageFileName ?? undefined,
            imageData: item.imageData,
            createdAt: item.createdAt,
            isCollapsed: true,
            submissionState: item.submissionState ?? 'idle'
          } as PendingInvoiceEntry;
        })
        .filter(Boolean) as PendingInvoiceEntry[];

      entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPendingInvoices(entries);

      // Populate invoice asset map so editing/submission can reuse images
      for (const entry of entries) {
        if (entry.imageData && !invoiceAssetsRef.current.files.has(entry.messageId)) {
          try {
            const file = await base64ToFile(entry.imageData, entry.imageFileName || `${entry.messageId}.jpg`);
            invoiceAssetsRef.current.files.set(entry.messageId, file);
          } catch (error) {
            console.error('[AI-PENDING] Failed to hydrate image file for pending invoice:', error);
          }
        }
      }
    } catch (error) {
      console.error('[AI-PENDING] Unable to load pending invoices:', error);
      setPendingInvoices([]);
    }
  }, [tenantId]);

  useEffect(() => {
    loadPendingInvoices();
  }, [loadPendingInvoices]);

  const upsertPendingInvoice = useCallback(async (entry: PendingInvoiceEntry) => {
    const imagePayload = await buildImagePayload(entry.messageId, entry.imageFileName);
    const payload = {
      tenantId,
      messageId: entry.messageId,
      summaryText: entry.summaryText,
      summary: entry.summary,
      invoiceData: entry.invoiceData,
      rawAnalysis: entry.rawAnalysis,
      imageFileName: imagePayload.imageFileName,
      imageData: imagePayload.imageData,
      submissionState: entry.submissionState ?? 'idle',
      createdAt: entry.createdAt
    };

    try {
      const response = await fetch('/api/pending-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Failed to store pending invoice (${response.status})`);
      }
      const saved = await response.json() as PendingInvoiceDTO;
      setPendingInvoices(prev => {
        const others = prev.filter(item => item.messageId !== entry.messageId);
        return [{
          ...entry,
          imageData: imagePayload.imageData,
          imageFileName: imagePayload.imageFileName,
          serverId: saved.id,
          submissionState: saved.submissionState,
          createdAt: saved.createdAt
        }, ...others];
      });
    } catch (error) {
      console.error('[AI-PENDING] Failed to persist pending invoice:', error);
    }
  }, [tenantId, buildImagePayload]);

  const updatePendingInvoiceEntry = useCallback((messageId: string, mutator: (entry: PendingInvoiceEntry) => PendingInvoiceEntry) => {
    setPendingInvoices(prev => {
      let updatedEntry: PendingInvoiceEntry | undefined;
      const nextEntries = prev.map(entry => {
        if (entry.messageId !== messageId) return entry;
        const next = mutator(entry);
        updatedEntry = next;
        return next;
      });

      if (updatedEntry) {
        void fetch(`/api/pending-invoices/${encodeURIComponent(messageId)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summaryText: updatedEntry.summaryText,
            summary: updatedEntry.summary,
            invoiceData: updatedEntry.invoiceData,
            rawAnalysis: updatedEntry.rawAnalysis,
            imageFileName: updatedEntry.imageFileName,
            imageData: updatedEntry.imageData,
            submissionState: updatedEntry.submissionState ?? 'idle'
          })
        }).catch(error => {
          console.error('[AI-PENDING] Failed to update pending invoice:', error);
        });
      }

      return nextEntries;
    });
  }, []);

  const removePendingInvoiceEntry = useCallback(async (messageId: string) => {
    setPendingInvoices(prev => prev.filter(entry => entry.messageId !== messageId));
    invoiceAssetsRef.current.files.delete(messageId);
    try {
      await fetch(`/api/pending-invoices/${encodeURIComponent(messageId)}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('[AI-PENDING] Failed to delete pending invoice:', error);
    }
  }, []);

  const handlePendingInvoiceVisibilityChange = useCallback((messageId: string, isCollapsed: boolean) => {
    updatePendingInvoiceEntry(messageId, entry => ({ ...entry, isCollapsed }));
  }, [updatePendingInvoiceEntry]);

  const handlePendingInvoiceDataChange = useCallback(async (messageId: string, payload: { invoiceData?: InvoiceData | null; rawAnalysis?: any; summary?: InvoiceSummary; summaryText?: string; submissionState?: SubmissionState; imageFileName?: string; }) => {
    const existing = pendingInvoices.find(entry => entry.messageId === messageId);
    if (!existing) {
      if (!payload.invoiceData) {
        return;
      }
      const { text, summary } = buildInvoiceSummary(payload.invoiceData);
      const imagePayload = await buildImagePayload(messageId, payload.imageFileName);
      await upsertPendingInvoice({
        messageId,
        summaryText: payload.summaryText ?? text,
        summary: payload.summary ?? summary,
        invoiceData: payload.invoiceData,
        rawAnalysis: payload.rawAnalysis,
        imageFileName: imagePayload.imageFileName,
        imageData: imagePayload.imageData,
        createdAt: new Date().toISOString(),
        isCollapsed: true,
        submissionState: payload.submissionState ?? 'idle'
      });
      return;
    }

    const imagePayload = payload.imageFileName ? await buildImagePayload(messageId, payload.imageFileName) : undefined;

    updatePendingInvoiceEntry(messageId, entry => {
      const next = { ...entry };
      if (payload.invoiceData) {
        next.invoiceData = payload.invoiceData;
        if (!payload.summary || !payload.summaryText) {
          const { text, summary } = buildInvoiceSummary(payload.invoiceData);
          if (!payload.summary) next.summary = summary;
          if (!payload.summaryText) next.summaryText = text;
        }
      }
      if (payload.rawAnalysis !== undefined) {
        next.rawAnalysis = payload.rawAnalysis;
      }
      if (payload.summary) {
        next.summary = payload.summary;
      }
      if (payload.summaryText) {
        next.summaryText = payload.summaryText;
      }
      if (imagePayload) {
        next.imageFileName = imagePayload.imageFileName ?? next.imageFileName;
        if (imagePayload.imageData) {
          next.imageData = imagePayload.imageData;
        }
      }
      if (payload.submissionState) {
        next.submissionState = payload.submissionState;
      }
      return next;
    });
  }, [pendingInvoices, upsertPendingInvoice, updatePendingInvoiceEntry, buildImagePayload]);

  const handleOpenPendingInvoice = useCallback((messageId: string) => {
    const entry = pendingInvoices.find(item => item.messageId === messageId);
    if (!entry) return;

    setMessages(prev => {
      const messageExists = prev.some(msg => msg.id === messageId);
      let nextMessages = prev;
      if (!messageExists) {
        const pendingMessage: Message = {
          id: entry.messageId,
          role: 'assistant',
          content: entry.summaryText,
          timestamp: new Date(entry.createdAt),
          type: 'document',
          documentInfo: {
            type: 'invoice',
            invoiceData: entry.invoiceData,
            summary: entry.summary,
            rawAnalysis: entry.rawAnalysis,
            imageFileName: entry.imageFileName,
            submissionState: entry.submissionState || 'idle',
            isCollapsed: true
          }
        };
        nextMessages = [...prev, pendingMessage];
      }

      return nextMessages.map(msg => {
        if (msg.id !== messageId || !msg.documentInfo) {
          return msg;
        }
        return {
          ...msg,
          documentInfo: {
            ...msg.documentInfo,
            isCollapsed: false
          }
        };
      });
    });

    setTimeout(() => {
      handlePendingInvoiceVisibilityChange(messageId, false);
      const element = document.getElementById(`message-${messageId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }, [pendingInvoices, handlePendingInvoiceVisibilityChange]);

  const handleDiscardPendingInvoice = useCallback((messageId: string) => {
    invoiceAssetsRef.current.files.delete(messageId);
    removePendingInvoiceEntry(messageId);
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId || !msg.documentInfo) {
        return msg;
      }
      return {
        ...msg,
        documentInfo: {
          ...msg.documentInfo,
          submissionState: 'idle',
          submissionError: undefined,
          isCollapsed: true
        }
      };
    }));
  }, [removePendingInvoiceEntry]);

  const pendingInvoicesPanel = useMemo(() => {
    if (pendingInvoices.length === 0) {
      return null;
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
            Pending invoices
          </h3>
          <Badge variant="outline" className="text-xs">
            Tenant {tenantId}
          </Badge>
        </div>
        <div className="space-y-2">
          {pendingInvoices.map((entry) => {
            const supplierName = entry.summary?.supplierName || entry.invoiceData?.invoice_header?.supplier_details?.name || 'Invoice draft';
            const invoiceNumber = entry.summary?.invoiceNumber || entry.invoiceData?.invoice_header?.invoice_number;
            const itemsCount = entry.summary?.lineItemCount ?? entry.invoiceData?.line_items?.length ?? 0;
            const grandTotalValue = entry.summary?.grandTotal ?? entry.invoiceData?.invoice_footer?.grand_total;
            const summaryText = entry.summaryText || '';
            const summaryLines = summaryText.split('\n').map(line => line.trim()).filter(Boolean);
            const detailLines = summaryLines.filter(line => !line.startsWith('✅'));
            const subtitle = detailLines.slice(0, 2).join(' • ');
            const statusLabel: string = entry.submissionState === 'submitting'
              ? 'Submitting…'
              : entry.submissionState === 'error'
                ? 'Needs attention'
                : entry.isCollapsed
                  ? 'Awaiting review'
                  : 'In chat';

            return (
              <div
                key={entry.messageId}
                className="border border-dashed border-border rounded-xl bg-background/60 shadow-sm p-3 md:p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {supplierName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {invoiceNumber ? `#${invoiceNumber} • ` : ''}
                      {itemsCount} items
                      {grandTotalValue ? ` • ${formatCurrency(grandTotalValue)}` : ''}
                    </p>
                    {subtitle && (
                      <p className="text-[11px] text-muted-foreground whitespace-pre-line">{subtitle}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      Captured {formatTimestamp(entry.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={entry.submissionState === 'error' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {statusLabel}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleOpenPendingInvoice(entry.messageId)}
                    disabled={entry.submissionState === 'submitting'}
                  >
                    {entry.isCollapsed ? 'Review' : 'Continue in chat'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDiscardPendingInvoice(entry.messageId)}
                    className="flex items-center gap-1"
                    disabled={entry.submissionState === 'submitting'}
                  >
                    <Trash2 className="w-3 h-3" />
                    Discard
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [pendingInvoices, tenantId, handleOpenPendingInvoice, handleDiscardPendingInvoice]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load persisted session on mount
  useEffect(() => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('ai_assistant_session_'))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('[AI-SESSION] Error clearing session cache:', error);
    }

    addMessage('assistant', 
      '🔄 Loading your complete business data for intelligent insights...\n\n' +
      'Welcome to AushadiExpress AI Assistant! 🏥\n\n' +
      'I can help you with:\n' +
      '• Analyzing bills, prescriptions, and invoices\n' +
      '• Medicine information and drug interactions\n' +
      '• Inventory management and stock levels\n' +
      '• Sales analytics and reporting\n' +
      '• Business insights from your documents\n\n' +
      'You can upload images, ask questions, or use voice commands. How can I assist you today?'
    );
    
    // Focus on input after mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const addMessage = (
    role: 'user' | 'assistant' | 'system',
    content: string,
    type: 'text' | 'image' | 'document' | 'confirmation' = 'text',
    imageUrl?: string,
    documentInfo?: any,
    pendingConfirmationData?: any
  ) => {
    const message: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
      type,
      imageUrl,
      documentInfo,
      pendingConfirmation: pendingConfirmationData
    };
    setMessages(prev => [...prev, message]);
    return message;
  };

  const updateMessageById = (id: string, updater: (prev: Message) => Message) => {
    let updatedMessage: Message | undefined;
    setMessages(prev => prev.map(msg => {
      if (msg.id !== id) return msg;
      const next = updater({ ...msg, documentInfo: msg.documentInfo ? { ...msg.documentInfo } : undefined });
      updatedMessage = next;
      return next;
    }));
    return updatedMessage;
  };

  const handleInvoiceSubmit = async (messageId: string) => {
    const targetMessage = messages.find(msg => msg.id === messageId);
    const docInfo = targetMessage?.documentInfo;

    if (!targetMessage || !docInfo?.invoiceData) {
      toast({
        title: 'Invoice Not Ready',
        description: 'The invoice data could not be found. Please reprocess the document.',
        variant: 'destructive'
      });
      return;
    }


    const file = invoiceAssetsRef.current.files.get(messageId);

    updateMessageById(messageId, prev => ({
      ...prev,
      documentInfo: prev.documentInfo ? {
        ...prev.documentInfo,
        submissionState: 'submitting',
        submissionError: undefined
      } : prev.documentInfo
    }));
    void handlePendingInvoiceDataChange(messageId, { submissionState: 'submitting' });

    try {
      const userRole = localStorage.getItem('userRole') || 'retailer';
      const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
      const payload = buildSubmissionPayload(docInfo.invoiceData, docInfo.rawAnalysis, docInfo.type || 'invoice');

      let response: Response;

      if (file) {
        const formData = new FormData();
        formData.append('image', file, docInfo.imageFileName || file.name || 'document.jpg');
        formData.append('confirmedType', docInfo.type || 'invoice');
        formData.append('extractedData', JSON.stringify(payload));
        formData.append('userRole', userRole);
        formData.append('deviceType', deviceType);

        response = await fetch('/api/documents', {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            confirmedType: docInfo.type || 'invoice',
            extractedData: payload,
            userRole,
            deviceType
          })
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Submission failed with status ${response.status}`);
      }

      updateMessageById(messageId, prev => ({
        ...prev,
        documentInfo: prev.documentInfo ? {
          ...prev.documentInfo,
          submissionState: 'submitted',
          submissionError: undefined,
          submittedAt: new Date().toISOString(),
          isCollapsed: true
        } : prev.documentInfo
      }));

      invoiceAssetsRef.current.files.delete(messageId);
      removePendingInvoiceEntry(messageId);

      toast({
        title: 'Invoice Stored',
        description: 'The invoice has been submitted to your document records.',
        variant: 'default'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateMessageById(messageId, prev => ({
        ...prev,
        documentInfo: prev.documentInfo ? {
          ...prev.documentInfo,
          submissionState: 'error',
          submissionError: errorMessage
        } : prev.documentInfo
      }));
      void handlePendingInvoiceDataChange(messageId, { submissionState: 'error' });

      toast({
        title: 'Submission Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Extract clickable suggestions from message content
  // Handle suggestion click
  const handleSuggestionClick = async (suggestion: string) => {
    setInputText('');
    await handleSendMessage(suggestion);
  };

  // Mobile-optimized image compression without quality loss
  const compressImageForMobile = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      console.log('[MOBILE-DEBUG] Starting image compression', {
        originalSize: file.size,
        originalType: file.type,
        fileName: file.name
      });
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Calculate optimal dimensions (max 1920x1920 for mobile compatibility)
        const maxDimension = 1920;
        let { width, height } = img;
        
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Use high-quality settings for compression without quality loss
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with optimal quality (0.92 maintains quality while reducing size)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: file.lastModified
              });
              
              console.log('[MOBILE-DEBUG] Image compression completed', {
                originalSize: file.size,
                compressedSize: compressedFile.size,
                compressionRatio: (compressedFile.size / file.size * 100).toFixed(1) + '%',
                dimensions: `${width}x${height}`
              });
              
              resolve(compressedFile);
            } else {
              console.warn('[MOBILE-DEBUG] Compression failed, using original');
              resolve(file);
            }
          },
          file.type.includes('png') ? 'image/png' : 'image/jpeg',
          0.92 // High quality compression
        );
      };
      
      img.onerror = () => {
        console.warn('[MOBILE-DEBUG] Image load failed, using original');
        resolve(file);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSendMessage = async (message: string, imageFile?: File) => {
    if (!message.trim() && !imageFile) return;

    let userContent = message.trim();

    // Add user message
    if (imageFile) {
      setLoadingContext('invoice');
      console.log('[MOBILE-DEBUG] Starting image upload process', {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type,
        userAgent: navigator.userAgent,
        isMobile: /Mobi|Android/i.test(navigator.userAgent)
      });
      
      const imageUrl = URL.createObjectURL(imageFile);
      addMessage('user', userContent || 'Uploaded an image', 'image', imageUrl);
      
      // Process the image through AI
      try {
        setIsLoading(true);
        
        // Compress image for mobile compatibility
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        const processedFile = isMobile ? await compressImageForMobile(imageFile) : imageFile;
        
        console.log('[MOBILE-DEBUG] Creating FormData for upload', {
          originalFile: imageFile.name,
          processedSize: processedFile.size,
          isMobileCompressed: isMobile
        });
        
        const formData = new FormData();
        formData.append('image', processedFile, processedFile.name);
        
        // Log FormData contents for mobile debugging
        console.log('[MOBILE-DEBUG] FormData created, sending request to /api/ai/analyze-document');
        console.log('[MOBILE-DEBUG] Request headers will be set automatically by browser');

        const response = await fetch('/api/ai/analyze-document', {
          method: 'POST',
          body: formData,
          // Add credentials and origin handling for mobile compatibility
          credentials: 'same-origin',
          mode: 'cors'
        });

        console.log('[MOBILE-DEBUG] Response received', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[MOBILE-DEBUG] Response not OK, error text:', errorText);
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { details: errorText };
          }
          throw new Error(errorData.details || `HTTP ${response.status}: ${response.statusText}`);
        }

        const analysisResult = await response.json();
        const structuredData = extractStructuredData(analysisResult) || analysisResult;
        const invoiceData = ensureInvoiceData(structuredData);
        const lineItems = Array.isArray(structuredData?.line_items)
          ? structuredData.line_items
          : Array.isArray(structuredData?.lineItems)
            ? structuredData.lineItems
            : [];
        const detectedTotal =
          structuredData?.invoice_footer?.grand_total ??
          structuredData?.totals?.grandTotal ??
          structuredData?.totals?.grand_total ??
          structuredData?.invoice_footer?.total;

        console.log('[MOBILE-DEBUG] Analysis result received', {
          responseKeys: Object.keys(analysisResult || {}),
          hasStructuredData: !!structuredData,
          invoiceDetected: !!invoiceData,
          lineItemCount: Array.isArray(lineItems) ? lineItems.length : 0
        });

        if (invoiceData) {
          const lineItemCount = invoiceData.line_items?.length || 0;
          const grandTotalValue = invoiceData.invoice_footer?.grand_total || '';
          const { text: summaryText, summary } = buildInvoiceSummary(invoiceData);
          const assistantMessage = addMessage('assistant', summaryText, 'document', undefined, {
            type: 'invoice',
            confidence: typeof analysisResult.confidence === 'number' ? analysisResult.confidence : undefined,
            invoiceData,
            summary,
            rawAnalysis: structuredData,
            imageFileName: imageFile?.name,
            submissionState: 'idle',
            isCollapsed: true
          });
          invoiceAssetsRef.current.files.set(assistantMessage.id, processedFile);
          await upsertPendingInvoice({
            messageId: assistantMessage.id,
            summaryText,
            summary,
            invoiceData,
            rawAnalysis: structuredData,
            imageFileName: imageFile?.name,
            createdAt: new Date().toISOString(),
            isCollapsed: true,
            submissionState: 'idle'
          });
        } else {
          const docType = (analysisResult.documentType
            || structuredData?.documentType
            || structuredData?.document_type
            || 'document') as string;
          const docTypeLabel = docType.toLowerCase();

          const medicineNames = Array.isArray(lineItems)
            ? lineItems
                .map((item: any) => item?.product_name || item?.name || item?.medicine)
                .filter(Boolean)
            : undefined;

          const summary = `✅ Document processed successfully${docTypeLabel !== 'document' && docType ? ` (${docType})` : ''}.`;
          addMessage('assistant', summary, 'document', undefined, {
            type: docType,
            confidence: typeof analysisResult.confidence === 'number' ? analysisResult.confidence : undefined,
            medicines: medicineNames?.slice(0, 6),
            total: detectedTotal
          });
        }

      } catch (error) {
        console.error('[MOBILE-DEBUG] Image analysis failed:', error);
        console.error('[MOBILE-DEBUG] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace',
          name: error instanceof Error ? error.name : 'Unknown error type'
        });
        
        // Enhanced error handling with user-friendly messages
        let userFriendlyMessage = '❌ Sorry, I couldn\'t analyze the image.';
        
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
            userFriendlyMessage = '🌐 **Network Issue**: Please check your internet connection and try again.';
          } else if (error.message.includes('timeout')) {
            userFriendlyMessage = '⏱️ **Upload Timeout**: The image is taking too long to process. Try a smaller image or check your connection.';
          } else if (error.message.includes('413') || error.message.includes('too large')) {
            userFriendlyMessage = '📏 **File Too Large**: Please try a smaller image (under 5MB).';
          } else if (error.message.includes('400') || error.message.includes('bad request')) {
            userFriendlyMessage = '📷 **Invalid Image**: Please upload a clear photo of your document.';
          } else {
            userFriendlyMessage = `❌ **Upload Error**: ${error.message}`;
          }
        }
        
        addMessage('assistant', 
          `${userFriendlyMessage}\n\n💡 **Tips:**\n• Ensure good lighting and clear text\n• Keep the document flat and in focus\n• Try uploading a different image\n\nPlease try again or ask me something else.`
        );
      } finally {
        setIsLoading(false);
        setLoadingContext(null);
      }
    } else {
      addMessage('user', userContent);
    }

    // Get AI response for text queries
    if (userContent && !imageFile) {
      setLoadingContext('text');
      setIsLoading(true);

      try {
        const response = await agent.processQuery(userContent, {
          hasImage: false,
          currentScreen: 'AI Assistant',
          sessionId: sessionId
        });

        addMessage('assistant', response);

      } catch (error) {
        console.error('AI Assistant error:', error);
        
        // Enhanced error handling for AI queries
        let errorMessage = '❌ I encountered an error processing your request.';
        
        if (error instanceof Error) {
          if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
            errorMessage = '🌐 **Connection Issue**: Unable to reach the AI service. Please check your internet connection.';
          } else if (error.message.includes('timeout')) {
            errorMessage = '⏱️ **Request Timeout**: The AI is taking too long to respond. Please try a simpler question.';
          } else if (error.message.includes('500')) {
            errorMessage = '🔧 **Server Error**: Our AI service is temporarily unavailable. Please try again in a moment.';
          }
        }
        
        addMessage('assistant', 
          `${errorMessage}\n\n💡 **You can try:**\n• Rephrasing your question\n• Asking about stored documents\n• Uploading a new image\n• Using voice input`
        );
        
        toast({
          title: 'Assistant Unavailable',
          description: 'Please try again or contact support if this persists',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
        setLoadingContext(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputText;
    setInputText('');
    await handleSendMessage(message);
    inputRef.current?.focus();
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const isAnalyzeOnly = fileInputRef.current?.getAttribute('data-analyze') === 'true';

    if (file) {
      console.log('[MOBILE-DEBUG] File selected from input', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        isMobile: /Mobi|Android/i.test(navigator.userAgent),
        analyzeOnly: isAnalyzeOnly
      });

      if (isAnalyzeOnly) {
        await handleAnalyzeOnly(file);
      } else {
        await handleSendMessage('', file);
      }
    }

    if (fileInputRef.current?.hasAttribute('data-analyze')) {
      fileInputRef.current.removeAttribute('data-analyze');
    }

    // Reset file input
    e.target.value = '';
  };

  const handleCameraCapture = async () => {
    try {
      setIsUploading(true);
      console.log('[MOBILE-DEBUG] Camera capture initiated');
      
      const result = await cameraCapture.captureImage();
      
      if (result.success && result.file) {
        console.log('[MOBILE-DEBUG] Camera capture successful', {
          fileName: result.file.name,
          fileSize: result.file.size,
          fileType: result.file.type
        });
        await handleSendMessage('', result.file);
      } else {
        console.error('[MOBILE-DEBUG] Camera capture failed:', result.error);
        toast({
          title: 'Capture Failed',
          description: result.error || 'Could not capture image',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[MOBILE-DEBUG] Camera capture error:', error);
      toast({
        title: 'Capture Failed',
        description: 'Could not access camera',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeOnly = async (imageFile: File) => {
    console.log('[MOBILE-DEBUG] Starting analyze-only mode', {
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type
    });
    
    const imageUrl = URL.createObjectURL(imageFile);
    addMessage('user', 'Analyze this image', 'image', imageUrl);
    
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      console.log('[MOBILE-DEBUG] Sending analyze-only request to /api/ai/analyze-document');

      const response = await fetch('/api/ai/analyze-document', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for authentication if needed
      });
      
      console.log('[MOBILE-DEBUG] Analyze-only response received', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MOBILE-DEBUG] Analyze-only failed:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { details: errorText };
        }
        throw new Error(errorData.details || 'Analysis failed');
      }

      const analysisResult = await response.json();
      const structuredData = extractStructuredData(analysisResult);
      const invoiceData = structuredData ? ensureInvoiceData(structuredData) : null;
      const lineItems = Array.isArray(structuredData?.line_items)
        ? structuredData.line_items
        : Array.isArray(structuredData?.lineItems)
          ? structuredData.lineItems
          : [];
      const docType = (analysisResult.documentType
        || structuredData?.documentType
        || structuredData?.document_type
        || (invoiceData ? 'invoice' : 'document'))
        .toString()
        .toUpperCase();

      let analysisText = `📄 **Document Analysis Results**\n\n`;
      analysisText += `**Type:** ${docType}\n`;

      const rawText = analysisResult.rawText || structuredData?.rawText;
      if (rawText) {
        const trimmedText = rawText.length > 300 ? `${rawText.substring(0, 300)}...` : rawText;
        analysisText += `**Text Preview:** ${trimmedText}\n\n`;
      }

      if (invoiceData) {
        const header = invoiceData.invoice_header;
        analysisText += `**Supplier:** ${header?.supplier_details?.name || 'N/A'}\n`;
        analysisText += `**Buyer:** ${header?.buyer_details?.name || 'N/A'}\n`;
        if (invoiceData.invoice_footer?.grand_total) {
          analysisText += `**Grand Total:** ${formatCurrency(invoiceData.invoice_footer.grand_total)}\n`;
        }
        analysisText += '\n';
      } else if (structuredData?.header && typeof structuredData.header === 'object') {
        analysisText += '**Header Info:**\n';
        Object.entries(structuredData.header).forEach(([key, value]) => {
          if (value) analysisText += `• ${key}: ${value}\n`;
        });
        analysisText += '\n';
      }

      const normalizedItems = Array.isArray(lineItems)
        ? lineItems.map((item: any) => ({
            name: item?.product_name || item?.name || 'Unknown',
            qty: item?.quantity || item?.qty || '',
            rate: item?.mrp || item?.rate || '',
            amount: item?.total_amount || item?.amount || ''
          }))
        : [];

      if (normalizedItems.length > 0) {
        analysisText += `**Items Detected (${normalizedItems.length}):**\n`;
        normalizedItems.slice(0, 5).forEach((item, index) => {
          analysisText += `${index + 1}. ${item.name}`;
          if (item.qty) analysisText += ` - Qty: ${item.qty}`;
          if (item.amount) analysisText += ` - Amount: ${formatCurrency(item.amount)}`;
          analysisText += '\n';
        });
        if (normalizedItems.length > 5) {
          analysisText += `...and ${normalizedItems.length - 5} more items\n`;
        }
        analysisText += '\n';
      }

      const totals = invoiceData?.invoice_footer || structuredData?.totals;
      if (totals && typeof totals === 'object') {
        analysisText += '**Totals:**\n';
        const totalEntries = [
          ['Subtotal', totals.subtotal],
          ['Discount', totals.discount],
          ['IGST', totals.igst || totals.igstAmount],
          ['CGST', totals.cgst || totals.cgstAmount],
          ['SGST', totals.sgst || totals.sgstAmount],
          ['Grand Total', totals.grand_total || totals.grandTotal]
        ];
        totalEntries.forEach(([label, value]) => {
          if (value) {
            analysisText += `• ${label}: ${formatCurrency(value)}\n`;
          }
        });
      }

      analysisText += '\n*This is analysis only - document was not stored.*';

      addMessage('assistant', analysisText);

    } catch (error) {
      console.error('Image analysis failed:', error);
      addMessage('assistant', 
        `❌ Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };


  const handleAnalyzeImage = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-analyze', 'true');
      fileInputRef.current.click();
    }
  };

  const handleVoiceToggle = async () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      toast({
        title: 'Voice Recognition',
        description: 'Voice input will be available in a future update',
        variant: 'default'
      });
      setTimeout(() => setIsListening(false), 2000);
    }
  };

  const quickActions = [
    { 
      label: 'Analyze Medicine Interactions', 
      icon: '💊',
      action: () => handleSendMessage('Help me check for drug interactions and safety information')
    },
    { 
      label: 'Recent Documents Summary', 
      icon: '📄',
      action: () => handleSendMessage('Show me a summary of recently uploaded documents')
    },
    { 
      label: 'Inventory Status', 
      icon: '📦',
      action: () => handleSendMessage('What\'s my current inventory status and any low stock alerts?')
    },
    { 
      label: 'Sales Analytics', 
      icon: '📊',
      action: () => handleSendMessage('Give me today\'s sales analytics and key insights')
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10 shrink-0 h-16">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/')}
            data-testid="back-button"
          >
            <X className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              AI Assistant
            </h1>
            <p className="text-xs text-muted-foreground">Pharmacy Intelligence</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
        {isLoading
          ? loadingContext === 'pendingInvoice'
            ? 'Generating…'
            : 'Thinking…'
          : 'Ready'}
        </Badge>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {messages.length === 0 && !isLoading ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {pendingInvoicesPanel}
            <div className="flex flex-col items-center justify-center text-center py-12">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">AI Assistant Ready</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Upload documents, ask questions, or try a quick action below
              </p>
              <div className="w-full max-w-md space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4 text-left"
                    onClick={action.action}
                    data-testid={`quick-action-${index}`}
                  >
                    <span className="text-lg mr-3">{action.icon}</span>
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {pendingInvoicesPanel}
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onSuggestionClick={handleSuggestionClick} 
                onUpdateMessage={updateMessageById}
                onSubmitInvoice={handleInvoiceSubmit}
                onInvoiceVisibilityChange={handlePendingInvoiceVisibilityChange}
                onInvoiceDataChange={handlePendingInvoiceDataChange}
              />
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-3 mr-12">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span className="text-sm">{loadingContext === 'pendingInvoice' ? 'Generating invoice…' : 'AI is thinking…'}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border bg-background p-4 shrink-0" style={{ 
          paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)'
        }}>
          {/* Action Buttons */}
          <div className="flex justify-center space-x-3 mb-4">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleImageUpload}
              disabled={isUploading || isLoading}
              data-testid="upload-button"
              className="h-12 w-12 p-0 rounded-full hover:bg-muted/50 bg-muted/20 border border-border/50"
              title="Upload Image"
            >
              <Upload className="w-6 h-6 text-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleCameraCapture}
              disabled={isUploading || isLoading}
              data-testid="camera-button"
              className="h-12 w-12 p-0 rounded-full hover:bg-muted/50 bg-muted/20 border border-border/50"
              title="Capture Document"
            >
              {isUploading ? (
                <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Camera className="w-6 h-6 text-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleAnalyzeImage}
              disabled={isUploading || isLoading}
              data-testid="analyze-button"
              className="h-12 w-12 p-0 rounded-full hover:bg-muted/50 bg-muted/20 border border-border/50"
              title="Analyze Only"
            >
              <Zap className="w-6 h-6 text-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleVoiceToggle}
              disabled={isLoading}
              data-testid="voice-button"
              className={`h-12 w-12 p-0 rounded-full hover:bg-muted/50 border border-border/50 ${
                isListening ? 'bg-red-100 dark:bg-red-900/20' : 'bg-muted/20'
              }`}
              title="Voice Input"
            >
              {isListening ? (
                <div className="relative">
                  <MicOff className="w-6 h-6 text-red-600" />
                  <div className="absolute inset-0 animate-ping">
                    <MicOff className="w-6 h-6 text-red-600 opacity-20" />
                  </div>
                </div>
              ) : (
                <Mic className="w-6 h-6 text-foreground" />
              )}
            </Button>
          </div>

          {/* Text Input */}
          <form onSubmit={handleSubmit} className="relative">
            <Input
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about medicines, documents, or get insights..."
              disabled={isLoading}
              className="flex-1 pr-12 rounded-2xl border-2 resize-none min-h-[44px] text-base bg-background focus:border-primary/50 transition-colors"
              data-testid="message-input"
              style={{ fontSize: '16px' }}
            />
            <Button 
              type="submit" 
              disabled={isLoading || (!inputText.trim())}
              data-testid="send-button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <div className="text-xs text-center text-muted-foreground mt-2">
            AI responses may contain errors. Verify important medical information.
          </div>
        </div>
      </main>


      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}

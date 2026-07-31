import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  FileText,
  Loader2,
  Calendar,
  CreditCard,
  Truck,
} from 'lucide-react';
import { Link } from 'wouter';

interface QuoteItem {
  id: string;
  productName: string;
  manufacturer?: string;
  packSize?: string;
  quantity: number;
  unitPrice: number;
  gstPercentage: number;
  totalPrice: number;
  isAvailable: boolean;
  notes?: string;
}

interface Quote {
  id: string;
  quoteRequestId: string;
  wholesalerTenantId: string;
  status: 'sent' | 'accepted' | 'rejected' | 'expired';
  subtotal: number;
  gstAmount: number;
  discountAmount: number;
  totalAmount: number;
  validUntil: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  notes?: string;
  createdAt: string;
  items: QuoteItem[];
}

interface QuoteRequestDetail {
  id: string;
  wholesalerTenantId: string;
  wholesalerName: string;
  wholesalerPhone: string;
  status: string;
  totalItems: number;
  notes: string;
  createdAt: string;
  items: {
    productName: string;
    requestedQuantity: number;
  }[];
}

export default function RetailerQuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequestDetail | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchQuoteDetails();
    }
  }, [id]);

  const fetchQuoteDetails = async () => {
    try {
      // Fetch quote request details and quotes in parallel
      const [requestRes, quotesRes] = await Promise.all([
        fetch(`/api/retailer/my-quote-requests`, { credentials: 'include' }),
        fetch(`/api/retailer/quote-requests/${id}/quotes`, { credentials: 'include' }),
      ]);

      if (requestRes.ok) {
        const requests = await requestRes.json();
        const request = requests.find((r: any) => r.id === id);
        if (request) {
          setQuoteRequest(request);
        }
      }

      if (quotesRes.ok) {
        const quotesData = await quotesRes.json();
        setQuotes(quotesData);
      }
    } catch (error) {
      console.error('Failed to fetch quote details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load quote details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to accept this quote? This will create an order.')) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/retailer/quotes/${quoteId}/accept`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        toast({
          title: 'Quote Accepted',
          description: 'Order has been created successfully!',
        });
        setLocation('/retailer/my-quotes');
      } else {
        const error = await res.json();
        toast({
          title: 'Failed to Accept',
          description: error.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept quote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to reject this quote?')) {
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/retailer/quotes/${quoteId}/reject`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        toast({
          title: 'Quote Rejected',
          description: 'The quote has been rejected',
        });
        fetchQuoteDetails(); // Refresh
      } else {
        const error = await res.json();
        toast({
          title: 'Failed to Reject',
          description: error.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject quote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-blue-500">Quote Received</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quoteRequest) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Quote Request Not Found</h3>
            <Link href="/retailer/my-quotes">
              <Button>Back to My Quotes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/retailer/my-quotes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Quote Details</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review and respond to quotes
          </p>
        </div>
      </div>

      {/* Quote Request Info */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-500" />
              <CardTitle className="text-lg">{quoteRequest.wholesalerName}</CardTitle>
            </div>
            <Badge variant="outline">{quoteRequest.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Requested on {new Date(quoteRequest.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="h-4 w-4" />
              <span>{quoteRequest.totalItems} item(s) requested</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Received */}
      {quotes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <h3 className="font-medium mb-1">Waiting for Quote</h3>
            <p className="text-sm text-gray-500">
              The wholesaler hasn't sent a quote yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Quotes Received</h2>
          {quotes.map((quote) => (
            <Card key={quote.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-medium">Quote</span>
                  </div>
                  {getStatusBadge(quote.status)}
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Quote Items */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Items</h4>
                  <div className="space-y-2">
                    {quote.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          {item.manufacturer && (
                            <p className="text-xs text-gray-500">{item.manufacturer}</p>
                          )}
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.totalPrice.toFixed(2)}</p>
                          {!item.isAvailable && (
                            <Badge variant="destructive" className="text-xs">Unavailable</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Quote Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{quote.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST</span>
                    <span>₹{quote.gstAmount.toFixed(2)}</span>
                  </div>
                  {quote.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{quote.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>₹{quote.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Terms */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>
                      Valid until: {new Date(quote.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                  {quote.paymentTerms && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span>{quote.paymentTerms}</span>
                    </div>
                  )}
                  {quote.deliveryTerms && (
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span>{quote.deliveryTerms}</span>
                    </div>
                  )}
                  {quote.notes && (
                    <p className="text-gray-600 italic mt-2">"{quote.notes}"</p>
                  )}
                </div>

                {/* Actions */}
                {quote.status === 'sent' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleAcceptQuote(quote.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Accept & Order
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleRejectQuote(quote.id)}
                      disabled={isProcessing}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {quote.status === 'accepted' && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                    <p className="text-green-700 dark:text-green-400 font-medium">
                      Quote Accepted - Order Created
                    </p>
                  </div>
                )}

                {quote.status === 'rejected' && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                    <XCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
                    <p className="text-red-700 dark:text-red-400 font-medium">
                      Quote Rejected
                    </p>
                  </div>
                )}

                {quote.status === 'expired' && (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-center">
                    <Clock className="h-6 w-6 text-gray-500 mx-auto mb-1" />
                    <p className="text-gray-600 font-medium">
                      Quote Expired
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

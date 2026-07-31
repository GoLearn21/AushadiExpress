import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Clock, CheckCircle, XCircle, ChevronRight, Send, Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/app-header';

interface QuoteRequest {
  id: string;
  retailerName: string;
  retailerPhone: string;
  itemCount: number;
  totalEstimate: number;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  items: {
    productName: string;
    quantity: number;
    requestedPrice?: number;
  }[];
}

export default function WholesalerQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    unitPrice: '',
    notes: '',
    validDays: '7',
    paymentTerms: '',
    deliveryTerms: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/wholesaler/quotes', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openQuoteDialog = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    // Pre-fill with estimated price if available
    const estimatedUnitPrice = quote.totalEstimate / Math.max(quote.itemCount, 1);
    setQuoteForm({
      unitPrice: estimatedUnitPrice.toString(),
      notes: '',
      validDays: '7',
      paymentTerms: 'Net 30 days',
      deliveryTerms: 'Delivery within 2-3 business days',
    });
    setShowQuoteDialog(true);
  };

  const handleSendQuote = async () => {
    if (!selectedQuote) return;

    const unitPrice = parseFloat(quoteForm.unitPrice);
    if (isNaN(unitPrice) || unitPrice <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid unit price',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Build quote items from the request items
      const quoteItems = selectedQuote.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: unitPrice,
        gstPercentage: 12,
        isAvailable: true,
      }));

      const res = await fetch('/api/wholesaler/quotes/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quoteRequestId: selectedQuote.id,
          items: quoteItems,
          validDays: parseInt(quoteForm.validDays) || 7,
          paymentTerms: quoteForm.paymentTerms,
          deliveryTerms: quoteForm.deliveryTerms,
          notes: quoteForm.notes,
        }),
      });

      if (res.ok) {
        toast({
          title: 'Quote Sent',
          description: `Quote sent to ${selectedQuote.retailerName}`,
        });
        setShowQuoteDialog(false);
        setSelectedQuote(null);
        fetchQuotes(); // Refresh the list
      } else {
        const error = await res.json();
        toast({
          title: 'Failed to Send Quote',
          description: error.error || 'Something went wrong',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send quote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectQuote = async (quote: QuoteRequest) => {
    if (!confirm(`Are you sure you want to reject the quote request from ${quote.retailerName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/wholesaler/quotes/${quote.id}/reject`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        toast({
          title: 'Quote Rejected',
          description: `Quote request from ${quote.retailerName} has been rejected`,
        });
        fetchQuotes(); // Refresh the list
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
    }
  };

  const getStatusBadge = (status: QuoteRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'quoted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Quoted</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expired</Badge>;
      default:
        return null;
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    if (activeTab === 'pending') return quote.status === 'pending';
    if (activeTab === 'quoted') return quote.status === 'quoted';
    if (activeTab === 'completed') return ['accepted', 'rejected', 'expired'].includes(quote.status);
    return true;
  });

  const pendingCount = quotes.filter(q => q.status === 'pending').length;
  const quotedCount = quotes.filter(q => q.status === 'quoted').length;

  return (
    <div className="flex flex-col h-full">
      <AppHeader />
      <div className="p-4 space-y-4 flex-1 overflow-auto">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Quote Requests</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage incoming quote requests from retailers
          </p>
        </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="quoted">
            Quoted
            {quotedCount > 0 && (
              <span className="ml-1.5 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {quotedCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No quote requests</h3>
                <p className="text-sm text-gray-500">
                  {activeTab === 'pending'
                    ? 'No pending quote requests at the moment'
                    : activeTab === 'quoted'
                    ? 'No quotes waiting for retailer response'
                    : 'No completed quotes yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredQuotes.map((quote) => (
                <Card key={quote.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{quote.retailerName}</h3>
                          {getStatusBadge(quote.status)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {quote.itemCount} item{quote.itemCount > 1 ? 's' : ''} • Est. ₹{quote.totalEstimate.toLocaleString()}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(quote.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>

                    {quote.status === 'pending' && (
                      <div className="mt-3 pt-3 border-t flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuoteDialog(quote);
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send Quote
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectQuote(quote);
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>

      {/* Send Quote Dialog */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Quote</DialogTitle>
            <DialogDescription>
              {selectedQuote && (
                <>Send pricing quote to <strong>{selectedQuote.retailerName}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedQuote && (
            <div className="space-y-4">
              {/* Quote Request Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Requested Items:</h4>
                <ul className="text-sm space-y-1">
                  {selectedQuote.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{item.productName}</span>
                      <span className="text-gray-500">Qty: {item.quantity}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 pt-2 border-t text-sm text-gray-600">
                  Estimated Total: ₹{selectedQuote.totalEstimate.toLocaleString()}
                </div>
              </div>

              {/* Quote Form */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="unitPrice">Unit Price (₹)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    value={quoteForm.unitPrice}
                    onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: e.target.value })}
                    placeholder="Enter price per unit"
                  />
                </div>

                <div>
                  <Label htmlFor="validDays">Quote Valid For (days)</Label>
                  <Input
                    id="validDays"
                    type="number"
                    value={quoteForm.validDays}
                    onChange={(e) => setQuoteForm({ ...quoteForm, validDays: e.target.value })}
                    placeholder="7"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={quoteForm.paymentTerms}
                    onChange={(e) => setQuoteForm({ ...quoteForm, paymentTerms: e.target.value })}
                    placeholder="e.g., Net 30 days"
                  />
                </div>

                <div>
                  <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                  <Input
                    id="deliveryTerms"
                    value={quoteForm.deliveryTerms}
                    onChange={(e) => setQuoteForm({ ...quoteForm, deliveryTerms: e.target.value })}
                    placeholder="e.g., Delivery within 2-3 days"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={quoteForm.notes}
                    onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                    placeholder="Any additional notes for the retailer"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowQuoteDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSendQuote} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Quote
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

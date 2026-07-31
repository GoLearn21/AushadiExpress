import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, ChevronRight, Building2 } from 'lucide-react';
import { Link } from 'wouter';

interface QuoteRequest {
  id: string;
  wholesalerTenantId: string;
  wholesalerName: string;
  wholesalerPhone: string;
  status: 'pending' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  totalItems: number;
  notes: string;
  createdAt: string;
}

export default function MyQuotesPage() {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchQuoteRequests();
  }, []);

  const fetchQuoteRequests = async () => {
    try {
      const res = await fetch('/api/retailer/my-quote-requests', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setQuoteRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch quote requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: QuoteRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'quoted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Quote Received</Badge>;
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

  const filteredQuotes = quoteRequests.filter(qr => {
    if (activeTab === 'pending') return qr.status === 'pending';
    if (activeTab === 'quoted') return qr.status === 'quoted';
    if (activeTab === 'completed') return ['accepted', 'rejected', 'expired'].includes(qr.status);
    return true;
  });

  const pendingCount = quoteRequests.filter(q => q.status === 'pending').length;
  const quotedCount = quoteRequests.filter(q => q.status === 'quoted').length;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/ops">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">My Quote Requests</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your quotes from wholesalers
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending
            {pendingCount > 0 && (
              <span className="ml-1.5 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="quoted">
            Received
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
                <p className="text-sm text-gray-500 mb-4">
                  {activeTab === 'pending'
                    ? 'No pending quote requests'
                    : activeTab === 'quoted'
                    ? 'No quotes received yet'
                    : 'No completed quotes'}
                </p>
                <Link href="/retailer/wholesalers">
                  <Button>Browse Wholesalers</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredQuotes.map((qr) => (
                <Link key={qr.id} href={`/retailer/quote/${qr.id}`}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <h3 className="font-medium">{qr.wholesalerName}</h3>
                            {getStatusBadge(qr.status)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {qr.totalItems} item{qr.totalItems > 1 ? 's' : ''} requested
                          </p>
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(qr.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>

                      {qr.status === 'quoted' && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-blue-600 font-medium">
                            Quote received! Tap to review
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

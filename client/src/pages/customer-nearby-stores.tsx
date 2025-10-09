import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OfflineIndicator } from '@/components/offline-indicator';
import { tw } from '@/lib/theme';
import { useToast } from '@/hooks/use-toast';

interface RetailStore {
  buyerName: string;
  buyerAddress: string | null;
  buyerPhone: string | null;
}

export default function CustomerNearbyStoresPage() {
  const [, setLocation] = useLocation();
  const [retailStores, setRetailStores] = useState<RetailStore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/retail-stores', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const stores = await response.json();
        setRetailStores(stores);
      } else {
        toast({ 
          title: "Unable to fetch stores", 
          description: "Please try again later",
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('Error fetching retail stores:', error);
      toast({ 
        title: "Network error", 
        description: "Please check your connection",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <OfflineIndicator />
      
      {/* App Bar */}
      <header className="app-bar text-primary-foreground px-4 py-3 elevation-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setLocation('/customer-search')} className="material-icons text-xl">
              arrow_back
            </button>
            <h1 className={`${tw.headingLg} text-primary-foreground`}>Nearby Pharmacies</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 pb-24">
          <div className="max-w-2xl mx-auto">
            
            {/* Info Header */}
            <div className="mb-6">
              <p className="text-gray-600">
                {loading 
                  ? 'Finding pharmacies...' 
                  : retailStores.length > 0 
                    ? `Found ${retailStores.length} retail ${retailStores.length === 1 ? 'pharmacy' : 'pharmacies'}` 
                    : 'No pharmacies found'}
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <span className="material-icons text-6xl text-blue-500 animate-spin mb-4">refresh</span>
                <p className="text-gray-600">Loading pharmacies...</p>
              </div>
            ) : retailStores.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <span className="material-icons text-6xl text-gray-400 mb-4">store</span>
                <p className="text-lg font-medium text-gray-900 mb-2">No pharmacies available</p>
                <p className="text-sm text-gray-600 mb-6">Check back later for nearby stores</p>
                <Button onClick={() => setLocation('/customer-search')} variant="outline">
                  Go Back
                </Button>
              </div>
            ) : (
              /* Store List */
              <div className="space-y-4">
                {retailStores.map((store, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
                          <span className="material-icons text-blue-600 text-2xl">store</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{store.buyerName}</h3>
                          {store.buyerAddress && (
                            <p className="text-sm text-gray-600 mb-2 flex items-start">
                              <span className="material-icons text-sm mr-2 mt-0.5 text-gray-500">location_on</span>
                              {store.buyerAddress}
                            </p>
                          )}
                          {store.buyerPhone && (
                            <p className="text-sm text-gray-600 flex items-center">
                              <span className="material-icons text-sm mr-2 text-gray-500">phone</span>
                              <a href={`tel:${store.buyerPhone}`} className="text-blue-600 hover:underline">
                                {store.buyerPhone}
                              </a>
                            </p>
                          )}
                        </div>
                        <button className="text-blue-600 p-2 hover:bg-blue-50 rounded-full">
                          <span className="material-icons">chevron_right</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

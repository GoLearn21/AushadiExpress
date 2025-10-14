import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OfflineIndicator } from '@/components/offline-indicator';
import { CustomerHeader } from '@/components/customer-header';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';

export default function CustomerSearchResultsPage() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const medicine = searchParams.get('medicine') || '';
  const pincode = searchParams.get('pincode') || '';
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: results, isLoading, error } = useQuery({
    queryKey: ['/api/search', medicine, pincode],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (medicine) params.append('medicine', medicine);
      if (pincode) params.append('pincode', pincode);

      const response = await fetch(`/api/search?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      return response.json();
    },
    enabled: !!(medicine || pincode),
  });

  const handleAddToCart = (product: any, store: any) => {
    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      storeId: store.tenantId,
      storeName: store.storeName,
      storeAddress: store.storeAddress,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} from ${store.storeName}`,
    });
  };

  const handleViewStore = (storeId: string, storeName: string) => {
    setLocation(`/store/${storeId}/${encodeURIComponent(storeName)}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <OfflineIndicator />
        <CustomerHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="material-icons animate-spin text-4xl text-blue-600 mb-4">refresh</span>
            <p className="text-gray-600">Searching...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <OfflineIndicator />
        <CustomerHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <span className="material-icons text-red-500 text-5xl mb-4">error</span>
              <h3 className="text-lg font-semibold mb-2">Search Failed</h3>
              <p className="text-gray-600 mb-4">Unable to perform search. Please try again.</p>
              <Button onClick={() => setLocation('/search')}>Back to Search</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stores = results?.stores || [];
  const totalProducts = results?.totalProducts || 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <OfflineIndicator />
      <CustomerHeader />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="container mx-auto px-4 py-4">
          {/* Search Info */}
          <div className="mb-4">
            <button
              onClick={() => setLocation('/search')}
              className="flex items-center text-blue-600 mb-2"
            >
              <span className="material-icons text-sm mr-1">arrow_back</span>
              <span className="text-sm font-medium">Back to Search</span>
            </button>

            <h1 className="text-xl font-bold text-gray-900">Search Results</h1>
            <p className="text-sm text-gray-600">
              {medicine && `Medicine: "${medicine}"`}
              {medicine && pincode && " • "}
              {pincode && `Area: ${pincode}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Found {stores.length} pharmacies with {totalProducts} products
            </p>
          </div>

          {/* Results */}
          {stores.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <span className="material-icons text-6xl text-gray-400 mb-4">search_off</span>
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4">
                  {medicine
                    ? `No pharmacies found with "${medicine}" in stock`
                    : "No pharmacies found in this area"
                  }
                </p>
                <Button onClick={() => setLocation('/search')}>
                  Try Different Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {stores.map((store: any) => (
                <Card key={store.tenantId} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Store Card */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-xl text-gray-900 mb-1">{store.storeName}</h3>

                          {/* Rating/Reviews Placeholder */}
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex items-center">
                              <span className="material-icons text-yellow-500 text-sm">star</span>
                              <span className="material-icons text-yellow-500 text-sm">star</span>
                              <span className="material-icons text-yellow-500 text-sm">star</span>
                              <span className="material-icons text-yellow-500 text-sm">star</span>
                              <span className="material-icons text-gray-300 text-sm">star</span>
                            </div>
                            <span className="text-sm text-gray-600 ml-1">4.0 (120 reviews)</span>
                          </div>

                          {store.storeAddress && (
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2 flex items-start">
                              <span className="material-icons text-xs mr-1 mt-0.5">location_on</span>
                              {store.storeAddress}
                            </p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                              <span className="material-icons text-xs mr-1">inventory_2</span>
                              {store.products.length} items available
                            </span>
                            {store.pincode && (
                              <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                <span className="material-icons text-xs mr-1">pin_drop</span>
                                {store.pincode}
                              </span>
                            )}
                            <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                              <span className="material-icons text-xs mr-1">schedule</span>
                              Open now
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* View Store Button */}
                    <div className="border-t bg-gray-50 px-4 py-3">
                      <Button
                        onClick={() => handleViewStore(store.tenantId, store.storeName)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="lg"
                      >
                        <span className="material-icons text-sm mr-2">storefront</span>
                        View Products & Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

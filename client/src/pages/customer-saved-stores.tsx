import { useLocation } from 'wouter';
import { useFavorites } from '@/hooks/use-favorites';
import { CustomerHeader } from '@/components/customer-header';
import { OfflineIndicator } from '@/components/offline-indicator';

export default function CustomerSavedStoresPage() {
  const [, setLocation] = useLocation();
  const { favorites, loading, toggleFavorite } = useFavorites();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <OfflineIndicator />
      <CustomerHeader />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Saved Stores</h1>
            <p className="text-gray-500">Your favorite pharmacies</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center mb-6">
                <span className="material-icons text-6xl text-red-400">favorite_border</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No saved stores yet</h2>
              <p className="text-gray-500 text-center mb-8 max-w-sm">
                Save your favorite pharmacies by tapping the heart icon in your cart
              </p>
              <button
                onClick={() => setLocation('/nearby-stores')}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold flex items-center gap-2 transition-colors"
              >
                <span className="material-icons">search</span>
                Browse Stores
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((store) => (
                <div
                  key={store.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="material-icons text-gray-600 text-2xl">store</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{store.storeName}</h3>
                        {store.storeAddress && (
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                            {store.storeAddress}
                          </p>
                        )}
                        {store.storePhone && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <span className="material-icons text-base">phone</span>
                            {store.storePhone}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => toggleFavorite(
                          store.storeTenantId,
                          store.storeName,
                          store.storeAddress,
                          store.storePhone
                        )}
                        className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors active:scale-95 flex-shrink-0"
                        aria-label="Remove from favorites"
                      >
                        <span className="material-icons text-xl text-red-500">favorite</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setLocation(`/store/${store.storeTenantId}/${encodeURIComponent(store.storeName)}`)}
                      className="mt-4 w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span className="material-icons">storefront</span>
                      View Products
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

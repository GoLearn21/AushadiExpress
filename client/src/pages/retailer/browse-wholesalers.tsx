import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, Phone, MapPin, Package, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface Wholesaler {
  id: string;
  tenantId: string;
  name: string;
  businessAddress: string;
  contactPhone: string;
  gstNumber: string;
  productCount: number;
}

export default function BrowseWholesalersPage() {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWholesalers();
  }, []);

  const fetchWholesalers = async (search?: string) => {
    setIsLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/retailer/wholesalers${params}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setWholesalers(data);
      }
    } catch (error) {
      console.error('Failed to fetch wholesalers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWholesalers(searchQuery);
  };

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
          <h1 className="text-xl font-bold">Browse Wholesalers</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Find wholesalers and request quotes
          </p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </form>

      {/* Wholesalers List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : wholesalers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No wholesalers found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery ? 'Try a different search term' : 'No wholesalers are available yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {wholesalers.map((wholesaler) => (
            <Link key={wholesaler.id} href={`/retailer/wholesaler/${wholesaler.tenantId}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{wholesaler.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          <Package className="h-3 w-3 mr-1" />
                          {wholesaler.productCount} products
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        {wholesaler.businessAddress && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{wholesaler.businessAddress}</span>
                          </div>
                        )}
                        {wholesaler.contactPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{wholesaler.contactPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface FavoriteStore {
  id: string;
  userId: string;
  storeTenantId: string;
  storeName: string;
  storeAddress: string | null;
  storePhone: string | null;
  createdAt: Date;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteStore[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const isFavorite = (storeTenantId: string): boolean => {
    return favorites.some(fav => fav.storeTenantId === storeTenantId);
  };

  const toggleFavorite = async (
    storeTenantId: string,
    storeName: string,
    storeAddress?: string | null,
    storePhone?: string | null
  ) => {
    const favorite = isFavorite(storeTenantId);

    try {
      if (favorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${storeTenantId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          setFavorites(prev => prev.filter(fav => fav.storeTenantId !== storeTenantId));
          toast({
            title: "Removed from favorites",
            description: `${storeName} has been removed from your favorites.`,
          });
        } else {
          throw new Error('Failed to remove favorite');
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            storeTenantId,
            storeName,
            storeAddress,
            storePhone,
          }),
        });

        if (response.ok) {
          const newFavorite = await response.json();
          setFavorites(prev => [...prev, newFavorite]);
          toast({
            title: "Added to favorites",
            description: `${storeName} has been added to your favorites.`,
          });
        } else {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add favorite');
        }
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    refreshFavorites: fetchFavorites,
  };
}

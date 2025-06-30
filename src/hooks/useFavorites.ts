import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface FavoriteItem {
  productId: string;
}

export function useFavorites() {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!session?.user) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data: FavoriteItem[] = await response.json();
        setFavorites(data.map((fav) => fav.productId));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = (productId: string) => favorites.includes(productId);

  const toggleFavorite = async (productId: string) => {
    if (!session?.user) return false;

    const isCurrentlyFavorite = isFavorite(productId);

    try {
      let response;
      if (isCurrentlyFavorite) {
        response = await fetch(`/api/favorites/${productId}`, {
          method: "DELETE",
        });
      } else {
        response = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      }

      if (response.ok) {
        if (isCurrentlyFavorite) {
          setFavorites(favorites.filter((id) => id !== productId));
        } else {
          setFavorites([...favorites, productId]);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return false;
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    refresh: loadFavorites,
  };
}

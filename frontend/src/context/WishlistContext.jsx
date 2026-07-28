import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WishlistContext = createContext(null);

const WISHLIST_KEY = 'gomibox_wishlist';

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => (p._id || p.id) === (product._id || product.id));
      if (exists) {
        return prev.filter((p) => (p._id || p.id) !== (product._id || product.id));
      }
      return [...prev, product];
    });
  }, []);

  const isInWishlist = useCallback(
    (productId) => {
      return wishlist.some((p) => (p._id || p.id) === productId);
    },
    [wishlist]
  );

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((p) => (p._id || p.id) !== productId));
  }, []);

  return (
    <WishlistContext.Provider
      value={{ wishlistCount: wishlist.length, toggleWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}

import { createContext, useContext, useReducer, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext.jsx';
import * as cartService from '../services/cartService.js';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'gomibox_guest_cart';

function guestCartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return action.payload;
    case 'ADD_ITEM': {
      const existing = state.findIndex(
        (i) => i.product === action.payload.product && i.color === action.payload.color
      );
      if (existing > -1) {
        const updated = [...state];
        updated[existing] = { ...updated[existing], quantity: updated[existing].quantity + action.payload.quantity };
        return updated;
      }
      return [...state, action.payload];
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return state.filter((i) => i.product !== action.payload.product);
      }
      return state.map((i) =>
        i.product === action.payload.product ? { ...i, quantity: action.payload.quantity } : i
      );
    }
    case 'REMOVE_ITEM':
      return state.filter((i) => i.product !== action.payload);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [serverCart, setServerCart] = useState(null);
  const [guestCart, dispatchGuest] = useReducer(guestCartReducer, [], () => {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(guestCart));
  }, [guestCart]);

  useEffect(() => {
    if (isAuthenticated) {
      cartService
        .getCart()
        .then((res) => setServerCart(res.data))
        .catch(() => setServerCart(null));
    } else {
      setServerCart(null);
    }
  }, [isAuthenticated]);

  const items = isAuthenticated && serverCart ? serverCart.items || [] : [];
  const guestItems = guestCart;
  const cartItems = isAuthenticated ? items : guestItems;

  const addToCart = useCallback(
    async (product, quantity = 1, color = '') => {
      if (isAuthenticated) {
        const res = await cartService.addToCart(product._id || product.id, quantity, color);
        setServerCart(res.data);
      } else {
        dispatchGuest({
          type: 'ADD_ITEM',
          payload: {
            product: product._id || product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || product.thumbnail || '',
            quantity,
            color,
          },
        });
      }
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(
    async (itemId, productId, quantity) => {
      if (isAuthenticated) {
        const res = await cartService.updateCartItem(itemId, quantity);
        setServerCart(res.data);
      } else {
        dispatchGuest({ type: 'UPDATE_QUANTITY', payload: { product: productId, quantity } });
      }
    },
    [isAuthenticated]
  );

  const removeFromCart = useCallback(
    async (itemId, productId) => {
      if (isAuthenticated) {
        const res = await cartService.removeCartItem(itemId);
        setServerCart(res.data);
      } else {
        dispatchGuest({ type: 'REMOVE_ITEM', payload: productId });
      }
    },
    [isAuthenticated]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      await cartService.clearCart();
      setServerCart(null);
    } else {
      dispatchGuest({ type: 'CLEAR' });
    }
  }, [isAuthenticated]);

  const cartCount = isAuthenticated
    ? (serverCart?.itemCount || 0)
    : guestItems.reduce((sum, i) => sum + i.quantity, 0);

  const subtotal = isAuthenticated
    ? (serverCart?.subtotal || 0)
    : guestItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

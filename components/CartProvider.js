'use client';

import React, { createContext, useContext, useState, useEffect, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';
import { MAX_QUANTITY } from '@/lib/pricing';

const CartContext = createContext();

// The cart lives in localStorage; useSyncExternalStore reads it without a
// hydration mismatch and keeps every open tab in sync.
// When logged in, the account's cart in the database is the source of truth:
// a guest cart is merged into it on login, every change is saved back to it,
// and the local copy is cleared on logout.
const STORAGE_KEY = 'coolphotos_cart';
const OWNER_KEY = 'coolphotos_cart_owner'; // user id the local cart belongs to
const DIRTY_KEY = 'coolphotos_cart_dirty'; // local changes not yet saved to the account
const EMPTY_CART = [];
const listeners = new Set();
let cachedCart = null;
let syncUserId = null; // set once the logged-in user's cart has been loaded
let pushTimer = null;

function readCart() {
  if (cachedCart === null) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      cachedCart = Array.isArray(saved) ? saved : EMPTY_CART;
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
      cachedCart = EMPTY_CART;
    }
  }
  return cachedCart;
}

function writeCart(items, { push = true } = {}) {
  cachedCart = items;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save cart to localStorage:', e);
  }
  listeners.forEach((listener) => listener());
  if (push) schedulePush();
}

function readOwner() {
  try {
    return localStorage.getItem(OWNER_KEY);
  } catch {
    return null;
  }
}

function writeOwner(userId) {
  try {
    if (userId) localStorage.setItem(OWNER_KEY, userId);
    else localStorage.removeItem(OWNER_KEY);
  } catch {
    // ignore
  }
}

function isDirty() {
  try {
    return localStorage.getItem(DIRTY_KEY) === '1';
  } catch {
    return false;
  }
}

function setDirty(dirty) {
  try {
    if (dirty) localStorage.setItem(DIRTY_KEY, '1');
    else localStorage.removeItem(DIRTY_KEY);
  } catch {
    // ignore
  }
}

// Saves the cart to the account and returns the server's cleaned-up copy
// (current prices, unavailable items removed)
async function pushCart(items) {
  const res = await fetch('/api/cart', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map(({ type, id, quantity }) => ({ type, id: String(id), quantity })),
    }),
  });
  if (!res.ok) throw new Error(`PUT /api/cart failed with ${res.status}`);
  return res.json();
}

function schedulePush() {
  if (!syncUserId) return;
  // Survives a reload before the save below runs, so the change isn't lost
  setDirty(true);
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const sent = readCart();
    try {
      const saved = await pushCart(sent);
      // Don't overwrite changes made while the request was in flight
      if (readCart() === sent) {
        writeCart(saved, { push: false });
        setDirty(false);
      }
    } catch (e) {
      console.error('Failed to save cart to account:', e);
    }
  }, 400);
}

// Same item in both carts keeps the larger quantity, so merging twice is harmless
function mergeCarts(accountItems, localItems) {
  const merged = [...accountItems];
  for (const item of localItems) {
    const i = merged.findIndex((m) => String(m.id) === String(item.id) && m.type === item.type);
    if (i === -1) merged.push(item);
    else merged[i] = { ...merged[i], quantity: Math.max(merged[i].quantity, item.quantity) };
  }
  return merged;
}

function subscribe(listener) {
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) {
      cachedCart = null;
      listener();
    }
  };
  listeners.add(listener);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

const setCartItems = (update) => writeCart(update(readCart()));

export function CartProvider({ children }) {
  const cartItems = useSyncExternalStore(subscribe, readCart, () => EMPTY_CART);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (status === 'loading') return;

    if (!userId) {
      syncUserId = null;
      // The local cart belonged to someone who logged out — don't show it to the next person
      if (readOwner()) {
        writeOwner(null);
        setDirty(false);
        writeCart(EMPTY_CART, { push: false });
      }
      return;
    }

    if (syncUserId === userId) return;

    let cancelled = false;
    const before = readCart();
    const loadAccountCart = async () => {
      try {
        const res = await fetch('/api/cart');
        if (!res.ok) throw new Error(`GET /api/cart failed with ${res.status}`);
        const accountItems = await res.json();
        if (cancelled) return;

        const owner = readOwner();
        const local = readCart();
        // - Guest cart: merge it into the account.
        // - This user's cart with unsaved changes: the local copy is newer, save it.
        // - Otherwise (in sync, or left behind by another user): use the account's cart.
        const unsaved = owner === userId && (isDirty() || local !== before);
        writeOwner(userId);
        syncUserId = userId;
        if (owner === null && local.length > 0) {
          writeCart(mergeCarts(accountItems, local));
        } else if (unsaved) {
          writeCart(local);
        } else {
          setDirty(false);
          writeCart(accountItems, { push: false });
        }
      } catch (e) {
        console.error('Failed to load cart from account:', e);
      }
    };
    loadAccountCart();

    return () => {
      cancelled = true;
    };
  }, [status, userId]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
    return () => clearTimeout(timer);
  };

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.id === item.id && i.type === item.type
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(
            updated[existingIndex].quantity + (item.quantity || 1),
            MAX_QUANTITY
          ),
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: item.id,
            type: item.type || 'gear',
            name: item.name,
            price: Number(item.price || item.pricePerDay || item.pricePerHalf || 0),
            quantity: Math.min(item.quantity || 1, MAX_QUANTITY),
            image: item.image || item.images?.[0] || '',
            category: item.category || '',
          },
        ];
      }
    });

    showToast(`เพิ่ม "${item.name}" ลงในตะกร้าเรียบร้อยแล้ว!`);
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    showToast('ลบรายการออกจากตะกร้าแล้ว', 'info');
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY) } : item
      )
    );
  };

  const clearCart = () => {
    writeCart(EMPTY_CART);
    showToast('ล้างตะกร้าสินค้าเรียบร้อยแล้ว', 'info');
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 1),
      0
    );
  };

  const cartCount = cartItems.reduce(
    (count, item) => count + (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
      }}
    >
      {children}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-5 right-5 z-[9999] transition-all transform duration-300 ease-out translate-y-0 opacity-100 animate-slide-in">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl px-4 py-3 text-white max-w-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-check text-sm"></i>
            </div>
            <div className="flex-1 text-sm font-medium">
              <p className="text-slate-200">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-white transition-colors ml-2"
              aria-label="Close notification"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartProvider;

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('coolphotos_cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('coolphotos_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

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
          quantity: updated[existingIndex].quantity + (item.quantity || 1),
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
            quantity: item.quantity || 1,
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
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('coolphotos_cart');
    } catch (e) {
      // ignore
    }
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

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./ToastContext";

export interface CartItem {
  id: string; // unique cart item key (e.g. productId-variantId)
  productId: string;
  variantId?: string | null;
  variantName?: string | null;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  sku: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "id">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "aj_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { success, error } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore parse errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore write errors
      }
    }
  }, [items, isLoaded]);

  const addToCart = (item: Omit<CartItem, "id">) => {
    const id = `${item.productId}-${item.variantId || "main"}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        const nextQty = existing.quantity + item.quantity;
        if (nextQty > item.stock) {
          error(`Rất tiếc, kho chỉ còn ${item.stock} sản phẩm.`);
          return prev;
        }
        success(`Đã cập nhật số lượng ${item.title}`);
        return prev.map((i) => (i.id === id ? { ...i, quantity: nextQty } : i));
      } else {
        if (item.quantity > item.stock) {
          error(`Rất tiếc, chỉ còn ${item.stock} sản phẩm.`);
          return prev;
        }
        success(`Đã thêm "${item.title}" vào giỏ hàng`);
        return [...prev, { ...item, id }];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (quantity > item.stock) {
            error(`Kho chỉ còn ${item.stock} sản phẩm`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((total, i) => total + i.quantity, 0);
  const subtotal = items.reduce((total, i) => total + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
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
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

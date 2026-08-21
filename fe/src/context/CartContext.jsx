import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProductById } from "../data/products";

// Giỏ hàng phía client, lưu tạm trong localStorage.
// Khi nối API thật: thay các hàm bên dưới bằng lời gọi GET/POST/PATCH/DELETE
// tới /api/cart tương ứng — phần UI (Cart.jsx, Checkout.jsx) không cần đổi.

const CartContext = createContext(null);
const CART_KEY = "fd_cart";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCart());

  // Đồng bộ khi giỏ hàng thay đổi ở tab khác.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CART_KEY) setItems(readCart());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (next) => {
    writeCart(next);
    setItems(next);
  };

  const addItem = (productId, quantity = 1) => {
    const product = getProductById(productId);
    if (!product) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      let next;
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + quantity);
        next = prev.map((i) =>
          i.productId === productId ? { ...i, quantity: nextQty } : i
        );
      } else {
        next = [...prev, { productId, quantity: Math.min(product.stock, quantity) }];
      }
      writeCart(next);
      return next;
    });
  };

  const updateQuantity = (productId, quantity) => {
    const product = getProductById(productId);
    const clamped = Math.max(1, Math.min(product?.stock || 1, quantity));
    persist(items.map((i) => (i.productId === productId ? { ...i, quantity: clamped } : i)));
  };

  const removeItem = (productId) => {
    persist(items.filter((i) => i.productId !== productId));
  };

  const clearCart = () => persist([]);

  // Ghép dữ liệu giỏ hàng với thông tin sản phẩm đầy đủ (ảnh, giá, tồn kho...).
  // Sản phẩm không còn tồn tại (bị gỡ khỏi catalog) sẽ tự động bị loại khỏi danh sách hiển thị.
  const cartItems = useMemo(
    () =>
      items
        .map((i) => {
          const product = getProductById(i.productId);
          return product ? { ...i, product } : null;
        })
        .filter(Boolean),
    [items]
  );

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cartItems.reduce((sum, i) => sum + i.quantity * i.product.price, 0);

  const value = useMemo(
    () => ({
      cartItems,
      totalItems,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartItems, totalItems, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải được dùng bên trong <CartProvider>.");
  return ctx;
}

export default CartContext;

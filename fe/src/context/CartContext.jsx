import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getProductById } from "../data/products";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

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

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function hasToken() {
  return !!localStorage.getItem("accessToken");
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCart());
  const [apiCart, setApiCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setApiCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "GET",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setApiCart(data.data);
      } else {
        setApiCart(null);
      }
    } catch (err) {
      console.error("Lỗi khi tải giỏ hàng:", err);
      setApiCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CART_KEY) setItems(readCart());
      if (e.key === "accessToken") fetchCart();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (next) => {
    writeCart(next);
    setItems(next);
  };

  const addItem = async (productId, quantity = 1) => {
    if (hasToken()) {
      const res = await fetch(`${API_BASE_URL}/api/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Thêm sản phẩm vào giỏ hàng thất bại");
      }
      setApiCart(data.data);
      return;
    }
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

  const updateQuantity = async (cartItemIdOrProductId, quantity) => {
    if (hasToken()) {
      const item = apiCart?.items?.find(
        (i) => i.id === cartItemIdOrProductId || i.productId === cartItemIdOrProductId
      );
      const itemId = item ? item.id : cartItemIdOrProductId;
      const res = await fetch(`${API_BASE_URL}/api/cart/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Cập nhật số lượng thất bại");
      }
      setApiCart(data.data);
      return;
    }
    const product = getProductById(cartItemIdOrProductId);
    const clamped = Math.max(1, Math.min(product?.stock || 1, quantity));
    persist(items.map((i) => (i.productId === cartItemIdOrProductId ? { ...i, quantity: clamped } : i)));
  };

  const removeItem = async (cartItemIdOrProductId) => {
    if (hasToken()) {
      const item = apiCart?.items?.find(
        (i) => i.id === cartItemIdOrProductId || i.productId === cartItemIdOrProductId
      );
      const itemId = item ? item.id : cartItemIdOrProductId;
      const res = await fetch(`${API_BASE_URL}/api/cart/items/${itemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Xóa sản phẩm khỏi giỏ hàng thất bại");
      }
      setApiCart(data.data);
      return;
    }
    persist(items.filter((i) => i.productId !== cartItemIdOrProductId));
  };

  const clearCart = async () => {
    if (hasToken()) {
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Xóa giỏ hàng thất bại");
      }
      setApiCart(data.data);
      clearSelection();
      return;
    }
    setApiCart(null);
    clearSelection();
    persist([]);
  };

  const cartItems = useMemo(() => {
    if (apiCart && apiCart.items) {
      return apiCart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImageUrl: item.productImageUrl,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
        product: {
          id: item.productId,
          name: item.productName,
          price: item.price,
          images: [item.productImageUrl],
        },
      }));
    }
    return items
      .map((i) => {
        const product = getProductById(i.productId);
        return product ? { ...i, product } : null;
      })
      .filter(Boolean);
  }, [apiCart, items]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = useMemo(() => {
    if (apiCart && apiCart.totalAmount != null) {
      return apiCart.totalAmount;
    }
    return cartItems.reduce((sum, i) => sum + i.quantity * (i.price || i.product?.price || 0), 0);
  }, [apiCart, cartItems]);

  const [selectedItemIds, setSelectedItemIds] = useState([]);

  const toggleSelectItem = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllItems = (ids) => {
    setSelectedItemIds(ids);
  };

  const clearSelection = () => {
    setSelectedItemIds([]);
  };

  const validateCartApi = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Vui lòng đăng nhập để thực hiện đặt hàng");
    const res = await fetch(`${API_BASE_URL}/api/cart/validate`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok || (data.status && data.status >= 400)) {
      throw new Error(data.message || "Giỏ hàng không hợp lệ");
    }
    return data;
  };

  const checkoutOrderApi = async (orderPayload) => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Vui lòng đăng nhập để thực hiện đặt hàng");
    const res = await fetch(`${API_BASE_URL}/api/orders/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(orderPayload),
    });
    const data = await res.json();
    if (!res.ok || (data.status && data.status >= 400)) {
      throw new Error(data.message || "Đặt hàng không thành công");
    }
    await fetchCart();
    return data.data;
  };

  const buyNowApi = async (buyNowPayload) => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Vui lòng đăng nhập để thực hiện mua ngay");
    const res = await fetch(`${API_BASE_URL}/api/orders/buy-now`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(buyNowPayload),
    });
    const data = await res.json();
    if (!res.ok || (data.status && data.status >= 400)) {
      throw new Error(data.message || "Đặt mua ngay không thành công");
    }
    return data.data;
  };

  const value = useMemo(
    () => ({
      cartItems,
      totalItems,
      subtotal,
      loading,
      selectedItemIds,
      toggleSelectItem,
      selectAllItems,
      clearSelection,
      fetchCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      validateCartApi,
      checkoutOrderApi,
      buyNowApi,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartItems, totalItems, subtotal, loading, selectedItemIds]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart phải được dùng bên trong <CartProvider>.");
  return ctx;
}

export default CartContext;

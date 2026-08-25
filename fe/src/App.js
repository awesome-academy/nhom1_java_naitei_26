import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { initializeProducts } from "./data/products";

// Context
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

// Trang chủ
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// ---- Auth (Đăng ký / Đăng nhập / Quên mật khẩu) ----
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import OAuth2RedirectHandler from "./pages/Auth/OAuth2RedirectHandler";

// ---- Sản phẩm (Thực phẩm & Đồ uống) ----
import ProductList from "./pages/Products/ProductList";
import ProductDetail from "./pages/Products/ProductDetail";

// ---- Giỏ hàng & Đặt hàng ----
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Cart/Checkout";

// ---- Tài khoản ----
import OrderHistory from "./pages/Account/OrderHistory";
import Profile from "./pages/Account/Profile";

// ---- Đề xuất sản phẩm ----
import SuggestionForm from "./pages/Suggestions/SuggestionForm";

// ---- Quản trị (admin site) ----
import Dashboard from "./pages/Admin/Dashboard";
import AdminUserList from "./pages/Admin/Users/UserList";
import AdminCategoryList from "./pages/Admin/Categories/CategoryList";
import AdminProductList from "./pages/Admin/Products/ProductList";
import AdminProductForm from "./pages/Admin/Products/ProductForm";
import AdminOrderList from "./pages/Admin/Orders/OrderList";
import AdminOrderDetail from "./pages/Admin/Orders/OrderDetail";
import AdminSuggestionList from "./pages/Admin/Suggestions/SuggestionList";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeProducts()
      .catch(err => console.error("Dynamic product loading failed", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải dữ liệu sản phẩm...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* ================= User site ================= */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />

              {/* ---- Auth ---- */}
              <Route path="/dang-nhap" element={<Login />} />
              <Route path="/dang-ky" element={<Register />} />
              <Route path="/quen-mat-khau" element={<ForgotPassword />} />
              <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

              {/* ---- Thực phẩm & Đồ uống ---- */}
              <Route path="/thuc-pham-do-uong" element={<ProductList />} />
              <Route path="/san-pham/:id" element={<ProductDetail />} />

              {/* ---- Giỏ hàng & Đặt hàng (yêu cầu đăng nhập) ---- */}
              <Route
                path="/gio-hang"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/thanh-toan"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />

              {/* ---- Tài khoản (yêu cầu đăng nhập) ---- */}
              <Route
                path="/don-hang"
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ho-so"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* ---- Đề xuất sản phẩm (yêu cầu đăng nhập) ---- */}
              <Route
                path="/de-xuat-san-pham"
                element={
                  <ProtectedRoute>
                    <SuggestionForm />
                  </ProtectedRoute>
                }
              />

              {/* ---- 404 ---- */}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* ================= Admin site (chỉ ADMIN) ================= */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="nguoi-dung" element={<AdminUserList />} />
              <Route path="danh-muc" element={<AdminCategoryList />} />
              <Route path="san-pham" element={<AdminProductList />} />
              <Route path="san-pham/them-moi" element={<AdminProductForm />} />
              <Route path="san-pham/:id/chinh-sua" element={<AdminProductForm />} />
              <Route path="don-hang" element={<AdminOrderList />} />
              <Route path="don-hang/:id" element={<AdminOrderDetail />} />
              <Route path="de-xuat" element={<AdminSuggestionList />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;

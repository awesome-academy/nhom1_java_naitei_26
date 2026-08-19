import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Context
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout
import Header from "./Component/Header";
import Footer from "./Component/Footer";

// Trang chủ
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// ---- Auth (Đăng ký / Đăng nhập / Quên mật khẩu) ----
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";

// ---- Sản phẩm (Thực phẩm & Đồ uống) ----
import ProductList from "./pages/Products/ProductList";
import ProductDetail from "./pages/Products/ProductDetail";

// ---- Giỏ hàng & Đặt hàng ----
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Cart/Checkout";

// ---- Tài khoản ----
import OrderHistory from "./pages/Account/OrderHistory";
import Profile from "./pages/Account/Profile";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />

          {/* ---- Auth ---- */}
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/quen-mat-khau" element={<ForgotPassword />} />

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

          {/* ---- 404 ---- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Chặn các route yêu cầu đăng nhập (giỏ hàng, đơn hàng, hồ sơ, trang admin...).
// Sau khi đăng nhập xong sẽ quay lại đúng trang người dùng đang muốn vào.
const ProtectedRoute = ({ children, requireRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

import React, { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { persistUserSession } = useAuth();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;

    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const id = searchParams.get("id");
    const role = searchParams.get("role");
    const error = searchParams.get("error");
    const provider = searchParams.get("provider");
    const providerLabel = provider ? (provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase()) : "OAuth2";

    if (error) {
      const decodedError = decodeURIComponent(error);
      Swal.fire({
        icon: "error",
        title: `Đăng nhập ${providerLabel} thất bại`,
        text: decodedError.includes("_") ? "Không thể xác thực qua tài khoản " + providerLabel : decodedError,
      }).then(() => {
        navigate("/dang-nhap", { replace: true });
      });
      return;
    }

    if (token) {
      const decodedName = name ? decodeURIComponent(name) : (email ? email.split("@")[0] : "Người dùng");
      const userObj = {
        id: id ? Number(id) : Date.now(),
        email: email || "",
        fullName: decodedName,
        role: role || "USER",
      };

      // 1. Lưu ngay thông tin phiên đăng nhập vào LocalStorage & Context
      persistUserSession(userObj, token, refreshToken);

      // 2. Hiển thị thông báo thành công và chuyển hướng về trang chủ
      Swal.fire({
        icon: "success",
        title: `Đăng nhập ${providerLabel} thành công!`,
        text: `Chào mừng ${decodedName} quay trở lại!`,
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.replace("/");
      });
    } else {
      navigate("/dang-nhap", { replace: true });
    }
  }, [searchParams, navigate, persistUserSession]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Đang xử lý...</span>
        </div>
        <h5>Đang xử lý đăng nhập...</h5>
        <p className="text-muted">Vui lòng chờ trong giây lát.</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;

import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { persistUserSession } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const id = searchParams.get("id");
    const role = searchParams.get("role");
    const error = searchParams.get("error");

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Đăng nhập Google thất bại",
        text: "Không thể xác thực qua tài khoản Google.",
      }).then(() => navigate("/dang-nhap"));
      return;
    }

    if (token) {
      const decodedName = name ? decodeURIComponent(name) : email?.split("@")[0] || "Người dùng";
      const userObj = {
        id: id ? Number(id) : Date.now(),
        email: email || "",
        fullName: decodedName,
        role: role || "USER",
      };

      persistUserSession(userObj, token, refreshToken);

      Swal.fire({
        icon: "success",
        title: "Đăng nhập Google thành công!",
        text: `Chào mừng ${decodedName} quay trở lại!`,
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate("/", { replace: true });
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
        <h5>Đang xử lý đăng nhập với Google...</h5>
        <p className="text-muted">Vui lòng chờ trong giây lát.</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;

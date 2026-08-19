import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { SOCIAL_PROVIDERS, useAuth } from "../context/AuthContext";

// Nhóm nút "Xác thực qua Facebook, Twitter, Google" dùng chung
// cho cả trang Đăng nhập và Đăng ký.
const SocialAuthButtons = ({ redirectTo = "/" }) => {
  const { loginWithProvider } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);

  const handleClick = async (providerId, label) => {
    setPending(providerId);
    try {
      await loginWithProvider(providerId);
      await Swal.fire({
        icon: "success",
        title: `Đã đăng nhập bằng ${label}`,
        timer: 1500,
        showConfirmButton: false,
      });
      navigate(redirectTo);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Đăng nhập thất bại", text: err.message });
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="col-12">
      <div className="d-flex align-items-center my-3">
        <hr className="flex-grow-1" />
        <span className="px-3 text-muted small">hoặc tiếp tục với</span>
        <hr className="flex-grow-1" />
      </div>
      <div className="d-grid gap-2">
        {SOCIAL_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2"
            onClick={() => handleClick(provider.id, provider.label)}
            disabled={pending !== null}
          >
            {pending === provider.id ? (
              <span className="spinner-border spinner-border-sm" role="status" />
            ) : (
              <i className={provider.icon} style={{ color: provider.color }} />
            )}
            <span>Tiếp tục với {provider.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialAuthButtons;

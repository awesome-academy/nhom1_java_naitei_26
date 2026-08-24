import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

// Menu điều hướng dùng chung cho các trang trong khu vực tài khoản
// (Hồ sơ cá nhân, Đơn hàng của tôi).
const AccountSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/ho-so", label: "Hồ sơ cá nhân", icon: "fas fa-id-card" },
    { to: "/don-hang", label: "Đơn hàng của tôi", icon: "fas fa-box" },
    { to: "/gio-hang", label: "Giỏ hàng", icon: "fas fa-shopping-basket" },
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: "Đăng xuất?",
      text: "Bạn có chắc muốn đăng xuất khỏi tài khoản?",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Huỷ",
    });
    if (result.isConfirmed) {
      logout();
      navigate("/");
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Avatar"
              className="rounded-circle object-fit-cover shadow-sm flex-shrink-0"
              style={{ width: 44, height: 44 }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <i className="fas fa-user-circle fs-2 text-muted flex-shrink-0" />
          )}
          <div className="text-truncate">
            <div className="fw-semibold text-truncate">{user?.fullName || user?.email}</div>
            <div className="small text-muted text-truncate">{user?.email}</div>
          </div>
        </div>
        <ul className="nav nav-pills flex-column gap-1">
          {links.map((link) => (
            <li className="nav-item" key={link.to}>
              <Link
                to={link.to}
                className={`nav-link d-flex align-items-center gap-2 ${
                  location.pathname === link.to ? "active" : "text-dark"
                }`}
              >
                <i className={link.icon} style={{ width: 18 }} />
                {link.label}
              </Link>
            </li>
          ))}
          <li className="nav-item mt-2 pt-2 border-top">
            <button
              type="button"
              className="nav-link d-flex align-items-center gap-2 text-danger bg-transparent border-0 w-100 text-start"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt" style={{ width: 18 }} />
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AccountSidebar;

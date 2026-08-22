import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

const AdminTopbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: "Đăng xuất?",
      text: "Bạn có chắc muốn đăng xuất khỏi trang quản trị?",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Huỷ",
    });
    if (result.isConfirmed) {
      await logout();
      navigate("/dang-nhap");
    }
  };

  const displayName = user?.fullName || user?.email || "Quản trị viên";

  return (
    <header className="admin-topbar">
      <div className="d-flex align-items-center justify-content-between gap-3">
        <button
          type="button"
          className="btn btn-light d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Mở menu quản trị"
        >
          <i className="fas fa-bars" />
        </button>

        <div className="d-none d-lg-block small text-muted">
          <i className="fas fa-calendar-day me-2" />
          {new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </div>

        <div className="dropdown ms-auto">
          <button
            type="button"
            className="btn btn-light d-flex align-items-center gap-2 dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span
              className="rounded-circle bg-primary text-white d-grid"
              style={{ width: 32, height: 32, placeItems: "center" }}
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
            <span className="d-none d-sm-inline small fw-semibold">{displayName}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <span className="dropdown-header">{user?.email}</span>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <Link className="dropdown-item" to="/ho-so">
                <i className="fas fa-user me-2 text-muted" />
                Hồ sơ cá nhân
              </Link>
            </li>
            <li>
              <Link className="dropdown-item" to="/">
                <i className="fas fa-store me-2 text-muted" />
                Về trang bán hàng
              </Link>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button type="button" className="dropdown-item text-danger" onClick={handleLogout}>
                <i className="fas fa-right-from-bracket me-2" />
                Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;

import React from "react";
import { NavLink, Link } from "react-router-dom";

// Menu điều hướng khu vực quản trị.
// `end` để mục Dashboard không sáng khi đang ở route con của /admin.
const NAV_SECTIONS = [
  {
    title: "Tổng quan",
    items: [{ to: "/admin", label: "Bảng điều khiển", icon: "fa-gauge-high", end: true }],
  },
  {
    title: "Bán hàng",
    items: [
      { to: "/admin/don-hang", label: "Đơn hàng", icon: "fa-receipt", badgeKey: "pendingOrders" },
      { to: "/admin/san-pham", label: "Sản phẩm", icon: "fa-box-open" },
      { to: "/admin/danh-muc", label: "Danh mục", icon: "fa-tags" },
    ],
  },
  {
    title: "Hệ thống",
    items: [{ to: "/admin/nguoi-dung", label: "Người dùng", icon: "fa-users" }],
  },
];

const AdminSidebar = ({ isOpen, onNavigate, badges = {} }) => {
  return (
    <aside className={`admin-sidebar ${isOpen ? "is-open" : ""}`}>
      <Link to="/admin" className="admin-sidebar-brand" onClick={onNavigate}>
        <span className="admin-sidebar-logo">
          <i className="fas fa-basket-shopping" />
        </span>
        <span>
          <span className="d-block fw-bold lh-1">Food &amp; Drink</span>
          <span className="d-block small text-secondary">Trang quản trị</span>
        </span>
      </Link>

      <nav className="py-2 flex-grow-1">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="admin-sidebar-section">{section.title}</div>
            {section.items.map((item) => {
              const badge = item.badgeKey ? badges[item.badgeKey] : 0;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className="admin-nav-link"
                  onClick={onNavigate}
                >
                  <i className={`fas ${item.icon}`} />
                  <span>{item.label}</span>
                  {badge > 0 && (
                    <span className="badge rounded-pill bg-danger admin-nav-badge">{badge}</span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-top border-secondary border-opacity-25">
        <Link to="/" className="btn btn-sm btn-outline-light w-100" onClick={onNavigate}>
          <i className="fas fa-arrow-left me-2" />
          Về trang bán hàng
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Grocerylogo from "../images/Grocerylogo.png";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { CATEGORIES } from "../data/products";
import "./Header.css";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [foodMenuOpen, setFoodMenuOpen] = useState(false);
  const [drinkMenuOpen, setDrinkMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const foodMenuRef = useRef(null);
  const drinkMenuRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (foodMenuRef.current && !foodMenuRef.current.contains(event.target)) {
        setFoodMenuOpen(false);
      }
      if (drinkMenuRef.current && !drinkMenuRef.current.contains(event.target)) {
        setDrinkMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đóng mọi dropdown khi chuyển route
  useEffect(() => {
    setUserMenuOpen(false);
    setFoodMenuOpen(false);
    setDrinkMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = keyword.trim();
    navigate(q ? `/thuc-pham-do-uong?q=${encodeURIComponent(q)}` : "/thuc-pham-do-uong");
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    const result = await Swal.fire({
      icon: "question",
      title: "Đăng xuất?",
      text: "Bạn có chắc muốn đăng xuất khỏi tài khoản?",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#ef4444",
    });
    if (result.isConfirmed) {
      logout();
      navigate("/");
    }
  };

  const foodCategories = CATEGORIES.filter((c) => c.type === "food" && c.active !== false);
  const drinkCategories = CATEGORIES.filter((c) => c.type === "drink" && c.active !== false);

  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";

  return (
    <header className="w-100">
      {/* 1. Thanh thông báo đỉnh (Top Announcement Bar) */}
      <div className="fresh-topbar py-1">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <span>
                <i className="fas fa-truck-fast text-success me-1" />
                Miễn phí giao hàng từ <strong>300.000 ₫</strong>
              </span>
              <span className="d-none d-md-inline text-muted">|</span>
              <span className="d-none d-md-inline text-secondary">
                <i className="fas fa-bolt text-warning me-1" />
                Giao siêu tốc trong 2 giờ
              </span>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="d-none d-lg-inline">
                <i className="fas fa-headset text-primary me-1" />
                Hotline: <strong>1900 1234</strong>
              </span>
              <Link to="/de-xuat-san-pham" className="text-secondary small">
                Đề xuất món mới
              </Link>
              {isAdmin && (
                <Link to="/admin" className="fresh-admin-badge-btn py-1 px-2">
                  <i className="fas fa-shield-halved" />
                  Quản trị Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Thanh chính: Logo + Tìm kiếm + Giỏ hàng & User */}
      <div className="fresh-main-header border-bottom">
        <div className="container">
          <div className="row g-3 align-items-center">
            {/* Logo */}
            <div className="col-lg-3 col-6">
              <Link className="fresh-brand-link" to="/" title="FreshCart - Siêu thị Thực phẩm & Đồ uống">
                <img src={Grocerylogo} alt="FreshCart - Thực phẩm & Đồ uống" className="fresh-brand-logo" />
              </Link>
            </div>

            {/* Khung tìm kiếm hiện đại */}
            <div className="col-lg-6 col-12 order-3 order-lg-2">
              <form onSubmit={handleSearch} className="fresh-search-form">
                <div className="fresh-search-wrapper">
                  <i className="fas fa-magnifying-glass fresh-search-icon" />
                  <input
                    type="search"
                    className="fresh-search-input"
                    placeholder="Tìm thực phẩm tươi, đồ uống, bánh kẹo, thương hiệu..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    aria-label="Tìm kiếm sản phẩm"
                  />
                  {keyword && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-muted p-0 me-2"
                      onClick={() => setKeyword("")}
                      title="Xoá tìm kiếm"
                    >
                      <i className="fas fa-times-circle" />
                    </button>
                  )}
                  <button className="fresh-search-btn" type="submit">
                    <span>Tìm</span>
                    <i className="fas fa-arrow-right small" />
                  </button>
                </div>
              </form>
            </div>

            {/* Giỏ hàng & Tài khoản */}
            <div className="col-lg-3 col-6 order-2 order-lg-3 text-end d-flex align-items-center justify-content-end gap-3">
              {/* Giỏ hàng đẹp mắt */}
              <Link to="/gio-hang" className="fresh-cart-btn" title="Xem giỏ hàng">
                <span className="cart-icon-wrapper">
                  <i className="fas fa-shopping-bag" />
                </span>
                <span className="d-none d-sm-inline">Giỏ hàng</span>
                <span className="cart-count-badge">{totalItems}</span>
              </Link>

              {/* Tài khoản Dropdown */}
              {isAuthenticated ? (
                <div className="position-relative" ref={userMenuRef}>
                  <button
                    className={`btn fresh-user-trigger ${userMenuOpen ? "active" : ""}`}
                    type="button"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    aria-expanded={userMenuOpen}
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="fresh-avatar-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="fresh-avatar-fallback">
                        {(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="fw-semibold text-truncate d-none d-md-inline" style={{ maxWidth: "120px", fontSize: "0.875rem" }}>
                      {user?.fullName || user?.email?.split("@")[0]}
                    </span>
                    <i className={`fas fa-chevron-down text-muted small ms-1 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="fresh-dropdown-card">
                      <div className="px-3 py-2 border-bottom mb-2 bg-light rounded-3">
                        <div className="fw-bold text-dark text-truncate">{user?.fullName || "Người dùng"}</div>
                        <div className="text-muted small text-truncate">{user?.email}</div>
                        {isAdmin && (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle mt-1" style={{ fontSize: "0.7rem" }}>
                            <i className="fas fa-shield-halved me-1" /> Quản trị viên
                          </span>
                        )}
                      </div>

                      <Link className="fresh-dropdown-item" to="/ho-so" onClick={() => setUserMenuOpen(false)}>
                        Hồ sơ cá nhân
                      </Link>
                      <Link className="fresh-dropdown-item" to="/don-hang" onClick={() => setUserMenuOpen(false)}>
                        Đơn hàng của tôi
                      </Link>
                      <Link className="fresh-dropdown-item" to="/gio-hang" onClick={() => setUserMenuOpen(false)}>
                        Giỏ hàng hiện tại
                      </Link>
                      <Link className="fresh-dropdown-item" to="/de-xuat-san-pham/cua-toi" onClick={() => setUserMenuOpen(false)}>
                        Đề xuất của tôi
                      </Link>

                      {isAdmin && (
                        <>
                          <hr className="my-1" />
                          <Link className="fresh-dropdown-item text-primary fw-semibold" to="/admin" onClick={() => setUserMenuOpen(false)}>
                            Trang quản trị (Admin)
                          </Link>
                        </>
                      )}

                      <hr className="my-1" />
                      <button type="button" className="fresh-dropdown-item text-danger" onClick={handleLogout}>
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex align-items-center gap-1">
                  <Link to="/dang-nhap" className="btn btn-sm btn-outline-success rounded-pill px-3 fw-medium">
                    Đăng nhập
                  </Link>
                  <Link to="/dang-ky" className="btn btn-sm btn-success rounded-pill px-3 fw-medium d-none d-sm-inline-block">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Thanh điều hướng danh mục (Sticky Navbar) */}
      <nav className="navbar navbar-expand-lg fresh-navbar sticky-top">
        <div className="container">
          <button
            className="navbar-toggler py-2 px-3 border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#freshMainNav"
            aria-controls="freshMainNav"
            aria-expanded="false"
            aria-label="Mở menu"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="freshMainNav">
            <ul className="navbar-nav me-auto align-items-lg-center">
              {/* Trang chủ - Giữ duy nhất icon này theo yêu cầu */}
              <li className="nav-item">
                <Link
                  className={`nav-link fresh-nav-link ${location.pathname === "/" ? "active" : ""}`}
                  to="/"
                >
                  <i className="fas fa-house" />
                  Trang chủ
                </Link>
              </li>

              {/* Thực phẩm Dropdown (Không icon) */}
              <li className="nav-item position-relative" ref={foodMenuRef}>
                <span
                  className={`nav-link fresh-nav-link ${location.search.includes("food") ? "active" : ""}`}
                  onClick={() => setFoodMenuOpen((prev) => !prev)}
                >
                  Thực phẩm
                  <i className="fas fa-chevron-down ms-1 text-muted" style={{ fontSize: "0.7rem" }} />
                </span>

                {foodMenuOpen && (
                  <div className="fresh-nav-dropdown-card">
                    <div className="px-3 py-1 text-uppercase text-muted small fw-bold border-bottom mb-1">
                      Danh mục thực phẩm
                    </div>
                    {foodCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        className="fresh-cat-menu-item"
                        to={`/thuc-pham-do-uong?category=${cat.slug}`}
                        onClick={() => setFoodMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <div className="border-top mt-1 pt-1">
                      <Link
                        className="fresh-cat-menu-item fw-semibold text-success"
                        to="/thuc-pham-do-uong?type=food"
                        onClick={() => setFoodMenuOpen(false)}
                      >
                        Xem tất cả thực phẩm →
                      </Link>
                    </div>
                  </div>
                )}
              </li>

              {/* Đồ uống Dropdown (Không icon) */}
              <li className="nav-item position-relative" ref={drinkMenuRef}>
                <span
                  className={`nav-link fresh-nav-link ${location.search.includes("drink") ? "active" : ""}`}
                  onClick={() => setDrinkMenuOpen((prev) => !prev)}
                >
                  Đồ uống
                  <i className="fas fa-chevron-down ms-1 text-muted" style={{ fontSize: "0.7rem" }} />
                </span>

                {drinkMenuOpen && (
                  <div className="fresh-nav-dropdown-card">
                    <div className="px-3 py-1 text-uppercase text-muted small fw-bold border-bottom mb-1">
                      Danh mục đồ uống
                    </div>
                    {drinkCategories.map((cat) => (
                      <Link
                        key={cat.slug}
                        className="fresh-cat-menu-item"
                        to={`/thuc-pham-do-uong?category=${cat.slug}`}
                        onClick={() => setDrinkMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <div className="border-top mt-1 pt-1">
                      <Link
                        className="fresh-cat-menu-item fw-semibold text-primary"
                        to="/thuc-pham-do-uong?type=drink"
                        onClick={() => setDrinkMenuOpen(false)}
                      >
                        Xem tất cả đồ uống →
                      </Link>
                    </div>
                  </div>
                )}
              </li>

              {/* Tất cả sản phẩm (Không icon) */}
              <li className="nav-item">
                <Link
                  className={`nav-link fresh-nav-link ${location.pathname === "/thuc-pham-do-uong" && !location.search ? "active" : ""}`}
                  to="/thuc-pham-do-uong"
                >
                  Tất cả sản phẩm
                </Link>
              </li>

              {/* Đề xuất món mới (Không icon, không badge HOT) */}
              <li className="nav-item">
                <Link
                  className={`nav-link fresh-nav-link ${location.pathname.startsWith("/de-xuat-san-pham") ? "active" : ""}`}
                  to="/de-xuat-san-pham"
                >
                  Đề xuất món mới
                </Link>
              </li>
            </ul>

            {/* Tra cứu đơn hàng bên phải (Nổi bật, rõ ràng) */}
            <div className="d-flex align-items-center py-2 py-lg-0">
              <Link to="/don-hang" className="fresh-order-track-btn" title="Kiểm tra tình trạng đơn hàng">
                <i className="fas fa-truck-fast track-icon" />
                <span>Tra cứu đơn hàng</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

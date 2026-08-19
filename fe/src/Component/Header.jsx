import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Grocerylogo from "../images/Grocerylogo.png";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../data/products";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = keyword.trim();
    navigate(q ? `/thuc-pham-do-uong?q=${encodeURIComponent(q)}` : "/thuc-pham-do-uong");
  };

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

  const foodCategories = CATEGORIES.filter((c) => c.type === "food");
  const drinkCategories = CATEGORIES.filter((c) => c.type === "drink");

  return (
    <div>
      {/* Thanh khuyến mãi trên cùng */}
      <div className="bg-light py-2 border-bottom">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span className="small">
              <i className="fas fa-truck me-2 text-primary" />
              Miễn phí giao hàng cho đơn từ 300.000 ₫
            </span>
            <span className="small text-muted d-none d-md-inline">
              Hỗ trợ: 1900 1234 · 8h00 - 22h00 hằng ngày
            </span>
          </div>
        </div>
      </div>

      {/* Logo + tìm kiếm + icon */}
      <div className="border-bottom py-3">
        <div className="container">
          <div className="row g-3 align-items-center">
            <div className="col-lg-3 col-md-4 col-6">
              <Link className="navbar-brand p-0 m-0" to="/">
                <img src={Grocerylogo} alt="Thực phẩm & Đồ uống" height={40} />
              </Link>
            </div>

            <div className="col-lg-6 col-md-8 col-12 order-3 order-md-2">
              <form onSubmit={handleSearch}>
                <div className="input-group">
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Tìm thực phẩm, đồ uống, thương hiệu..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    aria-label="Tìm kiếm sản phẩm"
                  />
                  <button className="btn btn-primary" type="submit">
                    <i className="fas fa-search" />
                  </button>
                </div>
              </form>
            </div>

            <div className="col-lg-3 col-6 order-2 order-md-3 text-end">
              <Link
                to="/gio-hang"
                className="text-muted position-relative d-inline-block me-3"
                title="Giỏ hàng"
              >
                <i className="fas fa-shopping-bag fs-5" />
              </Link>
              <Link
                to={isAuthenticated ? "/ho-so" : "/dang-nhap"}
                className="text-muted d-inline-block"
                title={isAuthenticated ? "Hồ sơ cá nhân" : "Đăng nhập"}
              >
                <i className="fas fa-user fs-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh điều hướng chính */}
      <nav className="navbar navbar-expand-lg navbar-light sticky-top bg-white border-bottom">
        <div className="container">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Mở menu"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Trang chủ
                </Link>
              </li>

              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to="/thuc-pham-do-uong"
                  id="navFood"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Thực phẩm
                </Link>
                <ul className="dropdown-menu" aria-labelledby="navFood">
                  {foodCategories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        className="dropdown-item"
                        to={`/thuc-pham-do-uong?category=${cat.slug}`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/thuc-pham-do-uong?type=food">
                      Xem tất cả thực phẩm
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to="/thuc-pham-do-uong"
                  id="navDrink"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Đồ uống
                </Link>
                <ul className="dropdown-menu" aria-labelledby="navDrink">
                  {drinkCategories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        className="dropdown-item"
                        to={`/thuc-pham-do-uong?category=${cat.slug}`}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/thuc-pham-do-uong?type=drink">
                      Xem tất cả đồ uống
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/thuc-pham-do-uong">
                  Tất cả sản phẩm
                </Link>
              </li>
            </ul>

            {/* Menu tài khoản */}
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle"
                  to="#"
                  id="navAccount"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="fas fa-user-circle me-1" />
                  {isAuthenticated ? user.fullName || user.email : "Tài khoản"}
                </Link>

                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navAccount">
                  {isAuthenticated ? (
                    <>
                      <li>
                        <h6 className="dropdown-header">
                          Xin chào, {user.fullName || user.email}
                        </h6>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/ho-so">
                          <i className="fas fa-id-card me-2 text-muted" />
                          Hồ sơ cá nhân
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/don-hang">
                          <i className="fas fa-box me-2 text-muted" />
                          Đơn hàng của tôi
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/gio-hang">
                          <i className="fas fa-shopping-basket me-2 text-muted" />
                          Giỏ hàng
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          type="button"
                          className="dropdown-item text-danger"
                          onClick={handleLogout}
                        >
                          <i className="fas fa-sign-out-alt me-2" />
                          Đăng xuất
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/dang-nhap">
                          Đăng nhập
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/dang-ky">
                          Đăng ký
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/quen-mat-khau">
                          Quên mật khẩu
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;

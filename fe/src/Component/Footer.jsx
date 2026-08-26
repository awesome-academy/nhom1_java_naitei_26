import React from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import groceryshop from "../images/Grocerylogo.png";
import amazonpay from "../images/amazonpay.svg";
import american from "../images/american-express.svg";
import mastercard from "../images/mastercard.svg";
import paypal from "../images/paypal.svg";
import visa from "../images/visa.svg";
import { CATEGORIES } from "../data/products";

const Footer = () => {
  const year = new Date().getFullYear();
  const foodCategories = CATEGORIES.filter((c) => c.type === "food" && c.active !== false).slice(0, 5);
  const drinkCategories = CATEGORIES.filter((c) => c.type === "drink" && c.active !== false);

  const paymentLogos = [
    { src: visa, alt: "Visa" },
    { src: mastercard, alt: "Mastercard" },
    { src: paypal, alt: "PayPal" },
    { src: amazonpay, alt: "Amazon Pay" },
    { src: american, alt: "American Express" },
  ];

  return (
    <footer className="footer mt-8">
      <div className="overlay" />
      <div className="container">
        <div className="row footer-row">
          {/* Giới thiệu */}
          <div className="col-sm-6 col-lg-3 mb-30">
            <div className="footer-widget">
              <div className="footer-logo">
                <Link to="/">
                  <img
                    src={groceryshop}
                    style={{ width: 260, padding: 16, marginLeft: "-20px" }}
                    alt="Thực phẩm & Đồ uống"
                  />
                </Link>
              </div>
              <p className="mb-30">
                Cửa hàng thực phẩm &amp; đồ uống trực tuyến — hàng tươi mỗi ngày,
                nguồn gốc rõ ràng, giao nhanh trong ngày tại nội thành.
              </p>
              <ul className="list-unstyled small">
                <li className="mb-2">
                  <i className="fas fa-map-marker-alt me-2" />
                  123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh
                </li>
                <li className="mb-2">
                  <i className="fas fa-phone me-2" />
                  1900 1234
                </li>
                <li>
                  <i className="fas fa-envelope me-2" />
                  hotro@freshfood.vn
                </li>
              </ul>
            </div>
          </div>

          {/* Thực phẩm */}
          <div className="col-sm-6 col-lg-3 mb-30">
            <div className="footer-widget">
              <h5 className="footer-title">Thực phẩm</h5>
              <ul className="footer-list list-unstyled">
                {foodCategories.map((cat) => (
                  <li key={cat.slug}>
                    <Link to={`/thuc-pham-do-uong?category=${cat.slug}`}>
                      <i className="fas fa-angle-right me-2" />
                      {cat.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/thuc-pham-do-uong?type=food">
                    <i className="fas fa-angle-right me-2" />
                    Xem tất cả thực phẩm
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Đồ uống */}
          <div className="col-sm-6 col-lg-3 mb-30">
            <div className="footer-widget">
              <h5 className="footer-title">Đồ uống</h5>
              <ul className="footer-list list-unstyled">
                {drinkCategories.map((cat) => (
                  <li key={cat.slug}>
                    <Link to={`/thuc-pham-do-uong?category=${cat.slug}`}>
                      <i className="fas fa-angle-right me-2" />
                      {cat.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/thuc-pham-do-uong?type=drink">
                    <i className="fas fa-angle-right me-2" />
                    Xem tất cả đồ uống
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Tài khoản */}
          <div className="col-sm-6 col-lg-3 mb-30">
            <div className="footer-widget">
              <h5 className="footer-title">Tài khoản của tôi</h5>
              <ul className="footer-list list-unstyled">
                <li>
                  <Link to="/dang-nhap">
                    <i className="fas fa-angle-right me-2" />
                    Đăng nhập
                  </Link>
                </li>
                <li>
                  <Link to="/dang-ky">
                    <i className="fas fa-angle-right me-2" />
                    Đăng ký
                  </Link>
                </li>
                <li>
                  <Link to="/gio-hang">
                    <i className="fas fa-angle-right me-2" />
                    Giỏ hàng
                  </Link>
                </li>
                <li>
                  <Link to="/don-hang">
                    <i className="fas fa-angle-right me-2" />
                    Đơn hàng của tôi
                  </Link>
                </li>
                <li>
                  <Link to="/ho-so">
                    <i className="fas fa-angle-right me-2" />
                    Hồ sơ cá nhân
                  </Link>
                </li>
              </ul>

              <h6 className="mt-4 mb-2">Phương thức thanh toán</h6>
              <ul className="list-inline mb-0">
                {paymentLogos.map((logo) => (
                  <li className="list-inline-item" key={logo.alt}>
                    <img src={logo.src} alt={logo.alt} height={24} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Dòng bản quyền */}
        <div className="row border-top py-4 mt-4">
          <div className="col-md-6 text-center text-md-start">
            <p className="mb-0 small">
              © {year} FreshFood — Thực phẩm &amp; Đồ uống. Đồ án môn học.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="#!" aria-label="Facebook">
                  <i className="fab fa-facebook-f" />
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#!" aria-label="Twitter">
                  <i className="fab fa-x-twitter" />
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#!" aria-label="Instagram">
                  <i className="fab fa-instagram" />
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#!" aria-label="YouTube">
                  <i className="fab fa-youtube" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from "react";
import { Link } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

const NotFound = () => {
  return (
    <div>
      <ScrollToTop />
      <section className="my-lg-14 my-8">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-6 col-md-8">
              <h1 className="display-1 fw-bold text-primary mb-0">404</h1>
              <h2 className="h3 mb-3">Không tìm thấy trang</h2>
              <p className="text-muted mb-6">
                Trang bạn truy cập không tồn tại hoặc đã được chuyển sang địa chỉ
                khác. Hãy thử quay lại trang chủ hoặc xem danh sách sản phẩm.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/" className="btn btn-primary">
                  Về trang chủ
                </Link>
                <Link to="/thuc-pham-do-uong" className="btn btn-outline-primary">
                  Xem sản phẩm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;

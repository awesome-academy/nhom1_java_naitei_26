import React, { useState } from "react";
import { Link } from "react-router-dom";
import forgetpassword from "../../images/fp-g.svg";
import ScrollToTop from "../ScrollToTop";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Email không hợp lệ.");
      return;
    }
    setError("");
    // Khi có BE: gọi API gửi email đặt lại mật khẩu tại đây.
    setSent(true);
  };

  return (
    <div>
      <ScrollToTop />
      <section className="my-lg-14 my-8">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-12 col-md-6 col-lg-4 order-lg-1 order-2">
              <img src={forgetpassword} alt="Quên mật khẩu" className="img-fluid" />
            </div>

            <div className="col-12 col-md-6 offset-lg-1 col-lg-4 order-lg-2 order-1 d-flex align-items-center">
              <div className="w-100">
                <div className="mb-lg-9 mb-5">
                  <h1 className="mb-2 h2 fw-bold">Quên mật khẩu?</h1>
                  <p>
                    Nhập email đã đăng ký, chúng tôi sẽ gửi cho bạn liên kết đặt lại
                    mật khẩu.
                  </p>
                </div>

                {sent ? (
                  <div className="alert alert-success" role="alert">
                    Đã gửi liên kết đặt lại mật khẩu tới <strong>{email}</strong>. Vui
                    lòng kiểm tra hộp thư của bạn.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-3">
                      <div className="col-12">
                        <input
                          type="email"
                          className={`form-control ${error ? "is-invalid" : ""}`}
                          placeholder="Email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                          }}
                        />
                        {error && <div className="invalid-feedback">{error}</div>}
                        <span className="navbar-text">
                          Đã nhớ mật khẩu? <Link to="/dang-nhap">Đăng nhập</Link>
                        </span>
                      </div>

                      <div className="col-12 d-grid gap-2">
                        <button type="submit" className="btn btn-primary">
                          Gửi liên kết đặt lại
                        </button>
                        <Link to="/dang-ky" className="btn btn-light">
                          Quay lại
                        </Link>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;

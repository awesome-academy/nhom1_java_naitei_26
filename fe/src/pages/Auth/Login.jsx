import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import signinimage from "../../images/signin-g.svg";
import ScrollToTop from "../ScrollToTop";
import SocialAuthButtons from "../../components/SocialAuthButtons";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Vui lòng nhập email.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Email không hợp lệ.";
    if (!form.password) next.password = "Vui lòng nhập mật khẩu.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(form);
      await Swal.fire({
        icon: "success",
        title: "Đăng nhập thành công",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    }
  };

  return (
    <div>
      <ScrollToTop />
      <section className="my-lg-14 my-8">
        <div className="container">
          <div className="row justify-content-center align-items-center">
            <div className="col-12 col-md-6 col-lg-4 order-lg-1 order-2">
              <img src={signinimage} alt="Đăng nhập" className="img-fluid" />
            </div>

            <div className="col-12 col-md-6 offset-lg-1 col-lg-4 order-lg-2 order-1">
              <div className="mb-lg-9 mb-5">
                <h1 className="mb-1 h2 fw-bold">Đăng nhập FreshFood</h1>
                <p>Chào mừng bạn quay lại! Đăng nhập để tiếp tục mua sắm.</p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  {errors.form && (
                    <div className="col-12">
                      <div className="alert alert-danger py-2 mb-0" role="alert">
                        {errors.form}
                      </div>
                    </div>
                  )}

                  <div className="col-12">
                    <label htmlFor="login-email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="login-email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      placeholder="nhapemail@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label htmlFor="login-password" className="form-label">
                      Mật khẩu
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="login-password"
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        placeholder="Nhập mật khẩu"
                        value={form.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label="Hiện/ẩn mật khẩu"
                      >
                        <i className={showPassword ? "far fa-eye-slash" : "far fa-eye"} />
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="remember"
                        id="remember"
                        checked={form.remember}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="remember">
                        Ghi nhớ đăng nhập
                      </label>
                    </div>
                    <div>
                      Quên mật khẩu? <Link to="/quen-mat-khau">Đặt lại</Link>
                    </div>
                  </div>

                  <div className="col-12 d-grid">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                  </div>

                  {/* Xác thực qua Facebook, Twitter, Google */}
                  <SocialAuthButtons redirectTo={redirectTo} />

                  <div className="col-12 text-center">
                    Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;

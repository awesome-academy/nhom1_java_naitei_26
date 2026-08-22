import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import signupimage from "../../images/signup-g.svg";
import ScrollToTop from "../ScrollToTop";
import SocialAuthButtons from "../../components/SocialAuthButtons";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const { register, loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Nếu người dùng đã đăng nhập từ trước, tự động chuyển hướng theo Role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "Vui lòng nhập họ.";
    if (!form.lastName.trim()) next.lastName = "Vui lòng nhập tên.";
    if (!form.email.trim()) next.email = "Vui lòng nhập email.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Email không hợp lệ.";
    if (form.phone && !/^0\d{9}$/.test(form.phone))
      next.phone = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.";
    if (!form.password) next.password = "Vui lòng nhập mật khẩu.";
    else if (form.password.length < 6) next.password = "Mật khẩu tối thiểu 6 ký tự.";
    if (form.confirmPassword !== form.password)
      next.confirmPassword = "Mật khẩu nhập lại không khớp.";
    if (!form.agree) next.agree = "Bạn cần đồng ý với điều khoản dịch vụ.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await register({
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      await Swal.fire({
        icon: "success",
        title: "Đăng ký thành công",
        text: "Tài khoản của bạn đã được tạo thành công. Vui lòng đăng nhập!",
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/dang-nhap");
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
              <img src={signupimage} alt="Đăng ký" className="img-fluid" />
            </div>

            <div className="col-12 col-md-6 offset-lg-1 col-lg-4 order-lg-2 order-1">
              <div className="mb-lg-9 mb-5">
                <h1 className="mb-1 h2 fw-bold">Tạo tài khoản</h1>
                <p>Đăng ký để đặt món và theo dõi đơn hàng của bạn.</p>
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

                  <div className="col-6">
                    <label htmlFor="reg-firstName" className="form-label">
                      Họ
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      id="reg-firstName"
                      className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                      placeholder="Nguyễn"
                      value={form.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && (
                      <div className="invalid-feedback">{errors.firstName}</div>
                    )}
                  </div>

                  <div className="col-6">
                    <label htmlFor="reg-lastName" className="form-label">
                      Tên
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      id="reg-lastName"
                      className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                      placeholder="Văn A"
                      value={form.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && (
                      <div className="invalid-feedback">{errors.lastName}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label htmlFor="reg-email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="reg-email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      placeholder="nhapemail@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="reg-phone" className="form-label">
                      Số điện thoại <span className="text-muted small">(không bắt buộc)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="reg-phone"
                      className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                      placeholder="0912345678"
                      value={form.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="reg-password" className="form-label">
                      Mật khẩu
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="reg-password"
                        className={`form-control ${errors.password ? "is-invalid" : ""}`}
                        placeholder="Tối thiểu 6 ký tự"
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

                  <div className="col-12">
                    <label htmlFor="reg-confirmPassword" className="form-label">
                      Nhập lại mật khẩu
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      id="reg-confirmPassword"
                      className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                      placeholder="Nhập lại mật khẩu"
                      value={form.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">{errors.confirmPassword}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className={`form-check-input ${errors.agree ? "is-invalid" : ""}`}
                        type="checkbox"
                        name="agree"
                        id="reg-agree"
                        checked={form.agree}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="reg-agree">
                        Tôi đồng ý với <Link to="#!">Điều khoản dịch vụ</Link> và{" "}
                        <Link to="#!">Chính sách bảo mật</Link>
                      </label>
                      {errors.agree && (
                        <div className="invalid-feedback">{errors.agree}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-12 d-grid">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Đang xử lý..." : "Đăng ký"}
                    </button>
                  </div>

                  {/* Xác thực qua Facebook, Twitter, Google */}
                  <SocialAuthButtons redirectTo="/" />

                  <div className="col-12 text-center">
                    Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
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

export default Register;

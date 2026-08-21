import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import ScrollToTop from "../ScrollToTop";
import AccountSidebar from "../../components/AccountSidebar";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Vui lòng nhập họ tên.";
    if (form.phone && !/^0\d{9}$/.test(form.phone))
      next.phone = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    updateProfile({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    });

    Swal.fire({
      icon: "success",
      title: "Cập nhật hồ sơ thành công",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  return (
    <div>
      <ScrollToTop />

      <div className="container mt-6">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Trang chủ</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Hồ sơ cá nhân
            </li>
          </ol>
        </nav>
      </div>

      <section className="mt-4 mb-lg-14 mb-8">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 mb-6 mb-lg-0">
              <AccountSidebar />
            </div>

            <div className="col-lg-9">
              <h1 className="h2 fw-bold mb-6">Hồ sơ cá nhân</h1>

              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="form-control"
                          value={user?.email || ""}
                          disabled
                        />
                        <div className="form-text">Email dùng để đăng nhập, không thể đổi.</div>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="fullName" className="form-label">
                          Họ tên
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                          value={form.fullName}
                          onChange={handleChange}
                          placeholder="Nguyễn Văn A"
                        />
                        {errors.fullName && (
                          <div className="invalid-feedback">{errors.fullName}</div>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="phone" className="form-label">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="0912345678"
                        />
                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                      </div>

                      <div className="col-12">
                        <label htmlFor="address" className="form-label">
                          Địa chỉ mặc định
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          rows={2}
                          className="form-control"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        />
                        <div className="form-text">
                          Địa chỉ này sẽ được điền sẵn ở bước thanh toán.
                        </div>
                      </div>

                      <div className="col-12">
                        <button type="submit" className="btn btn-primary">
                          Cập nhật hồ sơ
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;

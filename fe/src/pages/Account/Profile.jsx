import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import ScrollToTop from "../ScrollToTop";
import AccountSidebar from "../../components/AccountSidebar";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user, getProfile, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    avatarUrl: "",
  });
  const [errors, setErrors] = useState({});

  // Gọi API lấy thông tin Profile chi tiết từ Backend
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      setFetching(true);
      setFetchError(null);
      try {
        const data = await getProfile();
        if (isMounted) {
          setProfileData(data);
          setForm({
            fullName: data.fullName || "",
            phone: data.phone || "",
            address: data.address || "",
            avatarUrl: data.avatarUrl || "",
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error("Lỗi khi tải thông tin profile:", err);
          setFetchError(err.message || "Không thể kết nối đến máy chủ.");
          if (user) {
            setForm({
              fullName: user.fullName || "",
              phone: user.phone || "",
              address: user.address || "",
              avatarUrl: user.avatarUrl || "",
            });
          }
        }
      } finally {
        if (isMounted) setFetching(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [getProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "Ảnh quá lớn",
          text: "Dung lượng ảnh tối đa là 1 MB. Vui lòng chọn ảnh khác!",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (dataUrl) {
          setForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
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
      avatarUrl: form.avatarUrl,
    });

    Swal.fire({
      icon: "success",
      title: "Cập nhật hồ sơ thành công",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const displayAvatar = form.avatarUrl || profileData?.avatarUrl;
  const initialLetter = (form.fullName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div>
      <ScrollToTop />

      <div className="container mt-4">
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

      <section className="mb-lg-14 mb-8">
        <div className="container">
          <div className="row g-4">
            {/* Sidebar điều hướng */}
            <div className="col-lg-3 mb-4 mb-lg-0">
              <AccountSidebar />
            </div>

            {/* Nội dung chính hồ sơ */}
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4 p-md-5">
                  {/* Tiêu đề trang hồ sơ */}
                  <div className="pb-3 mb-4 border-bottom">
                    <h1 className="h3 fw-bold text-dark mb-1" style={{ fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
                      Hồ sơ của tôi
                    </h1>
                    <p className="text-muted mb-0" style={{ fontSize: "0.875rem" }}>
                      Quản lý thông tin hồ sơ để bảo mật tài khoản
                    </p>
                  </div>

                  {fetchError && (
                    <div className="alert alert-warning py-2 mb-4 small" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {fetchError} (Đang hiển thị dữ liệu phiên hiện tại)
                    </div>
                  )}

                  {fetching ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                      <p className="text-muted small mb-0">Đang tải thông tin hồ sơ...</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate>
                      <div className="row g-4 flex-column-reverse flex-md-row">
                        {/* Cột trái: Form thông tin cá nhân */}
                        <div className="col-12 col-md-8 pe-md-4">
                          <div className="row g-3 align-items-center mb-3">
                            <label
                              htmlFor="email"
                              className="col-12 col-sm-3 col-form-label text-sm-end text-secondary fw-medium"
                              style={{ fontSize: "0.9rem" }}
                            >
                              Email
                            </label>
                            <div className="col-12 col-sm-9">
                              <span className="fw-semibold text-dark">
                                {profileData?.email || user?.email || "Chưa có email"}
                              </span>
                              <div className="text-muted small mt-1" style={{ fontSize: "0.8rem" }}>
                                Email tài khoản dùng để đăng nhập và bảo mật.
                              </div>
                            </div>
                          </div>

                          <div className="row g-3 align-items-center mb-3">
                            <label
                              htmlFor="fullName"
                              className="col-12 col-sm-3 col-form-label text-sm-end text-secondary fw-medium"
                              style={{ fontSize: "0.9rem" }}
                            >
                              Tên <span className="text-danger">*</span>
                            </label>
                            <div className="col-12 col-sm-9">
                              <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                                style={{ borderRadius: 6, padding: "0.55rem 0.85rem" }}
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên"
                              />
                              {errors.fullName && (
                                <div className="invalid-feedback">{errors.fullName}</div>
                              )}
                            </div>
                          </div>

                          <div className="row g-3 align-items-center mb-3">
                            <label
                              htmlFor="phone"
                              className="col-12 col-sm-3 col-form-label text-sm-end text-secondary fw-medium"
                              style={{ fontSize: "0.9rem" }}
                            >
                              Số điện thoại
                            </label>
                            <div className="col-12 col-sm-9">
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                                style={{ borderRadius: 6, padding: "0.55rem 0.85rem" }}
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                              />
                              {errors.phone && (
                                <div className="invalid-feedback">{errors.phone}</div>
                              )}
                            </div>
                          </div>

                          <div className="row g-3 align-items-start mb-4">
                            <label
                              htmlFor="address"
                              className="col-12 col-sm-3 col-form-label text-sm-end text-secondary fw-medium pt-2"
                              style={{ fontSize: "0.9rem" }}
                            >
                              Địa chỉ
                            </label>
                            <div className="col-12 col-sm-9">
                              <textarea
                                id="address"
                                name="address"
                                rows={3}
                                className="form-control"
                                style={{ borderRadius: 6, padding: "0.55rem 0.85rem" }}
                                value={form.address}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ nhận hàng mặc định"
                              />
                              <div className="text-muted small mt-1" style={{ fontSize: "0.8rem" }}>
                                Địa chỉ này sẽ được dùng mặc định khi thanh toán đơn hàng.
                              </div>
                            </div>
                          </div>

                          <div className="row g-3">
                            <div className="col-sm-9 offset-sm-3">
                              <button
                                type="submit"
                                className="btn btn-primary px-4 py-2 fw-semibold"
                                style={{ minWidth: 100, borderRadius: 6 }}
                              >
                                Lưu
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Cột phải: Khung ảnh đại diện + Nút chọn ảnh */}
                        <div className="col-12 col-md-4 ps-md-4 border-start d-flex flex-column align-items-center justify-content-center text-center pb-4 pb-md-0">
                          <div
                            className="rounded-circle bg-light border d-flex align-items-center justify-content-center shadow-sm overflow-hidden mb-3"
                            style={{
                              width: 120,
                              height: 120,
                              fontSize: "2.8rem",
                              color: "#6c757d",
                            }}
                          >
                            {displayAvatar ? (
                              <img
                                src={displayAvatar}
                                alt="Avatar"
                                className="w-100 h-100 object-fit-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <i className="fas fa-user text-secondary" style={{ opacity: 0.45 }}></i>
                            )}
                          </div>

                          <input
                            type="file"
                            ref={fileInputRef}
                            className="d-none"
                            accept=".jpg,.jpeg,.png"
                            onChange={handleAvatarChange}
                          />

                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm px-3 py-1 mb-3 bg-white"
                            style={{ borderRadius: 6 }}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Chọn Ảnh
                          </button>

                          <div className="text-muted" style={{ fontSize: "0.8rem", lineHeight: 1.6 }}>
                            <div>Dung lượng file tối đa 1 MB</div>
                            <div>Định dạng: .JPEG, .PNG</div>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
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

import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import ScrollToTop from "../ScrollToTop";
import AccountSidebar from "../../components/AccountSidebar";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user, getProfile, updateProfileApi } = useAuth();
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    avatarUrl: "",
  });
  const [errors, setErrors] = useState({});

  // Gọi API lấy thông tin Profile chi tiết từ Backend khi load trang
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProfile]);

  // Hàm validate từng trường đơn lẻ để bắt lỗi ngay khi người dùng gõ
  const validateField = (name, value) => {
    switch (name) {
      case "fullName":
        if (!value || !value.trim()) {
          return "Vui lòng nhập họ và tên.";
        }
        if (value.trim().length > 100) {
          return "Họ và tên không được vượt quá 100 ký tự.";
        }
        return undefined;

      case "phone":
        if (value && value.trim()) {
          const cleanPhone = value.trim();
          if (!/^0\d{9}$/.test(cleanPhone)) {
            return "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.";
          }
        }
        return undefined;

      case "address":
        if (value && value.trim().length > 255) {
          return "Địa chỉ không được vượt quá 255 ký tự.";
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Bắt validate tức thì ngay khi gõ
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra dung lượng file tối đa 1 MB
      if (file.size > 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "Ảnh quá lớn",
          text: "Dung lượng file tối đa là 1 MB. Vui lòng chọn ảnh khác!",
          confirmButtonColor: "#198754",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      // Kiểm tra định dạng file
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        Swal.fire({
          icon: "warning",
          title: "Định dạng không hợp lệ",
          text: "Chỉ chấp nhận định dạng ảnh .JPEG hoặc .PNG!",
          confirmButtonColor: "#198754",
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
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
    const next = {
      fullName: validateField("fullName", form.fullName),
      phone: validateField("phone", form.phone),
      address: validateField("address", form.address),
    };

    // Lọc bỏ các trường không có lỗi
    Object.keys(next).forEach((key) => {
      if (!next[key]) delete next[key];
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Kiểm tra validation ngay ở Frontend
    if (!validate()) {
      Swal.fire({
        icon: "warning",
        title: "Thông tin chưa hợp lệ",
        text: "Vui lòng kiểm tra và sửa lại các trường bị báo lỗi trước khi lưu!",
        confirmButtonColor: "#198754",
      });
      return;
    }

    setSaving(true);
    try {
      // 2. Gửi request cập nhật lên Backend API
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone && form.phone.trim() ? form.phone.trim() : null,
        address: form.address && form.address.trim() ? form.address.trim() : null,
        avatarUrl: form.avatarUrl || null,
      };

      const updated = await updateProfileApi(payload);

      // Cập nhật lại UI với dữ liệu mới nhận được từ BE
      if (updated) {
        setProfileData(updated);
        setForm((prev) => ({
          ...prev,
          fullName: updated.fullName || "",
          phone: updated.phone || "",
          address: updated.address || "",
          avatarUrl: updated.avatarUrl || "",
        }));
      }

      // Thông báo thành công
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật hồ sơ thành công.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật hồ sơ:", err);
      // 3. Hiển thị thông báo lỗi chi tiết khi Backend từ chối hoặc DB không lưu
      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
        text: err.message || "Đã xảy ra lỗi khi lưu thông tin. Vui lòng thử lại!",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = form.avatarUrl || profileData?.avatarUrl;

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
                                onBlur={handleBlur}
                                placeholder="Nhập họ và tên"
                                disabled={saving}
                              />
                              {errors.fullName && (
                                <div className="invalid-feedback d-block">{errors.fullName}</div>
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
                                onBlur={handleBlur}
                                placeholder="Nhập số điện thoại (10 chữ số)"
                                disabled={saving}
                              />
                              {errors.phone && (
                                <div className="invalid-feedback d-block">{errors.phone}</div>
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
                                className={`form-control ${errors.address ? "is-invalid" : ""}`}
                                style={{ borderRadius: 6, padding: "0.55rem 0.85rem" }}
                                value={form.address}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Nhập địa chỉ nhận hàng mặc định"
                                disabled={saving}
                              />
                              {errors.address && (
                                <div className="invalid-feedback d-block">{errors.address}</div>
                              )}
                              <div className="text-muted small mt-1" style={{ fontSize: "0.8rem" }}>
                                Địa chỉ này sẽ được dùng mặc định khi thanh toán đơn hàng.
                              </div>
                            </div>
                          </div>

                          <div className="row g-3">
                            <div className="col-sm-9 offset-sm-3">
                              <button
                                type="submit"
                                className="btn btn-primary px-4 py-2 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
                                style={{ minWidth: 110, borderRadius: 6 }}
                                disabled={saving}
                              >
                                {saving ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                    Đang lưu...
                                  </>
                                ) : (
                                  "Lưu"
                                )}
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
                            disabled={saving}
                          />

                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm px-3 py-1 mb-3 bg-white"
                            style={{ borderRadius: 6 }}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={saving}
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

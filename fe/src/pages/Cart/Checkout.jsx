import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import ScrollToTop from "../ScrollToTop";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { PAYMENT_METHODS } from "../../data/orders";
import { formatPrice } from "../../utils/format";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const Checkout = () => {
  const { user, getProfile, updateProfileApi } = useAuth();
  const { cartItems, selectedItemIds, checkoutOrderApi } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Nhận danh sách ID món ăn được chọn từ trang Cart hoặc CartContext
  const activeSelectedIds = location.state?.selectedCartItemIds || selectedItemIds || [];

  // Lọc danh sách món ăn cần thanh toán
  const itemsToCheckout = cartItems.filter((item) => {
    if (activeSelectedIds.length === 0) return true;
    return activeSelectedIds.includes(item.id || item.productId);
  });

  const subtotal = itemsToCheckout.reduce((sum, i) => {
    const price = i.price || i.product?.price || 0;
    const itemSubtotal = i.subtotal != null ? i.subtotal : price * i.quantity;
    return sum + itemSubtotal;
  }, 0);

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    note: "",
    paymentMethod: "cod",
  });
  const [saveDefaultAddress, setSaveDefaultAddress] = useState(true);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Điền sẵn thông tin hồ sơ từ API GET /api/users/profile khi load trang
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          setForm((prev) => ({
            ...prev,
            fullName: prev.fullName || profile.fullName || "",
            phone: prev.phone || profile.phone || "",
            address: prev.address || profile.address || "",
          }));
        }
      } catch (err) {
        console.warn("Không thể tải hồ sơ người dùng để nhập sẵn địa chỉ:", err);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/gio-hang", { replace: true });
    }
  }, [cartItems.length, navigate]);

  if (cartItems.length === 0) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Vui lòng nhập họ tên người nhận.";
    if (!/^0\d{9}$/.test(form.phone.trim()))
      next.phone = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.";
    if (!form.address.trim()) next.address = "Vui lòng nhập địa chỉ giao hàng.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    // 1. Tạo payload chuẩn cho API Backend /api/orders/checkout
    const payload = {
      recipientName: form.fullName.trim(),
      recipientPhone: form.phone.trim(),
      deliveryAddress: form.address.trim(),
      note: form.note.trim() || undefined,
      cartItemIds: itemsToCheckout.map((i) => i.id).filter(Boolean),
    };

    try {
      const createdOrder = await checkoutOrderApi(payload);

      // 2. Cập nhật lại địa chỉ mới vào Hồ sơ người dùng qua API PUT /api/users/profile (nếu chọn)
      if (saveDefaultAddress) {
        try {
          await updateProfileApi({
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
          });
        } catch (profileErr) {
          console.warn("Cập nhật địa chỉ vào profile người dùng thất bại:", profileErr);
        }
      }

      Swal.fire({
        icon: "success",
        title: "Đặt hàng thành công!",
        text: `Mã đơn hàng của bạn: #${createdOrder.id}`,
        confirmButtonText: "Xem lịch sử đơn hàng",
      }).then(() => navigate("/don-hang"));
    } catch (err) {
      console.error("Lỗi Đặt hàng:", err);
      Swal.fire({
        icon: "error",
        title: "Đặt hàng thất bại",
        text: err.message || "Đã xảy ra lỗi trong quá trình xử lý đơn hàng.",
      });
    } finally {
      setSubmitting(false);
    }
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
            <li className="breadcrumb-item">
              <Link to="/gio-hang">Giỏ hàng</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Thanh toán
            </li>
          </ol>
        </nav>
      </div>

      <section className="mt-4 mb-lg-14 mb-8">
        <div className="container">
          <h1 className="h2 fw-bold mb-6">Thanh toán đơn hàng</h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-lg-7">
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Thông tin người nhận hàng</h5>
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="fullName" className="form-label">
                          Họ tên người nhận <span className="text-danger">*</span>
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

                      <div className="col-12">
                        <label htmlFor="phone" className="form-label">
                          Số điện thoại <span className="text-danger">*</span>
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
                          Địa chỉ giao hàng <span className="text-danger">*</span>
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          rows={2}
                          className={`form-control ${errors.address ? "is-invalid" : ""}`}
                          value={form.address}
                          onChange={handleChange}
                          placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        />
                        {errors.address && (
                          <div className="invalid-feedback">{errors.address}</div>
                        )}
                        <div className="form-check mt-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="saveDefaultAddress"
                            checked={saveDefaultAddress}
                            onChange={(e) => setSaveDefaultAddress(e.target.checked)}
                          />
                          <label className="form-check-label small text-muted" htmlFor="saveDefaultAddress">
                            Lưu thông tin giao hàng này làm địa chỉ mặc định cho tài khoản của tôi
                          </label>
                        </div>
                      </div>

                      <div className="col-12">
                        <label htmlFor="note" className="form-label">
                          Ghi chú đơn hàng <span className="text-muted small">(không bắt buộc)</span>
                        </label>
                        <textarea
                          id="note"
                          name="note"
                          rows={2}
                          className="form-control"
                          value={form.note}
                          onChange={handleChange}
                          placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi tới..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Phương thức thanh toán</h5>
                    {PAYMENT_METHODS.map((method) => (
                      <div className="form-check mb-2" key={method.value}>
                        <input
                          className="form-check-input"
                          type="radio"
                          name="paymentMethod"
                          id={`pm-${method.value}`}
                          value={method.value}
                          checked={form.paymentMethod === method.value}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor={`pm-${method.value}`}>
                          {method.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-lg-5 mt-6 mt-lg-0">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title mb-4">
                      Sản phẩm thanh toán ({itemsToCheckout.length})
                    </h5>
                    <ul className="list-unstyled mb-4" style={{ maxHeight: 300, overflowY: "auto" }}>
                      {itemsToCheckout.map((item) => {
                        const productName = item.productName || item.product?.name || "Sản phẩm";
                        const imageUrl = item.productImageUrl || item.product?.images?.[0] || "https://via.placeholder.com/40";
                        const price = item.price || item.product?.price || 0;
                        const itemSubtotal = item.subtotal != null ? item.subtotal : price * item.quantity;

                        return (
                          <li
                            key={item.id || item.productId}
                            className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <img
                                src={imageUrl}
                                alt={productName}
                                style={{ width: 44, height: 44, objectFit: "cover" }}
                                className="rounded-2"
                              />
                              <div className="small">
                                <div className="fw-semibold text-truncate" style={{ maxWidth: 180 }}>
                                  {productName}
                                </div>
                                <div className="text-muted">
                                  {formatPrice(price)} × {item.quantity}
                                </div>
                              </div>
                            </div>
                            <span className="small fw-bold text-primary">
                              {formatPrice(itemSubtotal)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Tạm tính</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-muted">Phí vận chuyển</span>
                      <span className="text-success fw-semibold">Miễn phí</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                      <span>Tổng tiền thanh toán</span>
                      <span className="text-primary">{formatPrice(subtotal)}</span>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-2"
                      disabled={submitting}
                    >
                      {submitting ? "Đang xử lý đơn hàng..." : "Xác nhận Đặt hàng"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Checkout;

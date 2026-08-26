import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";

const QuickBuyModal = ({ product, isOpen, onClose, initialQuantity = 1 }) => {
  const { user, isAuthenticated } = useAuth();
  const { buyNowApi } = useCart();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(initialQuantity);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity);
      setForm({
        fullName: user?.fullName || "",
        phone: user?.phone || "",
        address: user?.address || "",
        note: "",
      });
      setErrors({});
    }
  }, [isOpen, initialQuantity, user]);

  if (!isOpen || !product) return null;

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
    if (!isAuthenticated) {
      onClose();
      navigate("/dang-nhap", { state: { from: { pathname: "/thuc-pham-do-uong" } } });
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    const payload = {
      productId: product.id,
      quantity,
      recipientName: form.fullName.trim(),
      recipientPhone: form.phone.trim(),
      deliveryAddress: form.address.trim(),
      note: form.note.trim() || undefined,
    };

    try {
      const order = await buyNowApi(payload);
      onClose();
      Swal.fire({
        icon: "success",
        title: "Đặt mua ngay thành công!",
        text: `Mã đơn hàng của bạn: #${order.id}`,
        confirmButtonText: "Xem đơn hàng",
      }).then(() => navigate("/don-hang"));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Đặt hàng thất bại",
        text: err.message || "Không thể xử lý đơn hàng mua ngay.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const price = product.price || 0;
  const totalAmount = price * quantity;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title fw-bold">
              <i className="fas fa-bolt text-warning me-2" />
              Đặt Mua Trực Tiếp (Buy Now)
            </h5>
            <button type="button" className="btn-close" onClick={onClose} disabled={submitting} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Product Quick Info */}
              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-4">
                <img
                  src={product.images?.[0] || product.productImageUrl || "https://via.placeholder.com/80"}
                  alt={product.name}
                  style={{ width: 70, height: 70, objectFit: "cover" }}
                  className="rounded-2"
                />
                <div className="flex-grow-1">
                  <h6 className="mb-1 fw-bold">{product.name}</h6>
                  <div className="text-primary fw-bold fs-5">
                    {formatPrice(price)}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted me-1">Số lượng:</span>
                  <div className="input-group input-group-sm" style={{ width: 110 }}>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1 || submitting}
                    >
                      <i className="fas fa-minus" />
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={quantity}
                      min={1}
                      max={product.stock || 99}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1) setQuantity(val);
                      }}
                      disabled={submitting}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      disabled={submitting}
                    >
                      <i className="fas fa-plus" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <h6 className="fw-bold mb-3">Thông tin nhận hàng</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Họ tên người nhận <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    disabled={submitting}
                  />
                  {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Số điện thoại <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0901234567"
                    disabled={submitting}
                  />
                  {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">
                    Địa chỉ giao hàng <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="address"
                    rows={2}
                    className={`form-control ${errors.address ? "is-invalid" : ""}`}
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    disabled={submitting}
                  />
                  {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Ghi chú (tùy chọn)</label>
                  <input
                    type="text"
                    name="note"
                    className="form-control"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Ví dụ: Giao giờ hành chính..."
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                <span className="text-muted">Tổng thanh toán:</span>
                <span className="h4 text-primary fw-bold mb-0">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Hủy
              </button>
              <button type="submit" className="btn btn-warning text-dark fw-bold" disabled={submitting}>
                {submitting ? (
                  <span>
                    <i className="fas fa-spinner fa-spin me-2" />
                    Đang xử lý...
                  </span>
                ) : (
                  <span>
                    <i className="fas fa-bolt me-2" />
                    Xác nhận Mua Ngay
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickBuyModal;

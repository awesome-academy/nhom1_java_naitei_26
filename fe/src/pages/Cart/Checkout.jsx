import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ScrollToTop from "../ScrollToTop";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { createOrder, calcShippingFee, PAYMENT_METHODS } from "../../data/orders";
import { formatPrice } from "../../utils/format";

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    note: "",
    paymentMethod: "cod",
  });
  const [errors, setErrors] = useState({});

  // Giỏ hàng trống thì không cho vào trang thanh toán.
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/gio-hang", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems.length]);

  if (cartItems.length === 0) return null;

  const shippingFee = calcShippingFee(subtotal);
  const total = subtotal + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Vui lòng nhập họ tên người nhận.";
    if (!/^0\d{9}$/.test(form.phone))
      next.phone = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.";
    if (!form.address.trim()) next.address = "Vui lòng nhập địa chỉ giao hàng.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const order = createOrder({
      userId: user.id,
      items: cartItems.map((i) => ({
        productId: i.productId,
        name: i.product.name,
        image: i.product.images[0],
        unit: i.product.unit,
        price: i.product.price,
        quantity: i.quantity,
      })),
      shippingInfo: {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note.trim(),
      },
      paymentMethod: form.paymentMethod,
      subtotal,
      shippingFee,
      total,
    });

    clearCart();
    Swal.fire({
      icon: "success",
      title: "Đặt hàng thành công!",
      text: `Mã đơn hàng: ${order.id}`,
      confirmButtonText: "Xem đơn hàng của tôi",
    }).then(() => navigate("/don-hang"));
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
          <h1 className="h2 fw-bold mb-6">Thanh toán</h1>

          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="col-lg-7">
                <div className="card mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Thông tin giao hàng</h5>
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="fullName" className="form-label">
                          Họ tên người nhận
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
                          Địa chỉ giao hàng
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          rows={2}
                          className={`form-control ${errors.address ? "is-invalid" : ""}`}
                          value={form.address}
                          onChange={handleChange}
                          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        />
                        {errors.address && (
                          <div className="invalid-feedback">{errors.address}</div>
                        )}
                      </div>

                      <div className="col-12">
                        <label htmlFor="note" className="form-label">
                          Ghi chú <span className="text-muted small">(không bắt buộc)</span>
                        </label>
                        <textarea
                          id="note"
                          name="note"
                          rows={2}
                          className="form-control"
                          value={form.note}
                          onChange={handleChange}
                          placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..."
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
                    <h5 className="card-title mb-4">Đơn hàng của bạn</h5>
                    <ul className="list-unstyled mb-4">
                      {cartItems.map((item) => (
                        <li
                          key={item.productId}
                          className="d-flex justify-content-between align-items-center mb-2"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              style={{ width: 40, height: 40, objectFit: "cover" }}
                              className="rounded-2"
                            />
                            <div className="small">
                              <div className="text-truncate" style={{ maxWidth: 180 }}>
                                {item.product.name}
                              </div>
                              <div className="text-muted">× {item.quantity}</div>
                            </div>
                          </div>
                          <span className="small fw-semibold">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <hr />
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Tạm tính</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <span className="text-muted">Phí vận chuyển</span>
                      <span>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      Đặt hàng
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

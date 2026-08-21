import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ScrollToTop from "../ScrollToTop";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/format";

const Cart = () => {
  const { cartItems, subtotal, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const handleRemove = async (item) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Xoá sản phẩm?",
      text: `Xoá "${item.product.name}" khỏi giỏ hàng?`,
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc3545",
    });
    if (result.isConfirmed) removeItem(item.productId);
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
              Giỏ hàng
            </li>
          </ol>
        </nav>
      </div>

      <section className="mt-4 mb-lg-14 mb-8">
        <div className="container">
          <h1 className="h2 fw-bold mb-6">Giỏ hàng của bạn</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <i className="fas fa-shopping-basket fa-3x text-muted mb-3" />
              <h5>Giỏ hàng đang trống</h5>
              <p className="text-muted">Hãy chọn thêm vài món ngon vào giỏ nhé.</p>
              <Link to="/thuc-pham-do-uong" className="btn btn-primary">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-8">
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr className="text-muted small text-uppercase">
                        <th style={{ width: "45%" }}>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th style={{ width: 150 }}>Số lượng</th>
                        <th>Thành tiền</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.productId}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                style={{ width: 64, height: 64, objectFit: "cover" }}
                                className="rounded-2"
                              />
                              <div>
                                <Link
                                  to={`/san-pham/${item.productId}`}
                                  className="text-decoration-none text-dark fw-semibold"
                                >
                                  {item.product.name}
                                </Link>
                                <div className="small text-muted">{item.product.unit}</div>
                              </div>
                            </div>
                          </td>
                          <td>{formatPrice(item.product.price)}</td>
                          <td>
                            <div className="input-group input-group-sm" style={{ width: 120 }}>
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <i className="fas fa-minus" />
                              </button>
                              <input
                                type="text"
                                className="form-control text-center"
                                value={item.quantity}
                                readOnly
                              />
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                              >
                                <i className="fas fa-plus" />
                              </button>
                            </div>
                          </td>
                          <td className="fw-semibold text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger"
                              onClick={() => handleRemove(item)}
                              title="Xoá sản phẩm"
                            >
                              <i className="fas fa-trash-alt" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Link to="/thuc-pham-do-uong" className="btn btn-outline-secondary">
                  <i className="fas fa-arrow-left me-2" />
                  Tiếp tục mua sắm
                </Link>
              </div>

              <div className="col-lg-4 mt-6 mt-lg-0">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Tóm tắt đơn hàng</h5>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Tạm tính</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 small text-muted">
                      <span>Phí vận chuyển</span>
                      <span>Tính ở bước thanh toán</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatPrice(subtotal)}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={() => navigate("/thanh-toan")}
                    >
                      Tiến hành thanh toán
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Cart;

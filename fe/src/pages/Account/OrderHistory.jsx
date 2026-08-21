import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import AccountSidebar from "../../components/AccountSidebar";
import { useAuth } from "../../context/AuthContext";
import { getOrdersByUser, ORDER_STATUS } from "../../data/orders";
import { formatPrice } from "../../utils/format";

const STATUS_BADGE = {
  [ORDER_STATUS.PENDING]: "bg-warning-subtle text-warning",
  [ORDER_STATUS.CONFIRMED]: "bg-info-subtle text-info",
  [ORDER_STATUS.SHIPPING]: "bg-primary-subtle text-primary",
  [ORDER_STATUS.COMPLETED]: "bg-success-subtle text-success",
};

const OrderHistory = () => {
  const { user } = useAuth();
  const orders = useMemo(() => getOrdersByUser(user.id), [user.id]);
  const [expandedId, setExpandedId] = useState(null);

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
              Đơn hàng của tôi
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
              <h1 className="h2 fw-bold mb-6">Đơn hàng của tôi</h1>

              {orders.length === 0 ? (
                <div className="text-center py-10">
                  <i className="fas fa-box-open fa-3x text-muted mb-3" />
                  <h5>Bạn chưa có đơn hàng nào</h5>
                  <p className="text-muted">Đơn hàng của bạn sẽ hiển thị tại đây.</p>
                  <Link to="/thuc-pham-do-uong" className="btn btn-primary">
                    Bắt đầu mua sắm
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {orders.map((order) => {
                    const isExpanded = expandedId === order.id;
                    const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
                    return (
                      <div className="card" key={order.id}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div>
                              <div className="fw-semibold">Mã đơn: {order.id}</div>
                              <div className="small text-muted">
                                Đặt lúc{" "}
                                {new Date(order.createdAt).toLocaleString("vi-VN")}
                              </div>
                            </div>
                            <span
                              className={`badge ${STATUS_BADGE[order.status]}`}
                              style={{ height: "fit-content" }}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="text-muted small">
                              {itemCount} sản phẩm
                            </span>
                            <span className="fw-bold text-primary fs-6">
                              {formatPrice(order.total)}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="btn btn-link btn-sm px-0 mt-2 text-decoration-none"
                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          >
                            {isExpanded ? "Thu gọn" : "Xem chi tiết"}{" "}
                            <i className={`fas fa-chevron-${isExpanded ? "up" : "down"} ms-1`} />
                          </button>

                          {isExpanded && (
                            <div className="mt-3 pt-3 border-top">
                              <ul className="list-unstyled mb-4">
                                {order.items.map((item) => (
                                  <li
                                    key={item.productId}
                                    className="d-flex justify-content-between align-items-center mb-2"
                                  >
                                    <div className="d-flex align-items-center gap-2">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        style={{ width: 44, height: 44, objectFit: "cover" }}
                                        className="rounded-2"
                                      />
                                      <div className="small">
                                        <div>{item.name}</div>
                                        <div className="text-muted">
                                          {formatPrice(item.price)} × {item.quantity}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="small fw-semibold">
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  </li>
                                ))}
                              </ul>

                              <div className="row small">
                                <div className="col-md-6 mb-2">
                                  <div className="text-muted mb-1">Giao đến</div>
                                  <div className="fw-semibold">
                                    {order.shippingInfo.fullName} ·{" "}
                                    {order.shippingInfo.phone}
                                  </div>
                                  <div>{order.shippingInfo.address}</div>
                                  {order.shippingInfo.note && (
                                    <div className="text-muted fst-italic">
                                      Ghi chú: {order.shippingInfo.note}
                                    </div>
                                  )}
                                </div>
                                <div className="col-md-6 mb-2">
                                  <div className="text-muted mb-1">Thanh toán</div>
                                  <div>
                                    {order.paymentMethod === "cod"
                                      ? "Thanh toán khi nhận hàng (COD)"
                                      : "Chuyển khoản ngân hàng"}
                                  </div>
                                  <div className="d-flex justify-content-between mt-2">
                                    <span className="text-muted">Tạm tính</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                  </div>
                                  <div className="d-flex justify-content-between">
                                    <span className="text-muted">Phí vận chuyển</span>
                                    <span>
                                      {order.shippingFee === 0
                                        ? "Miễn phí"
                                        : formatPrice(order.shippingFee)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderHistory;

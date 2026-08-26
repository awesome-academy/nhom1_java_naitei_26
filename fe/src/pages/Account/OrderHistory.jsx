import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import AccountSidebar from "../../components/AccountSidebar";
import { useAuth } from "../../context/AuthContext";
import { getOrdersByUser } from "../../data/orders";
import { formatPrice } from "../../utils/format";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const STATUS_BADGE = {
  PENDING: "bg-warning-subtle text-warning",
  CONFIRMED: "bg-info-subtle text-info",
  PROCESSING: "bg-primary-subtle text-primary",
  SHIPPING: "bg-primary-subtle text-primary",
  COMPLETED: "bg-success-subtle text-success",
  CANCELLED: "bg-danger-subtle text-danger",
};

const STATUS_LABEL = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PROCESSING: "Đang đóng gói",
  SHIPPING: "Đang giao hàng",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/orders`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          if (res.ok && data.data) {
            setOrders(data.data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Lỗi khi tải lịch sử đơn hàng từ API:", err);
        }
      }

      // Fallback local data nếu chưa đăng nhập hoặc API trống
      const localOrders = getOrdersByUser(user?.id);
      setOrders(localOrders);
      setLoading(false);
    };

    fetchOrders();
  }, [user?.id]);

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

              {loading ? (
                <div className="text-center py-10">
                  <i className="fas fa-spinner fa-spin fa-2x text-primary mb-3" />
                  <p className="text-muted">Đang tải danh sách đơn hàng...</p>
                </div>
              ) : orders.length === 0 ? (
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
                    const items = order.items || [];
                    const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);
                    const totalAmount = order.totalAmount != null ? order.totalAmount : order.total;
                    const statusStr = String(order.status || "PENDING").toUpperCase();
                    const statusBadgeClass = STATUS_BADGE[statusStr] || "bg-secondary-subtle text-secondary";
                    const statusText = STATUS_LABEL[statusStr] || statusStr;

                    return (
                      <div className="card" key={order.id}>
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            <div>
                              <div className="fw-semibold">Mã đơn: #{order.id}</div>
                              <div className="small text-muted">
                                Đặt lúc{" "}
                                {order.createdAt
                                  ? new Date(order.createdAt).toLocaleString("vi-VN")
                                  : "Mới đây"}
                              </div>
                            </div>
                            <span
                              className={`badge ${statusBadgeClass}`}
                              style={{ height: "fit-content" }}
                            >
                              {statusText}
                            </span>
                          </div>

                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="text-muted small">
                              {itemCount} sản phẩm
                            </span>
                            <span className="fw-bold text-primary fs-6">
                              {formatPrice(totalAmount)}
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
                                {items.map((item, idx) => {
                                  const pName = item.productName || item.name || "Sản phẩm";
                                  const pPrice = item.unitPrice || item.price || 0;
                                  const pQty = item.quantity || 1;
                                  const pSubtotal = item.subtotal || pPrice * pQty;
                                  const pImg = item.productImageUrl || item.image || "https://via.placeholder.com/44";

                                  return (
                                    <li
                                      key={item.id || item.productId || idx}
                                      className="d-flex justify-content-between align-items-center mb-2"
                                    >
                                      <div className="d-flex align-items-center gap-2">
                                        <img
                                          src={pImg}
                                          alt={pName}
                                          style={{ width: 44, height: 44, objectFit: "cover" }}
                                          className="rounded-2"
                                        />
                                        <div className="small">
                                          <div className="fw-semibold">{pName}</div>
                                          <div className="text-muted">
                                            {formatPrice(pPrice)} × {pQty}
                                          </div>
                                        </div>
                                      </div>
                                      <span className="small fw-semibold">
                                        {formatPrice(pSubtotal)}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>

                              <div className="row small">
                                <div className="col-md-6 mb-2">
                                  <div className="text-muted mb-1">Giao đến</div>
                                  <div className="fw-semibold">
                                    {order.recipientName || order.shippingInfo?.fullName} ·{" "}
                                    {order.recipientPhone || order.shippingInfo?.phone}
                                  </div>
                                  <div>{order.deliveryAddress || order.shippingInfo?.address}</div>
                                  {(order.note || order.shippingInfo?.note) && (
                                    <div className="text-muted fst-italic mt-1">
                                      Ghi chú: {order.note || order.shippingInfo?.note}
                                    </div>
                                  )}
                                </div>
                                <div className="col-md-6 mb-2">
                                  <div className="text-muted mb-1">Thanh toán</div>
                                  <div>Thanh toán khi nhận hàng (COD)</div>
                                  <div className="d-flex justify-content-between mt-2">
                                    <span className="text-muted">Tổng cộng</span>
                                    <span className="fw-bold text-primary">{formatPrice(totalAmount)}</span>
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

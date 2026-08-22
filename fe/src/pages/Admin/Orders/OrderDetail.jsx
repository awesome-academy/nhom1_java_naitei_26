import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../../components/admin/PageHeader";
import { formatPrice } from "../../../utils/format";
import {
  getOrderById,
  updateOrderStatus,
  getNextStatuses,
  getStatusBadge,
  getStatusIcon,
  getPaymentLabel,
} from "../../../data/adminOrders";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(() => getOrderById(id));

  // Chuyển sang đơn khác dùng lại cùng component nên phải nạp lại theo id.
  useEffect(() => {
    setOrder(getOrderById(id));
  }, [id]);

  if (!order) {
    return (
      <div>
        <PageHeader
          title="Không tìm thấy đơn hàng"
          breadcrumb={[{ label: "Đơn hàng", to: "/admin/don-hang" }, { label: id }]}
        />
        <div className="admin-card p-4 text-center">
          <i className="fas fa-receipt fa-2x text-secondary opacity-50 mb-3" />
          <p className="text-muted">Đơn hàng {id} không tồn tại hoặc đã bị xoá.</p>
          <Link to="/admin/don-hang" className="btn btn-primary">
            Về danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const nextStatuses = getNextStatuses(order.status);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleChangeStatus = async (nextStatus) => {
    const isCancel = nextStatus === "Đã huỷ";
    const result = await Swal.fire({
      icon: isCancel ? "warning" : "question",
      title: isCancel ? "Huỷ đơn hàng?" : `Chuyển sang "${nextStatus}"?`,
      html: `Đơn <b>${order.id}</b> của ${order.customer.fullName}.${
        isCancel ? "<br/>Đơn đã huỷ sẽ không tính vào doanh thu." : ""
      }`,
      showCancelButton: true,
      confirmButtonText: isCancel ? "Huỷ đơn" : "Xác nhận",
      cancelButtonText: "Quay lại",
      confirmButtonColor: isCancel ? "#dc3545" : "#0aad0a",
    });
    if (!result.isConfirmed) return;

    setOrder(updateOrderStatus(order.id, nextStatus));
    Swal.fire({
      icon: "success",
      title: "Đã cập nhật trạng thái",
      timer: 1600,
      showConfirmButton: false,
    });
  };

  return (
    <div>
      <PageHeader
        title={`Đơn hàng ${order.id}`}
        subtitle={`Đặt lúc ${new Date(order.createdAt).toLocaleString("vi-VN")}`}
        breadcrumb={[{ label: "Đơn hàng", to: "/admin/don-hang" }, { label: order.id }]}
      >
        <Link to="/admin/don-hang" className="btn btn-light">
          <i className="fas fa-arrow-left me-2" />
          Danh sách
        </Link>
        {nextStatuses.map((status) => (
          <button
            key={status}
            type="button"
            className={`btn ${status === "Đã huỷ" ? "btn-outline-danger" : "btn-primary"}`}
            onClick={() => handleChangeStatus(status)}
          >
            {status === "Đã huỷ" ? (
              <i className="fas fa-ban me-2" />
            ) : (
              <i className={`fas ${getStatusIcon(status)} me-2`} />
            )}
            {status}
          </button>
        ))}
      </PageHeader>

      <div className="row g-3">
        <div className="col-lg-8">
          {/* ---- Sản phẩm trong đơn ---- */}
          <div className="admin-card mb-3">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h2 className="h6 fw-bold mb-0">Sản phẩm ({itemCount})</h2>
              <span className={`badge ${getStatusBadge(order.status)}`}>
                <i className={`fas ${getStatusIcon(order.status)} me-1`} />
                {order.status}
              </span>
            </div>

            <div className="table-responsive">
              <table className="table admin-table align-middle">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-end">Đơn giá</th>
                    <th className="text-end">SL</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.productId}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img src={item.image} alt={item.name} className="admin-table-thumb" />
                          <div className="min-w-0">
                            <Link
                              to={`/admin/san-pham/${item.productId}/chinh-sua`}
                              className="fw-semibold text-decoration-none admin-truncate d-block"
                            >
                              {item.name}
                            </Link>
                            <div className="small text-muted">{item.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-end small">{formatPrice(item.price)}</td>
                      <td className="text-end small">×{item.quantity}</td>
                      <td className="text-end fw-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-top">
              <div className="ms-auto" style={{ maxWidth: 320 }}>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Tạm tính</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Phí vận chuyển</span>
                  <span>
                    {order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}
                  </span>
                </div>
                <div className="d-flex justify-content-between fw-bold pt-2 border-top">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Lịch sử trạng thái ---- */}
          <div className="admin-card p-3 p-md-4">
            <h2 className="h6 fw-bold mb-3">Lịch sử xử lý</h2>
            <ul className="list-unstyled mb-0">
              {(order.history || []).map((entry, index) => (
                // Một trạng thái có thể lặp lại nên ghép thêm mốc thời gian vào key.
                <li className="d-flex gap-3 pb-3" key={`${entry.status}-${entry.at}-${index}`}>
                  <span
                    className={`admin-stat-icon ${getStatusBadge(entry.status)}`}
                    style={{ width: 36, height: 36, fontSize: "0.85rem" }}
                  >
                    <i className={`fas ${getStatusIcon(entry.status)}`} />
                  </span>
                  <div>
                    <div className="fw-semibold small">{entry.status}</div>
                    <div className="small text-muted">
                      {new Date(entry.at).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {nextStatuses.length === 0 && (
              <p className="small text-muted mb-0">
                Đơn đã ở trạng thái cuối, không thể chuyển tiếp.
              </p>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          {/* ---- Khách hàng ---- */}
          <div className="admin-card p-3 p-md-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Khách hàng</h2>
            <div className="d-flex align-items-center gap-2 mb-3">
              <span
                className="rounded-circle bg-primary-subtle text-primary d-grid fw-semibold"
                style={{ width: 42, height: 42, placeItems: "center" }}
              >
                {order.customer.fullName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="fw-semibold">{order.customer.fullName}</div>
                <div className="small text-muted">Mã KH #{order.userId}</div>
              </div>
            </div>

            <div className="small mb-2">
              <i className="fas fa-envelope text-muted me-2" />
              {order.customer.email}
            </div>
            <div className="small">
              <i className="fas fa-phone text-muted me-2" />
              {order.customer.phone}
            </div>
          </div>

          {/* ---- Giao hàng ---- */}
          <div className="admin-card p-3 p-md-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Địa chỉ giao hàng</h2>
            <div className="small fw-semibold">{order.shippingInfo.fullName}</div>
            <div className="small text-muted mb-2">{order.shippingInfo.phone}</div>
            <div className="small">{order.shippingInfo.address}</div>
            {order.shippingInfo.note && (
              <div className="alert alert-light small mt-3 mb-0">
                <i className="fas fa-note-sticky text-muted me-2" />
                {order.shippingInfo.note}
              </div>
            )}
          </div>

          {/* ---- Thanh toán ---- */}
          <div className="admin-card p-3 p-md-4">
            <h2 className="h6 fw-bold mb-3">Thanh toán</h2>
            <div className="d-flex justify-content-between align-items-center small mb-2">
              <span className="text-muted">Phương thức</span>
              <span className="fw-semibold text-end">{getPaymentLabel(order.paymentMethod)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center small">
              <span className="text-muted">Trạng thái</span>
              <span
                className={`badge ${
                  order.status === "Hoàn thành"
                    ? "bg-success-subtle text-success"
                    : "bg-secondary-subtle text-secondary"
                }`}
              >
                {order.status === "Hoàn thành" ? "Đã thanh toán" : "Chưa thanh toán"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

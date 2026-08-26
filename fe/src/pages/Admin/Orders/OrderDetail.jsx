import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../../components/admin/PageHeader";
import { formatPrice } from "../../../utils/format";
import {
  fetchAdminOrderByIdApi,
  updateAdminOrderStatusApi,
  getOrderById,
  getNextStatuses,
  getStatusBadge,
  getStatusIcon,
  getStatusLabel,
  getPaymentLabel,
} from "../../../data/adminOrders";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      try {
        const data = await fetchAdminOrderByIdApi(id);
        setOrder(data);
      } catch (err) {
        console.warn(`Lỗi API chi tiết đơn hàng #${id}, dùng mock data fallback:`, err);
        setOrder(getOrderById(id));
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageHeader
          title={`Chi tiết đơn hàng #${id}`}
          breadcrumb={[{ label: "Đơn hàng", to: "/admin/don-hang" }, { label: `#${id}` }]}
        />
        <div className="admin-card p-5 text-center">
          <i className="fas fa-spinner fa-spin fa-2x text-primary mb-3" />
          <p className="text-muted">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div>
        <PageHeader
          title="Không tìm thấy đơn hàng"
          breadcrumb={[{ label: "Đơn hàng", to: "/admin/don-hang" }, { label: `#${id}` }]}
        />
        <div className="admin-card p-4 text-center">
          <i className="fas fa-receipt fa-2x text-secondary opacity-50 mb-3" />
          <p className="text-muted">Đơn hàng #{id} không tồn tại hoặc đã bị xoá.</p>
          <Link to="/admin/don-hang" className="btn btn-primary">
            Về danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const nextStatuses = getNextStatuses(order.status);
  const itemCount = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);

  const handleChangeStatus = async (nextStatus) => {
    const isCancel = nextStatus === "CANCELLED" || nextStatus === "Đã huỷ";
    const nextStatusLabel = getStatusLabel(nextStatus);
    const result = await Swal.fire({
      icon: isCancel ? "warning" : "question",
      title: isCancel ? "Huỷ đơn hàng?" : `Chuyển sang "${nextStatusLabel}"?`,
      html: `Đơn <b>#${order.id}</b> của ${order.customer?.fullName || "Khách hàng"}.${
        isCancel ? "<br/>Đơn đã huỷ sẽ không tính vào doanh thu." : ""
      }`,
      showCancelButton: true,
      confirmButtonText: isCancel ? "Huỷ đơn" : "Xác nhận",
      cancelButtonText: "Quay lại",
      confirmButtonColor: isCancel ? "#dc3545" : "#0aad0a",
    });
    if (!result.isConfirmed) return;

    try {
      const updated = await updateAdminOrderStatusApi(order.id, nextStatus);
      setOrder(updated);
      Swal.fire({
        icon: "success",
        title: "Đã cập nhật trạng thái",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: err.message || "Cập nhật trạng thái đơn hàng không thành công.",
      });
    }
  };

  const handlePickStatus = async () => {
    if (nextStatuses.length === 0) return;

    const inputOptions = {};
    nextStatuses.forEach((s) => {
      inputOptions[s] = getStatusLabel(s);
    });

    const { value: picked } = await Swal.fire({
      title: `Cập nhật đơn hàng #${order.id}`,
      text: `Trạng thái hiện tại: ${getStatusLabel(order.status)}`,
      input: "select",
      inputOptions,
      inputValue: nextStatuses[0],
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#0aad0a",
    });
    if (!picked) return;

    try {
      const updated = await updateAdminOrderStatusApi(order.id, picked);
      setOrder(updated);
      Swal.fire({
        icon: "success",
        title: "Đã cập nhật trạng thái",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: err.message || "Cập nhật trạng thái đơn hàng không thành công.",
      });
    }
  };

  return (
    <div>
      <PageHeader
        title={`Đơn hàng #${order.id}`}
        subtitle={`Đặt lúc ${new Date(order.createdAt).toLocaleString("vi-VN")}`}
        breadcrumb={[{ label: "Đơn hàng", to: "/admin/don-hang" }, { label: `#${order.id}` }]}
      >
        <Link to="/admin/don-hang" className="btn btn-light me-2">
          <i className="fas fa-arrow-left me-2" />
          Danh sách
        </Link>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handlePickStatus}
        >
          <i className="fas fa-arrow-right-arrow-left me-2" />
          Đổi trạng thái
        </button>
      </PageHeader>

      <div className="row g-3">
        <div className="col-lg-8">
          {/* ---- Sản phẩm trong đơn ---- */}
          <div className="admin-card mb-3">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h2 className="h6 fw-bold mb-0">Sản phẩm ({itemCount})</h2>
              <span className={`badge ${getStatusBadge(order.status)}`}>
                <i className={`fas ${getStatusIcon(order.status)} me-1`} />
                {getStatusLabel(order.status)}
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
                  {(order.items || []).map((item, idx) => {
                    const itemImg = item.image || item.productImageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150";
                    return (
                      <tr key={item.id || item.productId || idx}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {item.productId ? (
                              <Link to={`/san-pham/${item.productId}`}>
                                <img
                                  src={itemImg}
                                  alt={item.name}
                                  className="admin-table-thumb"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150";
                                  }}
                                />
                              </Link>
                            ) : (
                              <img
                                src={itemImg}
                                alt={item.name}
                                className="admin-table-thumb"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150";
                                }}
                              />
                            )}
                            <div className="min-w-0">
                              {item.productId ? (
                                <Link
                                  to={`/san-pham/${item.productId}`}
                                  className="fw-semibold text-decoration-none admin-truncate d-block"
                                >
                                  {item.name}
                                </Link>
                              ) : (
                                <span className="fw-semibold admin-truncate d-block">{item.name}</span>
                              )}
                              <div className="small text-muted">{item.unit}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-end small">{formatPrice(item.price)}</td>
                        <td className="text-end small">×{item.quantity}</td>
                        <td className="text-end fw-semibold">
                          {formatPrice(item.subtotal || item.price * item.quantity)}
                        </td>
                      </tr>
                    );
                  })}
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
                <li className="d-flex gap-3 pb-3" key={`${entry.status}-${entry.at}-${index}`}>
                  <span
                    className={`admin-stat-icon ${getStatusBadge(entry.status)}`}
                    style={{ width: 36, height: 36, fontSize: "0.85rem" }}
                  >
                    <i className={`fas ${getStatusIcon(entry.status)}`} />
                  </span>
                  <div>
                    <div className="fw-semibold small">{getStatusLabel(entry.status)}</div>
                    <div className="small text-muted">
                      {new Date(entry.at).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
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
                {(order.customer?.fullName || "K").charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="fw-semibold">{order.customer?.fullName || "N/A"}</div>
                <div className="small text-muted">Mã KH #{order.userId || "N/A"}</div>
              </div>
            </div>

            <div className="small mb-2">
              <i className="fas fa-envelope text-muted me-2" />
              {order.customer?.email || "N/A"}
            </div>
            <div className="small">
              <i className="fas fa-phone text-muted me-2" />
              {order.customer?.phone || "N/A"}
            </div>
          </div>

          {/* ---- Giao hàng ---- */}
          <div className="admin-card p-3 p-md-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Địa chỉ giao hàng</h2>
            <div className="small fw-semibold">{order.shippingInfo?.fullName || "N/A"}</div>
            <div className="small text-muted mb-2">{order.shippingInfo?.phone || "N/A"}</div>
            <div className="small">{order.shippingInfo?.address || "N/A"}</div>
            {order.shippingInfo?.note && (
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
                  order.status === "COMPLETED" || order.status === "Hoàn thành"
                    ? "bg-success-subtle text-success"
                    : "bg-secondary-subtle text-secondary"
                }`}
              >
                {order.status === "COMPLETED" || order.status === "Hoàn thành" ? "Đã thanh toán" : "Chưa thanh toán"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

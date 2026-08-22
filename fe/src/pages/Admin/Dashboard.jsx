import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/admin/PageHeader";
import StatCard from "../../components/admin/StatCard";
import { formatPrice } from "../../utils/format";
import {
  getOrderStats,
  getRevenueByMonth,
  getTopProducts,
  getOrders,
  getStatusBadge,
  ORDER_STATUSES,
} from "../../data/adminOrders";
import { getProductStats, getLowStockProducts } from "../../data/adminProducts";
import { getUserStats } from "../../data/adminUsers";

// Rút gọn số tiền cho nhãn biểu đồ: 12500000 -> "12,5 tr".
function formatCompact(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".", ",")} tr`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} k`;
  return String(value);
}

const Dashboard = () => {
  const orderStats = useMemo(() => getOrderStats(), []);
  const productStats = useMemo(() => getProductStats(), []);
  const userStats = useMemo(() => getUserStats(), []);
  const revenueByMonth = useMemo(() => getRevenueByMonth(6), []);
  const topProducts = useMemo(() => getTopProducts(5), []);
  const lowStock = useMemo(() => getLowStockProducts(5), []);
  const orders = useMemo(() => getOrders(), []);
  const recentOrders = orders.slice(0, 6);

  // Đếm số đơn theo từng trạng thái một lần thay vì quét lại danh sách trong lúc render.
  const statusCounts = useMemo(
    () =>
      ORDER_STATUSES.map((status) => ({
        ...status,
        count: orders.filter((o) => o.status === status.value).length,
      })),
    [orders]
  );

  const maxRevenue = Math.max(...revenueByMonth.map((m) => m.revenue), 1);

  return (
    <div>
      <PageHeader
        title="Bảng điều khiển"
        subtitle="Tổng quan tình hình kinh doanh của cửa hàng"
      />

      {/* ---- Số liệu tổng quan ---- */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Doanh thu tháng này"
            value={formatPrice(orderStats.revenueThisMonth)}
            icon="fa-sack-dollar"
            tone="success"
            hint={`Tổng doanh thu: ${formatPrice(orderStats.revenue)}`}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Đơn hàng"
            value={orderStats.total}
            icon="fa-receipt"
            tone="primary"
            hint={`${orderStats.pending} đơn chờ xác nhận · ${orderStats.shipping} đơn đang giao`}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Sản phẩm"
            value={productStats.total}
            icon="fa-box-open"
            tone="info"
            hint={`${productStats.lowStock} sắp hết · ${productStats.outOfStock} hết hàng`}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Người dùng"
            value={userStats.total}
            icon="fa-users"
            tone="warning"
            hint={`${userStats.newThisMonth} tài khoản mới trong 30 ngày`}
          />
        </div>
      </div>

      <div className="row g-3 mb-4">
        {/* ---- Biểu đồ doanh thu ---- */}
        <div className="col-xl-8">
          <div className="admin-card h-100 p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="h6 fw-bold mb-0">Doanh thu 6 tháng gần nhất</h2>
                <span className="small text-muted">Không tính các đơn đã huỷ</span>
              </div>
              <span className="badge bg-success-subtle text-success">
                Trung bình {formatPrice(orderStats.averageValue)}/đơn
              </span>
            </div>

            <div className="admin-chart">
              {revenueByMonth.map((month) => (
                <div className="admin-chart-col" key={month.key}>
                  <div className="small fw-semibold mb-1">{formatCompact(month.revenue)}</div>
                  <div
                    className="admin-chart-bar"
                    style={{ height: `${Math.max((month.revenue / maxRevenue) * 100, 2)}%` }}
                    title={`${month.label}/${month.year}: ${formatPrice(month.revenue)} · ${month.orderCount} đơn`}
                  />
                  <div className="small text-muted pt-2">{month.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ---- Phân bổ trạng thái đơn ---- */}
        <div className="col-xl-4">
          <div className="admin-card h-100 p-3 p-md-4">
            <h2 className="h6 fw-bold mb-4">Trạng thái đơn hàng</h2>

            {statusCounts.map((status) => {
              const { count } = status;
              const percent = orderStats.total ? (count / orderStats.total) * 100 : 0;
              return (
                <div className="mb-3" key={status.value}>
                  <div className="d-flex justify-content-between align-items-center small mb-1">
                    <span>
                      <i className={`fas ${status.icon} me-2 text-muted`} />
                      {status.value}
                    </span>
                    <span className="fw-semibold">{count}</span>
                  </div>
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className="progress-bar bg-primary"
                      style={{ width: `${percent}%` }}
                      role="progressbar"
                      aria-valuenow={count}
                      aria-valuemin="0"
                      aria-valuemax={orderStats.total}
                    />
                  </div>
                </div>
              );
            })}

            <Link to="/admin/don-hang" className="btn btn-sm btn-outline-primary w-100 mt-2">
              Xem tất cả đơn hàng
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* ---- Đơn hàng gần đây ---- */}
        <div className="col-xl-7">
          <div className="admin-card h-100">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h2 className="h6 fw-bold mb-0">Đơn hàng gần đây</h2>
              <Link to="/admin/don-hang" className="small text-decoration-none">
                Xem tất cả <i className="fas fa-arrow-right ms-1" />
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th className="text-end">Giá trị</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link
                          to={`/admin/don-hang/${order.id}`}
                          className="fw-semibold text-decoration-none"
                        >
                          {order.id}
                        </Link>
                        <div className="small text-muted">
                          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="small">{order.customer.fullName}</td>
                      <td className="text-end fw-semibold">{formatPrice(order.total)}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-xl-5">
          {/* ---- Bán chạy ---- */}
          <div className="admin-card mb-3">
            <div className="p-3 border-bottom">
              <h2 className="h6 fw-bold mb-0">Sản phẩm bán chạy</h2>
            </div>
            <ul className="list-unstyled mb-0 p-3 d-flex flex-column gap-3">
              {topProducts.map((product, index) => (
                <li className="d-flex align-items-center gap-3" key={product.productId}>
                  <span className="text-muted fw-bold small" style={{ width: 16 }}>
                    {index + 1}
                  </span>
                  <img src={product.image} alt={product.name} className="admin-table-thumb" />
                  <div className="flex-grow-1 min-w-0">
                    <div className="small fw-semibold admin-truncate">{product.name}</div>
                    <div className="small text-muted">Đã bán {product.quantity}</div>
                  </div>
                  <span className="small fw-semibold text-nowrap">
                    {formatPrice(product.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Cảnh báo tồn kho ---- */}
          <div className="admin-card">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h2 className="h6 fw-bold mb-0">
                <i className="fas fa-triangle-exclamation text-warning me-2" />
                Sắp hết hàng
              </h2>
              <Link to="/admin/san-pham" className="small text-decoration-none">
                Quản lý kho
              </Link>
            </div>

            {lowStock.length === 0 ? (
              <p className="text-muted small mb-0 p-3">Tất cả sản phẩm đều còn đủ hàng.</p>
            ) : (
              <ul className="list-unstyled mb-0 p-3 d-flex flex-column gap-3">
                {lowStock.map((product) => (
                  <li className="d-flex align-items-center gap-3" key={product.id}>
                    <img src={product.images[0]} alt={product.name} className="admin-table-thumb" />
                    <div className="flex-grow-1 min-w-0">
                      <div className="small fw-semibold admin-truncate">{product.name}</div>
                      <div className="small text-muted">{product.unit}</div>
                    </div>
                    <span
                      className={`badge ${
                        product.stock <= 0
                          ? "bg-danger-subtle text-danger"
                          : "bg-warning-subtle text-warning"
                      }`}
                    >
                      Còn {product.stock}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/admin/PageHeader";
import StatCard from "../../components/admin/StatCard";
import { formatPrice } from "../../utils/format";
import { getProductStats, getLowStockProducts, loadAdminProducts } from "../../data/adminProducts";
import { loadAdminCategories } from "../../data/adminCategories";
import {
  fetchRecentOrders,
  fetchRevenueReport,
  fetchTotalUsers,
  getOrderStatusBadge,
  getOrderStatusLabel,
} from "../../data/adminReports";

const RECENT_ORDER_LIMIT = 6;
const LOW_STOCK_LIMIT = 5;

// Ngày từ API về dạng YYYY-MM-DD, hiển thị lại theo kiểu Việt Nam mà không qua
// new Date() để tránh bị lệch một ngày do quy đổi múi giờ của trình duyệt.
function formatDate(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

const Dashboard = () => {
  // Khoảng ngày đang áp dụng; rỗng nghĩa là để backend tự lấy 30 ngày gần nhất.
  const [range, setRange] = useState({ from: "", to: "" });
  // Giá trị đang gõ trong hai ô ngày, chỉ có hiệu lực khi bấm "Áp dụng".
  const [draftRange, setDraftRange] = useState({ from: "", to: "" });

  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [revenueError, setRevenueError] = useState("");

  const [recentOrders, setRecentOrders] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [productStats, setProductStats] = useState({ total: 0, outOfStock: 0, lowStock: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  // Phần không phụ thuộc khoảng ngày: chỉ tải một lần khi mở trang.
  useEffect(() => {
    let ignore = false;

    async function loadOverview() {
      setOverviewLoading(true);
      setOverviewError("");
      try {
        const [, , orders, users] = await Promise.all([
          loadAdminCategories(),
          loadAdminProducts(),
          fetchRecentOrders(RECENT_ORDER_LIMIT),
          fetchTotalUsers(),
        ]);
        if (ignore) return;
        setRecentOrders(orders);
        setTotalUsers(users);
        // Hai hàm này đọc từ cache mà loadAdminProducts vừa nạp xong nên gọi được đồng bộ.
        setProductStats(getProductStats());
        setLowStock(getLowStockProducts(LOW_STOCK_LIMIT));
      } catch (err) {
        if (!ignore) setOverviewError(err.message);
      } finally {
        if (!ignore) setOverviewLoading(false);
      }
    }

    loadOverview();
    return () => {
      ignore = true;
    };
  }, []);

  // Doanh thu tải lại mỗi lần đổi khoảng ngày; cờ ignore chống việc phản hồi của
  // lần gọi cũ về sau lần gọi mới rồi ghi đè số liệu.
  useEffect(() => {
    let ignore = false;

    async function loadRevenue() {
      setRevenueLoading(true);
      setRevenueError("");
      try {
        const data = await fetchRevenueReport(range);
        if (ignore) return;
        setRevenue(data);
        // Lần đầu vào trang hai ô ngày còn trống, điền khoảng mặc định backend đã dùng
        // để người dùng biết con số đang tính cho quãng thời gian nào.
        if (!range.from && !range.to) {
          setDraftRange({ from: data.fromDate || "", to: data.toDate || "" });
        }
      } catch (err) {
        if (!ignore) {
          setRevenue(null);
          setRevenueError(err.message);
        }
      } finally {
        if (!ignore) setRevenueLoading(false);
      }
    }

    loadRevenue();
    return () => {
      ignore = true;
    };
  }, [range]);

  const handleApply = useCallback(
    (event) => {
      event.preventDefault();
      setRange({ from: draftRange.from, to: draftRange.to });
    },
    [draftRange]
  );

  // Về lại khoảng mặc định bằng cách bỏ trống tham số cho backend tự quyết định.
  const handleReset = useCallback(() => {
    setDraftRange({ from: "", to: "" });
    setRange({ from: "", to: "" });
  }, []);

  const rangeLabel =
    revenue && revenue.fromDate && revenue.toDate
      ? `${formatDate(revenue.fromDate)} - ${formatDate(revenue.toDate)}`
      : "";

  return (
    <div>
      <PageHeader
        title="Bảng điều khiển"
        subtitle="Tổng quan tình hình kinh doanh của cửa hàng"
      />

      {/* ---- Chọn khoảng thời gian tính doanh thu ---- */}
      <div className="admin-card p-3 mb-4">
        <form className="row g-2 align-items-end" onSubmit={handleApply}>
          <div className="col-6 col-md-auto">
            <label className="form-label small mb-1" htmlFor="report-from">
              Từ ngày
            </label>
            <input
              id="report-from"
              type="date"
              className="form-control form-control-sm"
              value={draftRange.from}
              max={draftRange.to || undefined}
              onChange={(e) => setDraftRange((prev) => ({ ...prev, from: e.target.value }))}
            />
          </div>
          <div className="col-6 col-md-auto">
            <label className="form-label small mb-1" htmlFor="report-to">
              Đến ngày
            </label>
            <input
              id="report-to"
              type="date"
              className="form-control form-control-sm"
              value={draftRange.to}
              min={draftRange.from || undefined}
              onChange={(e) => setDraftRange((prev) => ({ ...prev, to: e.target.value }))}
            />
          </div>
          <div className="col-12 col-md-auto d-flex gap-2">
            <button type="submit" className="btn btn-sm btn-primary" disabled={revenueLoading}>
              Áp dụng
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleReset}
              disabled={revenueLoading}
            >
              30 ngày gần nhất
            </button>
          </div>
        </form>
      </div>

      {overviewError && (
        <div className="alert alert-danger py-2 small" role="alert">
          {overviewError}
        </div>
      )}
      {revenueError && (
        <div className="alert alert-danger py-2 small" role="alert">
          {revenueError}
        </div>
      )}

      {/* ---- Số liệu tổng quan ---- */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Doanh thu"
            value={revenueLoading ? "..." : formatPrice(revenue?.totalRevenue || 0)}
            icon="fa-sack-dollar"
            tone="success"
            hint={rangeLabel ? `Khoảng ${rangeLabel}` : "Chỉ tính đơn đã hoàn thành"}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Đơn hoàn thành"
            value={revenueLoading ? "..." : revenue?.totalOrders ?? 0}
            icon="fa-receipt"
            tone="primary"
            hint="Số đơn được tính vào doanh thu ở trên"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Sản phẩm"
            value={overviewLoading ? "..." : productStats.total}
            icon="fa-box-open"
            tone="info"
            hint={`${productStats.lowStock} sắp hết · ${productStats.outOfStock} hết hàng`}
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Người dùng"
            value={overviewLoading ? "..." : totalUsers}
            icon="fa-users"
            tone="warning"
            hint="Tổng số tài khoản trong hệ thống"
          />
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

            {!overviewLoading && recentOrders.length === 0 ? (
              <p className="text-muted small mb-0 p-3">Chưa có đơn hàng nào.</p>
            ) : (
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
                          {/* Chưa liên kết sang trang chi tiết vì màn hình đó còn đọc dữ liệu
                              mock; mở lại link khi module Quản lý đơn hàng được nối API. */}
                          <span className="fw-semibold">#{order.id}</span>
                          <div className="small text-muted">
                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </td>
                        <td className="small">{order.recipientName}</td>
                        <td className="text-end fw-semibold">{formatPrice(order.totalAmount)}</td>
                        <td>
                          <span className={`badge ${getOrderStatusBadge(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ---- Cảnh báo tồn kho ---- */}
        <div className="col-xl-5">
          <div className="admin-card h-100">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h2 className="h6 fw-bold mb-0">
                <i className="fas fa-triangle-exclamation text-warning me-2" />
                Sắp hết hàng
              </h2>
              <Link to="/admin/san-pham" className="small text-decoration-none">
                Quản lý kho
              </Link>
            </div>

            {!overviewLoading && lowStock.length === 0 ? (
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

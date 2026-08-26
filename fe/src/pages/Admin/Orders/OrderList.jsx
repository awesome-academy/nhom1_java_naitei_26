import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../../components/admin/PageHeader";
import Pagination from "../../../components/admin/Pagination";
import EmptyState from "../../../components/admin/EmptyState";
import StatCard from "../../../components/admin/StatCard";
import { formatPrice } from "../../../utils/format";
import {
  fetchAdminOrdersApi,
  updateAdminOrderStatusApi,
  getOrders,
  filterOrders,
  getNextStatuses,
  getOrderStats,
  getStatusBadge,
  getStatusLabel,
  ORDER_STATUSES,
  ORDER_SORTS,
  PAYMENT_METHODS,
} from "../../../data/adminOrders";

const PAGE_SIZE = 10;

const EMPTY_FILTERS = {
  keyword: "",
  status: "",
  payment: "",
  fromDate: "",
  toDate: "",
  sort: "newest",
};

const OrderList = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOrdersApi();
      setAllOrders(data);
    } catch (err) {
      console.warn("Không kết nối được API backend, sử dụng mock data fallback:", err);
      setAllOrders(getOrders());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const orders = useMemo(
    () => filterOrders(allOrders, filters),
    [allOrders, filters]
  );
  const stats = useMemo(
    () => getOrderStats(allOrders),
    [allOrders]
  );

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const pageItems = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [filters]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const hasActiveFilter =
    filters.keyword || filters.status || filters.payment || filters.fromDate || filters.toDate;

  const filteredRevenue = orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "Đã huỷ")
    .reduce((sum, o) => sum + o.total, 0);



  const handlePickStatus = async (order) => {
    const nextStatuses = getNextStatuses(order.status);
    if (nextStatuses.length === 0) return;

    const inputOptions = {};
    nextStatuses.forEach((s) => {
      inputOptions[s] = getStatusLabel(s);
    });

    const { value: picked } = await Swal.fire({
      title: `Cập nhật đơn #${order.id}`,
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
      setAllOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
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
        title="Quản lý đơn hàng"
        subtitle="Theo dõi và cập nhật trạng thái xử lý của từng đơn"
        breadcrumb={[{ label: "Đơn hàng" }]}
      />

      {/* ---- Số liệu nhanh ---- */}
      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-xl-3">
          <StatCard label="Tổng đơn" value={stats.total} icon="fa-receipt" tone="primary" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Chờ xác nhận"
            value={stats.pending}
            icon="fa-clock"
            tone="warning"
            hint="Cần xử lý sớm"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard label="Đang giao" value={stats.shipping} icon="fa-truck-fast" tone="info" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Doanh thu"
            value={formatPrice(stats.revenue)}
            icon="fa-sack-dollar"
            tone="success"
            hint={`${stats.completed} đơn hoàn thành · ${stats.cancelled} đơn huỷ`}
          />
        </div>
      </div>

      {/* ---- Bộ lọc ---- */}
      <div className="admin-card p-3 mb-3">
        <div className="row g-2">
          <div className="col-lg-4">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="fas fa-magnifying-glass text-muted" />
              </span>
              <input
                type="search"
                className="form-control"
                placeholder="Tìm mã đơn, tên hoặc số điện thoại..."
                value={filters.keyword}
                onChange={(e) => setFilter("keyword", e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
              aria-label="Lọc theo trạng thái"
            >
              <option value="">Trạng thái</option>
              {ORDER_STATUSES.map((status) => (
                <option value={status.value} key={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-lg-2">
            <select
              className="form-select"
              value={filters.payment}
              onChange={(e) => setFilter("payment", e.target.value)}
              aria-label="Lọc theo thanh toán"
            >
              <option value="">Thanh toán</option>
              {PAYMENT_METHODS.map((method) => (
                <option value={method.value} key={method.value}>
                  {method.value === "cod" ? "COD" : "Chuyển khoản"}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-lg-2">
            <input
              type="date"
              className="form-control"
              value={filters.fromDate}
              onChange={(e) => setFilter("fromDate", e.target.value)}
              aria-label="Từ ngày"
            />
          </div>

          <div className="col-6 col-lg-2">
            <input
              type="date"
              className="form-control"
              value={filters.toDate}
              onChange={(e) => setFilter("toDate", e.target.value)}
              aria-label="Đến ngày"
            />
          </div>
        </div>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
          <div className="d-flex align-items-center gap-2">
            <label className="small text-muted mb-0" htmlFor="order-sort">
              Sắp xếp
            </label>
            <select
              id="order-sort"
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={filters.sort}
              onChange={(e) => setFilter("sort", e.target.value)}
            >
              {ORDER_SORTS.map((sort) => (
                <option value={sort.value} key={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="small text-muted">
              Doanh thu theo bộ lọc: <b>{formatPrice(filteredRevenue)}</b>
            </span>
            {hasActiveFilter && (
              <button
                type="button"
                className="btn btn-sm btn-light"
                onClick={() => setFilters(EMPTY_FILTERS)}
              >
                <i className="fas fa-rotate-left me-2" />
                Xoá bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---- Bảng ---- */}
      <div className="admin-card">
        {loading ? (
          <div className="text-center py-5">
            <i className="fas fa-spinner fa-spin fa-2x text-primary mb-2" />
            <p className="text-muted small">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon="fa-receipt"
            title="Không có đơn hàng nào"
            description="Thử đổi từ khoá, khoảng ngày hoặc bỏ bớt bộ lọc."
          />
        ) : (
          <div className="table-responsive">
            <table className="table admin-table align-middle">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th className="text-end">Sản phẩm</th>
                  <th className="text-end">Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((order) => {
                  const itemCount = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
                  const nextStatuses = getNextStatuses(order.status);
                  return (
                    <tr key={order.id}>
                      <td>
                        <Link
                          to={`/admin/don-hang/${order.id}`}
                          className="fw-semibold text-decoration-none"
                        >
                          #{order.id}
                        </Link>
                        <div className="small text-muted">
                          {new Date(order.createdAt).toLocaleString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="small">
                        <div className="fw-semibold">{order.customer?.fullName}</div>
                        <div className="text-muted">{order.customer?.phone}</div>
                      </td>
                      <td className="text-end small">{itemCount}</td>
                      <td className="text-end fw-semibold">{formatPrice(order.total)}</td>
                      <td className="small text-muted">
                        {order.paymentMethod === "cod" ? "COD" : "Chuyển khoản"}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="text-end text-nowrap">
                        <Link
                          to={`/admin/don-hang/${order.id}`}
                          className="btn btn-sm btn-light me-1"
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye" />
                        </Link>

                        {nextStatuses.length > 0 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-light"
                            onClick={() => handlePickStatus(order)}
                            title="Đổi trạng thái"
                          >
                            <i className="fas fa-arrow-right-arrow-left" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="p-3 border-top">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={orders.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList;

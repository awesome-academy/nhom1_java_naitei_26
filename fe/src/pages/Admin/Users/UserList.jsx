import React, { useEffect, useState, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import PageHeader from "../../../components/admin/PageHeader";
import Pagination from "../../../components/admin/Pagination";
import AdminModal from "../../../components/admin/AdminModal";
import EmptyState from "../../../components/admin/EmptyState";
import { useAuth } from "../../../context/AuthContext";
import { formatPrice } from "../../../utils/format";
import {
  fetchAdminUsersApi,
  fetchAdminUserDetailApi,
  fetchAdminUserOrdersApi,
  updateUserStatusApi,
  getRoleLabel,
  getRoleBadge,
  getStatusLabel,
  getStatusBadge,
  getOrderStatusLabel,
  getOrderStatusBadge,
  USER_ROLES,
  USER_STATUSES,
} from "../../../data/adminUsers";

const PAGE_SIZE = 10;

const UserList = () => {
  const { user: currentUser } = useAuth();

  const [filters, setFilters] = useState({ keyword: "", role: "", status: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [usersPage, setUsersPage] = useState({
    content: [],
    totalElements: 0,
    totalPages: 1,
  });

  // Modal Chi tiết người dùng & Đơn hàng
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Popup xem nhanh chi tiết 1 đơn hàng cụ thể
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsersApi({
        keyword: filters.keyword,
        role: filters.role || null,
        status: filters.status || null,
        page: page - 1, // Spring backend 0-indexed
        size: PAGE_SIZE,
      });
      setUsersPage(data || { content: [], totalElements: 0, totalPages: 1 });
    } catch (err) {
      console.error("Lỗi tải danh sách người dùng:", err);
      setError(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleToggleStatus = async (user) => {
    const isSelf = String(user.id) === String(currentUser?.id);
    if (isSelf) {
      Swal.fire({
        icon: "warning",
        title: "Không thể thao tác",
        text: "Bạn không thể tự khóa tài khoản của chính mình!",
      });
      return;
    }

    if (user.role === "ADMIN" && user.status === "ACTIVE") {
      Swal.fire({
        icon: "warning",
        title: "Không thể thao tác",
        text: "Không thể khóa tài khoản có vai trò Quản trị viên (ADMIN)!",
      });
      return;
    }

    const locking = user.status === "ACTIVE";
    const nextStatus = locking ? "BLOCKED" : "ACTIVE";

    const result = await Swal.fire({
      icon: "question",
      title: locking ? "Khoá tài khoản?" : "Mở khoá tài khoản?",
      text: locking
        ? `${user.fullName || user.email} sẽ không thể đăng nhập cho tới khi được mở khoá.`
        : `${user.fullName || user.email} sẽ đăng nhập lại được bình thường.`,
      showCancelButton: true,
      confirmButtonText: locking ? "Khoá tài khoản" : "Mở khoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: locking ? "#dc3545" : "#0aad0a",
    });
    if (!result.isConfirmed) return;

    try {
      await updateUserStatusApi(user.id, nextStatus);
      Swal.fire({
        icon: "success",
        title: locking ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản",
        timer: 1500,
        showConfirmButton: false,
      });
      loadUsers();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Thao tác thất bại",
        text: err.message,
      });
    }
  };

  const openDetailModal = async (user) => {
    setDetailUser(user);
    setDetailLoading(true);
    setOrdersLoading(true);
    setUserOrders([]);

    try {
      // 1. Tải chi tiết người dùng
      const fullDetail = await fetchAdminUserDetailApi(user.id);
      if (fullDetail) {
        setDetailUser(fullDetail);
      }
    } catch (err) {
      console.warn("Dùng dữ liệu danh sách do không thể tải chi tiết từ API:", err);
    } finally {
      setDetailLoading(false);
    }

    try {
      // 2. Tải lịch sử đơn hàng của người dùng
      const orders = await fetchAdminUserOrdersApi(user.id);
      setUserOrders(orders || []);
    } catch (err) {
      console.warn("Không thể tải lịch sử đơn hàng:", err);
      setUserOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Tính toán thống kê mua sắm của khách hàng
  const userOrderStats = useMemo(() => {
    const totalOrders = userOrders.length;
    const completedOrders = userOrders.filter((o) => o.status !== "CANCELLED");
    const totalSpent = completedOrders.reduce(
      (sum, o) => sum + (Number(o.totalAmount) || 0),
      0
    );
    const latestOrder = userOrders[0];
    const latestDate = latestOrder?.createdAt
      ? new Date(latestOrder.createdAt).toLocaleDateString("vi-VN")
      : "Chưa có";

    return { totalOrders, totalSpent, latestDate };
  }, [userOrders]);

  const users = usersPage.content || [];
  const totalElements = usersPage.totalElements || 0;
  const totalPages = Math.max(1, usersPage.totalPages || 1);

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        subtitle={`Tổng cộng ${totalElements} tài khoản trong hệ thống`}
        breadcrumb={[{ label: "Người dùng" }]}
      />

      {/* ---- Bộ lọc ---- */}
      <div className="admin-card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="fas fa-magnifying-glass text-muted" />
              </span>
              <input
                type="search"
                className="form-control"
                placeholder="Tìm theo tên, email hoặc số điện thoại..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange("keyword", e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              aria-label="Lọc theo vai trò"
            >
              <option value="">Tất cả vai trò</option>
              {USER_ROLES.map((role) => (
                <option value={role.value} key={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              aria-label="Lọc theo trạng thái"
            >
              <option value="">Tất cả trạng thái</option>
              {USER_STATUSES.map((status) => (
                <option value={status.value} key={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ---- Bảng dữ liệu ---- */}
      <div className="admin-card position-relative">
        {loading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75"
            style={{ zIndex: 10, minHeight: 200 }}
          >
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải dữ liệu...</span>
            </div>
          </div>
        )}

        {error ? (
          <div className="p-4 text-center text-danger">
            <i className="fas fa-triangle-exclamation fs-3 mb-2" />
            <div className="fw-semibold">{error}</div>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={loadUsers}
            >
              Thử lại
            </button>
          </div>
        ) : users.length === 0 && !loading ? (
          <EmptyState
            icon="fa-user-slash"
            title="Không tìm thấy người dùng nào"
            description="Thử đổi từ khoá hoặc chọn bộ lọc khác."
          />
        ) : (
          <div className="table-responsive">
            <table className="table admin-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Liên hệ</th>
                  <th>Địa chỉ</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => {
                  const isSelf = String(item.id) === String(currentUser?.id);
                  const isItemAdmin = item.role === "ADMIN";
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt="Avatar"
                              className="rounded-circle object-fit-cover flex-shrink-0"
                              style={{ width: 38, height: 38 }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <span
                              className="rounded-circle bg-primary-subtle text-primary d-grid fw-semibold flex-shrink-0"
                              style={{ width: 38, height: 38, placeItems: "center" }}
                            >
                              {(item.fullName || item.email || "U").charAt(0).toUpperCase()}
                            </span>
                          )}
                          <div className="min-w-0">
                            <div className="fw-semibold text-truncate">
                              {item.fullName || item.email}
                              {isSelf && (
                                <span className="badge bg-primary ms-1" style={{ fontSize: "0.7rem" }}>
                                  Bạn
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="small">
                        <div>{item.email}</div>
                        <div className="text-muted">{item.phone || "Chưa cập nhật"}</div>
                      </td>
                      <td className="small text-truncate" style={{ maxWidth: 200 }}>
                        {item.address || "Chưa cập nhật"}
                      </td>
                      <td>
                        <span className={`badge ${getRoleBadge(item.role)}`}>
                          {getRoleLabel(item.role)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="text-end text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-light me-1"
                          onClick={() => openDetailModal(item)}
                          title="Xem chi tiết & Lịch sử mua hàng"
                        >
                          <i className="fas fa-eye text-primary" />
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${
                            item.status === "ACTIVE" ? "btn-light text-danger" : "btn-light text-success"
                          }`}
                          onClick={() => handleToggleStatus(item)}
                          disabled={isSelf || (isItemAdmin && item.status === "ACTIVE")}
                          title={
                            isSelf
                              ? "Không thể khoá chính tài khoản đang đăng nhập"
                              : isItemAdmin && item.status === "ACTIVE"
                              ? "Không thể khóa tài khoản Quản trị viên"
                              : item.status === "ACTIVE"
                              ? "Khoá tài khoản"
                              : "Mở khoá tài khoản"
                          }
                        >
                          <i className={`fas ${item.status === "ACTIVE" ? "fa-lock" : "fa-lock-open"}`} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalElements > 0 && (
          <div className="p-3 border-top">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalElements}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ---- Modal Chi tiết người dùng & Đơn hàng (1 Modal duy nhất) ---- */}
      <AdminModal
        show={!!detailUser}
        title={
          selectedOrder ? (
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary py-1 px-2 rounded-2 me-1"
                onClick={() => setSelectedOrder(null)}
                title="Quay lại thông tin khách hàng"
              >
                <i className="fas fa-arrow-left me-1" /> Quay lại
              </button>
              <span>Chi tiết đơn hàng #{selectedOrder.id}</span>
            </div>
          ) : (
            "Chi tiết thông tin khách hàng"
          )
        }
        size="lg"
        onClose={() => {
          setSelectedOrder(null);
          setDetailUser(null);
        }}
        footer={
          selectedOrder ? (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={() => setSelectedOrder(null)}
              >
                <i className="fas fa-arrow-left me-1" /> Quay lại
              </button>
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={() => {
                  setSelectedOrder(null);
                  setDetailUser(null);
                }}
              >
                Đóng
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-light px-4"
              onClick={() => setDetailUser(null)}
            >
              Đóng
            </button>
          )
        }
      >
        {selectedOrder ? (
          /* View 2: Chi tiết đơn hàng */
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <span className="text-muted small">Thời gian đặt: </span>
                <span className="fw-semibold text-dark small">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString("vi-VN") : "—"}
                </span>
              </div>
              <span className={`badge ${getOrderStatusBadge(selectedOrder.status)}`}>
                {getOrderStatusLabel(selectedOrder.status)}
              </span>
            </div>

            {/* Thông tin giao hàng */}
            <div className="bg-light p-3 rounded-3 mb-3 border small">
              <div className="mb-1">
                <strong>Người nhận:</strong> {selectedOrder.recipientName || "—"} ({selectedOrder.recipientPhone || "—"})
              </div>
              <div className="mb-1">
                <strong>Địa chỉ giao:</strong> {selectedOrder.deliveryAddress || "—"}
              </div>
              {selectedOrder.note && (
                <div>
                  <strong>Ghi chú:</strong> {selectedOrder.note}
                </div>
              )}
            </div>

            {/* Danh sách sản phẩm trong đơn */}
            <h6 className="fw-bold text-dark mb-2 small">Sản phẩm đã đặt:</h6>
            <div className="table-responsive border rounded-3 mb-3">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-center">Số lượng</th>
                    <th className="text-end">Đơn giá</th>
                    <th className="text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="fw-medium text-dark">{item.productName}</div>
                        </td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end text-muted small">{formatPrice(item.unitPrice)}</td>
                        <td className="text-end fw-semibold text-dark">{formatPrice(item.subtotal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-2">
                        Không có sản phẩm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Tổng cộng */}
            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border">
              <span className="fw-bold text-dark">Tổng tiền thanh toán:</span>
              <span className="fs-5 fw-bold text-danger">{formatPrice(selectedOrder.totalAmount)}</span>
            </div>
          </div>
        ) : detailUser ? (
          /* View 1: Hồ sơ khách hàng & Lịch sử mua sắm */
          <div>
            {detailLoading && (
              <div className="text-muted small mb-2 fst-italic">
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                Đang làm mới thông tin từ máy chủ...
              </div>
            )}

            {/* Thông tin hồ sơ */}
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              {detailUser.avatarUrl ? (
                <img
                  src={detailUser.avatarUrl}
                  alt="Avatar"
                  className="rounded-circle object-fit-cover shadow-sm flex-shrink-0"
                  style={{ width: 60, height: 60 }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary-subtle text-primary d-grid fw-bold fs-4 flex-shrink-0"
                  style={{ width: 60, height: 60, placeItems: "center" }}
                >
                  {(detailUser.fullName || detailUser.email || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h5 className="mb-0 fw-bold text-dark">{detailUser.fullName || detailUser.email}</h5>
                <div className="small text-muted">{detailUser.email}</div>
                <div className="mt-1 d-flex gap-2">
                  <span className={`badge ${getRoleBadge(detailUser.role)}`}>
                    {getRoleLabel(detailUser.role)}
                  </span>
                  <span className={`badge ${getStatusBadge(detailUser.status)}`}>
                    {getStatusLabel(detailUser.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Chi tiết liên hệ */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label text-muted small mb-1">
                  <i className="fas fa-phone text-primary me-1" /> Số điện thoại
                </label>
                <div className="fw-semibold text-dark fs-6">{detailUser.phone || "Chưa cập nhật"}</div>
              </div>
              <div className="col-md-5">
                <label className="form-label text-muted small mb-1">
                  <i className="fas fa-location-dot text-danger me-1" /> Địa chỉ mặc định
                </label>
                <div className="fw-semibold text-dark fs-6 text-truncate" title={detailUser.address || ""}>
                  {detailUser.address || "Chưa cập nhật"}
                </div>
              </div>
              <div className="col-md-3">
                <label className="form-label text-muted small mb-1">
                  <i className="fas fa-calendar-day text-success me-1" /> Ngày đăng ký
                </label>
                <div className="text-dark fs-6">
                  {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleDateString("vi-VN") : "—"}
                </div>
              </div>
            </div>

            {/* Thống kê mua sắm (KPI Cards) */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="fas fa-chart-pie text-success" />
                Thống kê mua sắm
              </h6>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="text-muted small">Tổng đơn hàng</div>
                    <div className="fs-4 fw-bold text-dark mt-1">
                      {ordersLoading ? "..." : `${userOrderStats.totalOrders} đơn`}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-success-subtle rounded-3 border border-success-subtle">
                    <div className="text-success small fw-medium">Tổng chi tiêu</div>
                    <div className="fs-4 fw-bold text-success mt-1">
                      {ordersLoading ? "..." : formatPrice(userOrderStats.totalSpent)}
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="text-muted small">Đơn gần nhất</div>
                    <div className="fs-5 fw-bold text-dark mt-1">
                      {ordersLoading ? "..." : userOrderStats.latestDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lịch sử đơn hàng gần đây */}
            <div>
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="fas fa-receipt text-primary" />
                Lịch sử đơn hàng ({userOrders.length})
              </h6>

              {ordersLoading ? (
                <div className="text-center py-5 text-muted">
                  <div className="spinner-border text-primary me-2" role="status" />
                  Đang tải danh sách đơn hàng...
                </div>
              ) : userOrders.length === 0 ? (
                <div className="p-4 text-center text-muted bg-light rounded-3 border border-dashed">
                  <i className="fas fa-box-open fs-2 text-muted opacity-50 mb-2 d-block" />
                  Khách hàng này chưa có đơn hàng nào trong hệ thống.
                </div>
              ) : (
                <div className="table-responsive border rounded-3" style={{ maxHeight: 340, overflowY: "auto" }}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th className="py-3 px-3">Mã đơn</th>
                        <th className="py-3">Ngày đặt</th>
                        <th className="py-3">Số món</th>
                        <th className="py-3">Tổng tiền</th>
                        <th className="py-3">Trạng thái</th>
                        <th className="py-3 text-end px-3">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="fw-bold text-primary px-3">#{order.id}</td>
                          <td className="text-muted">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {order.items ? `${order.items.length} món` : "—"}
                            </span>
                          </td>
                          <td className="fw-bold text-dark">
                            {formatPrice(order.totalAmount)}
                          </td>
                          <td>
                            <span className={`badge ${getOrderStatusBadge(order.status)}`} style={{ fontSize: "0.8rem", padding: "5px 10px" }}>
                              {getOrderStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="text-end px-3">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <i className="fas fa-eye me-1" /> Xem
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
};

export default UserList;


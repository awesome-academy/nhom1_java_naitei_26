import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import PageHeader from "../../../components/admin/PageHeader";
import Pagination from "../../../components/admin/Pagination";
import AdminModal from "../../../components/admin/AdminModal";
import EmptyState from "../../../components/admin/EmptyState";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchAdminUsersApi,
  fetchAdminUserDetailApi,
  updateUserStatusApi,
  getRoleLabel,
  getRoleBadge,
  getStatusLabel,
  getStatusBadge,
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

  // Modal Chi tiết người dùng
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
    try {
      const fullDetail = await fetchAdminUserDetailApi(user.id);
      if (fullDetail) {
        setDetailUser(fullDetail);
      }
    } catch (err) {
      console.warn("Dùng dữ liệu danh sách do không thể tải chi tiết từ API:", err);
    } finally {
      setDetailLoading(false);
    }
  };

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
                          title="Xem chi tiết người dùng"
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

      {/* ---- Modal Chi tiết người dùng ---- */}
      <AdminModal
        show={!!detailUser}
        title="Chi tiết thông tin người dùng"
        onClose={() => setDetailUser(null)}
        footer={
          <button
            type="button"
            className="btn btn-light px-4"
            onClick={() => setDetailUser(null)}
          >
            Đóng
          </button>
        }
      >
        {detailUser && (
          <div>
            {detailLoading && (
              <div className="text-muted small mb-2 fst-italic">
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                Đang làm mới chi tiết từ máy chủ...
              </div>
            )}
            <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
              {detailUser.avatarUrl ? (
                <img
                  src={detailUser.avatarUrl}
                  alt="Avatar"
                  className="rounded-circle object-fit-cover shadow-sm flex-shrink-0"
                  style={{ width: 64, height: 64 }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary-subtle text-primary d-grid fw-bold fs-4 flex-shrink-0"
                  style={{ width: 64, height: 64, placeItems: "center" }}
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

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Mã người dùng (ID)</label>
                <div className="fw-semibold text-dark">#{detailUser.id}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Số điện thoại</label>
                <div className="fw-semibold text-dark">{detailUser.phone || "Chưa cập nhật"}</div>
              </div>
              <div className="col-12">
                <label className="form-label text-muted small mb-1">Địa chỉ</label>
                <div className="fw-semibold text-dark">{detailUser.address || "Chưa cập nhật"}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Ngày tạo tài khoản</label>
                <div className="text-dark small">
                  {detailUser.createdAt ? new Date(detailUser.createdAt).toLocaleString("vi-VN") : "—"}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1">Cập nhật lần cuối</label>
                <div className="text-dark small">
                  {detailUser.updatedAt ? new Date(detailUser.updatedAt).toLocaleString("vi-VN") : "—"}
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default UserList;

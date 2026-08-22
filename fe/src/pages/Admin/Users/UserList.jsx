import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import PageHeader from "../../../components/admin/PageHeader";
import Pagination from "../../../components/admin/Pagination";
import AdminModal from "../../../components/admin/AdminModal";
import EmptyState from "../../../components/admin/EmptyState";
import { useAuth } from "../../../context/AuthContext";
import { formatPrice } from "../../../utils/format";
import {
  filterUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  isEmailTaken,
  getUserStats,
  getRoleLabel,
  getRoleBadge,
  getStatusLabel,
  getStatusBadge,
  USER_ROLES,
  USER_STATUSES,
} from "../../../data/adminUsers";

const PAGE_SIZE = 8;

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  role: "USER",
  status: "active",
};

function validate(form, editingId) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Vui lòng nhập họ tên.";
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = "Họ tên phải có ít nhất 2 ký tự.";
  }

  if (!form.email.trim()) {
    errors.email = "Vui lòng nhập email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Email không đúng định dạng.";
  } else if (isEmailTaken(form.email, editingId)) {
    errors.email = "Email này đã được sử dụng.";
  }

  if (form.phone.trim() && !/^0\d{9}$/.test(form.phone.trim())) {
    errors.phone = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.";
  }

  return errors;
}

const UserList = () => {
  const { user: currentUser } = useAuth();

  const [filters, setFilters] = useState({ keyword: "", role: "", status: "" });
  const [page, setPage] = useState(1);
  // Tăng lên sau mỗi lần thêm/sửa/xoá để tính lại danh sách từ localStorage.
  const [version, setVersion] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const users = useMemo(
    () => filterUsers(filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, version]
  );
  const stats = useMemo(
    () => getUserStats(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version]
  );

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const pageItems = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Đổi bộ lọc thì quay về trang đầu; xoá hết bản ghi trang cuối thì lùi lại.
  useEffect(() => setPage(1), [filters]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditingId(user.id);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      role: user.role,
      status: user.status,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validate(form, editingId);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (editingId) {
      updateUser(editingId, form);
    } else {
      createUser(form);
    }

    setShowModal(false);
    setVersion((v) => v + 1);
    Swal.fire({
      icon: "success",
      title: editingId ? "Đã cập nhật người dùng" : "Đã thêm người dùng",
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const handleToggleStatus = async (user) => {
    const locking = user.status === "active";
    const result = await Swal.fire({
      icon: "question",
      title: locking ? "Khoá tài khoản?" : "Mở khoá tài khoản?",
      text: locking
        ? `${user.fullName} sẽ không thể đăng nhập cho tới khi được mở khoá.`
        : `${user.fullName} sẽ đăng nhập lại được bình thường.`,
      showCancelButton: true,
      confirmButtonText: locking ? "Khoá" : "Mở khoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: locking ? "#dc3545" : "#0aad0a",
    });
    if (!result.isConfirmed) return;

    toggleUserStatus(user.id);
    setVersion((v) => v + 1);
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Xoá người dùng?",
      html: `Tài khoản <b>${user.email}</b> sẽ bị xoá vĩnh viễn.`,
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc3545",
    });
    if (!result.isConfirmed) return;

    deleteUser(user.id);
    setVersion((v) => v + 1);
    Swal.fire({
      icon: "success",
      title: "Đã xoá người dùng",
      timer: 1600,
      showConfirmButton: false,
    });
  };

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        subtitle={`${stats.total} tài khoản · ${stats.admins} quản trị viên · ${stats.locked} đang bị khoá`}
        breadcrumb={[{ label: "Người dùng" }]}
      >
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <i className="fas fa-plus me-2" />
          Thêm người dùng
        </button>
      </PageHeader>

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
                onChange={(e) => setFilter("keyword", e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.role}
              onChange={(e) => setFilter("role", e.target.value)}
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
              onChange={(e) => setFilter("status", e.target.value)}
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

      {/* ---- Bảng ---- */}
      <div className="admin-card">
        {pageItems.length === 0 ? (
          <EmptyState
            icon="fa-user-slash"
            title="Không tìm thấy người dùng nào"
            description="Thử đổi từ khoá hoặc bỏ bớt bộ lọc."
          />
        ) : (
          <div className="table-responsive">
            <table className="table admin-table align-middle">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Liên hệ</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Đơn / Chi tiêu</th>
                  <th>Ngày tạo</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((user) => {
                  const isSelf = String(user.id) === String(currentUser?.id);
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="rounded-circle bg-primary-subtle text-primary d-grid fw-semibold flex-shrink-0"
                            style={{ width: 38, height: 38, placeItems: "center" }}
                          >
                            {user.fullName.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <div className="fw-semibold">{user.fullName}</div>
                            <div className="small text-muted">#{user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="small">
                        <div>{user.email}</div>
                        <div className="text-muted">{user.phone || "—"}</div>
                      </td>
                      <td>
                        <span className={`badge ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(user.status)}`}>
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td className="text-end small">
                        <div className="fw-semibold">{user.orderCount} đơn</div>
                        <div className="text-muted">{formatPrice(user.totalSpent)}</div>
                      </td>
                      <td className="small text-muted">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="text-end text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-light me-1"
                          onClick={() => openEdit(user)}
                          title="Sửa"
                        >
                          <i className="fas fa-pen" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-light me-1"
                          onClick={() => handleToggleStatus(user)}
                          disabled={isSelf}
                          title={
                            isSelf
                              ? "Không thể khoá chính tài khoản đang đăng nhập"
                              : user.status === "active"
                              ? "Khoá tài khoản"
                              : "Mở khoá tài khoản"
                          }
                        >
                          <i
                            className={`fas ${user.status === "active" ? "fa-lock" : "fa-lock-open"}`}
                          />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-light text-danger"
                          onClick={() => handleDelete(user)}
                          disabled={isSelf}
                          title={isSelf ? "Không thể xoá chính mình" : "Xoá"}
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {users.length > 0 && (
          <div className="p-3 border-top">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={users.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ---- Form thêm / sửa ---- */}
      <AdminModal
        show={showModal}
        title={editingId ? "Cập nhật người dùng" : "Thêm người dùng"}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setShowModal(false)}
            >
              Huỷ
            </button>
            <button type="submit" form="user-form" className="btn btn-primary">
              {editingId ? "Lưu thay đổi" : "Thêm người dùng"}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="user-fullname">
              Họ và tên <span className="text-danger">*</span>
            </label>
            <input
              id="user-fullname"
              type="text"
              className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="user-email">
              Email <span className="text-danger">*</span>
            </label>
            <input
              id="user-email"
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="email@example.com"
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="user-phone">
                Số điện thoại
              </label>
              <input
                id="user-phone"
                type="tel"
                className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="0901234567"
              />
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label" htmlFor="user-role">
                Vai trò
              </label>
              <select
                id="user-role"
                className="form-select"
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
              >
                {USER_ROLES.map((role) => (
                  <option value={role.value} key={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="user-address">
              Địa chỉ
            </label>
            <textarea
              id="user-address"
              className="form-control"
              rows="2"
              value={form.address}
              onChange={(e) => setField("address", e.target.value)}
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
            />
          </div>

          <div className="mb-1">
            <label className="form-label" htmlFor="user-status">
              Trạng thái
            </label>
            <select
              id="user-status"
              className="form-select"
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
            >
              {USER_STATUSES.map((status) => (
                <option value={status.value} key={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default UserList;

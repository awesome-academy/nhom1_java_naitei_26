import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import PageHeader from "../../../components/admin/PageHeader";
import Pagination from "../../../components/admin/Pagination";
import EmptyState from "../../../components/admin/EmptyState";
import StatCard from "../../../components/admin/StatCard";
import AdminModal from "../../../components/admin/AdminModal";
import {
  fetchSuggestions,
  updateSuggestionStatus,
  getSuggestionStats,
  getStatusBadge,
  getStatusLabel,
  getTypeLabel,
  SUGGESTION_STATUSES,
  SUGGESTION_TYPES,
} from "../../../data/suggestions";

const PAGE_SIZE = 10;

const EMPTY_FILTERS = { keyword: "", status: "", type: "" };

const EMPTY_STATS = { total: 0, pending: 0, approved: 0, rejected: 0 };

function formatDateTime(value) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SuggestionList = () => {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // Từ khoá dùng để gọi API, chỉ cập nhật sau khi người dùng ngừng gõ.
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [detail, setDetail] = useState(null);

  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Đợi 400ms sau lần gõ cuối rồi mới tìm, tránh bắn request mỗi ký tự.
  useEffect(() => {
    const timer = setTimeout(() => setSearchKeyword(filters.keyword), 400);
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  // Đổi điều kiện lọc thì quay lại trang đầu.
  useEffect(() => setPage(1), [searchKeyword, filters.status, filters.type]);

  // Tải danh sách theo trang và bộ lọc hiện tại.
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    fetchSuggestions({
      page: page - 1, // backend đánh số trang từ 0, Pagination của FE đếm từ 1
      size: PAGE_SIZE,
      status: filters.status,
      type: filters.type,
      keyword: searchKeyword,
    })
      .then((data) => {
        if (ignore) return;
        setItems(data?.content || []);
        setTotalItems(data?.totalElements || 0);
        setTotalPages(Math.max(1, data?.totalPages || 1));
      })
      .catch((err) => {
        if (ignore) return;
        setItems([]);
        setTotalItems(0);
        setTotalPages(1);
        setError(err.message || "Không tải được danh sách đề xuất.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, filters.status, filters.type, searchKeyword, version]);

  // Số liệu thống kê tải riêng, hỏng thì chỉ ẩn số chứ không chặn bảng danh sách.
  useEffect(() => {
    let ignore = false;
    getSuggestionStats()
      .then((data) => {
        if (!ignore) setStats(data || EMPTY_STATS);
      })
      .catch(() => {
        if (!ignore) setStats(EMPTY_STATS);
      });

    return () => {
      ignore = true;
    };
  }, [version]);

  // Nếu bộ lọc thu hẹp làm số trang giảm, kéo người dùng về trang cuối còn dữ liệu.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  const hasActiveFilter = filters.keyword || filters.status || filters.type;

  // Duyệt / từ chối kèm ghi chú gửi lại cho người đề xuất.
  const handleReview = async (suggestion, nextStatus) => {
    const isApprove = nextStatus === "APPROVED";

    const { value: note, isConfirmed } = await Swal.fire({
      icon: isApprove ? "question" : "warning",
      title: isApprove ? "Duyệt đề xuất?" : "Từ chối đề xuất?",
      html: `Đề xuất <b>${suggestion.productName}</b> của ${suggestion.userFullName}.`,
      input: "textarea",
      inputLabel: "Ghi chú của quản trị viên (không bắt buộc)",
      inputPlaceholder: isApprove
        ? "Ví dụ: Đã liên hệ nhà cung cấp, dự kiến lên kệ tuần sau."
        : "Ví dụ: Sản phẩm chưa có giấy tờ nhập khẩu hợp lệ.",
      inputValue: suggestion.adminNote || "",
      showCancelButton: true,
      confirmButtonText: isApprove ? "Duyệt" : "Từ chối",
      cancelButtonText: "Quay lại",
      confirmButtonColor: isApprove ? "#0aad0a" : "#dc3545",
    });
    if (!isConfirmed) return;

    try {
      await updateSuggestionStatus(suggestion.id, nextStatus, note || "");
      setVersion((v) => v + 1);
      setDetail(null);
      Swal.fire({
        icon: "success",
        title: isApprove ? "Đã duyệt đề xuất" : "Đã từ chối đề xuất",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cập nhật thất bại",
        text: err.message || "Không cập nhật được trạng thái đề xuất.",
        confirmButtonText: "Đã hiểu",
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản lý đề xuất"
        subtitle="Xem và xử lý các đề xuất thực phẩm, đồ uống do người dùng gửi lên"
        breadcrumb={[{ label: "Đề xuất" }]}
      />

      {/* ---- Số liệu nhanh ---- */}
      <div className="row g-3 mb-3">
        <div className="col-sm-6 col-xl-3">
          <StatCard label="Tổng đề xuất" value={stats.total} icon="fa-lightbulb" tone="primary" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard
            label="Chờ duyệt"
            value={stats.pending}
            icon="fa-clock"
            tone="warning"
            hint="Cần xử lý sớm"
          />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard label="Đã duyệt" value={stats.approved} icon="fa-circle-check" tone="success" />
        </div>
        <div className="col-sm-6 col-xl-3">
          <StatCard label="Từ chối" value={stats.rejected} icon="fa-circle-xmark" tone="danger" />
        </div>
      </div>

      {/* ---- Bộ lọc ---- */}
      <div className="admin-card p-3 mb-3">
        <div className="row g-2">
          <div className="col-lg-6">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="fas fa-magnifying-glass text-muted" />
              </span>
              <input
                type="search"
                className="form-control"
                placeholder="Tìm theo tên món hoặc người gửi..."
                value={filters.keyword}
                onChange={(e) => setFilter("keyword", e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
              aria-label="Lọc theo trạng thái"
            >
              <option value="">Tất cả trạng thái</option>
              {SUGGESTION_STATUSES.map((status) => (
                <option value={status.value} key={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-lg-3">
            <select
              className="form-select"
              value={filters.type}
              onChange={(e) => setFilter("type", e.target.value)}
              aria-label="Lọc theo phân loại"
            >
              <option value="">Tất cả phân loại</option>
              {SUGGESTION_TYPES.map((type) => (
                <option value={type.value} key={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilter && (
          <div className="d-flex justify-content-end mt-3">
            <button
              type="button"
              className="btn btn-sm btn-light"
              onClick={() => setFilters(EMPTY_FILTERS)}
            >
              <i className="fas fa-rotate-left me-2" />
              Xoá bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* ---- Bảng ---- */}
      <div className="admin-card">
        {loading ? (
          <div className="text-center text-muted py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
            <div className="small">Đang tải danh sách đề xuất...</div>
          </div>
        ) : error ? (
          <EmptyState
            icon="fa-triangle-exclamation"
            title="Không tải được dữ liệu"
            description={error}
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon="fa-lightbulb"
            title="Không có đề xuất nào"
            description="Thử đổi từ khoá hoặc bỏ bớt bộ lọc."
          />
        ) : (
          <div className="table-responsive">
            <table className="table admin-table align-middle">
              <thead>
                <tr>
                  <th>Tên món</th>
                  <th>Người gửi</th>
                  <th>Phân loại</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((suggestion) => (
                  <tr key={suggestion.id}>
                    <td>
                      <div className="fw-semibold">{suggestion.productName}</div>
                      {suggestion.description && (
                        <div className="small text-muted admin-truncate">
                          {suggestion.description}
                        </div>
                      )}
                    </td>
                    <td className="small">{suggestion.userFullName}</td>
                    <td>
                      <span
                        className={`badge ${
                          suggestion.type === "FOOD"
                            ? "bg-success-subtle text-success"
                            : "bg-info-subtle text-info"
                        }`}
                      >
                        {getTypeLabel(suggestion.type)}
                      </span>
                    </td>
                    <td className="small text-muted">{formatDateTime(suggestion.createdAt)}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(suggestion.status)}`}>
                        {getStatusLabel(suggestion.status)}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-light me-1"
                        onClick={() => setDetail(suggestion)}
                        title="Xem chi tiết"
                      >
                        <i className="fas fa-eye" />
                      </button>

                      {suggestion.status === "PENDING" && (
                        <>
                          <button
                            type="button"
                            className="btn btn-sm btn-light text-success me-1"
                            onClick={() => handleReview(suggestion, "APPROVED")}
                            title="Duyệt"
                          >
                            <i className="fas fa-check" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-light text-danger"
                            onClick={() => handleReview(suggestion, "REJECTED")}
                            title="Từ chối"
                          >
                            <i className="fas fa-xmark" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && totalItems > 0 && (
          <div className="p-3 border-top">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ---- Chi tiết đề xuất ---- */}
      <AdminModal
        show={Boolean(detail)}
        title="Chi tiết đề xuất"
        onClose={() => setDetail(null)}
        footer={
          <>
            <button type="button" className="btn btn-light" onClick={() => setDetail(null)}>
              Đóng
            </button>
            {detail?.status === "PENDING" && (
              <>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleReview(detail, "REJECTED")}
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleReview(detail, "APPROVED")}
                >
                  Duyệt
                </button>
              </>
            )}
          </>
        }
      >
        {detail && (
          <dl className="row mb-0 small">
            <dt className="col-sm-4">Tên món</dt>
            <dd className="col-sm-8 fw-semibold">{detail.productName}</dd>

            <dt className="col-sm-4">Phân loại</dt>
            <dd className="col-sm-8">{getTypeLabel(detail.type)}</dd>

            <dt className="col-sm-4">Người gửi</dt>
            <dd className="col-sm-8">{detail.userFullName}</dd>

            <dt className="col-sm-4">Ngày gửi</dt>
            <dd className="col-sm-8">{formatDateTime(detail.createdAt)}</dd>

            <dt className="col-sm-4">Trạng thái</dt>
            <dd className="col-sm-8">
              <span className={`badge ${getStatusBadge(detail.status)}`}>
                {getStatusLabel(detail.status)}
              </span>
            </dd>

            <dt className="col-sm-4">Mô tả</dt>
            <dd className="col-sm-8">
              {detail.description || <span className="text-muted">Không có mô tả</span>}
            </dd>

            {detail.adminNote && (
              <>
                <dt className="col-sm-4">Ghi chú xử lý</dt>
                <dd className="col-sm-8">{detail.adminNote}</dd>
              </>
            )}
          </dl>
        )}
      </AdminModal>
    </div>
  );
};

export default SuggestionList;

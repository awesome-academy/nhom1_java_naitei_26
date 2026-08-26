// Gọi API thật cho tính năng Đề xuất sản phẩm (người dùng gửi - quản trị viên duyệt):
//   POST  /api/suggestions                     -> createSuggestion
//   GET   /api/suggestions/my                  -> fetchMySuggestions
//   GET   /api/admin/suggestions               -> fetchSuggestions (lọc status/type/keyword + phân trang)
//   GET   /api/admin/suggestions/stats         -> getSuggestionStats
//   PATCH /api/admin/suggestions/{id}/status   -> updateSuggestionStatus

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const ACCESS_TOKEN_KEY = "accessToken";

// Khớp enum ProductType của backend.
export const SUGGESTION_TYPES = [
  { value: "FOOD", label: "Thực phẩm" },
  { value: "DRINK", label: "Đồ uống" },
];

// Khớp enum SuggestionStatus của backend: PENDING / APPROVED / REJECTED.
export const SUGGESTION_STATUSES = [
  { value: "PENDING", label: "Chờ duyệt", badge: "bg-warning-subtle text-warning" },
  { value: "APPROVED", label: "Đã duyệt", badge: "bg-success-subtle text-success" },
  { value: "REJECTED", label: "Từ chối", badge: "bg-danger-subtle text-danger" },
];

export function getTypeLabel(value) {
  return SUGGESTION_TYPES.find((t) => t.value === value)?.label || value;
}

export function getStatusLabel(value) {
  return SUGGESTION_STATUSES.find((s) => s.value === value)?.label || value;
}

export function getStatusBadge(value) {
  return SUGGESTION_STATUSES.find((s) => s.value === value)?.badge || "bg-secondary-subtle text-secondary";
}

// Gọi API kèm token, trả thẳng phần `data` trong ApiResponse của backend.
async function request(path, options = {}) {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) throw new Error("Bạn cần đăng nhập để thực hiện thao tác này.");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || (body?.status && body.status >= 400)) {
    throw new Error(body?.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
  }
  return body?.data;
}

// Người dùng gửi đề xuất mới; backend tự lấy người gửi từ token và đặt trạng thái PENDING.
export function createSuggestion({ productName, type, description }) {
  return request("/api/suggestions", {
    method: "POST",
    body: JSON.stringify({
      productName: productName.trim(),
      type,
      description: description?.trim() || null,
    }),
  });
}

// Các đề xuất do chính người dùng đang đăng nhập đã gửi, mới nhất lên đầu.
export function fetchMySuggestions() {
  return request("/api/suggestions/my");
}

// Danh sách đề xuất cho admin. `page` đánh số từ 0 theo quy ước của backend.
export function fetchSuggestions({ page = 0, size = 10, status = "", type = "", keyword = "" } = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  if (keyword.trim()) params.set("keyword", keyword.trim());

  return request(`/api/admin/suggestions?${params.toString()}`);
}

// Quản trị viên duyệt hoặc từ chối một đề xuất, kèm ghi chú (không bắt buộc).
export function updateSuggestionStatus(id, status, adminNote = "") {
  return request(`/api/admin/suggestions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminNote: adminNote.trim() || null }),
  });
}

// Số liệu cho thẻ thống kê và badge "chờ duyệt" trên menu quản trị.
export function getSuggestionStats() {
  return request("/api/admin/suggestions/stats");
}

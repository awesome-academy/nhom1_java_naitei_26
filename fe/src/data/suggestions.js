// Dữ liệu mock cho tính năng Đề xuất sản phẩm (người dùng gửi - quản trị viên duyệt).
// Tên trường đặt đúng theo DTO của backend (productName, type, status, adminNote...)
// nên khi nối API chỉ cần thay phần thân các hàm bên dưới bằng fetch:
//   POST  /api/suggestions                     -> createSuggestion
//   GET   /api/admin/suggestions               -> filterSuggestions (lọc status + phân trang)
//   PATCH /api/admin/suggestions/{id}/status   -> updateSuggestionStatus

import { loadCollection, saveCollection, nextId, normalize } from "./localStore";

const SUGGESTIONS_KEY = "fd_suggestions";

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

// Ngày cách hôm nay `days` ngày, để danh sách seed trông như dữ liệu mới phát sinh.
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function buildSeed() {
  return [
    {
      id: 1,
      userId: 2,
      userFullName: "Trần Thị Mai",
      productName: "Sữa chua nếp cẩm",
      type: "FOOD",
      description:
        "Món tráng miệng được nhiều người tìm mua nhưng shop chưa bán. Mong shop nhập thêm loại hũ 100g.",
      status: "PENDING",
      adminNote: "",
      createdAt: daysAgo(1),
      updatedAt: daysAgo(1),
    },
    {
      id: 2,
      userId: 3,
      userFullName: "Nguyễn Văn Hùng",
      productName: "Trà ô long sữa",
      type: "DRINK",
      description: "Đề xuất thêm trà ô long sữa đóng chai 450ml, vị ít ngọt.",
      status: "PENDING",
      adminNote: "",
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: 3,
      userId: 4,
      userFullName: "Lê Minh Anh",
      productName: "Bánh mì nguyên cám",
      type: "FOOD",
      description: "Bánh mì nguyên cám cắt lát dùng cho người ăn kiêng.",
      status: "APPROVED",
      adminNote: "Đã liên hệ nhà cung cấp, dự kiến lên kệ tuần sau.",
      createdAt: daysAgo(8),
      updatedAt: daysAgo(5),
    },
    {
      id: 4,
      userId: 5,
      userFullName: "Phạm Quốc Bảo",
      productName: "Nước tăng lực nhập khẩu",
      type: "DRINK",
      description: "Mong shop nhập loại lon 500ml của hãng nước ngoài.",
      status: "REJECTED",
      adminNote: "Sản phẩm chưa có giấy tờ nhập khẩu hợp lệ nên tạm thời chưa kinh doanh.",
      createdAt: daysAgo(12),
      updatedAt: daysAgo(10),
    },
  ];
}

function readSuggestions() {
  return loadCollection(SUGGESTIONS_KEY, buildSeed);
}

// Danh sách đề xuất, mới nhất lên đầu.
export function getSuggestions() {
  return readSuggestions().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getSuggestionById(id) {
  return readSuggestions().find((s) => String(s.id) === String(id)) || null;
}

// Người dùng gửi đề xuất mới; trạng thái ban đầu luôn là PENDING (giống backend).
export function createSuggestion(data, user = null) {
  const suggestions = readSuggestions();
  const now = new Date().toISOString();
  const suggestion = {
    id: nextId(suggestions),
    userId: user?.id ?? null,
    userFullName: user?.fullName || user?.email || "Khách",
    productName: data.productName.trim(),
    type: data.type,
    description: data.description?.trim() || "",
    status: "PENDING",
    adminNote: "",
    createdAt: now,
    updatedAt: now,
  };
  saveCollection(SUGGESTIONS_KEY, [...suggestions, suggestion]);
  return suggestion;
}

// Quản trị viên duyệt hoặc từ chối một đề xuất, kèm ghi chú (không bắt buộc).
export function updateSuggestionStatus(id, status, adminNote = "") {
  const suggestions = readSuggestions();
  const index = suggestions.findIndex((s) => String(s.id) === String(id));
  if (index === -1) return null;

  const updated = {
    ...suggestions[index],
    status,
    adminNote: adminNote.trim(),
    updatedAt: new Date().toISOString(),
  };
  suggestions[index] = updated;
  saveCollection(SUGGESTIONS_KEY, suggestions);
  return updated;
}

export function filterSuggestions({ keyword = "", status = "", type = "" } = {}) {
  const q = normalize(keyword.trim());
  return getSuggestions().filter((suggestion) => {
    if (status && suggestion.status !== status) return false;
    if (type && suggestion.type !== type) return false;
    if (!q) return true;
    return (
      normalize(suggestion.productName).includes(q) ||
      normalize(suggestion.userFullName).includes(q) ||
      normalize(suggestion.description).includes(q)
    );
  });
}

// Số liệu cho thẻ thống kê và badge "chờ duyệt" trên menu quản trị.
export function getSuggestionStats() {
  const suggestions = readSuggestions();
  return {
    total: suggestions.length,
    pending: suggestions.filter((s) => s.status === "PENDING").length,
    approved: suggestions.filter((s) => s.status === "APPROVED").length,
    rejected: suggestions.filter((s) => s.status === "REJECTED").length,
  };
}

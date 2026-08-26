// Gọi API thật cho Bảng điều khiển (thống kê) của trang quản trị:
//   GET /api/admin/reports/revenue  -> fetchRevenueReport (doanh thu + số đơn theo khoảng ngày)
//   GET /api/admin/orders           -> fetchRecentOrders (đơn hàng mới nhất)
//   GET /api/admin/users            -> fetchTotalUsers (tổng số tài khoản)
// Tổng sản phẩm và danh sách sắp hết hàng lấy từ data/adminProducts.js (đã nối API sẵn).

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const ACCESS_TOKEN_KEY = "accessToken";

function getAuthHeaders() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Nhãn và màu badge cho enum OrderStatus của backend (9 giá trị).
// Khi màn hình Quản lý đơn hàng được nối API thật thì chuyển bảng này sang
// data/adminOrders.js để hai nơi dùng chung, tránh lệch nhãn.
export const ORDER_STATUS_LABELS = {
  PENDING: { label: "Chờ xác nhận", badge: "bg-warning-subtle text-warning" },
  CONFIRMED: { label: "Đã xác nhận", badge: "bg-info-subtle text-info" },
  PREPARING: { label: "Đang chuẩn bị", badge: "bg-info-subtle text-info" },
  PROCESSING: { label: "Đang xử lý", badge: "bg-info-subtle text-info" },
  SHIPPED: { label: "Đã gửi hàng", badge: "bg-primary-subtle text-primary" },
  DELIVERING: { label: "Đang giao", badge: "bg-primary-subtle text-primary" },
  DELIVERED: { label: "Đã giao", badge: "bg-success-subtle text-success" },
  COMPLETED: { label: "Hoàn thành", badge: "bg-success-subtle text-success" },
  CANCELLED: { label: "Đã huỷ", badge: "bg-danger-subtle text-danger" },
};

export function getOrderStatusLabel(value) {
  return ORDER_STATUS_LABELS[value]?.label || value;
}

export function getOrderStatusBadge(value) {
  return ORDER_STATUS_LABELS[value]?.badge || "bg-secondary-subtle text-secondary";
}

// Gọi API kèm token, trả thẳng phần `data` trong ApiResponse của backend.
async function request(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok || (body?.status && body.status >= 400)) {
    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    }
    throw new Error(body?.message || "Không thể tải dữ liệu thống kê.");
  }
  return body?.data;
}

// Doanh thu và số đơn trong khoảng ngày (định dạng YYYY-MM-DD).
// Bỏ trống cả hai thì backend tự lấy 30 ngày gần nhất tính theo giờ Việt Nam.
// Chỉ đơn ở trạng thái COMPLETED mới được tính, đây là quy tắc đặt ở backend.
export function fetchRevenueReport({ from = "", to = "" } = {}) {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const query = params.toString();
  return request(`/api/admin/reports/revenue${query ? `?${query}` : ""}`);
}

// Đơn hàng mới nhất; backend đã sắp xếp sẵn theo createdAt giảm dần nên chỉ cần cắt bớt.
export async function fetchRecentOrders(limit = 6) {
  const orders = await request("/api/admin/orders");
  return Array.isArray(orders) ? orders.slice(0, limit) : [];
}

// Chỉ cần con số tổng nên lấy trang nhỏ nhất rồi đọc totalElements của Page.
export async function fetchTotalUsers() {
  const page = await request("/api/admin/users?page=0&size=1");
  return page?.totalElements ?? 0;
}

// Quản lý API và hằng số cho màn hình Quản lý người dùng (Admin)

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
const ACCESS_TOKEN_KEY = "accessToken";

function getAuthHeaders() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const USER_ROLES = [
  { value: "ADMIN", label: "Quản trị viên", badge: "bg-danger-subtle text-danger" },
  { value: "USER", label: "Khách hàng", badge: "bg-secondary-subtle text-secondary" },
];

export const USER_STATUSES = [
  { value: "ACTIVE", label: "Đang hoạt động", badge: "bg-success-subtle text-success" },
  { value: "BLOCKED", label: "Đã khoá", badge: "bg-danger-subtle text-danger" },
];

export function getRoleLabel(value) {
  return USER_ROLES.find((r) => r.value === value)?.label || value;
}

export function getRoleBadge(value) {
  return USER_ROLES.find((r) => r.value === value)?.badge || "bg-secondary-subtle text-secondary";
}

export function getStatusLabel(value) {
  return USER_STATUSES.find((s) => s.value === value)?.label || value;
}

export function getStatusBadge(value) {
  return USER_STATUSES.find((s) => s.value === value)?.badge || "bg-secondary-subtle text-secondary";
}

export function getUserStats() {
  return {
    total: 12,
    admins: 2,
    locked: 0,
    newThisMonth: 5,
  };
}

export async function fetchAdminUsersApi({ keyword, role, status, page = 0, size = 10 }) {
  const params = new URLSearchParams();
  if (keyword && keyword.trim()) params.append("keyword", keyword.trim());
  if (role) params.append("role", role);
  if (status) params.append("status", status);
  params.append("page", page);
  params.append("size", size);

  const res = await fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || (data.status && data.status >= 400)) {
    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    }
    throw new Error(data.message || "Không thể tải danh sách người dùng");
  }
  return data.data;
}

export async function fetchAdminUserDetailApi(id) {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || (data.status && data.status >= 400)) {
    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    }
    throw new Error(data.message || "Không thể lấy chi tiết người dùng");
  }
  return data.data;
}

export async function updateUserStatusApi(id, newStatus) {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: newStatus }),
  });
  const data = await res.json();
  if (!res.ok || (data.status && data.status >= 400)) {
    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    }
    throw new Error(data.message || "Không thể cập nhật trạng thái người dùng");
  }
  return data.data;
}

export async function updateUserRoleApi(id, newRole) {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/role`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ role: newRole }),
  });
  const data = await res.json();
  if (!res.ok || (data.status && data.status >= 400)) {
    if (res.status === 401) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
    }
    throw new Error(data.message || "Không thể cập nhật vai trò người dùng");
  }
  return data.data;
}

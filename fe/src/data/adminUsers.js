// Dữ liệu mock cho màn hình Quản lý người dùng (admin).
// Khi backend có API: thay phần thân các hàm bên dưới bằng fetch tới /api/admin/users.

import { loadCollection, saveCollection, nextId, normalize } from "./localStore";

const USERS_KEY = "fd_admin_users";

export const USER_ROLES = [
  { value: "ADMIN", label: "Quản trị viên", badge: "bg-danger-subtle text-danger" },
  { value: "USER", label: "Khách hàng", badge: "bg-secondary-subtle text-secondary" },
];

export const USER_STATUSES = [
  { value: "active", label: "Đang hoạt động", badge: "bg-success-subtle text-success" },
  { value: "locked", label: "Đã khoá", badge: "bg-danger-subtle text-danger" },
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

const SEED_USERS = [
  {
    id: 1,
    fullName: "Nguyễn Quản Trị",
    email: "admin@fooddrink.vn",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    role: "ADMIN",
    status: "active",
    orderCount: 0,
    totalSpent: 0,
    createdAt: "2025-11-02T08:15:00.000Z",
  },
  {
    id: 2,
    fullName: "Trần Thị Mai",
    email: "mai.tran@gmail.com",
    phone: "0912345678",
    address: "45 Lê Lợi, Quận 3, TP.HCM",
    role: "USER",
    status: "active",
    orderCount: 12,
    totalSpent: 4520000,
    createdAt: "2025-12-14T03:40:00.000Z",
  },
  {
    id: 3,
    fullName: "Lê Văn Hùng",
    email: "hungle92@gmail.com",
    phone: "0987654321",
    address: "78 Trần Phú, Hải Châu, Đà Nẵng",
    role: "USER",
    status: "active",
    orderCount: 5,
    totalSpent: 1380000,
    createdAt: "2026-01-08T10:22:00.000Z",
  },
  {
    id: 4,
    fullName: "Phạm Thu Hà",
    email: "ha.pham@outlook.com",
    phone: "0934567890",
    address: "12 Ngõ 5 Cầu Giấy, Hà Nội",
    role: "USER",
    status: "locked",
    orderCount: 2,
    totalSpent: 310000,
    createdAt: "2026-01-25T14:05:00.000Z",
  },
  {
    id: 5,
    fullName: "Đỗ Khắc Hoàng",
    email: "hoang.do@fooddrink.vn",
    phone: "0945678901",
    address: "260 Cách Mạng Tháng 8, Quận 10, TP.HCM",
    role: "ADMIN",
    status: "active",
    orderCount: 0,
    totalSpent: 0,
    createdAt: "2026-02-11T02:30:00.000Z",
  },
  {
    id: 6,
    fullName: "Vũ Minh Anh",
    email: "minhanh.vu@gmail.com",
    phone: "0956789012",
    address: "9 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    role: "USER",
    status: "active",
    orderCount: 8,
    totalSpent: 2760000,
    createdAt: "2026-03-03T09:00:00.000Z",
  },
  {
    id: 7,
    fullName: "Hoàng Mạnh Dũng",
    email: "dung.hoang@gmail.com",
    phone: "0967890123",
    address: "88 Điện Biên Phủ, Bình Thạnh, TP.HCM",
    role: "USER",
    status: "active",
    orderCount: 21,
    totalSpent: 8940000,
    createdAt: "2026-03-19T11:45:00.000Z",
  },
  {
    id: 8,
    fullName: "Bùi Thanh Trung",
    email: "trung.bui@yahoo.com",
    phone: "0978901234",
    address: "154 Hùng Vương, Ninh Kiều, Cần Thơ",
    role: "USER",
    status: "active",
    orderCount: 3,
    totalSpent: 640000,
    createdAt: "2026-04-27T06:10:00.000Z",
  },
  {
    id: 9,
    fullName: "Ngô Kiều Trinh",
    email: "trinh.ngo@gmail.com",
    phone: "0989012345",
    address: "31 Bà Triệu, Hai Bà Trưng, Hà Nội",
    role: "USER",
    status: "active",
    orderCount: 7,
    totalSpent: 1920000,
    createdAt: "2026-05-15T13:25:00.000Z",
  },
  {
    id: 10,
    fullName: "Đặng Quốc Bảo",
    email: "bao.dang@gmail.com",
    phone: "0990123456",
    address: "5 Lý Thường Kiệt, TP. Huế",
    role: "USER",
    status: "locked",
    orderCount: 1,
    totalSpent: 125000,
    createdAt: "2026-06-01T04:50:00.000Z",
  },
  {
    id: 11,
    fullName: "Trịnh Hải Yến",
    email: "yen.trinh@gmail.com",
    phone: "0901112223",
    address: "67 Nguyễn Văn Cừ, Long Biên, Hà Nội",
    role: "USER",
    status: "active",
    orderCount: 14,
    totalSpent: 5310000,
    createdAt: "2026-06-22T08:05:00.000Z",
  },
  {
    id: 12,
    fullName: "Lý Gia Khang",
    email: "khang.ly@gmail.com",
    phone: "0902223334",
    address: "20 Hai Bà Trưng, Nha Trang, Khánh Hoà",
    role: "USER",
    status: "active",
    orderCount: 4,
    totalSpent: 880000,
    createdAt: "2026-07-30T15:35:00.000Z",
  },
  {
    id: 13,
    fullName: "Nguyễn Duy Hưng",
    email: "hung.nguyen@fooddrink.vn",
    phone: "0903334445",
    address: "300 Trường Chinh, Tân Bình, TP.HCM",
    role: "USER",
    status: "active",
    orderCount: 0,
    totalSpent: 0,
    createdAt: "2026-08-12T01:15:00.000Z",
  },
];

function readUsers() {
  return loadCollection(USERS_KEY, () => SEED_USERS);
}

export function getUsers() {
  return readUsers().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getUserById(id) {
  return readUsers().find((u) => String(u.id) === String(id)) || null;
}

// Kiểm tra email đã tồn tại chưa (bỏ qua chính bản ghi đang sửa).
export function isEmailTaken(email, exceptId = null) {
  const target = String(email).trim().toLowerCase();
  return readUsers().some(
    (u) => u.email.toLowerCase() === target && String(u.id) !== String(exceptId)
  );
}

export function createUser(data) {
  const users = readUsers();
  const user = {
    id: nextId(users),
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() || "",
    address: data.address?.trim() || "",
    role: data.role || "USER",
    status: data.status || "active",
    orderCount: 0,
    totalSpent: 0,
    createdAt: new Date().toISOString(),
  };
  saveCollection(USERS_KEY, [user, ...users]);
  return user;
}

export function updateUser(id, patch) {
  const users = readUsers();
  const index = users.findIndex((u) => String(u.id) === String(id));
  if (index === -1) return null;

  const updated = {
    ...users[index],
    ...patch,
    fullName: (patch.fullName ?? users[index].fullName).trim(),
    email: (patch.email ?? users[index].email).trim(),
    id: users[index].id,
  };
  users[index] = updated;
  saveCollection(USERS_KEY, users);
  return updated;
}

export function toggleUserStatus(id) {
  const user = getUserById(id);
  if (!user) return null;
  return updateUser(id, { status: user.status === "active" ? "locked" : "active" });
}

export function deleteUser(id) {
  const users = readUsers();
  const remaining = users.filter((u) => String(u.id) !== String(id));
  if (remaining.length === users.length) return false;
  saveCollection(USERS_KEY, remaining);
  return true;
}

// Lọc + tìm kiếm phía client, thay bằng query param khi nối API.
export function filterUsers({ keyword = "", role = "", status = "" } = {}) {
  const q = normalize(keyword.trim());
  return getUsers().filter((user) => {
    if (role && user.role !== role) return false;
    if (status && user.status !== status) return false;
    if (!q) return true;
    return (
      normalize(user.fullName).includes(q) ||
      normalize(user.email).includes(q) ||
      normalize(user.phone).includes(q)
    );
  });
}

export function getUserStats() {
  const users = readUsers();
  return {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    locked: users.filter((u) => u.status === "locked").length,
    // Khách hàng đăng ký trong 30 ngày gần nhất.
    newThisMonth: users.filter(
      (u) => Date.now() - new Date(u.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000
    ).length,
  };
}

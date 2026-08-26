// Dữ liệu mock cho màn hình Quản lý đơn hàng (admin).
// Hiện tại tách riêng với đơn của user site (data/orders.js) vì chưa có API;
// khi backend có /api/admin/orders thì cả hai màn hình sẽ đọc chung một nguồn.

import { getAllProducts } from "./products";
import { loadCollection, saveCollection, normalize } from "./localStore";

const ORDERS_KEY = "fd_admin_orders";

export const SHIPPING_FEE = 20000;
export const FREE_SHIPPING_THRESHOLD = 300000;

export const ORDER_STATUSES = [
  { value: "Chờ xác nhận", badge: "bg-warning-subtle text-warning", icon: "fa-clock" },
  { value: "Đã xác nhận", badge: "bg-info-subtle text-info", icon: "fa-clipboard-check" },
  { value: "Đang giao", badge: "bg-primary-subtle text-primary", icon: "fa-truck-fast" },
  { value: "Hoàn thành", badge: "bg-success-subtle text-success", icon: "fa-circle-check" },
  { value: "Đã huỷ", badge: "bg-danger-subtle text-danger", icon: "fa-ban" },
];

// Trạng thái kế tiếp hợp lệ — dùng để chỉ cho phép chuyển đúng luồng xử lý đơn.
const NEXT_STATUSES = {
  "Chờ xác nhận": ["Đã xác nhận", "Đã huỷ"],
  "Đã xác nhận": ["Đang giao", "Đã huỷ"],
  "Đang giao": ["Hoàn thành", "Đã huỷ"],
  "Hoàn thành": [],
  "Đã huỷ": [],
};

export function getNextStatuses(current) {
  return NEXT_STATUSES[current] || [];
}

export function getStatusBadge(value) {
  return ORDER_STATUSES.find((s) => s.value === value)?.badge || "bg-secondary-subtle text-secondary";
}

export function getStatusIcon(value) {
  return ORDER_STATUSES.find((s) => s.value === value)?.icon || "fa-circle";
}

export const PAYMENT_METHODS = [
  { value: "cod", label: "Thanh toán khi nhận hàng (COD)" },
  { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
];

export function getPaymentLabel(value) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label || value;
}

const CUSTOMERS = [
  { userId: 2, fullName: "Trần Thị Mai", phone: "0912345678", email: "mai.tran@gmail.com", address: "45 Lê Lợi, Quận 3, TP.HCM" },
  { userId: 3, fullName: "Lê Văn Hùng", phone: "0987654321", email: "hungle92@gmail.com", address: "78 Trần Phú, Hải Châu, Đà Nẵng" },
  { userId: 4, fullName: "Phạm Thu Hà", phone: "0934567890", email: "ha.pham@outlook.com", address: "12 Ngõ 5 Cầu Giấy, Hà Nội" },
  { userId: 6, fullName: "Vũ Minh Anh", phone: "0956789012", email: "minhanh.vu@gmail.com", address: "9 Nguyễn Trãi, Thanh Xuân, Hà Nội" },
  { userId: 7, fullName: "Hoàng Mạnh Dũng", phone: "0967890123", email: "dung.hoang@gmail.com", address: "88 Điện Biên Phủ, Bình Thạnh, TP.HCM" },
  { userId: 8, fullName: "Bùi Thanh Trung", phone: "0978901234", email: "trung.bui@yahoo.com", address: "154 Hùng Vương, Ninh Kiều, Cần Thơ" },
  { userId: 9, fullName: "Ngô Kiều Trinh", phone: "0989012345", email: "trinh.ngo@gmail.com", address: "31 Bà Triệu, Hai Bà Trưng, Hà Nội" },
  { userId: 11, fullName: "Trịnh Hải Yến", phone: "0901112223", email: "yen.trinh@gmail.com", address: "67 Nguyễn Văn Cừ, Long Biên, Hà Nội" },
  { userId: 12, fullName: "Lý Gia Khang", phone: "0902223334", email: "khang.ly@gmail.com", address: "20 Hai Bà Trưng, Nha Trang, Khánh Hoà" },
];

const NOTES = [
  "",
  "Giao giờ hành chính giúp mình nhé.",
  "Gọi trước khi giao 15 phút.",
  "",
  "Để hàng ở quầy lễ tân toà nhà.",
  "",
];

// Bộ sinh số giả ngẫu nhiên có hạt giống cố định, để dữ liệu mock không đổi mỗi lần chạy.
function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function calcShippingFee(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

function buildSeed() {
  const products = getAllProducts();
  const random = createRandom(20260822);
  const orders = [];
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 42; i += 1) {
    const customer = CUSTOMERS[Math.floor(random() * CUSTOMERS.length)];
    const itemCount = 1 + Math.floor(random() * 4);
    const picked = new Set();
    const items = [];

    for (let j = 0; j < itemCount; j += 1) {
      const product = products[Math.floor(random() * products.length)];
      if (picked.has(product.id)) continue;
      picked.add(product.id);
      items.push({
        productId: product.id,
        name: product.name,
        image: product.images[0],
        unit: product.unit,
        price: product.price,
        quantity: 1 + Math.floor(random() * 3),
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = calcShippingFee(subtotal);
    // 10 đơn đầu được đặt trong vòng một tuần để luôn có đơn đang xử lý dở,
    // số còn lại rải đều 7 tháng gần nhất làm dữ liệu doanh thu.
    const daysAgo = i < 10 ? i % 6 : 6 + Math.floor(random() * 200);
    const createdAt = new Date(now - daysAgo * DAY - Math.floor(random() * DAY));

    let status;
    if (daysAgo < 2) status = "Chờ xác nhận";
    else if (daysAgo < 5) status = random() < 0.5 ? "Đã xác nhận" : "Đang giao";
    else status = random() < 0.12 ? "Đã huỷ" : "Hoàn thành";

    orders.push({
      id: `DH${createdAt.getFullYear()}${String(createdAt.getMonth() + 1).padStart(2, "0")}${String(1000 + i)}`,
      userId: customer.userId,
      customer: {
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
      },
      shippingInfo: {
        fullName: customer.fullName,
        phone: customer.phone,
        address: customer.address,
        note: NOTES[Math.floor(random() * NOTES.length)],
      },
      items,
      paymentMethod: random() < 0.7 ? "cod" : "bank_transfer",
      subtotal,
      shippingFee,
      total: subtotal + shippingFee,
      status,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      history: [{ status: "Chờ xác nhận", at: createdAt.toISOString() }],
    });
  }

  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function readOrders() {
  return loadCollection(ORDERS_KEY, buildSeed);
}

export function getOrders() {
  return readOrders().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getOrderById(id) {
  return readOrders().find((o) => String(o.id) === String(id)) || null;
}

export function updateOrderStatus(id, status) {
  const orders = readOrders();
  const index = orders.findIndex((o) => String(o.id) === String(id));
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updated = {
    ...orders[index],
    status,
    updatedAt: now,
    history: [...(orders[index].history || []), { status, at: now }],
  };
  orders[index] = updated;
  saveCollection(ORDERS_KEY, orders);
  return updated;
}

export function filterOrders({
  keyword = "",
  status = "",
  payment = "",
  fromDate = "",
  toDate = "",
  sort = "newest",
} = {}) {
  const q = normalize(keyword.trim());
  const from = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
  const to = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null;

  const result = getOrders().filter((order) => {
    if (status && order.status !== status) return false;
    if (payment && order.paymentMethod !== payment) return false;

    const createdAt = new Date(order.createdAt).getTime();
    if (from !== null && createdAt < from) return false;
    if (to !== null && createdAt > to) return false;

    if (!q) return true;
    return (
      normalize(order.id).includes(q) ||
      normalize(order.customer.fullName).includes(q) ||
      normalize(order.customer.phone).includes(q) ||
      normalize(order.customer.email).includes(q)
    );
  });

  const sorters = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    "total-desc": (a, b) => b.total - a.total,
    "total-asc": (a, b) => a.total - b.total,
  };

  return result.sort(sorters[sort] || sorters.newest);
}

export const ORDER_SORTS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "total-desc", label: "Giá trị cao nhất" },
  { value: "total-asc", label: "Giá trị thấp nhất" },
];

// Đơn đã huỷ không tính vào doanh thu.
function isRevenueOrder(order) {
  return order.status !== "Đã huỷ";
}

export function getOrderStats() {
  const orders = readOrders();
  const revenueOrders = orders.filter(isRevenueOrder);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const revenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Chờ xác nhận").length,
    shipping: orders.filter((o) => o.status === "Đang giao").length,
    completed: orders.filter((o) => o.status === "Hoàn thành").length,
    cancelled: orders.filter((o) => o.status === "Đã huỷ").length,
    revenue,
    averageValue: revenueOrders.length ? Math.round(revenue / revenueOrders.length) : 0,
    revenueThisMonth: revenueOrders
      .filter((o) => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + o.total, 0),
  };
}


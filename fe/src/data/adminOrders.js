

import { getAllProducts } from "./products";
import { loadCollection, saveCollection, normalize } from "./localStore";

const ORDERS_KEY = "fd_admin_orders";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export const SHIPPING_FEE = 20000;
export const FREE_SHIPPING_THRESHOLD = 300000;


// Danh sách 6 trạng thái chuẩn khớp chính xác với SQL Constraint (chk_orders_status)
export const ORDER_STATUSES = [
  { value: "PENDING", label: "Chờ xác nhận", badge: "bg-warning-subtle text-warning", icon: "fa-clock" },
  { value: "CONFIRMED", label: "Đã xác nhận", badge: "bg-info-subtle text-info", icon: "fa-clipboard-check" },
  { value: "PREPARING", label: "Đang chuẩn bị", badge: "bg-primary-subtle text-primary", icon: "fa-box-open" },
  { value: "DELIVERING", label: "Đang giao hàng", badge: "bg-primary-subtle text-primary", icon: "fa-truck-fast" },
  { value: "COMPLETED", label: "Hoàn thành", badge: "bg-success-subtle text-success", icon: "fa-circle-check" },
  { value: "CANCELLED", label: "Đã huỷ", badge: "bg-danger-subtle text-danger", icon: "fa-ban" },
];

const ALL_STATUS_MAP = [
  ...ORDER_STATUSES,
  { value: "SHIPPED", label: "Đang giao hàng", badge: "bg-primary-subtle text-primary", icon: "fa-truck-fast" },
  { value: "Chờ xác nhận", label: "Chờ xác nhận", badge: "bg-warning-subtle text-warning", icon: "fa-clock" },
  { value: "Đã xác nhận", label: "Đã xác nhận", badge: "bg-info-subtle text-info", icon: "fa-clipboard-check" },
  { value: "Đang giao", label: "Đang giao hàng", badge: "bg-primary-subtle text-primary", icon: "fa-truck-fast" },
  { value: "Hoàn thành", label: "Hoàn thành", badge: "bg-success-subtle text-success", icon: "fa-circle-check" },
  { value: "Đã huỷ", label: "Đã huỷ", badge: "bg-danger-subtle text-danger", icon: "fa-ban" },
];


export function getNextStatuses(current) {
  return ORDER_STATUSES
    .map((s) => s.value)
    .filter((val) => val !== current && getStatusLabel(val) !== getStatusLabel(current));
}

export function getStatusBadge(value) {
  return ALL_STATUS_MAP.find((s) => s.value === value)?.badge || "bg-secondary-subtle text-secondary";
}

export function getStatusIcon(value) {
  return ALL_STATUS_MAP.find((s) => s.value === value)?.icon || "fa-circle";
}

export function getStatusLabel(value) {
  return ALL_STATUS_MAP.find((s) => s.value === value)?.label || value;
}

export const PAYMENT_METHODS = [
  { value: "cod", label: "Thanh toán khi nhận hàng (COD)" },
  { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
];

export function getPaymentLabel(value) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label || value;
}

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function normalizeBackendOrder(dto) {
  if (!dto) return null;
  const allProds = getAllProducts();
  const items = (dto.items || []).map((item) => {
    let imgUrl = item.productImageUrl || item.image || item.imageUrl;
    const foundProd = allProds.find(
      (p) => p.id === item.productId || String(p.id) === String(item.productId)
    );

    if (!imgUrl && foundProd && foundProd.images && foundProd.images.length > 0) {
      imgUrl = foundProd.images[0];
    }
    if (!imgUrl) {
      imgUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150";
    }

    return {
      id: item.id,
      productId: item.productId,
      name: item.productName || item.name || foundProd?.name || "Sản phẩm",
      image: imgUrl,
      productImageUrl: imgUrl,
      unit: item.unit || foundProd?.unit || "phần",
      price: Number(item.unitPrice || item.price || 0),
      quantity: Number(item.quantity || 1),
      subtotal: Number(item.subtotal || (item.unitPrice || 0) * (item.quantity || 1)),
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const total = Number(dto.totalAmount != null ? dto.totalAmount : subtotal);
  const shippingFee = Math.max(0, total - subtotal);

  return {
    id: dto.id,
    userId: dto.userId,
    customer: {
      fullName: dto.recipientName || `Khách hàng #${dto.userId || ""}`,
      phone: dto.recipientPhone || "N/A",
      email: dto.recipientEmail || "N/A",
    },
    shippingInfo: {
      fullName: dto.recipientName || `Khách hàng #${dto.userId || ""}`,
      phone: dto.recipientPhone || "N/A",
      address: dto.deliveryAddress || "Chưa có địa chỉ",
      note: dto.note || "",
    },
    items,
    paymentMethod: dto.paymentMethod || "cod",
    subtotal,
    shippingFee,
    total,
    status: dto.status || "PENDING",
    createdAt: dto.createdAt || new Date().toISOString(),
    updatedAt: dto.updatedAt || new Date().toISOString(),
    history: [
      { status: dto.status || "PENDING", at: dto.updatedAt || dto.createdAt || new Date().toISOString() },
    ],
  };
}

export async function fetchAdminOrdersApi() {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || (data.status && data.status >= 400)) {
    throw new Error(data.message || "Không thể lấy danh sách đơn hàng từ backend.");
  }
  const rawList = data.data || [];
  return rawList.map(normalizeBackendOrder);
}

export async function fetchAdminOrderByIdApi(id) {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || (data.status && data.status >= 400)) {
    throw new Error(data.message || `Không thể lấy chi tiết đơn hàng #${id} từ backend.`);
  }
  return normalizeBackendOrder(data.data);
}

export async function updateAdminOrderStatusApi(id, statusEnum) {
  const res = await fetch(`${API_BASE_URL}/api/admin/orders/${id}/status?status=${encodeURIComponent(statusEnum)}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || (data.status && data.status >= 400)) {
    throw new Error(data.message || "Cập nhật trạng thái đơn hàng thất bại.");
  }
  return normalizeBackendOrder(data.data);
}

// ---- Phù hợp với Mock Data (Fallback khi chưa kết nối BE) ----

const CUSTOMERS = [
  { userId: 2, fullName: "Trần Thị Mai", phone: "0912345678", email: "mai.tran@gmail.com", address: "45 Lê Lợi, Quận 3, TP.HCM" },
  { userId: 3, fullName: "Lê Văn Hùng", phone: "0987654321", email: "hungle92@gmail.com", address: "78 Trần Phú, Hải Châu, Đà Nẵng" },
  { userId: 4, fullName: "Phạm Thu Hà", phone: "0934567890", email: "ha.pham@outlook.com", address: "12 Ngõ 5 Cầu Giấy, Hà Nội" },
];

const NOTES = ["", "Giao giờ hành chính giúp mình nhé.", "Gọi trước khi giao 15 phút."];

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
    const daysAgo = i < 10 ? i % 6 : 6 + Math.floor(random() * 200);
    const createdAt = new Date(now - daysAgo * DAY - Math.floor(random() * DAY));

    let status;
    if (daysAgo < 2) status = "PENDING";
    else if (daysAgo < 5) status = random() < 0.5 ? "CONFIRMED" : "SHIPPED";
    else status = random() < 0.12 ? "CANCELLED" : "COMPLETED";

    orders.push({
      id: i + 1,
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
      history: [{ status: "PENDING", at: createdAt.toISOString() }],
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

export function filterOrders(
  ordersList = null,
  { keyword = "", status = "", payment = "", fromDate = "", toDate = "", sort = "newest" } = {}
) {
  const source = ordersList || getOrders();
  const q = normalize(keyword.trim());
  const from = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
  const to = toDate ? new Date(`${toDate}T23:59:59`).getTime() : null;

  const result = source.filter((order) => {
    if (status) {
      const matchStatus =
        order.status === status ||
        getStatusLabel(order.status) === getStatusLabel(status);

      if (!matchStatus) return false;
    }
    if (payment && order.paymentMethod !== payment) return false;

    const createdAt = new Date(order.createdAt).getTime();
    if (from !== null && createdAt < from) return false;
    if (to !== null && createdAt > to) return false;

    if (!q) return true;
    return (
      normalize(String(order.id)).includes(q) ||
      normalize(order.customer?.fullName || "").includes(q) ||
      normalize(order.customer?.phone || "").includes(q) ||
      normalize(order.customer?.email || "").includes(q)
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

function isRevenueOrder(order) {
  return order.status !== "CANCELLED" && order.status !== "Đã huỷ";
}

export function getOrderStats(ordersList = null) {
  const orders = ordersList || readOrders();
  const revenueOrders = orders.filter(isRevenueOrder);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const revenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING" || o.status === "Chờ xác nhận").length,
    shipping: orders.filter((o) => o.status === "SHIPPED" || o.status === "DELIVERING" || o.status === "Đang giao" || o.status === "Đang giao hàng").length,
    completed: orders.filter((o) => o.status === "COMPLETED" || o.status === "Hoàn thành" || o.status === "DELIVERED" || o.status === "Đã giao hàng").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED" || o.status === "Đã huỷ").length,
    revenue,
    averageValue: revenueOrders.length ? Math.round(revenue / revenueOrders.length) : 0,
    revenueThisMonth: revenueOrders
      .filter((o) => new Date(o.createdAt) >= startOfMonth)
      .reduce((sum, o) => sum + o.total, 0),
  };
}

export function getRevenueByMonth(months = 6, ordersList = null) {
  const orders = (ordersList || readOrders()).filter(isRevenueOrder);
  const buckets = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - i);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: `T${date.getMonth() + 1}`,
      year: date.getFullYear(),
      revenue: 0,
      orderCount: 0,
    });
  }

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const bucket = buckets.find((b) => b.key === `${date.getFullYear()}-${date.getMonth()}`);
    if (bucket) {
      bucket.revenue += order.total;
      bucket.orderCount += 1;
    }
  });

  return buckets;
}

export function getTopProducts(limit = 5, ordersList = null) {
  const tally = new Map();
  const orders = (ordersList || readOrders()).filter(isRevenueOrder);

  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const current = tally.get(item.productId) || {
        productId: item.productId,
        name: item.name,
        image: item.image,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += item.quantity;
      current.revenue += item.price * item.quantity;
      tally.set(item.productId, current);
    });
  });

  return [...tally.values()].sort((a, b) => b.quantity - a.quantity).slice(0, limit);
}

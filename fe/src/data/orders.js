// Lưu trữ đơn hàng phía client, tạm thời qua localStorage.
// Khi nối API thật: thay các hàm bên dưới bằng lời gọi GET/POST tới /api/orders,
// phần UI (Checkout.jsx, OrderHistory.jsx) không cần đổi.

const ORDERS_KEY = "fd_orders";

export const ORDER_STATUS = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
};

export const PAYMENT_METHODS = [
  { value: "cod", label: "Thanh toán khi nhận hàng (COD)" },
  { value: "bank_transfer", label: "Chuyển khoản ngân hàng" },
];

export const SHIPPING_FEE = 20000;
export const FREE_SHIPPING_THRESHOLD = 300000;

function readOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function createOrder({ userId, items, shippingInfo, paymentMethod, subtotal, shippingFee, total }) {
  const order = {
    id: `DH${Date.now()}`,
    userId,
    items,
    shippingInfo,
    paymentMethod,
    subtotal,
    shippingFee,
    total,
    status: ORDER_STATUS.PENDING,
    createdAt: new Date().toISOString(),
  };
  writeOrders([order, ...readOrders()]);
  return order;
}

export function getOrdersByUser(userId) {
  return readOrders()
    .filter((o) => String(o.userId) === String(userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getOrderById(orderId) {
  return readOrders().find((o) => o.id === orderId) || null;
}

export function calcShippingFee(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

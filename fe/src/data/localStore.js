// Tiện ích đọc/ghi dữ liệu mock xuống localStorage.
// Mỗi module admin dùng một key riêng; lần chạy đầu tiên sẽ nạp dữ liệu seed.
// Khi nối API thật: bỏ file này, thay các hàm trong adminUsers/adminCategories/
// adminProducts/adminOrders bằng lời gọi fetch — phần UI không cần sửa.

export function loadCollection(key, seedFactory) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Dữ liệu hỏng thì bỏ qua và nạp lại seed.
  }
  const seed = seedFactory();
  saveCollection(key, seed);
  return seed;
}

// Sự kiện phát ra sau mỗi lần ghi, để những chỗ hiển thị số liệu tổng hợp
// (badge trên sidebar chẳng hạn) biết mà tính lại.
export const STORE_CHANGED_EVENT = "fd-admin-store-changed";

export function saveCollection(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(STORE_CHANGED_EVENT, { detail: { key } }));
    return true;
  } catch (err) {
    // Thường gặp khi ảnh base64 làm vượt hạn mức ~5MB của localStorage.
    console.error(`Không lưu được "${key}" xuống localStorage:`, err);
    return false;
  }
}

export function resetCollection(key) {
  localStorage.removeItem(key);
}

// Sinh id tăng dần cho bản ghi mới.
export function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

// Chuẩn hoá chuỗi để tìm kiếm không phân biệt hoa thường và dấu tiếng Việt.
export function normalize(str = "") {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/đ/g, "d");
}

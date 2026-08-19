// Các hàm tiện ích dùng chung cho hiển thị và lọc sản phẩm.

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatPrice(value) {
  if (value === null || value === undefined) return "";
  return currencyFormatter.format(value);
}

// Bỏ dấu tiếng Việt để so khớp tìm kiếm và lấy chữ cái đầu.
export function removeDiacritics(str = "") {
  return str
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// Chữ cái đầu (A-Z) của tên sản phẩm, dùng cho bộ lọc theo bảng chữ cái.
export function getInitialLetter(name = "") {
  const letter = removeDiacritics(name.trim()).charAt(0).toUpperCase();
  return /[A-Z]/.test(letter) ? letter : "#";
}

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function calcDiscountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

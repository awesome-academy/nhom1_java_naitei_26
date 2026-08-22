// Dữ liệu mock cho màn hình Quản lý sản phẩm (admin).
// Seed lấy từ catalog của user site, sau đó admin thêm/sửa/xoá trên bản localStorage.
// Khi backend có API: thay phần thân các hàm bên dưới bằng fetch tới /api/admin/products,
// riêng ảnh sẽ upload qua multipart thay vì lưu base64 như hiện tại.

import { getAllProducts } from "./products";
import { loadCollection, saveCollection, nextId, normalize } from "./localStore";
import { slugify } from "./adminCategories";

const PRODUCTS_KEY = "fd_admin_products";

// Ngưỡng cảnh báo tồn kho thấp trên Dashboard và bộ lọc kho.
export const LOW_STOCK_THRESHOLD = 20;

// Ảnh base64 lưu trong localStorage rất tốn chỗ (hạn mức ~5MB cho cả domain),
// nên chặn file quá lớn ngay từ form.
export const MAX_IMAGE_SIZE = 500 * 1024;

export const STOCK_FILTERS = [
  { value: "in", label: "Còn hàng" },
  { value: "low", label: "Sắp hết" },
  { value: "out", label: "Hết hàng" },
];

export function getStockLevel(stock) {
  if (stock <= 0) return "out";
  if (stock < LOW_STOCK_THRESHOLD) return "low";
  return "in";
}

export function getStockBadge(stock) {
  const level = getStockLevel(stock);
  if (level === "out") return "bg-danger-subtle text-danger";
  if (level === "low") return "bg-warning-subtle text-warning";
  return "bg-success-subtle text-success";
}

export function getStockLabel(stock) {
  const level = getStockLevel(stock);
  return STOCK_FILTERS.find((f) => f.value === level)?.label || "";
}

function buildSeed() {
  return getAllProducts().map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    type: product.type,
    category: product.category,
    brand: product.brand,
    price: product.price,
    oldPrice: product.oldPrice || 0,
    unit: product.unit,
    stock: product.stock,
    images: product.images || [],
    shortDescription: product.shortDescription || "",
    description: product.description || "",
    origin: product.origin || "",
    expiry: product.expiry || "",
    storage: product.storage || "",
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    active: true,
    createdAt: new Date(2025, 10, 2 + product.id).toISOString(),
  }));
}

function readProducts() {
  return loadCollection(PRODUCTS_KEY, buildSeed);
}

export function getProducts() {
  return readProducts();
}

export function getProductById(id) {
  return readProducts().find((p) => String(p.id) === String(id)) || null;
}

export function isSlugTaken(slug, exceptId = null) {
  return readProducts().some(
    (p) => p.slug === slug && String(p.id) !== String(exceptId)
  );
}

// Danh sách thương hiệu hiện có, dùng cho gợi ý trong form và bộ lọc.
export function getBrands() {
  return [...new Set(readProducts().map((p) => p.brand).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "vi")
  );
}

export function countProductsByCategory(slug) {
  return readProducts().filter((p) => p.category === slug).length;
}

function normalizeInput(data, fallback = {}) {
  return {
    name: (data.name ?? fallback.name ?? "").trim(),
    slug: (data.slug ?? fallback.slug ?? "").trim() || slugify(data.name ?? fallback.name ?? ""),
    type: data.type ?? fallback.type ?? "food",
    category: data.category ?? fallback.category ?? "",
    brand: (data.brand ?? fallback.brand ?? "").trim(),
    price: Number(data.price ?? fallback.price ?? 0),
    oldPrice: Number(data.oldPrice ?? fallback.oldPrice ?? 0),
    unit: (data.unit ?? fallback.unit ?? "").trim(),
    stock: Number(data.stock ?? fallback.stock ?? 0),
    images: data.images ?? fallback.images ?? [],
    shortDescription: (data.shortDescription ?? fallback.shortDescription ?? "").trim(),
    description: (data.description ?? fallback.description ?? "").trim(),
    origin: (data.origin ?? fallback.origin ?? "").trim(),
    expiry: (data.expiry ?? fallback.expiry ?? "").trim(),
    storage: (data.storage ?? fallback.storage ?? "").trim(),
    active: data.active ?? fallback.active ?? true,
  };
}

export function createProduct(data) {
  const products = readProducts();
  const product = {
    id: nextId(products),
    ...normalizeInput(data),
    rating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString(),
  };
  const saved = saveCollection(PRODUCTS_KEY, [product, ...products]);
  if (!saved) throw new Error("Bộ nhớ trình duyệt đã đầy, hãy bớt ảnh rồi lưu lại.");
  return product;
}

export function updateProduct(id, data) {
  const products = readProducts();
  const index = products.findIndex((p) => String(p.id) === String(id));
  if (index === -1) return null;

  const updated = {
    ...products[index],
    ...normalizeInput(data, products[index]),
    id: products[index].id,
  };
  products[index] = updated;
  const saved = saveCollection(PRODUCTS_KEY, products);
  if (!saved) throw new Error("Bộ nhớ trình duyệt đã đầy, hãy bớt ảnh rồi lưu lại.");
  return updated;
}

export function deleteProduct(id) {
  const products = readProducts();
  const remaining = products.filter((p) => String(p.id) !== String(id));
  if (remaining.length === products.length) return false;
  saveCollection(PRODUCTS_KEY, remaining);
  return true;
}

export function filterProducts({
  keyword = "",
  type = "",
  category = "",
  brand = "",
  stock = "",
  sort = "newest",
} = {}) {
  const q = normalize(keyword.trim());

  const result = readProducts().filter((product) => {
    if (type && product.type !== type) return false;
    if (category && product.category !== category) return false;
    if (brand && product.brand !== brand) return false;
    if (stock && getStockLevel(product.stock) !== stock) return false;
    if (!q) return true;
    return (
      normalize(product.name).includes(q) ||
      normalize(product.brand).includes(q) ||
      normalize(product.slug).includes(q)
    );
  });

  const sorters = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    "name-asc": (a, b) => a.name.localeCompare(b.name, "vi"),
    "name-desc": (a, b) => b.name.localeCompare(a.name, "vi"),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "stock-asc": (a, b) => a.stock - b.stock,
    "stock-desc": (a, b) => b.stock - a.stock,
  };

  return result.sort(sorters[sort] || sorters.newest);
}

export const PRODUCT_SORTS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "name-asc", label: "Tên A → Z" },
  { value: "name-desc", label: "Tên Z → A" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "stock-asc", label: "Tồn kho ít nhất" },
  { value: "stock-desc", label: "Tồn kho nhiều nhất" },
];

export function getProductStats() {
  const products = readProducts();
  return {
    total: products.length,
    outOfStock: products.filter((p) => p.stock <= 0).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD).length,
    inventoryValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
  };
}

// Sản phẩm cần nhập thêm, sắp xếp theo tồn kho ít nhất (hiển thị ở Dashboard).
export function getLowStockProducts(limit = 5) {
  return readProducts()
    .filter((p) => p.stock < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit);
}

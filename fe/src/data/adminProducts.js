// Product management for admin - fetches from database API with caching
import { normalize } from "./localStore";
import { slugify } from "./adminCategories";
import { refreshProducts } from "./products";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

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

// Map API product to frontend format
function mapApiProduct(apiProduct) {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    type: apiProduct.type ? apiProduct.type.toLowerCase() : "food",
    category: apiProduct.categorySlug,
    categoryName: apiProduct.categoryName,
    brand: apiProduct.brand || "",
    price: apiProduct.price,
    oldPrice: apiProduct.oldPrice || 0,
    unit: apiProduct.unit || "",
    stock: apiProduct.stockQuantity || 0,
    images: apiProduct.images || [],
    shortDescription: apiProduct.shortDescription || "",
    description: apiProduct.description || "",
    origin: apiProduct.origin || "",
    expiry: apiProduct.expiry || "",
    storage: apiProduct.storage || "",
    rating: apiProduct.rating || 0,
    reviewCount: apiProduct.reviewCount || 0,
    active: apiProduct.status === "ACTIVE",
    categoryId: apiProduct.categoryId,
    createdAt: apiProduct.createdAt,
    updatedAt: apiProduct.updatedAt,
  };
}

// Map frontend product to API request body
function mapToApiBody(data) {
  return {
    name: data.name,
    slug: data.slug,
    type: data.type ? data.type.toUpperCase() : "FOOD",
    categoryId: data.categoryId,
    brand: data.brand || null,
    price: data.price,
    oldPrice: data.oldPrice || null,
    unit: data.unit || null,
    stockQuantity: data.stock,
    shortDescription: data.shortDescription || null,
    description: data.description || null,
    origin: data.origin || null,
    expiry: data.expiry || null,
    storage: data.storage || null,
    status: data.active ? "ACTIVE" : "INACTIVE",
    images: data.images || [],
  };
}

// ===== CACHE =====
let _productsCache = null;
let _productsCachePromise = null;

function clearCache() {
  _productsCache = null;
  _productsCachePromise = null;
}

export async function loadAdminProducts() {
  // Return cache if available
  if (_productsCache) return _productsCache;
  
  // If already fetching, wait for that promise
  if (_productsCachePromise) return _productsCachePromise;
  
  _productsCachePromise = fetch(`${API_BASE_URL}/api/products?size=1000`, {
    headers: getAuthHeaders(),
    credentials: "include"
  })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (data.data && data.data.content) {
        _productsCache = data.data.content.map(mapApiProduct);
        return _productsCache;
      }
      _productsCache = [];
      return _productsCache;
    })
    .catch(err => {
      console.error("Failed to load products from API", err);
      _productsCache = [];
      return _productsCache;
    })
    .finally(() => {
      _productsCachePromise = null;
    });
  
  return _productsCachePromise;
}

// ===== SYNCHRONOUS HELPERS (use cache) =====

// Get products from cache (must call loadAdminProducts first)
export function getProducts() {
  return _productsCache || [];
}

// Get product by ID from cache
export function getProductById(id) {
  const products = _productsCache || [];
  return products.find((p) => String(p.id) === String(id)) || null;
}

// Check if slug is taken
export function isSlugTaken(slug, exceptId = null) {
  const products = _productsCache || [];
  return products.some(
    (p) => p.slug === slug && String(p.id) !== String(exceptId)
  );
}

// Get unique brands
export function getBrands() {
  const products = _productsCache || [];
  return [...new Set(products.map((p) => p.brand).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "vi")
  );
}

// Count products by category slug
export function countProductsByCategory(slug) {
  const products = _productsCache || [];
  return products.filter((p) => p.category === slug).length;
}

// Get products count by category slug
export function countProductsByCategoryId(categoryId) {
  const products = _productsCache || [];
  return products.filter((p) => p.categoryId === categoryId).length;
}

// ===== ASYNC OPERATIONS (mutate cache) =====

export async function createProduct(data) {
  const body = mapToApiBody(data);
  try {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const result = await res.json();
    clearCache(); // Invalidate admin cache
    refreshProducts().catch(() => {}); // Sync user-facing data
    return mapApiProduct(result.data);
  } catch (err) {
    console.error("Failed to create product", err);
    throw err;
  }
}

export async function updateProduct(id, data) {
  const body = mapToApiBody(data);
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const result = await res.json();
    clearCache(); // Invalidate admin cache
    refreshProducts().catch(() => {}); // Sync user-facing data
    return mapApiProduct(result.data);
  } catch (err) {
    console.error("Failed to update product", err);
    throw err;
  }
}

export async function deleteProduct(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    clearCache(); // Invalidate admin cache
    refreshProducts().catch(() => {}); // Sync user-facing data
    return true;
  } catch (err) {
    console.error("Failed to delete product", err);
    throw err;
  }
}

export function filterProducts({
  keyword = "",
  type = "",
  category = "",
  brand = "",
  stock = "",
  sort = "newest",
} = {}) {
  const products = _productsCache || [];
  const q = normalize(keyword.trim());

  const result = products.filter((product) => {
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
  const products = _productsCache || [];
  return {
    total: products.length,
    outOfStock: products.filter((p) => p.stock <= 0).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD).length,
    inventoryValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
  };
}

// Sản phẩm cần nhập thêm, sắp xếp theo tồn kho ít nhất (hiển thị ở Dashboard).
export function getLowStockProducts(limit = 5) {
  const products = _productsCache || [];
  return products
    .filter((p) => p.stock < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit);
}

export { loadAdminProducts as loadAdminProductsFromApi };

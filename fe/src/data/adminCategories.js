// Dữ liệu mock cho màn hình Quản lý danh mục sản phẩm (admin).
// Seed lấy từ CATEGORIES của user site để hai bên hiển thị giống nhau.
// Khi backend có API: thay phần thân các hàm bên dưới bằng fetch tới /api/admin/categories.

import { CATEGORIES, PRODUCT_TYPES } from "./products";
import { loadCollection, saveCollection, nextId, normalize } from "./localStore";

const CATEGORIES_KEY = "fd_admin_categories";

export { PRODUCT_TYPES };

export function getTypeLabel(value) {
  return PRODUCT_TYPES.find((t) => t.value === value)?.label || value;
}

const SEED_DESCRIPTIONS = {
  "rau-cu-trai-cay": "Rau xanh, củ quả và trái cây tươi nhập mỗi sáng.",
  "thit-ca-hai-san": "Thịt tươi, cá và hải sản bảo quản lạnh.",
  "sua-trung": "Sữa tươi, bơ, phô mai và trứng các loại.",
  "banh-ngu-coc": "Bánh mì, bánh ngọt và ngũ cốc ăn sáng.",
  "do-an-vat": "Snack, bánh kẹo và đồ ăn vặt đóng gói.",
  "thuc-pham-che-bien": "Đồ hộp, thực phẩm đông lạnh và món ăn liền.",
  "nuoc-giai-khat": "Nước ngọt, nước khoáng và nước tăng lực.",
  "nuoc-ep-sinh-to": "Nước ép trái cây và sinh tố đóng chai.",
  "tra-ca-phe": "Trà, cà phê hoà tan và cà phê rang xay.",
  "sua-uong": "Sữa uống liền, sữa chua uống và yogurt.",
};

// Chuyển tên danh mục thành slug (dùng khi thêm danh mục mới).
export function slugify(name = "") {
  return normalize(name)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function buildSeed() {
  return CATEGORIES.map((category, index) => ({
    id: index + 1,
    name: category.name,
    slug: category.slug,
    type: category.type,
    description: SEED_DESCRIPTIONS[category.slug] || "",
    sortOrder: index + 1,
    active: true,
    createdAt: new Date(2025, 10, 2 + index).toISOString(),
  }));
}

function readCategories() {
  return loadCollection(CATEGORIES_KEY, buildSeed);
}

export function getCategories() {
  return readCategories().sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryById(id) {
  return readCategories().find((c) => String(c.id) === String(id)) || null;
}

export function getCategoryNameBySlug(slug) {
  return readCategories().find((c) => c.slug === slug)?.name || slug;
}

// Slug phải là duy nhất vì user site dùng nó để lọc sản phẩm.
export function isSlugTaken(slug, exceptId = null) {
  return readCategories().some(
    (c) => c.slug === slug && String(c.id) !== String(exceptId)
  );
}

export function createCategory(data) {
  const categories = readCategories();
  const category = {
    id: nextId(categories),
    name: data.name.trim(),
    slug: data.slug?.trim() || slugify(data.name),
    type: data.type || "food",
    description: data.description?.trim() || "",
    sortOrder: Number(data.sortOrder) || categories.length + 1,
    active: data.active !== false,
    createdAt: new Date().toISOString(),
  };
  saveCollection(CATEGORIES_KEY, [...categories, category]);
  return category;
}

export function updateCategory(id, patch) {
  const categories = readCategories();
  const index = categories.findIndex((c) => String(c.id) === String(id));
  if (index === -1) return null;

  const updated = {
    ...categories[index],
    ...patch,
    name: (patch.name ?? categories[index].name).trim(),
    slug: (patch.slug ?? categories[index].slug).trim(),
    sortOrder: Number(patch.sortOrder ?? categories[index].sortOrder),
    id: categories[index].id,
  };
  categories[index] = updated;
  saveCollection(CATEGORIES_KEY, categories);
  return updated;
}

export function deleteCategory(id) {
  const categories = readCategories();
  const remaining = categories.filter((c) => String(c.id) !== String(id));
  if (remaining.length === categories.length) return false;
  saveCollection(CATEGORIES_KEY, remaining);
  return true;
}

export function filterCategories({ keyword = "", type = "", active = "" } = {}) {
  const q = normalize(keyword.trim());
  return getCategories().filter((category) => {
    if (type && category.type !== type) return false;
    if (active !== "" && String(category.active) !== active) return false;
    if (!q) return true;
    return (
      normalize(category.name).includes(q) ||
      normalize(category.slug).includes(q) ||
      normalize(category.description).includes(q)
    );
  });
}

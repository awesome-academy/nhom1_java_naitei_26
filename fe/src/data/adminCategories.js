import { PRODUCT_TYPES } from "./products";
import { normalize } from "./localStore";

export { PRODUCT_TYPES };

export function getTypeLabel(value) {
  return PRODUCT_TYPES.find((t) => t.value === value)?.label || value;
}

export function slugify(name = "") {
  return normalize(name)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

let ADMIN_CATEGORIES = [];

export async function loadAdminCategories() {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
    const res = await fetch(`${API_BASE_URL}/api/categories`);
    if (res.ok) {
      const data = await res.json();
      if (data.data) {
        ADMIN_CATEGORIES = data.data.map(c => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          type: c.label ? c.label.toLowerCase() : "food",
          description: c.description || "",
          sortOrder: c.id,
          active: c.status === "ACTIVE",
          createdAt: c.createdAt || new Date().toISOString()
        }));
      }
    }
  } catch (err) {
    console.error("Failed to load admin categories", err);
  }
}

export function getCategories() {
  return ADMIN_CATEGORIES.sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryById(id) {
  return ADMIN_CATEGORIES.find((c) => String(c.id) === String(id)) || null;
}

export function getCategoryNameBySlug(slug) {
  return ADMIN_CATEGORIES.find((c) => c.slug === slug)?.name || slug;
}

export function isSlugTaken(slug, exceptId = null) {
  return ADMIN_CATEGORIES.some(
    (c) => c.slug === slug && String(c.id) !== String(exceptId)
  );
}

export async function createCategory(data) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const token = localStorage.getItem("accessToken");

  const payload = {
    name: data.name?.trim() || "",
    slug: data.slug?.trim() || slugify(data.name || ""),
    description: data.description?.trim() || "",
    status: data.active !== false ? "ACTIVE" : "INACTIVE",
    label: data.type ? data.type.toUpperCase() : "FOOD"
  };

  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create category");
  }

  const resData = await res.json();
  return resData.data;
}

export async function updateCategory(id, patch) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const token = localStorage.getItem("accessToken");

  const existing = getCategoryById(id) || {};
  const merged = { ...existing, ...patch };

  const payload = {
    name: merged.name?.trim() || "",
    slug: merged.slug?.trim() || "",
    description: merged.description?.trim() || "",
    status: merged.active !== false ? "ACTIVE" : "INACTIVE",
    label: merged.type ? merged.type.toUpperCase() : "FOOD"
  };

  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to update category");
  }

  const resData = await res.json();
  return resData.data;
}

export async function deleteCategory(id) {
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    credentials: "include"
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to delete category");
  }
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

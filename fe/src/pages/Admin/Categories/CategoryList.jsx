import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../../components/admin/PageHeader";
import AdminModal from "../../../components/admin/AdminModal";
import EmptyState from "../../../components/admin/EmptyState";
import {
  filterCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  isSlugTaken,
  slugify,
  getTypeLabel,
  PRODUCT_TYPES,
} from "../../../data/adminCategories";
import { countProductsByCategory } from "../../../data/adminProducts";

const EMPTY_FORM = {
  name: "",
  slug: "",
  type: "food",
  description: "",
  sortOrder: "",
  active: true,
};

function validate(form, editingId) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = "Vui lòng nhập tên danh mục.";
  } else if (form.name.trim().length < 2) {
    errors.name = "Tên danh mục phải có ít nhất 2 ký tự.";
  }

  const slug = form.slug.trim() || slugify(form.name);
  if (!slug) {
    errors.slug = "Không tạo được đường dẫn từ tên danh mục, hãy nhập thủ công.";
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang.";
  } else if (isSlugTaken(slug, editingId)) {
    errors.slug = "Đường dẫn này đã được dùng cho danh mục khác.";
  }

  if (form.sortOrder !== "" && Number(form.sortOrder) < 1) {
    errors.sortOrder = "Thứ tự phải là số lớn hơn 0.";
  }

  return errors;
}

const CategoryList = () => {
  const [filters, setFilters] = useState({ keyword: "", type: "", active: "" });
  const [version, setVersion] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  // Khi thêm mới, đường dẫn tự sinh theo tên cho tới lúc người dùng tự sửa.
  const [slugTouched, setSlugTouched] = useState(false);

  const categories = useMemo(
    () => filterCategories(filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, version]
  );

  // Số sản phẩm của từng danh mục, dùng để hiển thị và chặn xoá nhầm.
  const productCounts = useMemo(() => {
    const counts = {};
    categories.forEach((category) => {
      counts[category.slug] = countProductsByCategory(category.slug);
    });
    return counts;
  }, [categories]);

  useEffect(() => {
    if (!slugTouched && !editingId) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
    }
  }, [form.name, slugTouched, editingId]);

  const setFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setSlugTouched(false);
    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      type: category.type,
      description: category.description || "",
      sortOrder: String(category.sortOrder),
      active: category.active,
    });
    setErrors({});
    setSlugTouched(true);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validate(form, editingId);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = { ...form, slug: form.slug.trim() || slugify(form.name) };
    if (editingId) {
      updateCategory(editingId, payload);
    } else {
      createCategory(payload);
    }

    setShowModal(false);
    setVersion((v) => v + 1);
    Swal.fire({
      icon: "success",
      title: editingId ? "Đã cập nhật danh mục" : "Đã thêm danh mục",
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const handleToggleActive = (category) => {
    updateCategory(category.id, { active: !category.active });
    setVersion((v) => v + 1);
  };

  const handleDelete = async (category) => {
    const count = productCounts[category.slug] || 0;

    // Xoá danh mục còn sản phẩm sẽ làm các sản phẩm đó mất chỗ hiển thị ở user site.
    if (count > 0) {
      Swal.fire({
        icon: "error",
        title: "Không thể xoá danh mục",
        html: `Danh mục <b>${category.name}</b> đang có <b>${count}</b> sản phẩm.<br/>Hãy chuyển các sản phẩm này sang danh mục khác trước.`,
        confirmButtonText: "Đã hiểu",
      });
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "Xoá danh mục?",
      html: `Danh mục <b>${category.name}</b> sẽ bị xoá vĩnh viễn.`,
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc3545",
    });
    if (!result.isConfirmed) return;

    deleteCategory(category.id);
    setVersion((v) => v + 1);
    Swal.fire({
      icon: "success",
      title: "Đã xoá danh mục",
      timer: 1600,
      showConfirmButton: false,
    });
  };

  return (
    <div>
      <PageHeader
        title="Quản lý danh mục"
        subtitle="Danh mục quyết định cách sản phẩm được nhóm và lọc ở trang bán hàng"
        breadcrumb={[{ label: "Danh mục" }]}
      >
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <i className="fas fa-plus me-2" />
          Thêm danh mục
        </button>
      </PageHeader>

      {/* ---- Bộ lọc ---- */}
      <div className="admin-card p-3 mb-3">
        <div className="row g-2">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="fas fa-magnifying-glass text-muted" />
              </span>
              <input
                type="search"
                className="form-control"
                placeholder="Tìm theo tên hoặc đường dẫn..."
                value={filters.keyword}
                onChange={(e) => setFilter("keyword", e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.type}
              onChange={(e) => setFilter("type", e.target.value)}
              aria-label="Lọc theo phân loại"
            >
              <option value="">Tất cả phân loại</option>
              {PRODUCT_TYPES.map((type) => (
                <option value={type.value} key={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filters.active}
              onChange={(e) => setFilter("active", e.target.value)}
              aria-label="Lọc theo trạng thái hiển thị"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hiển thị</option>
              <option value="false">Đang ẩn</option>
            </select>
          </div>
        </div>
      </div>

      {/* ---- Bảng ---- */}
      <div className="admin-card">
        {categories.length === 0 ? (
          <EmptyState
            icon="fa-tags"
            title="Không có danh mục nào"
            description="Thử đổi từ khoá hoặc thêm danh mục mới."
          >
            <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
              Thêm danh mục
            </button>
          </EmptyState>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table align-middle">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Thứ tự</th>
                  <th>Danh mục</th>
                  <th>Phân loại</th>
                  <th className="text-end">Sản phẩm</th>
                  <th>Hiển thị</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const count = productCounts[category.slug] || 0;
                  return (
                    <tr key={category.id}>
                      <td className="text-muted fw-semibold">{category.sortOrder}</td>
                      <td>
                        <div className="fw-semibold">{category.name}</div>
                        <div className="small text-muted">
                          <code>/{category.slug}</code>
                        </div>
                        {category.description && (
                          <div className="small text-muted admin-truncate mt-1">
                            {category.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            category.type === "food"
                              ? "bg-success-subtle text-success"
                              : "bg-info-subtle text-info"
                          }`}
                        >
                          {getTypeLabel(category.type)}
                        </span>
                      </td>
                      <td className="text-end">
                        {count > 0 ? (
                          <Link
                            to={`/admin/san-pham?category=${category.slug}`}
                            className="text-decoration-none fw-semibold"
                          >
                            {count}
                          </Link>
                        ) : (
                          <span className="text-muted">0</span>
                        )}
                      </td>
                      <td>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={category.active}
                            onChange={() => handleToggleActive(category)}
                            aria-label={`Bật/tắt hiển thị ${category.name}`}
                          />
                        </div>
                      </td>
                      <td className="text-end text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-light me-1"
                          onClick={() => openEdit(category)}
                          title="Sửa"
                        >
                          <i className="fas fa-pen" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-light text-danger"
                          onClick={() => handleDelete(category)}
                          title={count > 0 ? "Danh mục còn sản phẩm" : "Xoá"}
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- Form thêm / sửa ---- */}
      <AdminModal
        show={showModal}
        title={editingId ? "Cập nhật danh mục" : "Thêm danh mục"}
        onClose={() => setShowModal(false)}
        footer={
          <>
            <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
              Huỷ
            </button>
            <button type="submit" form="category-form" className="btn btn-primary">
              {editingId ? "Lưu thay đổi" : "Thêm danh mục"}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="category-name">
              Tên danh mục <span className="text-danger">*</span>
            </label>
            <input
              id="category-name"
              type="text"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Rau củ & Trái cây"
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="category-slug">
              Đường dẫn <span className="text-danger">*</span>
            </label>
            <input
              id="category-slug"
              type="text"
              className={`form-control ${errors.slug ? "is-invalid" : ""}`}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setField("slug", e.target.value);
              }}
              placeholder="rau-cu-trai-cay"
            />
            {errors.slug ? (
              <div className="invalid-feedback">{errors.slug}</div>
            ) : (
              <div className="form-text">Tự sinh theo tên, có thể sửa lại nếu cần.</div>
            )}
          </div>

          <div className="row">
            <div className="col-md-7 mb-3">
              <label className="form-label" htmlFor="category-type">
                Phân loại
              </label>
              <select
                id="category-type"
                className="form-select"
                value={form.type}
                onChange={(e) => setField("type", e.target.value)}
              >
                {PRODUCT_TYPES.map((type) => (
                  <option value={type.value} key={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-5 mb-3">
              <label className="form-label" htmlFor="category-order">
                Thứ tự hiển thị
              </label>
              <input
                id="category-order"
                type="number"
                min="1"
                className={`form-control ${errors.sortOrder ? "is-invalid" : ""}`}
                value={form.sortOrder}
                onChange={(e) => setField("sortOrder", e.target.value)}
                placeholder="Tự động"
              />
              {errors.sortOrder && <div className="invalid-feedback">{errors.sortOrder}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="category-description">
              Mô tả
            </label>
            <textarea
              id="category-description"
              className="form-control"
              rows="3"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Mô tả ngắn hiển thị ở trang danh mục"
            />
          </div>

          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="category-active"
              checked={form.active}
              onChange={(e) => setField("active", e.target.checked)}
            />
            <label className="form-check-label" htmlFor="category-active">
              Hiển thị danh mục này ở trang bán hàng
            </label>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default CategoryList;

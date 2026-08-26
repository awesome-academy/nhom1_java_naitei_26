import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../../components/admin/PageHeader";
import ProductImages from "./ProductImages";
import { formatPrice, calcDiscountPercent } from "../../../utils/format";
import {
  getProductById,
  createProduct,
  updateProduct,
  isSlugTaken,
  getBrands,
  LOW_STOCK_THRESHOLD,
} from "../../../data/adminProducts";
import { getCategories, slugify, PRODUCT_TYPES, loadAdminCategories } from "../../../data/adminCategories";

const EMPTY_FORM = {
  name: "",
  slug: "",
  type: "food",
  category: "",
  categoryId: null,
  brand: "",
  price: "",
  oldPrice: "",
  unit: "",
  stock: "",
  images: [],
  shortDescription: "",
  description: "",
  origin: "",
  expiry: "",
  storage: "",
  active: true,
};

function validate(form, editingId) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Vui lòng nhập tên sản phẩm.";

  const slug = form.slug.trim() || slugify(form.name);
  if (!slug) {
    errors.slug = "Không tạo được đường dẫn từ tên, hãy nhập thủ công.";
  } else if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.slug = "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang.";
  } else if (isSlugTaken(slug, editingId)) {
    errors.slug = "Đường dẫn này đã được dùng cho sản phẩm khác.";
  }

  if (!form.category) errors.category = "Vui lòng chọn danh mục.";
  if (!form.brand.trim()) errors.brand = "Vui lòng nhập thương hiệu.";
  if (!form.unit.trim()) errors.unit = "Vui lòng nhập quy cách (ví dụ: Gói 400g).";

  const price = Number(form.price);
  if (form.price === "" || Number.isNaN(price)) {
    errors.price = "Vui lòng nhập giá bán.";
  } else if (price <= 0) {
    errors.price = "Giá bán phải lớn hơn 0.";
  }

  const oldPrice = Number(form.oldPrice);
  if (form.oldPrice !== "" && !Number.isNaN(oldPrice) && oldPrice > 0 && oldPrice <= price) {
    errors.oldPrice = "Giá gốc phải lớn hơn giá bán thì mới hiện khuyến mãi.";
  }

  const stock = Number(form.stock);
  if (form.stock === "" || Number.isNaN(stock)) {
    errors.stock = "Vui lòng nhập số lượng tồn kho.";
  } else if (stock < 0) {
    errors.stock = "Tồn kho không được là số âm.";
  }

  if (form.images.length === 0) errors.images = "Cần ít nhất một ảnh sản phẩm.";

  if (!form.shortDescription.trim()) {
    errors.shortDescription = "Vui lòng nhập mô tả ngắn.";
  } else if (form.shortDescription.trim().length > 200) {
    errors.shortDescription = "Mô tả ngắn không nên vượt quá 200 ký tự.";
  }

  return errors;
}

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [notFound, setNotFound] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  // Nạp dữ liệu danh mục từ API và sản phẩm từ localStorage
  useEffect(() => {
    setLoading(true);
    loadAdminCategories()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => (loading ? [] : getCategories()), [loading]);
  const brands = useMemo(() => (loading ? [] : getBrands()), [loading]);

  // Nạp dữ liệu khi ở chế độ chỉnh sửa.
  useEffect(() => {
    if (!isEditing) {
      setForm(EMPTY_FORM);
      setSlugTouched(false);
      return;
    }

    const product = getProductById(id);
    if (!product) {
      setNotFound(true);
      return;
    }

    setForm({
      name: product.name,
      slug: product.slug,
      type: product.type,
      category: product.category,
      categoryId: product.categoryId || null,
      brand: product.brand,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      unit: product.unit,
      stock: String(product.stock),
      images: product.images || [],
      shortDescription: product.shortDescription || "",
      description: product.description || "",
      origin: product.origin || "",
      expiry: product.expiry || "",
      storage: product.storage || "",
      active: product.active !== false,
    });
    setSlugTouched(true);
  }, [id, isEditing, loading]);

  // Khi thêm mới, đường dẫn bám theo tên cho tới lúc người dùng tự sửa.
  useEffect(() => {
    if (!slugTouched && !isEditing) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name) }));
    }
  }, [form.name, slugTouched, isEditing]);

  const setField = (key, value) => {
    setForm((prev) => {
      // Đổi phân loại thì bỏ danh mục cũ nếu nó không thuộc phân loại mới.
      if (key === "type") {
        const stillValid = categories.some((c) => c.slug === prev.category && c.type === value);
        return { ...prev, type: value, category: stillValid ? prev.category : "", categoryId: stillValid ? prev.categoryId : null };
      }
      // Khi chọn danh mục, tự động lấy categoryId từ danh sách danh mục
      if (key === "category") {
        const found = categories.find((c) => c.slug === value);
        return { ...prev, category: value, categoryId: found ? found.id : null };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(form, isEditing ? id : null);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const payload = { ...form, slug: form.slug.trim() || slugify(form.name) };

    try {
      if (isEditing) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      Swal.fire({
        icon: "success",
        title: isEditing ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm",
        timer: 1600,
        showConfirmButton: false,
      });
      navigate("/admin/san-pham");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Không lưu được sản phẩm", text: err.message });
    }
  };

  if (notFound) {
    return (
      <div>
        <PageHeader
          title="Không tìm thấy sản phẩm"
          breadcrumb={[{ label: "Sản phẩm", to: "/admin/san-pham" }, { label: "Chỉnh sửa" }]}
        />
        <div className="admin-card p-4 text-center">
          <i className="fas fa-box-open fa-2x text-secondary opacity-50 mb-3" />
          <p className="text-muted">Sản phẩm #{id} không tồn tại hoặc đã bị xoá.</p>
          <Link to="/admin/san-pham" className="btn btn-primary">
            Về danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  const visibleCategories = categories.filter((c) => c.type === form.type);
  const discount = calcDiscountPercent(Number(form.price), Number(form.oldPrice));

  return (
    <form onSubmit={handleSubmit} noValidate>
      <PageHeader
        title={isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
        subtitle={
          isEditing ? `Đang sửa sản phẩm #${id}` : "Điền thông tin để thêm sản phẩm vào catalog"
        }
        breadcrumb={[
          { label: "Sản phẩm", to: "/admin/san-pham" },
          { label: isEditing ? "Chỉnh sửa" : "Thêm mới" },
        ]}
      >
        <Link to="/admin/san-pham" className="btn btn-light">
          Huỷ
        </Link>
        <button type="submit" className="btn btn-primary">
          <i className="fas fa-floppy-disk me-2" />
          {isEditing ? "Lưu thay đổi" : "Thêm sản phẩm"}
        </button>
      </PageHeader>

      {Object.keys(errors).length > 0 && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2">
          <i className="fas fa-circle-exclamation" />
          <span className="small">Vui lòng kiểm tra lại các trường được đánh dấu đỏ bên dưới.</span>
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-8">
          {/* ---- Thông tin cơ bản ---- */}
          <div className="admin-card p-3 p-md-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Thông tin cơ bản</h2>

            <div className="mb-3">
              <label className="form-label" htmlFor="product-name">
                Tên sản phẩm <span className="text-danger">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Bánh mì hoa cúc Kinh Đô"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="product-slug">
                Đường dẫn <span className="text-danger">*</span>
              </label>
              <div className="input-group has-validation">
                <span className="input-group-text text-muted">/san-pham/</span>
                <input
                  id="product-slug"
                  type="text"
                  className={`form-control ${errors.slug ? "is-invalid" : ""}`}
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setField("slug", e.target.value);
                  }}
                  placeholder="banh-mi-hoa-cuc-kinh-do"
                />
                {errors.slug && <div className="invalid-feedback">{errors.slug}</div>}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="product-type">
                  Phân loại <span className="text-danger">*</span>
                </label>
                <select
                  id="product-type"
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

              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="product-category">
                  Danh mục <span className="text-danger">*</span>
                </label>
                <select
                  id="product-category"
                  className={`form-select ${errors.category ? "is-invalid" : ""}`}
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {visibleCategories.map((category) => (
                    <option value={category.slug} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category}</div>}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="product-brand">
                  Thương hiệu <span className="text-danger">*</span>
                </label>
                <input
                  id="product-brand"
                  type="text"
                  list="brand-options"
                  className={`form-control ${errors.brand ? "is-invalid" : ""}`}
                  value={form.brand}
                  onChange={(e) => setField("brand", e.target.value)}
                  placeholder="Kinh Đô"
                />
                <datalist id="brand-options">
                  {brands.map((brand) => (
                    <option value={brand} key={brand} />
                  ))}
                </datalist>
                {errors.brand && <div className="invalid-feedback">{errors.brand}</div>}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="product-unit">
                  Quy cách <span className="text-danger">*</span>
                </label>
                <input
                  id="product-unit"
                  type="text"
                  className={`form-control ${errors.unit ? "is-invalid" : ""}`}
                  value={form.unit}
                  onChange={(e) => setField("unit", e.target.value)}
                  placeholder="Gói 400g"
                />
                {errors.unit && <div className="invalid-feedback">{errors.unit}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="product-short">
                Mô tả ngắn <span className="text-danger">*</span>
              </label>
              <textarea
                id="product-short"
                className={`form-control ${errors.shortDescription ? "is-invalid" : ""}`}
                rows="2"
                value={form.shortDescription}
                onChange={(e) => setField("shortDescription", e.target.value)}
                placeholder="Câu giới thiệu ngắn hiển thị ở thẻ sản phẩm"
              />
              {errors.shortDescription ? (
                <div className="invalid-feedback">{errors.shortDescription}</div>
              ) : (
                <div className="form-text">{form.shortDescription.length}/200 ký tự</div>
              )}
            </div>

            <div className="mb-0">
              <label className="form-label" htmlFor="product-description">
                Mô tả chi tiết
              </label>
              <textarea
                id="product-description"
                className="form-control"
                rows="5"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Thành phần, cách dùng, hương vị..."
              />
            </div>
          </div>

          {/* ---- Thông tin bổ sung ---- */}
          <div className="admin-card p-3 p-md-4">
            <h2 className="h6 fw-bold mb-3">Thông tin bổ sung</h2>
            <div className="row">
              <div className="col-md-4 mb-3 mb-md-0">
                <label className="form-label" htmlFor="product-origin">
                  Xuất xứ
                </label>
                <input
                  id="product-origin"
                  type="text"
                  className="form-control"
                  value={form.origin}
                  onChange={(e) => setField("origin", e.target.value)}
                  placeholder="Việt Nam"
                />
              </div>
              <div className="col-md-4 mb-3 mb-md-0">
                <label className="form-label" htmlFor="product-expiry">
                  Hạn sử dụng
                </label>
                <input
                  id="product-expiry"
                  type="text"
                  className="form-control"
                  value={form.expiry}
                  onChange={(e) => setField("expiry", e.target.value)}
                  placeholder="6 tháng kể từ ngày sản xuất"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label" htmlFor="product-storage">
                  Bảo quản
                </label>
                <input
                  id="product-storage"
                  type="text"
                  className="form-control"
                  value={form.storage}
                  onChange={(e) => setField("storage", e.target.value)}
                  placeholder="Nơi khô ráo, thoáng mát"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* ---- Giá & kho ---- */}
          <div className="admin-card p-3 p-md-4 mb-3">
            <h2 className="h6 fw-bold mb-3">Giá &amp; kho hàng</h2>

            <div className="mb-3">
              <label className="form-label" htmlFor="product-price">
                Giá bán (₫) <span className="text-danger">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="1000"
                className={`form-control ${errors.price ? "is-invalid" : ""}`}
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="52000"
              />
              {errors.price ? (
                <div className="invalid-feedback">{errors.price}</div>
              ) : (
                form.price !== "" && (
                  <div className="form-text">{formatPrice(Number(form.price))}</div>
                )
              )}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="product-oldprice">
                Giá gốc (₫)
              </label>
              <input
                id="product-oldprice"
                type="number"
                min="0"
                step="1000"
                className={`form-control ${errors.oldPrice ? "is-invalid" : ""}`}
                value={form.oldPrice}
                onChange={(e) => setField("oldPrice", e.target.value)}
                placeholder="Bỏ trống nếu không giảm giá"
              />
              {errors.oldPrice ? (
                <div className="invalid-feedback">{errors.oldPrice}</div>
              ) : (
                discount > 0 && (
                  <div className="form-text text-danger">Đang giảm {discount}%</div>
                )
              )}
            </div>

            <div className="mb-0">
              <label className="form-label" htmlFor="product-stock">
                Tồn kho <span className="text-danger">*</span>
              </label>
              <input
                id="product-stock"
                type="number"
                min="0"
                className={`form-control ${errors.stock ? "is-invalid" : ""}`}
                value={form.stock}
                onChange={(e) => setField("stock", e.target.value)}
                placeholder="48"
              />
              {errors.stock ? (
                <div className="invalid-feedback">{errors.stock}</div>
              ) : (
                form.stock !== "" &&
                Number(form.stock) < LOW_STOCK_THRESHOLD && (
                  <div className="form-text text-warning">
                    Dưới {LOW_STOCK_THRESHOLD} sản phẩm sẽ bị cảnh báo sắp hết hàng.
                  </div>
                )
              )}
            </div>
          </div>

          {/* ---- Hình ảnh ---- */}
          <div className="admin-card p-3 p-md-4 mb-3">
            <ProductImages
              images={form.images}
              onChange={(images) => setField("images", images)}
              error={errors.images}
            />
          </div>

          {/* ---- Trạng thái ---- */}
          <div className="admin-card p-3 p-md-4">
            <h2 className="h6 fw-bold mb-3">Trạng thái</h2>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="product-active"
                checked={form.active}
                onChange={(e) => setField("active", e.target.checked)}
              />
              <label className="form-check-label" htmlFor="product-active">
                Hiển thị sản phẩm ở trang bán hàng
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;

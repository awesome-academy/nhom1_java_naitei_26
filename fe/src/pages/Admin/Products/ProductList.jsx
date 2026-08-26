import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import PageHeader from "../../../components/admin/PageHeader";
import Pagination from "../../../components/admin/Pagination";
import EmptyState from "../../../components/admin/EmptyState";
import { formatPrice, calcDiscountPercent } from "../../../utils/format";
import {
  filterProducts,
  deleteProduct,
  updateProduct,
  getBrands,
  getProductStats,
  getStockBadge,
  getStockLabel,
  PRODUCT_SORTS,
  STOCK_FILTERS,
  loadAdminProducts,
} from "../../../data/adminProducts";
import { getCategories, getTypeLabel, PRODUCT_TYPES, loadAdminCategories } from "../../../data/adminCategories";
import { CATEGORIES } from "../../../data/products";

const PAGE_SIZE = 10;

const ProductList = () => {
  // Danh mục có thể mở sẵn bộ lọc qua ?category=<slug> từ trang Quản lý danh mục.
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [apiCategories, setApiCategories] = useState([]);

  const [filters, setFilters] = useState({
    keyword: "",
    type: "",
    category: searchParams.get("category") || "",
    brand: "",
    stock: "",
    sort: "newest",
  });
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadAdminCategories(), loadAdminProducts()])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [version]);

  // Fetch categories from API to ensure filter uses database categories
  useEffect(() => {
    const fetchApiCategories = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
        const res = await fetch(`${API_BASE_URL}/api/categories`, {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.data) {
            setApiCategories(data.data.map(c => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              type: c.label ? c.label.toLowerCase() : "food",
              active: c.status === "ACTIVE"
            })));
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories from API", err);
      }
    };
    fetchApiCategories();
  }, []);

  // All products, stats, and brands from cache (synchronous)
  const products = useMemo(
    () => (loading ? [] : filterProducts(filters)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters, version, loading]
  );
  const stats = useMemo(
    () => (loading ? { total: 0, outOfStock: 0, lowStock: 0, inventoryValue: 0 } : getProductStats()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, loading]
  );
  const brands = useMemo(
    () => (loading ? [] : getBrands()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, loading]
  );

  const categories = useMemo(() => (loading ? [] : getCategories()), [loading]);
  const categoryNames = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, c.name])),
    [categories]
  );

  // Danh mục hiển thị trong ô lọc phụ thuộc phân loại đang chọn.
  const visibleCategories = useMemo(
    () => {
      const source = apiCategories.length > 0 ? apiCategories : CATEGORIES;
      if (filters.type) {
        return source.filter((c) => c.type === filters.type || c.label === filters.type);
      }
      return source;
    },
    [filters.type, apiCategories]
  );

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const pageItems = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [filters]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const setFilter = (key, value) => {
    setFilters((prev) => {
      // Đổi phân loại thì bỏ danh mục cũ vì nó có thể không còn thuộc phân loại mới.
      if (key === "type") return { ...prev, type: value, category: "" };
      return { ...prev, [key]: value };
    });
    if (key === "category") {
      setSearchParams(value ? { category: value } : {}, { replace: true });
    }
  };

  const resetFilters = () => {
    setFilters({ keyword: "", type: "", category: "", brand: "", stock: "", sort: "newest" });
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilter =
    filters.keyword || filters.type || filters.category || filters.brand || filters.stock;

  const handleToggleActive = async (product) => {
    try {
      const newActive = !product.active;
      await updateProduct(product.id, { ...product, active: newActive });
      setVersion((v) => v + 1);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Lỗi", text: err.message });
    }
  };

  const handleDelete = async (product) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Xoá sản phẩm?",
      html: `Sản phẩm <b>${product.name}</b> sẽ bị xoá vĩnh viễn.`,
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc3545",
    });
    if (result.isConfirmed) {
      try {
        await deleteProduct(product.id);
        setVersion((v) => v + 1);
        Swal.fire({
          icon: "success",
          title: "Đã xoá sản phẩm",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({ icon: "error", title: "Không thể xoá sản phẩm", text: err.message });
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản lý sản phẩm"
        subtitle={`${stats.total} sản phẩm · Giá trị tồn kho ${formatPrice(stats.inventoryValue)}`}
        breadcrumb={[{ label: "Sản phẩm" }]}
      >
        <Link to="/admin/san-pham/them-moi" className="btn btn-primary">
          <i className="fas fa-plus me-2" />
          Thêm sản phẩm
        </Link>
      </PageHeader>

      {/* ---- Cảnh báo tồn kho ---- */}
      {(stats.outOfStock > 0 || stats.lowStock > 0) && (
        <div className="alert alert-warning d-flex align-items-center gap-2 py-2">
          <i className="fas fa-triangle-exclamation" />
          <span className="small">
            Có <b>{stats.outOfStock}</b> sản phẩm hết hàng và <b>{stats.lowStock}</b> sản phẩm sắp
            hết.{" "}
            <button
              type="button"
              className="btn btn-link btn-sm p-0 align-baseline"
              onClick={() => setFilter("stock", "low")}
            >
              Xem sản phẩm sắp hết
            </button>
          </span>
        </div>
      )}

      {/* ---- Bộ lọc ---- */}
      <div className="admin-card p-3 mb-3">
        <div className="row g-2">
          <div className="col-lg-4">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="fas fa-magnifying-glass text-muted" />
              </span>
              <input
                type="search"
                className="form-control"
                placeholder="Tìm theo tên hoặc thương hiệu..."
                value={filters.keyword}
                onChange={(e) => setFilter("keyword", e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <select
              className="form-select"
              value={filters.type}
              onChange={(e) => setFilter("type", e.target.value)}
              aria-label="Lọc theo phân loại"
            >
              <option value="">Phân loại</option>
              {PRODUCT_TYPES.map((type) => (
                <option value={type.value} key={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-lg-2">
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => setFilter("category", e.target.value)}
              aria-label="Lọc theo danh mục"
            >
              <option value="">Danh mục</option>
              {visibleCategories.map((category) => (
                <option value={category.slug} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-lg-2">
            <select
              className="form-select"
              value={filters.brand}
              onChange={(e) => setFilter("brand", e.target.value)}
              aria-label="Lọc theo thương hiệu"
            >
              <option value="">Thương hiệu</option>
              {brands.map((brand) => (
                <option value={brand} key={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="col-6 col-lg-2">
            <select
              className="form-select"
              value={filters.stock}
              onChange={(e) => setFilter("stock", e.target.value)}
              aria-label="Lọc theo tồn kho"
            >
              <option value="">Tồn kho</option>
              {STOCK_FILTERS.map((item) => (
                <option value={item.value} key={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
          <div className="d-flex align-items-center gap-2">
            <label className="small text-muted mb-0" htmlFor="product-sort">
              Sắp xếp
            </label>
            <select
              id="product-sort"
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={filters.sort}
              onChange={(e) => setFilter("sort", e.target.value)}
            >
              {PRODUCT_SORTS.map((sort) => (
                <option value={sort.value} key={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilter && (
            <button type="button" className="btn btn-sm btn-light" onClick={resetFilters}>
              <i className="fas fa-rotate-left me-2" />
              Xoá bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* ---- Bảng ---- */}
      <div className="admin-card">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : pageItems.length === 0 ? (
          <EmptyState
            icon="fa-box-open"
            title="Không tìm thấy sản phẩm nào"
            description="Thử đổi từ khoá hoặc bỏ bớt bộ lọc."
          >
            <Link to="/admin/san-pham/them-moi" className="btn btn-primary btn-sm">
              Thêm sản phẩm
            </Link>
          </EmptyState>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table align-middle">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th className="text-end">Giá</th>
                  <th className="text-end">Tồn kho</th>
                  <th>Hiển thị</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((product) => {
                  const discount = calcDiscountPercent(product.price, product.oldPrice);
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="admin-table-thumb"
                          />
                          <div className="min-w-0">
                            <div className="fw-semibold admin-truncate">{product.name}</div>
                            <div className="small text-muted">
                              {product.brand} · {product.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="small">
                        <div>{categoryNames[product.category] || product.category}</div>
                        <div className="text-muted">{getTypeLabel(product.type)}</div>
                      </td>
                      <td className="text-end">
                        <div className="fw-semibold">{formatPrice(product.price)}</div>
                        {discount > 0 && (
                          <div className="small text-muted">
                            <s>{formatPrice(product.oldPrice)}</s>{" "}
                            <span className="text-danger">-{discount}%</span>
                          </div>
                        )}
                      </td>
                      <td className="text-end">
                        <span className={`badge ${getStockBadge(product.stock)}`}>
                          {product.stock} · {getStockLabel(product.stock)}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            checked={product.active}
                            onChange={() => handleToggleActive(product)}
                            aria-label={`Bật/tắt hiển thị ${product.name}`}
                          />
                        </div>
                      </td>
                      <td className="text-end text-nowrap">
                        <Link
                          to={`/admin/san-pham/${product.id}/chinh-sua`}
                          className="btn btn-sm btn-light me-1"
                          title="Sửa"
                        >
                          <i className="fas fa-pen" />
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-light text-danger"
                          onClick={() => handleDelete(product)}
                          title="Xoá"
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

        {products.length > 0 && (
          <div className="p-3 border-top">
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={products.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;

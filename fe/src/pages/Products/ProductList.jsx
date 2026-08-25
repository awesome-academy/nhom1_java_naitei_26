import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MagnifyingGlass } from "react-loader-spinner";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ScrollToTop from "../ScrollToTop";
import ProductCard from "../../components/ProductCard";
import banner from "../../images/assortment-citrus-fruits.png";
import {
  getAllProducts,
  CATEGORIES,
  PRODUCT_TYPES,
  getBrands,
  PRICE_MAX,
} from "../../data/products";
import { ALPHABET, getInitialLetter, removeDiacritics, formatPrice } from "../../utils/format";

const SORT_OPTIONS = [
  { value: "featured", label: "Nổi bật" },
  { value: "name-asc", label: "Tên A → Z" },
  { value: "name-desc", label: "Tên Z → A" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "rating-desc", label: "Đánh giá cao nhất" },
];

const PER_PAGE = 9;

const ProductList = () => {
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const allProducts = useMemo(() => getAllProducts(), []);

  // URL là nguồn dữ liệu duy nhất của bộ lọc.
  // Nhờ vậy khi người dùng bấm một danh mục khác trên menu Header (điều hướng tới
  // cùng route nhưng khác query), bộ lọc cập nhật theo ngay — trước đây các giá trị
  // này nằm trong useState nên chỉ đọc URL đúng một lần lúc mount.
  const keyword = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const letter = searchParams.get("letter") || "";
  const maxPrice = Number(searchParams.get("maxPrice")) || PRICE_MAX;
  const minRating = Number(searchParams.get("rating")) || 0;
  const sort = searchParams.get("sort") || "featured";
  const page = Number(searchParams.get("page")) || 1;

  // Hai giá trị dạng mảng cần useMemo, nếu không mỗi lần render sẽ tạo mảng mới
  // khiến useMemo lọc sản phẩm bên dưới phải tính lại liên tục.
  const categoryParam = searchParams.get("category") || "";
  const categories = useMemo(
    () => (categoryParam ? categoryParam.split(",") : []),
    [categoryParam]
  );
  const brandParam = searchParams.get("brand") || "";
  const brands = useMemo(
    () => (brandParam ? brandParam.split(",") : []),
    [brandParam]
  );

  // Kiểu hiển thị chỉ là tuỳ chọn giao diện nên vẫn giữ ở state.
  const [layout, setLayout] = useState("grid");

  const brandOptions = useMemo(() => getBrands(), []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Ghi các thay đổi bộ lọc lên URL. Giá trị rỗng thì xoá hẳn tham số cho gọn.
  const updateParams = useCallback(
    (patch, { resetPage = true } = {}) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        const isEmpty =
          value === "" ||
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0);
        if (isEmpty) next.delete(key);
        else next.set(key, Array.isArray(value) ? value.join(",") : String(value));
      });
      if (resetPage) next.delete("page");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setKeyword = (value) => updateParams({ q: value });
  // Đổi phân loại thì bỏ luôn danh mục đang chọn vì danh mục phụ thuộc phân loại.
  const setType = (value) => updateParams({ type: value, category: [] });
  const setCategories = (value) => updateParams({ category: value });
  const setLetter = (value) => updateParams({ letter: value });
  const setMaxPrice = (value) =>
    updateParams({ maxPrice: value === PRICE_MAX ? "" : value });
  const setMinRating = (value) => updateParams({ rating: value || "" });
  const setBrands = (value) => updateParams({ brand: value });
  const setSort = (value) => updateParams({ sort: value === "featured" ? "" : value });
  const setPage = (value) =>
    updateParams({ page: value === 1 ? "" : value }, { resetPage: false });

  // Danh mục hiển thị phụ thuộc phân loại đang chọn.
  const visibleCategories = useMemo(
    () => (type ? CATEGORIES.filter((c) => c.type === type) : CATEGORIES),
    [type]
  );

  const filtered = useMemo(() => {
    let result = allProducts;

    if (keyword.trim()) {
      const kw = removeDiacritics(keyword.trim().toLowerCase());
      result = result.filter(
        (p) =>
          removeDiacritics((p.name || "").toLowerCase()).includes(kw) ||
          removeDiacritics((p.brand || "").toLowerCase()).includes(kw)
      );
    }
    if (type) result = result.filter((p) => p.type === type);
    if (categories.length) result = result.filter((p) => categories.includes(p.category));
    if (letter) result = result.filter((p) => getInitialLetter(p.name || "") === letter);
    result = result.filter((p) => (p.price || 0) <= maxPrice);
    if (minRating) result = result.filter((p) => (p.rating || 0) >= minRating);
    if (brands.length) result = result.filter((p) => brands.includes(p.brand));

    const sorted = [...result];
    switch (sort) {
      case "name-asc":
        sorted.sort((a, b) => (a.name || "").localeCompare(b.name || "", "vi"));
        break;
      case "name-desc":
        sorted.sort((a, b) => (b.name || "").localeCompare(a.name || "", "vi"));
        break;
      case "price-asc":
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating-desc":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    return sorted;
  }, [allProducts, keyword, type, categories, letter, maxPrice, minRating, brands, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Các chữ cái thực sự có sản phẩm, để vô hiệu hoá những chữ còn lại.
  const availableLetters = useMemo(
    () => new Set(allProducts.map((p) => getInitialLetter(p.name || ""))),
    [allProducts]
  );

  const toggleInArray = (value, list, setList) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  // Xoá toàn bộ tham số trong một lần ghi. Không gọi từng setter riêng lẻ vì mỗi
  // setter đều dựng URL mới từ cùng một searchParams của lần render hiện tại,
  // nên chỉ lệnh cuối cùng có tác dụng.
  const resetFilters = () => setSearchParams({}, { replace: true });

  const activeFilterCount =
    (keyword ? 1 : 0) +
    (type ? 1 : 0) +
    categories.length +
    (letter ? 1 : 0) +
    (maxPrice !== PRICE_MAX ? 1 : 0) +
    (minRating ? 1 : 0) +
    brands.length;

  if (loading) {
    return (
      <div className="loader-container">
        <MagnifyingGlass
          visible
          height="100"
          width="100"
          ariaLabel="Đang tải sản phẩm"
          glassColor="#c0efff"
          color="#0aad0a"
        />
      </div>
    );
  }

  return (
    <div>
      <ScrollToTop />

      {/* Breadcrumb */}
      <div className="container mt-6">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Trang chủ</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Thực phẩm &amp; Đồ uống
            </li>
          </ol>
        </nav>
      </div>

      {/* Banner */}
      <section className="mt-4">
        <div className="container">
          <div
            className="py-6 px-6 rounded-3 d-flex align-items-center"
            style={{ background: "#e8f6e8" }}
          >
            <div className="flex-grow-1">
              <h1 className="mb-1 h2 fw-bold">Thực phẩm &amp; Đồ uống</h1>
              <p className="mb-0 text-muted">
                {filtered.length} sản phẩm — tươi ngon, giao nhanh trong ngày.
              </p>
            </div>
            <img src={banner} alt="" className="d-none d-md-block" style={{ height: 120 }} />
          </div>
        </div>
      </section>

      <section className="mt-8 mb-lg-14 mb-8">
        <div className="container">
          <div className="row">
            {/* ---------------- Sidebar bộ lọc ---------------- */}
            <aside className="col-lg-3 col-md-4 mb-6">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">
                  Bộ lọc{" "}
                  {activeFilterCount > 0 && (
                    <span className="badge bg-primary">{activeFilterCount}</span>
                  )}
                </h5>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none"
                    onClick={resetFilters}
                  >
                    Xoá tất cả
                  </button>
                )}
              </div>

              {/* Tìm kiếm */}
              <div className="mb-5">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Tìm sản phẩm, thương hiệu..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              {/* Phân loại: thực phẩm / đồ uống */}
              <div className="mb-5">
                <h6 className="mb-3">Phân loại</h6>
                <div className="btn-group w-100" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${!type ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setType("")}
                  >
                    Tất cả
                  </button>
                  {PRODUCT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`btn btn-sm ${
                        type === t.value ? "btn-primary" : "btn-outline-primary"
                      }`}
                      onClick={() => setType(t.value)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Danh mục */}
              <div className="mb-5">
                <h6 className="mb-3">Danh mục</h6>
                {visibleCategories.map((cat) => (
                  <div className="form-check mb-2" key={cat.slug}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`cat-${cat.slug}`}
                      checked={categories.includes(cat.slug)}
                      onChange={() => toggleInArray(cat.slug, categories, setCategories)}
                    />
                    <label className="form-check-label" htmlFor={`cat-${cat.slug}`}>
                      {cat.name}
                    </label>
                  </div>
                ))}
              </div>

              {/* Bảng chữ cái */}
              <div className="mb-5">
                <h6 className="mb-3">Theo bảng chữ cái</h6>
                <div className="d-flex flex-wrap gap-1">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      !letter ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    style={{ minWidth: 34 }}
                    onClick={() => setLetter("")}
                  >
                    Tất cả
                  </button>
                  {ALPHABET.map((ch) => {
                    const enabled = availableLetters.has(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        className={`btn btn-sm ${
                          letter === ch ? "btn-primary" : "btn-outline-secondary"
                        }`}
                        style={{ minWidth: 34 }}
                        disabled={!enabled}
                        onClick={() => setLetter(letter === ch ? "" : ch)}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Giá */}
              <div className="mb-5">
                <h6 className="mb-3">Giá tối đa</h6>
                <input
                  type="range"
                  className="form-range"
                  min={0}
                  max={PRICE_MAX}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <div className="d-flex justify-content-between small text-muted">
                  <span>{formatPrice(0)}</span>
                  <span className="fw-bold text-dark">{formatPrice(maxPrice)}</span>
                </div>
              </div>

              {/* Đánh giá */}
              <div className="mb-5">
                <h6 className="mb-3">Đánh giá</h6>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div className="form-check mb-2" key={star}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="rating"
                      id={`rating-${star}`}
                      checked={minRating === star}
                      onChange={() => setMinRating(star)}
                    />
                    <label className="form-check-label" htmlFor={`rating-${star}`}>
                      <span className="text-warning">
                        {Array.from({ length: star }).map((_, i) => (
                          <i className="bi bi-star-fill" key={i} />
                        ))}
                        {Array.from({ length: 5 - star }).map((_, i) => (
                          <i className="bi bi-star text-muted" key={i} />
                        ))}
                      </span>{" "}
                      <span className="small text-muted">trở lên</span>
                    </label>
                  </div>
                ))}
                {minRating > 0 && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-decoration-none"
                    onClick={() => setMinRating(0)}
                  >
                    Bỏ lọc đánh giá
                  </button>
                )}
              </div>

              {/* Thương hiệu */}
              <div className="mb-5">
                <h6 className="mb-3">Thương hiệu</h6>
                <div style={{ maxHeight: 220, overflowY: "auto" }}>
                  {brandOptions.map((brand) => (
                    <div className="form-check mb-2" key={brand}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`brand-${brand}`}
                        checked={brands.includes(brand)}
                        onChange={() => toggleInArray(brand, brands, setBrands)}
                      />
                      <label className="form-check-label" htmlFor={`brand-${brand}`}>
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* ---------------- Danh sách sản phẩm ---------------- */}
            <div className="col-lg-9 col-md-8">
              <div className="d-md-flex justify-content-between align-items-center mb-5">
                <div className="mb-2 mb-md-0">
                  <span className="text-muted">
                    Hiển thị <strong>{paged.length}</strong> / {filtered.length} sản phẩm
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <select
                    className="form-select form-select-sm"
                    style={{ width: "auto" }}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="btn-group">
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        layout === "grid" ? "btn-primary" : "btn-outline-secondary"
                      }`}
                      onClick={() => setLayout("grid")}
                      title="Dạng lưới"
                    >
                      <i className="fas fa-th" />
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        layout === "list" ? "btn-primary" : "btn-outline-secondary"
                      }`}
                      onClick={() => setLayout("list")}
                      title="Dạng danh sách"
                    >
                      <i className="fas fa-list" />
                    </button>
                  </div>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-10">
                  <i className="fas fa-search fa-3x text-muted mb-3" />
                  <h5>Không tìm thấy sản phẩm phù hợp</h5>
                  <p className="text-muted">Thử bỏ bớt bộ lọc hoặc đổi từ khoá tìm kiếm.</p>
                  <button className="btn btn-primary" onClick={resetFilters}>
                    Xoá bộ lọc
                  </button>
                </div>
              ) : layout === "grid" ? (
                <div className="row g-4 row-cols-lg-3 row-cols-2">
                  {paged.map((product) => (
                    <div className="col" key={product.id}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {paged.map((product) => (
                    <ProductCard product={product} layout="list" key={product.id} />
                  ))}
                </div>
              )}

              {/* Phân trang */}
              {totalPages > 1 && (
                <nav className="mt-8">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage(Math.max(1, page - 1))}
                      >
                        Trước
                      </button>
                    </li>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <li className={`page-item ${page === i + 1 ? "active" : ""}`} key={i}>
                        <button className="page-link" onClick={() => setPage(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                      >
                        Sau
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductList;

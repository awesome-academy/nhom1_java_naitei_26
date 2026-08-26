import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ScrollToTop from "../ScrollToTop";
import StarRating from "../../components/StarRating";
import SocialShare from "../../components/SocialShare";
import ProductCard from "../../components/ProductCard";
import useReviews from "../../hooks/useReviews";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import {
  getProductById,
  getRelatedProducts,
  getCategoryName,
  PRODUCT_TYPES,
} from "../../data/products";
import { formatPrice, calcDiscountPercent } from "../../utils/format";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const product = useMemo(() => getProductById(id), [id]);
  const related = useMemo(() => getRelatedProducts(product), [product]);
  const baseline = useMemo(
    () => ({ rating: product?.rating || 0, count: product?.reviewCount || 0 }),
    [product]
  );
  const { reviews, addReview, averageRating, distribution, total, visibleTotal } =
    useReviews(id, baseline);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("description");
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", content: "" });
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
    setTab("description");
  }, [id]);

  if (!product) {
    return (
      <div className="container my-14 text-center">
        <h2 className="mb-3">Không tìm thấy sản phẩm</h2>
        <p className="text-muted">Sản phẩm có thể đã bị gỡ hoặc đường dẫn không đúng.</p>
        <Link to="/thuc-pham-do-uong" className="btn btn-primary">
          Về danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const discount = calcDiscountPercent(product.price, product.oldPrice);
  const typeLabel = PRODUCT_TYPES.find((t) => t.value === product.type)?.label;
  const displayRating = averageRating;
  const displayCount = total;

  const changeQuantity = (delta) => {
    setQuantity((q) => Math.min(product.stock, Math.max(1, q + delta)));
  };

  const handleAddToCart = () => {
    addItem(product.id, quantity);
    Swal.fire({
      icon: "success",
      title: "Đã thêm vào giỏ hàng",
      text: `${product.name} × ${quantity}`,
      timer: 1800,
      showConfirmButton: false,
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate("/dang-nhap", { state: { from: { pathname: `/san-pham/${product.id}` } } });
      return;
    }
    addItem(product.id, quantity);
    navigate("/thanh-toan");
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/dang-nhap", { state: { from: { pathname: `/san-pham/${product.id}` } } });
      return;
    }
    if (!reviewForm.content.trim()) {
      setReviewError("Vui lòng nhập nội dung đánh giá.");
      return;
    }
    addReview({
      author: user.fullName || user.email,
      rating: reviewForm.rating,
      title: reviewForm.title.trim() || "Đánh giá sản phẩm",
      content: reviewForm.content.trim(),
    });
    setReviewForm({ rating: 5, title: "", content: "" });
    setReviewError("");
    Swal.fire({
      icon: "success",
      title: "Cảm ơn bạn đã đánh giá!",
      timer: 1600,
      showConfirmButton: false,
    });
  };

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
            <li className="breadcrumb-item">
              <Link to={`/thuc-pham-do-uong?type=${product.type}`}>{typeLabel}</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to={`/thuc-pham-do-uong?category=${product.category}`}>
                {getCategoryName(product.category)}
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      <section className="mt-6 mb-lg-14 mb-8">
        <div className="container">
          <div className="row">
            {/* ------- Hình ảnh sản phẩm ------- */}
            <div className="col-lg-5 col-md-6">
              <div className="position-relative mb-3">
                {discount > 0 && (
                  <span className="badge bg-danger position-absolute top-0 start-0 m-3">
                    -{discount}%
                  </span>
                )}
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="img-fluid rounded-3 w-100"
                  style={{ objectFit: "cover", maxHeight: 460 }}
                />
              </div>
              <div className="d-flex gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`btn p-0 border rounded-2 overflow-hidden ${
                      activeImage === index ? "border-primary border-2" : "border-light"
                    }`}
                    style={{ width: 84, height: 84 }}
                    onClick={() => setActiveImage(index)}
                    aria-label={`Xem ảnh ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* ------- Thông tin sản phẩm ------- */}
            <div className="col-lg-7 col-md-6 mt-6 mt-md-0">
              <div className="ps-lg-6">
                <Link
                  to={`/thuc-pham-do-uong?category=${product.category}`}
                  className="mb-2 d-block text-decoration-none text-muted small"
                >
                  {typeLabel} · {getCategoryName(product.category)}
                </Link>

                <h1 className="mb-2 h2">{product.name}</h1>

                <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
                  <StarRating value={displayRating} showValue count={displayCount} />
                  <span className="text-muted small">Thương hiệu: {product.brand}</span>
{product.stock != null && product.stock > 0 ? (
    <span className="badge bg-success-subtle text-success">
      Còn {String(product.stock).split(" ")[0].toLowerCase()}
    </span>
  ) : (
    <span className="badge bg-danger-subtle text-danger">Hết hàng</span>
  )}
                </div>

                <div className="d-flex align-items-baseline gap-3 mb-3">
                  <span className="h2 mb-0 text-primary fw-bold">
                    {formatPrice(product.price)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-decoration-line-through text-muted">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                  <span className="text-muted small">/ {product.unit}</span>
                </div>

                <p className="mb-4">{product.shortDescription}</p>

                {/* Thông tin nhanh */}
                <div className="row g-2 mb-4 small">
                  <div className="col-6">
                    <span className="text-muted">Xuất xứ:</span>{" "}
                    <strong>{product.origin}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted">Hạn dùng:</span>{" "}
                    <strong>{product.expiry}</strong>
                  </div>
                  <div className="col-12">
                    <span className="text-muted">Bảo quản:</span>{" "}
                    <strong>{product.storage}</strong>
                  </div>
                </div>

                {/* Số lượng + hành động */}
                <div className="d-flex align-items-center flex-wrap gap-3 mb-4">
                  <div className="input-group" style={{ width: 140 }}>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => changeQuantity(-1)}
                      disabled={quantity <= 1}
                    >
                      <i className="fas fa-minus" />
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      value={quantity}
                      min={1}
                      max={product.stock}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v)) {
                          setQuantity(Math.min(product.stock, Math.max(1, v)));
                        }
                      }}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => changeQuantity(1)}
                      disabled={quantity >= product.stock}
                    >
                      <i className="fas fa-plus" />
                    </button>
                  </div>

                  <button
                    className="btn btn-primary flex-grow-1"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    <i className="fas fa-shopping-bag me-2" />
                    Thêm vào giỏ hàng
                  </button>
                  <button
                    className="btn btn-dark"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                  >
                    Mua ngay
                  </button>
                </div>

                <div className="mb-4">
                  <span className="text-muted small">Tạm tính: </span>
                  <strong className="text-primary">
                    {formatPrice(product.price * quantity)}
                  </strong>
                </div>

                {/* Chia sẻ sản phẩm lên mạng xã hội */}
                <div className="border-top pt-4">
                  <SocialShare
                    title={product.name}
                    description={product.shortDescription}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ------- Tabs: mô tả / dinh dưỡng / đánh giá ------- */}
          <div className="row mt-10">
            <div className="col-12">
              <ul className="nav nav-tabs" role="tablist">
                {[
                  { key: "description", label: "Mô tả sản phẩm" },
                  { key: "nutrition", label: "Thành phần dinh dưỡng" },
                  { key: "reviews", label: `Đánh giá (${total})` },
                ].map((item) => (
                  <li className="nav-item" key={item.key}>
                    <button
                      type="button"
                      className={`nav-link ${tab === item.key ? "active" : ""}`}
                      onClick={() => setTab(item.key)}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="py-6">
                {tab === "description" && (
                  <div>
                    <p>{product.description}</p>
                    <ul className="text-muted">
                      <li>Đơn vị bán: {product.unit}</li>
                      <li>Thương hiệu: {product.brand}</li>
                      <li>Xuất xứ: {product.origin}</li>
                      <li>Hướng dẫn bảo quản: {product.storage}</li>
                    </ul>
                  </div>
                )}

                {tab === "nutrition" && (
                  <div className="table-responsive">
                    <table className="table table-bordered w-auto">
                      <thead className="table-light">
                        <tr>
                          <th>Thành phần</th>
                          <th>Hàm lượng / 100g (hoặc 100ml)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Năng lượng</td>
                          <td>{product.nutrition.energy}</td>
                        </tr>
                        <tr>
                          <td>Chất đạm</td>
                          <td>{product.nutrition.protein}</td>
                        </tr>
                        <tr>
                          <td>Chất béo</td>
                          <td>{product.nutrition.fat}</td>
                        </tr>
                        <tr>
                          <td>Carbohydrate</td>
                          <td>{product.nutrition.carb}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {tab === "reviews" && (
                  <div className="row">
                    {/* Tổng quan đánh giá */}
                    <div className="col-lg-4 mb-6">
                      <div className="text-center border rounded-3 p-5">
                        <div className="h1 mb-0">{displayRating.toFixed(1)}</div>
                        <StarRating value={displayRating} />
                        <p className="text-muted mt-2 mb-0">{total} lượt đánh giá</p>
                      </div>
                      <div className="mt-4">
                        <p className="small text-muted mb-2">
                          Phân bố {visibleTotal} đánh giá đang hiển thị
                        </p>
                        {distribution.map(({ star, count }) => (
                          <div className="d-flex align-items-center gap-2 mb-2" key={star}>
                            <span className="small" style={{ width: 46 }}>
                              {star} sao
                            </span>
                            <div className="progress flex-grow-1" style={{ height: 8 }}>
                              <div
                                className="progress-bar bg-warning"
                                style={{
                                  width: visibleTotal
                                    ? `${(count / visibleTotal) * 100}%`
                                    : "0%",
                                }}
                              />
                            </div>
                            <span className="small text-muted" style={{ width: 24 }}>
                              {count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Danh sách + form đánh giá */}
                    <div className="col-lg-8">
                      {reviews.length === 0 ? (
                        <p className="text-muted">
                          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm
                          này.
                        </p>
                      ) : (
                        reviews.map((review) => (
                          <div className="border-bottom pb-4 mb-4" key={review.id}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{review.title}</h6>
                                <StarRating value={review.rating} />
                                <span className="ms-2 small text-muted">
                                  {review.author}
                                </span>
                              </div>
                              <span className="small text-muted">{review.date}</span>
                            </div>
                            <p className="mt-2 mb-0">{review.content}</p>
                          </div>
                        ))
                      )}

                      {/* Form đánh giá sản phẩm */}
                      <div className="mt-6">
                        <h5 className="mb-3">Viết đánh giá của bạn</h5>
                        {!isAuthenticated && (
                          <div className="alert alert-info py-2">
                            Vui lòng <Link to="/dang-nhap">đăng nhập</Link> để gửi đánh
                            giá.
                          </div>
                        )}
                        <form onSubmit={handleSubmitReview}>
                          <div className="mb-3">
                            <label className="form-label d-block">Chấm điểm</label>
                            <StarRating
                              value={reviewForm.rating}
                              onRate={(rating) =>
                                setReviewForm((prev) => ({ ...prev, rating }))
                              }
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="reviewTitle" className="form-label">
                              Tiêu đề
                            </label>
                            <input
                              type="text"
                              id="reviewTitle"
                              className="form-control"
                              placeholder="Tóm tắt cảm nhận của bạn"
                              value={reviewForm.title}
                              onChange={(e) =>
                                setReviewForm((prev) => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="reviewContent" className="form-label">
                              Nội dung
                            </label>
                            <textarea
                              id="reviewContent"
                              rows={4}
                              className={`form-control ${reviewError ? "is-invalid" : ""}`}
                              placeholder="Sản phẩm này thế nào?"
                              value={reviewForm.content}
                              onChange={(e) => {
                                setReviewForm((prev) => ({
                                  ...prev,
                                  content: e.target.value,
                                }));
                                setReviewError("");
                              }}
                            />
                            {reviewError && (
                              <div className="invalid-feedback">{reviewError}</div>
                            )}
                          </div>
                          <button type="submit" className="btn btn-primary">
                            Gửi đánh giá
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ------- Sản phẩm liên quan ------- */}
          {related.length > 0 && (
            <div className="row mt-8">
              <div className="col-12 mb-4">
                <h3 className="h4">Sản phẩm liên quan</h3>
              </div>
              {related.map((item) => (
                <div className="col-lg-3 col-md-4 col-6 mb-4" key={item.id}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;

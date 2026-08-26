import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import StarRating from "./StarRating";
import QuickBuyModal from "./QuickBuyModal";
import { formatPrice, calcDiscountPercent } from "../utils/format";
import { getCategoryName } from "../data/products";
import { useCart } from "../context/CartContext";

// Thẻ sản phẩm dùng lại ở trang danh sách, trang chủ và khối "sản phẩm liên quan".
const ProductCard = ({ product, layout = "grid" }) => {
  const { addItem } = useCart();
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const discount = calcDiscountPercent(product.price, product.oldPrice);
  const detailUrl = `/san-pham/${product.id}`;

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, 1);
      Swal.fire({
        icon: "success",
        title: "Đã thêm vào giỏ hàng",
        text: product.name,
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.message || "Không thể thêm vào giỏ hàng",
      });
    }
  };

  const media = (
    <div className="text-center position-relative">
      {product.badge && (
        <div className="position-absolute top-0 start-0">
          <span className={`badge ${discount ? "bg-danger" : "bg-success"}`}>
            {discount ? `-${discount}%` : product.badge}
          </span>
        </div>
      )}
      <Link to={detailUrl}>
        <img src={product.images[0]} alt={product.name} className="mb-3 img-fluid" />
      </Link>
      <div className="card-product-action">
        <Link to={detailUrl} className="btn-action" title="Xem chi tiết">
          <i className="bi bi-eye" />
        </Link>
      </div>
    </div>
  );

  const info = (
    <>
      <div className="text-small mb-1">
        <Link
          to={`/thuc-pham-do-uong?category=${product.category}`}
          className="text-decoration-none text-muted"
        >
          <small>{getCategoryName(product.category)}</small>
        </Link>
      </div>
      <h2 className="fs-6">
        <Link to={detailUrl} className="text-inherit text-decoration-none">
          {product.name}
        </Link>
      </h2>
      <div className="text-muted small mb-1">{product.unit}</div>
      <StarRating value={product.rating} showValue count={product.reviewCount} />
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          <span className="text-dark fw-bold">{formatPrice(product.price)}</span>{" "}
          {product.oldPrice && (
            <span className="text-decoration-line-through text-muted small">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
        <div className="d-flex gap-1">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            title="Thêm vào giỏ hàng"
          >
            <i className="fas fa-plus me-1" />
            Thêm
          </button>
          <button
            type="button"
            className="btn btn-warning btn-sm text-dark fw-semibold"
            onClick={() => setShowQuickBuy(true)}
            disabled={product.stock === 0}
            title="Mua ngay trực tiếp"
          >
            <i className="fas fa-bolt me-1" />
            Mua ngay
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {layout === "list" ? (
        <div className="card card-product mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-4 col-12">{media}</div>
              <div className="col-md-8 col-12">
                {info}
                <p className="text-muted small mt-2 mb-0">{product.shortDescription}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card card-product h-100">
          <div className="card-body d-flex flex-column">
            {media}
            {info}
          </div>
        </div>
      )}

      {/* Modal Đặt mua ngay trực tiếp */}
      <QuickBuyModal
        product={product}
        isOpen={showQuickBuy}
        onClose={() => setShowQuickBuy(false)}
        initialQuantity={1}
      />
    </>
  );
};

export default ProductCard;

import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { getAllProducts } from "../data/products";

// Khối "Sản phẩm nổi bật" ở trang chủ.
// Lấy các sản phẩm có đánh giá cao nhất từ catalog thật.
const FeaturedProducts = ({ limit = 10 }) => {
  const products = [...getAllProducts()]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);

  return (
    <section className="my-lg-14 my-8">
      <div className="container">
        <div className="row">
          <div className="col-12 mb-6">
            <div className="section-head text-center mt-8">
              <h3 className="h3style" data-title="Sản phẩm nổi bật">
                Sản phẩm nổi bật
              </h3>
              <div className="wt-separator bg-primarys" />
              <div className="wt-separator2 bg-primarys" />
              <p className="text-muted mt-3">
                Những món được khách hàng đánh giá cao nhất tuần này.
              </p>
            </div>
          </div>
        </div>

        <div className="row g-4 row-cols-lg-5 row-cols-2 row-cols-md-3">
          {products.map((product) => (
            <div className="col" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/thuc-pham-do-uong" className="btn btn-primary">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

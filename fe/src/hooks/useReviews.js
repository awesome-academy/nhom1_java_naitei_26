import { useCallback, useEffect, useState } from "react";
import { SEED_REVIEWS } from "../data/products";

// Đánh giá sản phẩm. Đánh giá mẫu lấy từ data, đánh giá mới lưu localStorage.
// Khi có BE: thay readStored/persist bằng GET/POST /api/products/:id/reviews.
//
// Lưu ý về điểm trung bình: product.rating / product.reviewCount là số liệu tổng
// hợp sẵn có của sản phẩm (đã bao gồm các đánh giá cũ, trong đó SEED_REVIEWS chỉ
// là vài đánh giá tiêu biểu được hiển thị). Vì vậy khi tính lại trung bình ta
// cộng dồn đánh giá MỚI vào con số tổng hợp đó, để điểm ở trang chi tiết luôn
// khớp với điểm hiển thị trên thẻ sản phẩm.

const STORAGE_KEY = "fd_reviews";

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export default function useReviews(productId, baseline = { rating: 0, count: 0 }) {
  const [seedReviews, setSeedReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);

  const load = useCallback(() => {
    const matches = (r) => String(r.productId) === String(productId);
    const byNewest = (a, b) => new Date(b.date) - new Date(a.date);
    setSeedReviews(SEED_REVIEWS.filter(matches).sort(byNewest));
    setUserReviews(readStored().filter(matches).sort(byNewest));
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const addReview = useCallback(
    ({ author, rating, title, content }) => {
      const review = {
        id: Date.now(),
        productId,
        author,
        rating: Number(rating),
        title,
        content,
        date: new Date().toISOString().slice(0, 10),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readStored(), review]));
      load();
      return review;
    },
    [productId, load]
  );

  // Danh sách hiển thị: đánh giá mới của người dùng đứng trước đánh giá mẫu.
  const reviews = [...userReviews, ...seedReviews];

  // Tổng số lượt đánh giá = số liệu tổng hợp + đánh giá mới thêm.
  const total = baseline.count + userReviews.length;

  const averageRating = total
    ? (baseline.rating * baseline.count +
        userReviews.reduce((sum, r) => sum + r.rating, 0)) /
      total
    : 0;

  // Phân bố sao tính trên các đánh giá đang hiển thị.
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const visibleTotal = reviews.length;

  return { reviews, addReview, averageRating, distribution, total, visibleTotal };
}

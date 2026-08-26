import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function useReviews(productId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Không thể tải đánh giá");
      const json = await res.json();
      setReviews(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const addReview = useCallback(
    async ({ rating, content }) => {
      const res = await fetch(`${API_BASE}/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ score: Number(rating), comment: content }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Gửi đánh giá thất bại");
      }
      await load();
    },
    [productId, load]
  );

  const total = reviews.length;
  const averageRating = total
    ? reviews.reduce((sum, r) => sum + r.score, 0) / total
    : 0;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.score) === star).length,
  }));

  return { reviews, loading, error, addReview, averageRating, distribution, total };
}

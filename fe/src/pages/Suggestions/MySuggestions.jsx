import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import AccountSidebar from "../../components/AccountSidebar";
import {
  fetchMySuggestions,
  getStatusBadge,
  getStatusLabel,
  getTypeLabel,
} from "../../data/suggestions";

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Câu dẫn cho phần ghi chú của quản trị viên, đọc theo trạng thái cho dễ hiểu.
function getNoteLabel(status) {
  if (status === "APPROVED") return "Phản hồi khi duyệt";
  if (status === "REJECTED") return "Lý do từ chối";
  return "Ghi chú của quản trị viên";
}

const MySuggestions = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    fetchMySuggestions()
      .then((data) => {
        if (!ignore) setItems(data || []);
      })
      .catch((err) => {
        if (ignore) return;
        setItems([]);
        setError(err.message || "Không tải được danh sách đề xuất của bạn.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <ScrollToTop />

      <div className="container mt-6">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Trang chủ</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Đề xuất của tôi
            </li>
          </ol>
        </nav>
      </div>

      <section className="mt-4 mb-lg-14 mb-8">
        <div className="container">
          <div className="row">
            <div className="col-lg-3 mb-6 mb-lg-0">
              <AccountSidebar />
            </div>

            <div className="col-lg-9">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                <h1 className="h2 fw-bold mb-0">Đề xuất của tôi</h1>
                <Link to="/de-xuat-san-pham" className="btn btn-primary btn-sm">
                  <i className="fas fa-plus me-2" />
                  Gửi đề xuất mới
                </Link>
              </div>
              <p className="text-muted mb-6">
                Theo dõi các món bạn đã đề xuất và phản hồi của cửa hàng.
              </p>

              {loading ? (
                <div className="card">
                  <div className="card-body text-center text-muted py-6">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <div className="small">Đang tải đề xuất của bạn...</div>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger mb-0">{error}</div>
              ) : items.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center py-6">
                    <i className="fas fa-lightbulb fs-1 text-muted mb-3 d-block" />
                    <p className="mb-3">Bạn chưa gửi đề xuất nào.</p>
                    <Link to="/de-xuat-san-pham" className="btn btn-primary">
                      Gửi đề xuất đầu tiên
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {items.map((suggestion) => (
                    <div className="card" key={suggestion.id}>
                      <div className="card-body">
                        <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                          <div>
                            <h2 className="h5 fw-bold mb-1">{suggestion.productName}</h2>
                            <span className="small text-muted">
                              {getTypeLabel(suggestion.type)} · Gửi ngày{" "}
                              {formatDateTime(suggestion.createdAt)}
                            </span>
                          </div>
                          <span className={`badge ${getStatusBadge(suggestion.status)}`}>
                            {getStatusLabel(suggestion.status)}
                          </span>
                        </div>

                        {suggestion.description && (
                          <p className="mb-0 text-muted small">{suggestion.description}</p>
                        )}

                        {suggestion.adminNote && (
                          <div className="mt-3 p-3 bg-light rounded">
                            <div className="small fw-semibold mb-1">
                              <i className="fas fa-comment-dots me-2 text-primary" />
                              {getNoteLabel(suggestion.status)}
                            </div>
                            <div className="small">{suggestion.adminNote}</div>
                          </div>
                        )}

                        {suggestion.status === "PENDING" && (
                          <div className="small text-muted mt-3">
                            <i className="fas fa-clock me-2" />
                            Quản trị viên đang xem xét đề xuất này.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MySuggestions;

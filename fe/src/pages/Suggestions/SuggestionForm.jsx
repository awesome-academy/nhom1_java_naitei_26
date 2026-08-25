import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import ScrollToTop from "../ScrollToTop";
import AccountSidebar from "../../components/AccountSidebar";
import { useAuth } from "../../context/AuthContext";
import { createSuggestion, SUGGESTION_TYPES } from "../../data/suggestions";

const EMPTY_FORM = {
  productName: "",
  type: "FOOD",
  description: "",
};

const DESCRIPTION_MAX = 500;

const SuggestionForm = () => {
  const { user } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const next = {};

    if (!form.productName.trim()) {
      next.productName = "Vui lòng nhập tên món muốn đề xuất.";
    } else if (form.productName.trim().length < 2) {
      next.productName = "Tên món phải có ít nhất 2 ký tự.";
    }

    if (!form.type) {
      next.type = "Vui lòng chọn loại sản phẩm.";
    }

    if (form.description.length > DESCRIPTION_MAX) {
      next.description = `Mô tả tối đa ${DESCRIPTION_MAX} ký tự.`;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Ticket này chỉ dựng giao diện: lưu tạm xuống localStorage.
      // Ticket nối API sẽ thay lời gọi dưới đây bằng POST /api/suggestions.
      createSuggestion(form, user);

      setForm(EMPTY_FORM);
      setErrors({});
      Swal.fire({
        icon: "success",
        title: "Đã gửi đề xuất",
        text: "Cảm ơn bạn! Quản trị viên sẽ xem xét đề xuất này sớm nhất có thể.",
        confirmButtonText: "Đóng",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gửi đề xuất thất bại",
        text: "Có lỗi xảy ra, vui lòng thử lại sau.",
        confirmButtonText: "Đã hiểu",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
              Đề xuất sản phẩm
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
              <h1 className="h2 fw-bold mb-2">Đề xuất sản phẩm</h1>
              <p className="text-muted mb-6">
                Bạn muốn mua món nào mà cửa hàng chưa có? Gửi đề xuất để chúng tôi cân nhắc nhập thêm.
              </p>

              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit} noValidate>
                    <div className="row g-3">
                      <div className="col-12">
                        <label htmlFor="productName" className="form-label">
                          Tên món <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          id="productName"
                          name="productName"
                          className={`form-control ${errors.productName ? "is-invalid" : ""}`}
                          value={form.productName}
                          onChange={handleChange}
                          placeholder="Ví dụ: Sữa chua nếp cẩm"
                        />
                        {errors.productName && (
                          <div className="invalid-feedback">{errors.productName}</div>
                        )}
                      </div>

                      <div className="col-12">
                        <span className="form-label d-block">
                          Loại sản phẩm <span className="text-danger">*</span>
                        </span>
                        <div className="d-flex flex-wrap gap-4">
                          {SUGGESTION_TYPES.map((type) => (
                            <div className="form-check" key={type.value}>
                              <input
                                className="form-check-input"
                                type="radio"
                                name="type"
                                id={`type-${type.value}`}
                                value={type.value}
                                checked={form.type === type.value}
                                onChange={handleChange}
                              />
                              <label className="form-check-label" htmlFor={`type-${type.value}`}>
                                {type.label}
                              </label>
                            </div>
                          ))}
                        </div>
                        {errors.type && <div className="text-danger small mt-1">{errors.type}</div>}
                      </div>

                      <div className="col-12">
                        <label htmlFor="description" className="form-label">
                          Mô tả thêm
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={4}
                          className={`form-control ${errors.description ? "is-invalid" : ""}`}
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Mô tả hương vị, quy cách đóng gói, thương hiệu mong muốn..."
                        />
                        {errors.description ? (
                          <div className="invalid-feedback">{errors.description}</div>
                        ) : (
                          <div className="form-text">
                            Không bắt buộc · {form.description.length}/{DESCRIPTION_MAX} ký tự
                          </div>
                        )}
                      </div>

                      <div className="col-12 d-flex flex-wrap gap-2">
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                          {submitting ? "Đang gửi..." : "Gửi đề xuất"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-light"
                          onClick={() => {
                            setForm(EMPTY_FORM);
                            setErrors({});
                          }}
                        >
                          Nhập lại
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuggestionForm;

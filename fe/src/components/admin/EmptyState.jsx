import React from "react";

// Hiển thị khi bảng không có dữ liệu hoặc bộ lọc không khớp kết quả nào.
const EmptyState = ({ icon = "fa-inbox", title, description, children }) => {
  return (
    <div className="text-center py-6">
      <i className={`fas ${icon} fa-2x text-secondary opacity-50 mb-3`} />
      <h6 className="fw-semibold mb-1">{title}</h6>
      {description && <p className="text-muted small mb-3">{description}</p>}
      {children}
    </div>
  );
};

export default EmptyState;

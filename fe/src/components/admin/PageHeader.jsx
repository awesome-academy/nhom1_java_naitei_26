import React from "react";
import { Link } from "react-router-dom";

// Tiêu đề trang + breadcrumb + vùng nút hành động bên phải.
const PageHeader = ({ title, subtitle, breadcrumb = [], children }) => {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
      <div>
        {breadcrumb.length > 0 && (
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small mb-1">
              <li className="breadcrumb-item">
                <Link to="/admin" className="text-decoration-none">
                  Quản trị
                </Link>
              </li>
              {breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;
                return isLast || !item.to ? (
                  <li className="breadcrumb-item active" aria-current="page" key={item.label}>
                    {item.label}
                  </li>
                ) : (
                  <li className="breadcrumb-item" key={item.label}>
                    <Link to={item.to} className="text-decoration-none">
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
        <h1 className="h4 fw-bold mb-1">{title}</h1>
        {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
      </div>

      {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
    </div>
  );
};

export default PageHeader;

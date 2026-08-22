import React from "react";

// Thẻ số liệu ở Dashboard: nhãn, giá trị lớn và icon màu.
const StatCard = ({ label, value, icon, tone = "primary", hint }) => {
  return (
    <div className="admin-card h-100 p-3">
      <div className="d-flex align-items-center gap-3">
        <span className={`admin-stat-icon bg-${tone}-subtle text-${tone}`}>
          <i className={`fas ${icon}`} />
        </span>
        <div className="min-w-0">
          <div className="small text-muted">{label}</div>
          <div className="h5 fw-bold mb-0 text-truncate">{value}</div>
        </div>
      </div>
      {hint && <div className="small text-muted mt-2">{hint}</div>}
    </div>
  );
};

export default StatCard;

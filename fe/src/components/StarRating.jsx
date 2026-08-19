import React from "react";

// Hiển thị số sao (có nửa sao). Khi truyền onRate sẽ chuyển sang chế độ chọn sao.
const StarRating = ({ value = 0, onRate, size = "small", showValue = false, count }) => {
  const interactive = typeof onRate === "function";

  const renderStar = (index) => {
    const starValue = index + 1;
    let icon = "bi bi-star";
    if (value >= starValue) icon = "bi bi-star-fill";
    else if (value >= starValue - 0.5) icon = "bi bi-star-half";

    if (!interactive) return <i key={index} className={icon} />;

    return (
      <button
        key={index}
        type="button"
        className="btn btn-link p-0 border-0 text-warning lh-1"
        style={{ fontSize: "1.25rem", textDecoration: "none" }}
        onClick={() => onRate(starValue)}
        aria-label={`Chọn ${starValue} sao`}
      >
        <i className={icon} />
      </button>
    );
  };

  return (
    <span className="d-inline-flex align-items-center gap-1">
      <span className={`text-warning ${size === "small" ? "small" : ""}`}>
        {[0, 1, 2, 3, 4].map(renderStar)}
      </span>
      {showValue && (
        <span className="text-muted small">
          {Number(value).toFixed(1)}
          {count !== undefined && ` (${count})`}
        </span>
      )}
    </span>
  );
};

export default StarRating;

import React from "react";

// Phân trang dùng chung cho các bảng quản trị.
// Hiển thị tối đa 5 số trang quanh trang hiện tại, kèm dấu "…" ở hai đầu.
function buildPageList(current, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}

const Pagination = ({ page, totalPages, totalItems, pageSize, onChange }) => {
  if (totalPages <= 1) {
    return totalItems > 0 ? (
      <div className="small text-muted">Hiển thị {totalItems} kết quả</div>
    ) : null;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div className="small text-muted">
        Hiển thị {from}–{to} trong tổng số {totalItems} kết quả
      </div>

      <nav aria-label="Phân trang">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onChange(page - 1)}
              disabled={page === 1}
              aria-label="Trang trước"
            >
              <i className="fas fa-chevron-left" />
            </button>
          </li>

          {buildPageList(page, totalPages).map((item, index) =>
            item === "..." ? (
              // eslint-disable-next-line react/no-array-index-key
              <li className="page-item disabled" key={`gap-${index}`}>
                <span className="page-link">…</span>
              </li>
            ) : (
              <li className={`page-item ${item === page ? "active" : ""}`} key={item}>
                <button type="button" className="page-link" onClick={() => onChange(item)}>
                  {item}
                </button>
              </li>
            )
          )}

          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button
              type="button"
              className="page-link"
              onClick={() => onChange(page + 1)}
              disabled={page === totalPages}
              aria-label="Trang sau"
            >
              <i className="fas fa-chevron-right" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;

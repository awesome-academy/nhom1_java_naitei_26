import React, { useEffect } from "react";

// Modal điều khiển hoàn toàn bằng React state (không phụ thuộc bootstrap.js),
// dùng cho các form thêm/sửa trong trang quản trị.
const AdminModal = ({ show, title, size = "", onClose, children, footer }) => {
  // Đóng bằng phím Esc và khoá cuộn nền khi modal đang mở.
  useEffect(() => {
    if (!show) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [show, onClose]);

  if (!show) return null;

  const sizeClass = size ? (size.startsWith("modal-") ? size : `modal-${size}`) : "";

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${sizeClass}`}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Đóng" />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
};

export default AdminModal;

import React, { useRef, useState } from "react";
import Swal from "sweetalert2";
import { MAX_IMAGE_SIZE } from "../../../data/adminProducts";

// Đọc file ảnh thành chuỗi base64 để lưu tạm vào localStorage.
// Khi có API thật: gửi thẳng File qua FormData thay vì đọc base64 như ở đây.
function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Không đọc được file ${file.name}`));
    reader.readAsDataURL(file);
  });
}

const ProductImages = ({ images, onChange, error }) => {
  const inputRef = useRef(null);
  const [urlInput, setUrlInput] = useState("");
  const [reading, setReading] = useState(false);

  const handleFiles = async (fileList) => {
    const files = [...fileList].filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) return;

    const tooBig = files.filter((file) => file.size > MAX_IMAGE_SIZE);
    if (tooBig.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Ảnh quá lớn",
        html: `${tooBig.map((f) => `<b>${f.name}</b>`).join(", ")} vượt quá ${Math.round(
          MAX_IMAGE_SIZE / 1024
        )}KB.<br/>Hãy nén ảnh lại trước khi tải lên.`,
        confirmButtonText: "Đã hiểu",
      });
    }

    const accepted = files.filter((file) => file.size <= MAX_IMAGE_SIZE);
    if (accepted.length === 0) return;

    setReading(true);
    try {
      const dataUrls = await Promise.all(accepted.map(readFileAsDataUrl));
      onChange([...images, ...dataUrls]);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Lỗi đọc ảnh", text: err.message });
    } finally {
      setReading(false);
    }
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (images.includes(url)) {
      Swal.fire({ icon: "info", title: "Ảnh này đã có trong danh sách" });
      return;
    }
    onChange([...images, url]);
    setUrlInput("");
  };

  const handleRemove = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  // Ảnh đầu tiên là ảnh chính (hiển thị ở danh sách sản phẩm và giỏ hàng).
  const handleSetPrimary = (index) => {
    const next = [...images];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label mb-0">
          Hình ảnh sản phẩm <span className="text-danger">*</span>
        </label>
        <span className="small text-muted">{images.length} ảnh</span>
      </div>

      {images.length > 0 && (
        <div className="row g-2 mb-3">
          {images.map((image, index) => (
            // Ảnh có thể trùng URL nên dùng kèm index làm key.
            // eslint-disable-next-line react/no-array-index-key
            <div className="col-4 col-md-3" key={`${image.slice(0, 32)}-${index}`}>
              <div className={`admin-image-tile ${index === 0 ? "is-primary" : ""}`}>
                <img src={image} alt={`Ảnh ${index + 1}`} />

                <div className="admin-image-actions">
                  {index !== 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      onClick={() => handleSetPrimary(index)}
                      title="Đặt làm ảnh chính"
                    >
                      <i className="fas fa-star" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-light text-danger"
                    onClick={() => handleRemove(index)}
                    title="Xoá ảnh"
                  >
                    <i className="fas fa-xmark" />
                  </button>
                </div>

                {index === 0 && (
                  <span className="badge bg-primary admin-image-primary-tag">Ảnh chính</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className="admin-dropzone mb-2"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        {reading ? (
          <>
            <i className="fas fa-spinner fa-spin fa-lg mb-2 d-block" />
            <span className="small">Đang xử lý ảnh...</span>
          </>
        ) : (
          <>
            <i className="fas fa-cloud-arrow-up fa-lg mb-2 d-block" />
            <span className="small">
              Kéo thả ảnh vào đây hoặc <span className="text-primary">chọn từ máy</span>
            </span>
            <span className="small d-block text-muted mt-1">
              Định dạng JPG/PNG, tối đa {Math.round(MAX_IMAGE_SIZE / 1024)}KB mỗi ảnh
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="d-none"
        onChange={(e) => {
          handleFiles(e.target.files);
          // Reset để chọn lại đúng file vừa xoá vẫn kích hoạt onChange.
          e.target.value = "";
        }}
      />

      <div className="input-group input-group-sm">
        <span className="input-group-text bg-white">
          <i className="fas fa-link text-muted" />
        </span>
        <input
          type="url"
          className="form-control"
          placeholder="Hoặc dán đường dẫn ảnh (https://...)"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddUrl();
            }
          }}
        />
        <button type="button" className="btn btn-outline-secondary" onClick={handleAddUrl}>
          Thêm
        </button>
      </div>

      {error && <div className="text-danger small mt-2">{error}</div>}
    </div>
  );
};

export default ProductImages;

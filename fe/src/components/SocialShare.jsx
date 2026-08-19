import React from "react";
import Swal from "sweetalert2";

// Chia sẻ sản phẩm lên mạng xã hội.
// Dùng share endpoint công khai của từng nền tảng, không cần SDK.
const SocialShare = ({ url, title, description = "" }) => {
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title || document.title);
  const encodedDesc = encodeURIComponent(description);

  const targets = [
    {
      id: "facebook",
      label: "Facebook",
      icon: "fab fa-facebook-f",
      className: "btn-outline-primary",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      id: "twitter",
      label: "Twitter",
      icon: "fab fa-x-twitter",
      className: "btn-outline-dark",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      id: "messenger",
      label: "Messenger",
      icon: "fab fa-facebook-messenger",
      className: "btn-outline-info",
      href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=123456789&redirect_uri=${encodedUrl}`,
    },
    {
      id: "email",
      label: "Email",
      icon: "far fa-envelope",
      className: "btn-outline-secondary",
      href: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
    },
  ];

  const openShare = (e, target) => {
    if (target.id === "email") return; // để trình duyệt tự mở mail client
    e.preventDefault();
    window.open(target.href, "_blank", "width=600,height=600,noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      Swal.fire({
        icon: "success",
        title: "Đã sao chép liên kết",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({ icon: "error", title: "Không sao chép được liên kết" });
    }
  };

  return (
    <div className="d-flex align-items-center flex-wrap gap-2">
      <span className="fw-semibold me-1">Chia sẻ:</span>
      {targets.map((target) => (
        <a
          key={target.id}
          href={target.href}
          className={`btn btn-sm ${target.className}`}
          onClick={(e) => openShare(e, target)}
          rel="noopener noreferrer"
          target="_blank"
          title={`Chia sẻ qua ${target.label}`}
        >
          <i className={target.icon} />
        </a>
      ))}
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary"
        onClick={copyLink}
        title="Sao chép liên kết"
      >
        <i className="far fa-copy" />
      </button>
    </div>
  );
};

export default SocialShare;

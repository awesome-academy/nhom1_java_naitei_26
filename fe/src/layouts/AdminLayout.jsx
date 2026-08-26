import React, { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopbar from "../components/admin/AdminTopbar";
import { getOrderStats } from "../data/adminOrders";
import { getSuggestionStats } from "../data/suggestions";
import { STORE_CHANGED_EVENT } from "../data/localStore";
import "../pages/Admin/admin.css";

// Khung chung của khu vực /admin: sidebar cố định + topbar + vùng nội dung.
// Không dùng Header/Footer của user site.
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Đổi trang thì đóng sidebar (chỉ ảnh hưởng trên mobile).
  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Số đơn chờ xác nhận và số đề xuất chờ duyệt hiển thị trên menu; tính lại khi
  // chuyển trang và mỗi khi có trang con ghi dữ liệu (ví dụ vừa duyệt một đơn).
  const [storeVersion, setStoreVersion] = useState(0);

  useEffect(() => {
    const onStoreChanged = () => setStoreVersion((v) => v + 1);
    window.addEventListener(STORE_CHANGED_EVENT, onStoreChanged);
    return () => window.removeEventListener(STORE_CHANGED_EVENT, onStoreChanged);
  }, []);

  // Số đề xuất chờ duyệt lấy từ API; lỗi (chưa đăng nhập, mất mạng) thì để 0 để ẩn badge
  // chứ không chặn cả khung quản trị.
  const [pendingSuggestions, setPendingSuggestions] = useState(0);

  useEffect(() => {
    let ignore = false;
    getSuggestionStats()
      .then((stats) => {
        if (!ignore) setPendingSuggestions(stats?.pending || 0);
      })
      .catch(() => {
        if (!ignore) setPendingSuggestions(0);
      });

    return () => {
      ignore = true;
    };
  }, [location.pathname, storeVersion]);

  const badges = useMemo(
    () => ({
      pendingOrders: getOrderStats().pending,
      pendingSuggestions,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname, storeVersion, pendingSuggestions]
  );

  return (
    <div className="admin-shell">
      <AdminSidebar
        isOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
        badges={badges}
      />

      {sidebarOpen && (
        <div className="admin-backdrop d-lg-none" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="admin-main">
        <AdminTopbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

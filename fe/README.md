# FE — Web Thực phẩm & Đồ uống
Frontend React (Create React App + Bootstrap 5), phát triển từ template Grocery-react
## Chạy dự án
```bash
npm install
npm start        # http://localhost:3000
npm run build    # build production
```
## Cấu trúc thư mục
```
src/
  data/products.js          # Catalog: 24 sản phẩm, 10 danh mục, đánh giá mẫu
  utils/format.js           # Tiền VND, bỏ dấu tiếng Việt, chữ cái đầu
  context/AuthContext.jsx   # Phiên đăng nhập + đăng nhập MXH
  hooks/useReviews.js       # Đánh giá sản phẩm
  components/
    ProtectedRoute.jsx      # Chặn route yêu cầu đăng nhập
    SocialAuthButtons.jsx   # Nút Facebook / Twitter / Google
    ProductCard.jsx         # Thẻ sản phẩm (lưới & danh sách)
    FeaturedProducts.jsx    # Khối sản phẩm nổi bật ở trang chủ
    StarRating.jsx          # Sao đánh giá (hiển thị + chọn)
    SocialShare.jsx         # Chia sẻ sản phẩm lên MXH
  Component/
    Header.jsx             
    Footer.jsx              
  pages/
    Home.jsx                # 
    NotFound.jsx            # Trang 404
    Auth/                   # Login, Register, ForgotPassword
    Products/               # ProductList, ProductDetail
    Cart/                   # Cart, Checkout — khung template, chờ làm
    Account/                # OrderHistory, Profile — khung template, chờ làm
```

## Requirement đã đáp ứng

**Auth (Hưng)**
- Đăng ký / Đăng nhập / Đăng xuất — validate, thông báo lỗi tiếng Việt
- Xác thực qua Facebook, Twitter, Google
- Route bảo vệ, đăng nhập xong quay lại đúng trang đang muốn vào

**Sản phẩm (Trung)**
- Xem thông tin thực phẩm & đồ uống — mô tả, dinh dưỡng, xuất xứ, bảo quản
- Lọc theo: bảng chữ cái (xử lý dấu tiếng Việt), phân loại (thực phẩm / đồ uống),
  giá, danh mục, đánh giá, thương hiệu, từ khoá — đồng bộ lên URL
- Xem hình ảnh / giá / số lượng — gallery ảnh, chọn số lượng, tạm tính
- Đánh giá sản phẩm — chấm sao, viết nhận xét, biểu đồ phân bố sao
- Chia sẻ lên MXH — Facebook, Twitter, Messenger, Email, copy link

## Việc còn lại

**Chưa làm (Admin — chưa có page nào)**
- Quản lý người dùng, danh mục, sản phẩm, đơn hàng
- Trang "không có quyền truy cập" (khi có phân quyền admin)
- Ảnh sản phẩm vẫn dùng ảnh mẫu của template, chưa khớp nội dung.
## Ghi chú kỹ thuật
- Dữ liệu là mock trong `src/data/products.js`. Khi có API thật, chỉ cần thay phần
  thân `getAllProducts` / `getProductById` và các hàm trong `AuthContext` /
  `useReviews` — component không phải sửa.
- Mật khẩu đang lưu plain text trong localStorage, **chỉ dùng cho bản demo**. Khi có
  backend, việc hash và lưu mật khẩu phải làm ở phía server.

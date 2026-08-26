// Dữ liệu mẫu cho catalog Thực phẩm & Đồ uống.
// Khi có API thật, chỉ cần thay các hàm getAllProducts / getProductById bên dưới.

import img1 from "../images/product-img-1.jpg";
import img2 from "../images/product-img-2.jpg";
import img3 from "../images/product-img-3.jpg";
import img4 from "../images/product-img-4.jpg";
import img5 from "../images/product-img-5.jpg";
import img6 from "../images/product-img-6.jpg";
import img7 from "../images/product-img-7.jpg";
import img8 from "../images/product-img-8.jpg";
import img9 from "../images/product-img-9.jpg";
import img10 from "../images/product-img-10.jpg";
import img11 from "../images/product-img-11.jpg";
import img12 from "../images/product-img-12.jpg";
import img13 from "../images/product-img-13.jpg";
import img15 from "../images/product-img-15.jpg";
import img16 from "../images/product-img-16.jpg";
import img17 from "../images/product-img-17.jpg";
import img18 from "../images/product-img-18.jpg";
import img19 from "../images/product-img-19.jpg";
import single1 from "../images/product-single-img-1.jpg";
import single2 from "../images/product-single-img-2.jpg";
import single3 from "../images/product-single-img-3.jpg";
import single4 from "../images/product-single-img-4.jpg";

// Phân loại cấp 1: thực phẩm hoặc đồ uống
export const PRODUCT_TYPES = [
  { value: "food", label: "Thực phẩm" },
  { value: "drink", label: "Đồ uống" },
];

// Danh mục cấp 2, mỗi danh mục thuộc về một phân loại
export const CATEGORIES = [
  { slug: "rau-cu-trai-cay", name: "Rau củ & Trái cây", type: "food" },
  { slug: "thit-ca-hai-san", name: "Thịt, Cá & Hải sản", type: "food" },
  { slug: "sua-trung", name: "Sữa, Bơ & Trứng", type: "food" },
  { slug: "banh-ngu-coc", name: "Bánh & Ngũ cốc", type: "food" },
  { slug: "do-an-vat", name: "Đồ ăn vặt", type: "food" },
  { slug: "thuc-pham-che-bien", name: "Thực phẩm chế biến", type: "food" },
  { slug: "nuoc-giai-khat", name: "Nước giải khát", type: "drink" },
  { slug: "nuoc-ep-sinh-to", name: "Nước ép & Sinh tố", type: "drink" },
  { slug: "tra-ca-phe", name: "Trà & Cà phê", type: "drink" },
  { slug: "sua-uong", name: "Sữa uống & Yogurt", type: "drink" },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Bánh mì hoa cúc Kinh Đô",
    slug: "banh-mi-hoa-cuc-kinh-do",
    type: "food",
    category: "banh-ngu-coc",
    brand: "Kinh Đô",
    price: 52000,
    oldPrice: 65000,
    unit: "Gói 400g",
    stock: 48,
    rating: 4.5,
    reviewCount: 149,
    badge: "Giảm giá",
    images: [img1, single1, single2],
    shortDescription:
      "Bánh mì hoa cúc thơm bơ, ruột mềm xốp, thích hợp cho bữa sáng nhanh gọn.",
    description:
      "Bánh mì hoa cúc Kinh Đô được làm từ bột mì cao cấp, bơ nhạt và trứng gà tươi. Sợi bánh dai mềm, thơm mùi bơ đặc trưng. Có thể dùng trực tiếp, kẹp cùng phô mai hoặc nướng nhẹ trước khi ăn.",
    nutrition: { energy: "372 kcal", protein: "8.5 g", fat: "12 g", carb: "56 g" },
    origin: "Việt Nam",
    expiry: "6 tháng kể từ ngày sản xuất",
    storage: "Nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp",
  },
  {
    id: 2,
    name: "Cà phê sữa đá hoà tan Highlands",
    slug: "ca-phe-sua-da-hoa-tan-highlands",
    type: "drink",
    category: "tra-ca-phe",
    brand: "Highlands Coffee",
    price: 89000,
    oldPrice: 105000,
    unit: "Hộp 18 gói",
    stock: 120,
    rating: 4.7,
    reviewCount: 302,
    badge: "Bán chạy",
    images: [img2, single3, single4],
    shortDescription:
      "Cà phê sữa đá pha sẵn, đậm vị robusta rang mộc, chỉ cần thêm nước và đá.",
    description:
      "Sự kết hợp giữa hạt robusta Buôn Ma Thuột rang đậm và sữa đặc, cho ly cà phê sữa đá chuẩn vị Việt trong 30 giây. Mỗi gói 22g pha được một ly 200ml.",
    nutrition: { energy: "95 kcal", protein: "1.2 g", fat: "2.4 g", carb: "17 g" },
    origin: "Việt Nam",
    expiry: "12 tháng kể từ ngày sản xuất",
    storage: "Nơi khô ráo, đậy kín sau khi mở",
  },
  {
    id: 3,
    name: "Cam sành Hà Giang",
    slug: "cam-sanh-ha-giang",
    type: "food",
    category: "rau-cu-trai-cay",
    brand: "Nông sản Việt",
    price: 45000,
    oldPrice: null,
    unit: "1 kg",
    stock: 60,
    rating: 4.3,
    reviewCount: 88,
    badge: "Tươi mới",
    images: [img3, single1],
    shortDescription: "Cam sành mọng nước, vị ngọt thanh, nhiều vitamin C.",
    description:
      "Cam sành trồng tại Hà Giang, thu hoạch đúng độ chín nên vỏ mỏng, tép mọng nước. Thích hợp ăn trực tiếp hoặc vắt nước ép.",
    nutrition: { energy: "47 kcal", protein: "0.9 g", fat: "0.1 g", carb: "12 g" },
    origin: "Hà Giang, Việt Nam",
    expiry: "7 ngày khi bảo quản lạnh",
    storage: "Ngăn mát tủ lạnh 4-8°C",
  },
  {
    id: 4,
    name: "Sữa tươi tiệt trùng Vinamilk không đường",
    slug: "sua-tuoi-tiet-trung-vinamilk-khong-duong",
    type: "drink",
    category: "sua-uong",
    brand: "Vinamilk",
    price: 34000,
    oldPrice: 39000,
    unit: "Lốc 4 hộp x 180ml",
    stock: 200,
    rating: 4.8,
    reviewCount: 512,
    badge: "Giảm giá",
    images: [img4, single2],
    shortDescription: "Sữa tươi 100% không đường, giàu canxi và vitamin D.",
    description:
      "Sữa tươi tiệt trùng từ trang trại bò sữa Vinamilk, không đường, phù hợp cho người ăn kiêng và người lớn tuổi. Bổ sung canxi cùng vitamin D3 hỗ trợ xương chắc khoẻ.",
    nutrition: { energy: "62 kcal", protein: "3.3 g", fat: "3.5 g", carb: "4.7 g" },
    origin: "Việt Nam",
    expiry: "6 tháng kể từ ngày sản xuất",
    storage: "Bảo quản lạnh sau khi mở, dùng trong 24 giờ",
  },
  {
    id: 5,
    name: "Thịt ba chỉ heo CP",
    slug: "thit-ba-chi-heo-cp",
    type: "food",
    category: "thit-ca-hai-san",
    brand: "CP Foods",
    price: 138000,
    oldPrice: 155000,
    unit: "Khay 500g",
    stock: 25,
    rating: 4.4,
    reviewCount: 96,
    badge: "Giảm giá",
    images: [img5, single3],
    shortDescription: "Ba chỉ heo tươi, tỷ lệ nạc mỡ cân đối, đạt chuẩn VietGAP.",
    description:
      "Thịt ba chỉ từ heo nuôi theo quy trình khép kín của CP, kiểm định thú y đầy đủ. Thớ thịt săn, mỡ trong, phù hợp để kho, nướng hoặc luộc.",
    nutrition: { energy: "518 kcal", protein: "9.3 g", fat: "53 g", carb: "0 g" },
    origin: "Việt Nam",
    expiry: "3 ngày khi bảo quản lạnh",
    storage: "Ngăn mát 0-4°C hoặc cấp đông -18°C",
  },
  {
    id: 6,
    name: "Nước suối Lavie",
    slug: "nuoc-suoi-lavie",
    type: "drink",
    category: "nuoc-giai-khat",
    brand: "Lavie",
    price: 68000,
    oldPrice: null,
    unit: "Thùng 24 chai x 500ml",
    stock: 150,
    rating: 4.6,
    reviewCount: 240,
    badge: null,
    images: [img6, single4],
    shortDescription: "Nước khoáng thiên nhiên, khoáng chất tự nhiên cân bằng.",
    description:
      "Nước khoáng thiên nhiên Lavie khai thác từ nguồn nước ngầm, qua hệ thống lọc đạt chuẩn quốc tế, giữ nguyên khoáng chất tự nhiên có lợi cho cơ thể.",
    nutrition: { energy: "0 kcal", protein: "0 g", fat: "0 g", carb: "0 g" },
    origin: "Việt Nam",
    expiry: "12 tháng kể từ ngày sản xuất",
    storage: "Nơi khô ráo, tránh ánh nắng trực tiếp",
  },
  {
    id: 7,
    name: "Snack khoai tây Lay's vị tảo biển",
    slug: "snack-khoai-tay-lays-vi-tao-bien",
    type: "food",
    category: "do-an-vat",
    brand: "Lay's",
    price: 28000,
    oldPrice: 32000,
    unit: "Gói 95g",
    stock: 300,
    rating: 4.2,
    reviewCount: 176,
    badge: "Giảm giá",
    images: [img7, single1],
    shortDescription: "Khoai tây lát mỏng giòn rụm, tẩm vị tảo biển Nhật Bản.",
    description:
      "Lay's vị tảo biển làm từ khoai tây tươi cắt lát mỏng, chiên giòn và tẩm gia vị tảo biển. Món ăn vặt quen thuộc cho những buổi xem phim.",
    nutrition: { energy: "536 kcal", protein: "6 g", fat: "32 g", carb: "53 g" },
    origin: "Việt Nam",
    expiry: "6 tháng kể từ ngày sản xuất",
    storage: "Nơi khô ráo, dùng ngay sau khi mở gói",
  },
  {
    id: 8,
    name: "Trà xanh không độ",
    slug: "tra-xanh-khong-do",
    type: "drink",
    category: "tra-ca-phe",
    brand: "Number 1",
    price: 96000,
    oldPrice: 110000,
    unit: "Thùng 24 chai x 455ml",
    stock: 90,
    rating: 4.1,
    reviewCount: 133,
    badge: "Giảm giá",
    images: [img8, single2],
    shortDescription: "Trà xanh đóng chai chiết xuất từ lá trà tươi, thanh mát.",
    description:
      "Trà xanh Không Độ được chiết xuất từ lá trà xanh tươi, bổ sung EGCG giúp giảm căng thẳng. Uống ngon nhất khi để lạnh.",
    nutrition: { energy: "38 kcal", protein: "0 g", fat: "0 g", carb: "9.5 g" },
    origin: "Việt Nam",
    expiry: "12 tháng kể từ ngày sản xuất",
    storage: "Nơi thoáng mát, tránh ánh nắng",
  },
  {
    id: 9,
    name: "Trứng gà ta Ba Huân",
    slug: "trung-ga-ta-ba-huan",
    type: "food",
    category: "sua-trung",
    brand: "Ba Huân",
    price: 42000,
    oldPrice: null,
    unit: "Vỉ 10 quả",
    stock: 80,
    rating: 4.6,
    reviewCount: 205,
    badge: null,
    images: [img9, single3],
    shortDescription: "Trứng gà ta sạch, đã xử lý tiệt trùng bề mặt.",
    description:
      "Trứng gà ta Ba Huân được thu gom hằng ngày, xử lý tiệt trùng bằng công nghệ Moba của Hà Lan. Lòng đỏ đậm màu, thơm béo.",
    nutrition: { energy: "155 kcal", protein: "13 g", fat: "11 g", carb: "1.1 g" },
    origin: "Việt Nam",
    expiry: "30 ngày khi bảo quản lạnh",
    storage: "Ngăn mát tủ lạnh",
  },
  {
    id: 10,
    name: "Nước ép táo Vfresh",
    slug: "nuoc-ep-tao-vfresh",
    type: "drink",
    category: "nuoc-ep-sinh-to",
    brand: "Vfresh",
    price: 27000,
    oldPrice: 31000,
    unit: "Hộp 1 lít",
    stock: 110,
    rating: 4.0,
    reviewCount: 74,
    badge: "Giảm giá",
    images: [img10, single4],
    shortDescription: "Nước ép táo nguyên chất, không chất bảo quản.",
    description:
      "Nước ép táo Vfresh làm từ táo tươi ép lấy nước, tiệt trùng UHT giữ trọn hương vị và vitamin. Không thêm chất bảo quản.",
    nutrition: { energy: "46 kcal", protein: "0.1 g", fat: "0 g", carb: "11 g" },
    origin: "Việt Nam",
    expiry: "9 tháng kể từ ngày sản xuất",
    storage: "Bảo quản lạnh sau khi mở, dùng trong 3 ngày",
  },
  {
    id: 11,
    name: "Gạo ST25 Ông Cua",
    slug: "gao-st25-ong-cua",
    type: "food",
    category: "banh-ngu-coc",
    brand: "Ông Cua",
    price: 215000,
    oldPrice: 240000,
    unit: "Túi 5 kg",
    stock: 40,
    rating: 4.9,
    reviewCount: 421,
    badge: "Bán chạy",
    images: [img11, single1],
    shortDescription: "Gạo ngon nhất thế giới 2019, hạt dài, cơm dẻo thơm lá dứa.",
    description:
      "Gạo ST25 chính hãng doanh nghiệp Hồ Quang Cua. Hạt gạo dài, trắng trong, khi nấu cho cơm mềm dẻo và giữ được mùi thơm lá dứa tự nhiên ngay cả khi nguội.",
    nutrition: { energy: "360 kcal", protein: "7.1 g", fat: "0.7 g", carb: "79 g" },
    origin: "Sóc Trăng, Việt Nam",
    expiry: "12 tháng kể từ ngày đóng gói",
    storage: "Nơi khô ráo, tránh ẩm mốc",
  },
  {
    id: 12,
    name: "Mì Hảo Hảo tôm chua cay",
    slug: "mi-hao-hao-tom-chua-cay",
    type: "food",
    category: "thuc-pham-che-bien",
    brand: "Acecook",
    price: 115000,
    oldPrice: null,
    unit: "Thùng 30 gói",
    stock: 200,
    rating: 4.5,
    reviewCount: 388,
    badge: null,
    images: [img12, single2],
    shortDescription: "Mì ăn liền vị tôm chua cay quen thuộc, sợi mì dai.",
    description:
      "Mì Hảo Hảo tôm chua cay với nước súp đậm đà vị tôm, chua cay vừa phải. Sợi mì được chiên ở nhiệt độ chuẩn nên giữ độ dai khi chan nước sôi.",
    nutrition: { energy: "350 kcal", protein: "6.9 g", fat: "13 g", carb: "51 g" },
    origin: "Việt Nam",
    expiry: "6 tháng kể từ ngày sản xuất",
    storage: "Nơi khô ráo, thoáng mát",
  },
  {
    id: 13,
    name: "Coca-Cola nguyên bản",
    slug: "coca-cola-nguyen-ban",
    type: "drink",
    category: "nuoc-giai-khat",
    brand: "Coca-Cola",
    price: 185000,
    oldPrice: 210000,
    unit: "Thùng 24 lon x 320ml",
    stock: 130,
    rating: 4.7,
    reviewCount: 456,
    badge: "Giảm giá",
    images: [img13, single3],
    shortDescription: "Nước giải khát có gas, hương vị nguyên bản.",
    description:
      "Coca-Cola nguyên bản với hương vị đặc trưng hơn 130 năm. Ngon nhất khi uống lạnh ở 4°C cùng đá viên.",
    nutrition: { energy: "42 kcal", protein: "0 g", fat: "0 g", carb: "10.6 g" },
    origin: "Việt Nam",
    expiry: "9 tháng kể từ ngày sản xuất",
    storage: "Nơi thoáng mát, tránh ánh nắng trực tiếp",
  },
  {
    id: 14,
    name: "Ức gà phi lê tươi",
    slug: "uc-ga-phi-le-tuoi",
    type: "food",
    category: "thit-ca-hai-san",
    brand: "3F Việt",
    price: 89000,
    oldPrice: null,
    unit: "Khay 500g",
    stock: 35,
    rating: 4.3,
    reviewCount: 112,
    badge: "Tươi mới",
    images: [img15, single4],
    shortDescription: "Ức gà phi lê không da, giàu đạm, ít béo — hợp người tập gym.",
    description:
      "Ức gà phi lê từ gà nuôi thả theo tiêu chuẩn 3F, đã lọc bỏ da và xương. Hàm lượng protein cao, ít chất béo, phù hợp cho chế độ ăn eat-clean.",
    nutrition: { energy: "165 kcal", protein: "31 g", fat: "3.6 g", carb: "0 g" },
    origin: "Việt Nam",
    expiry: "3 ngày khi bảo quản lạnh",
    storage: "Ngăn mát 0-4°C hoặc cấp đông -18°C",
  },
  {
    id: 15,
    name: "Sữa chua uống Yakult",
    slug: "sua-chua-uong-yakult",
    type: "drink",
    category: "sua-uong",
    brand: "Yakult",
    price: 32000,
    oldPrice: 36000,
    unit: "Lốc 5 chai x 65ml",
    stock: 175,
    rating: 4.6,
    reviewCount: 289,
    badge: "Giảm giá",
    images: [img16, single1],
    shortDescription: "Men sống Lactobacillus casei Shirota hỗ trợ tiêu hoá.",
    description:
      "Mỗi chai Yakult chứa hơn 6.5 tỷ lợi khuẩn L. casei Shirota còn sống, giúp cân bằng hệ vi sinh đường ruột. Uống 1 chai mỗi ngày.",
    nutrition: { energy: "50 kcal", protein: "0.8 g", fat: "0 g", carb: "11.6 g" },
    origin: "Việt Nam",
    expiry: "40 ngày khi bảo quản lạnh",
    storage: "Luôn giữ lạnh dưới 10°C",
  },
  {
    id: 16,
    name: "Bơ lạt Anchor",
    slug: "bo-lat-anchor",
    type: "food",
    category: "sua-trung",
    brand: "Anchor",
    price: 78000,
    oldPrice: 92000,
    unit: "Hộp 227g",
    stock: 55,
    rating: 4.8,
    reviewCount: 167,
    badge: "Giảm giá",
    images: [img17, single2],
    shortDescription: "Bơ lạt New Zealand, béo ngậy, chuyên dùng làm bánh.",
    description:
      "Bơ lạt Anchor sản xuất từ sữa bò New Zealand chăn thả tự nhiên, hàm lượng béo 82%. Là lựa chọn tiêu chuẩn cho làm bánh, nấu ăn và phết bánh mì.",
    nutrition: { energy: "717 kcal", protein: "0.9 g", fat: "81 g", carb: "0.1 g" },
    origin: "New Zealand",
    expiry: "12 tháng, xem hạn trên bao bì",
    storage: "Ngăn mát tủ lạnh 2-6°C",
  },
  {
    id: 17,
    name: "Xoài cát Hoà Lộc",
    slug: "xoai-cat-hoa-loc",
    type: "food",
    category: "rau-cu-trai-cay",
    brand: "Nông sản Việt",
    price: 125000,
    oldPrice: 140000,
    unit: "1 kg",
    stock: 30,
    rating: 4.7,
    reviewCount: 143,
    badge: "Tươi mới",
    images: [img18, single3],
    shortDescription: "Xoài cát Hoà Lộc chín cây, thịt dày, ngọt đậm, ít xơ.",
    description:
      "Xoài cát Hoà Lộc đặc sản Tiền Giang, được thu hoạch khi vừa chín tới. Thịt quả vàng cam, dày, ít xơ và có mùi thơm đặc trưng.",
    nutrition: { energy: "60 kcal", protein: "0.8 g", fat: "0.4 g", carb: "15 g" },
    origin: "Tiền Giang, Việt Nam",
    expiry: "5 ngày khi bảo quản lạnh",
    storage: "Nơi thoáng mát hoặc ngăn mát tủ lạnh",
  },
  {
    id: 18,
    name: "Rau cải ngọt hữu cơ",
    slug: "rau-cai-ngot-huu-co",
    type: "food",
    category: "rau-cu-trai-cay",
    brand: "Organica",
    price: 25000,
    oldPrice: null,
    unit: "Bó 300g",
    stock: 70,
    rating: 4.4,
    reviewCount: 61,
    badge: "Hữu cơ",
    images: [img19, single4],
    shortDescription: "Cải ngọt canh tác hữu cơ, không thuốc trừ sâu hoá học.",
    description:
      "Rau cải ngọt trồng theo tiêu chuẩn hữu cơ, không sử dụng thuốc bảo vệ thực vật và phân bón hoá học. Lá xanh non, vị ngọt tự nhiên.",
    nutrition: { energy: "13 kcal", protein: "1.5 g", fat: "0.2 g", carb: "2.2 g" },
    origin: "Lâm Đồng, Việt Nam",
    expiry: "5 ngày khi bảo quản lạnh",
    storage: "Ngăn mát tủ lạnh, bọc kín",
  },
  {
    id: 19,
    name: "Đậu phộng rang muối Tân Tân",
    slug: "dau-phong-rang-muoi-tan-tan",
    type: "food",
    category: "do-an-vat",
    brand: "Tân Tân",
    price: 35000,
    oldPrice: 42000,
    unit: "Gói 200g",
    stock: 140,
    rating: 4.1,
    reviewCount: 92,
    badge: "Giảm giá",
    images: [img1, single1],
    shortDescription: "Đậu phộng rang giòn, ướp muối vừa ăn.",
    description:
      "Đậu phộng chọn hạt đều, rang chín tới rồi ướp muối. Giòn, bùi, là món nhắm quen thuộc.",
    nutrition: { energy: "567 kcal", protein: "26 g", fat: "49 g", carb: "16 g" },
    origin: "Việt Nam",
    expiry: "9 tháng kể từ ngày sản xuất",
    storage: "Nơi khô ráo, đậy kín sau khi mở",
  },
  {
    id: 20,
    name: "Sinh tố xoài đóng chai",
    slug: "sinh-to-xoai-dong-chai",
    type: "drink",
    category: "nuoc-ep-sinh-to",
    brand: "Vfresh",
    price: 22000,
    oldPrice: null,
    unit: "Chai 300ml",
    stock: 95,
    rating: 3.9,
    reviewCount: 47,
    badge: null,
    images: [img3, single2],
    shortDescription: "Sinh tố xoài sánh mịn, không thêm đường tinh luyện.",
    description:
      "Sinh tố xoài làm từ thịt xoài chín xay nhuyễn cùng sữa chua, không thêm đường tinh luyện. Uống lạnh ngon nhất.",
    nutrition: { energy: "78 kcal", protein: "1.4 g", fat: "0.6 g", carb: "17 g" },
    origin: "Việt Nam",
    expiry: "7 ngày khi bảo quản lạnh",
    storage: "Luôn giữ lạnh, lắc đều trước khi uống",
  },
  {
    id: 21,
    name: "Cá hồi Na Uy phi lê",
    slug: "ca-hoi-na-uy-phi-le",
    type: "food",
    category: "thit-ca-hai-san",
    brand: "Seafood Plus",
    price: 320000,
    oldPrice: 365000,
    unit: "Khay 300g",
    stock: 18,
    rating: 4.8,
    reviewCount: 134,
    badge: "Giảm giá",
    images: [img5, single3],
    shortDescription: "Phi lê cá hồi Na Uy nhập khẩu, đạt chuẩn ăn sống (sashimi).",
    description:
      "Cá hồi Đại Tây Dương nhập khẩu trực tiếp từ Na Uy, cấp đông nhanh ngay trên tàu. Thịt cam đỏ, vân mỡ đều, dùng được cho sashimi, áp chảo hoặc nướng.",
    nutrition: { energy: "208 kcal", protein: "20 g", fat: "13 g", carb: "0 g" },
    origin: "Na Uy",
    expiry: "2 ngày khi bảo quản lạnh",
    storage: "Ngăn mát 0-4°C, dùng ngay sau khi rã đông",
  },
  {
    id: 22,
    name: "Yến mạch cán dẹt Quaker",
    slug: "yen-mach-can-det-quaker",
    type: "food",
    category: "banh-ngu-coc",
    brand: "Quaker",
    price: 145000,
    oldPrice: null,
    unit: "Túi 1 kg",
    stock: 65,
    rating: 4.6,
    reviewCount: 198,
    badge: null,
    images: [img11, single4],
    shortDescription: "Yến mạch nguyên hạt cán dẹt, giàu chất xơ hoà tan.",
    description:
      "Yến mạch Quaker cán dẹt từ hạt yến mạch nguyên cám, giàu beta-glucan hỗ trợ giảm cholesterol. Nấu cháo, trộn sữa chua hoặc làm granola.",
    nutrition: { energy: "389 kcal", protein: "17 g", fat: "7 g", carb: "66 g" },
    origin: "Úc",
    expiry: "12 tháng kể từ ngày sản xuất",
    storage: "Nơi khô ráo, đậy kín sau khi mở",
  },
  {
    id: 23,
    name: "Pepsi vị chanh không calo",
    slug: "pepsi-vi-chanh-khong-calo",
    type: "drink",
    category: "nuoc-giai-khat",
    brand: "Pepsi",
    price: 172000,
    oldPrice: 195000,
    unit: "Thùng 24 lon x 320ml",
    stock: 105,
    rating: 4.2,
    reviewCount: 211,
    badge: "Giảm giá",
    images: [img13, single1],
    shortDescription: "Nước ngọt có gas vị chanh, không đường, không calo.",
    description:
      "Pepsi vị chanh phiên bản không calo, dùng chất tạo ngọt thay đường. Giữ nguyên vị gas mạnh cùng hương chanh tươi mát.",
    nutrition: { energy: "0 kcal", protein: "0 g", fat: "0 g", carb: "0 g" },
    origin: "Việt Nam",
    expiry: "9 tháng kể từ ngày sản xuất",
    storage: "Nơi thoáng mát, ngon nhất khi uống lạnh",
  },
  {
    id: 24,
    name: "Xúc xích tiệt trùng Vissan",
    slug: "xuc-xich-tiet-trung-vissan",
    type: "food",
    category: "thuc-pham-che-bien",
    brand: "Vissan",
    price: 58000,
    oldPrice: 66000,
    unit: "Gói 10 cây x 40g",
    stock: 88,
    rating: 4.0,
    reviewCount: 105,
    badge: "Giảm giá",
    images: [img12, single2],
    shortDescription: "Xúc xích tiệt trùng ăn liền, tiện lợi cho bữa sáng.",
    description:
      "Xúc xích tiệt trùng Vissan làm từ thịt heo tươi, tiệt trùng ở nhiệt độ cao nên bảo quản được ở nhiệt độ thường. Ăn liền hoặc chiên, nướng đều ngon.",
    nutrition: { energy: "297 kcal", protein: "11 g", fat: "26 g", carb: "5 g" },
    origin: "Việt Nam",
    expiry: "6 tháng kể từ ngày sản xuất",
    storage: "Nhiệt độ thường, bảo quản lạnh sau khi mở",
  },
];

// Đánh giá mẫu, khoá theo productId
export const SEED_REVIEWS = [
  {
    id: 1,
    productId: 1,
    author: "Nguyễn Minh Hưng",
    rating: 5,
    date: "2026-07-12",
    title: "Bánh mềm, thơm bơ",
    content:
      "Mua về ăn sáng cả tuần. Bánh mềm, xé sợi được, không bị khô như mấy loại khác.",
  },
  {
    id: 2,
    productId: 1,
    author: "Trần Thị Lan",
    rating: 4,
    date: "2026-06-28",
    title: "Ngon nhưng hơi ngọt",
    content: "Chất lượng ổn so với giá. Với mình thì hơi ngọt một chút.",
  },
  {
    id: 3,
    productId: 2,
    author: "Lê Quang Trung",
    rating: 5,
    date: "2026-08-01",
    title: "Đậm vị, pha nhanh",
    content:
      "Vị gần giống uống tại quán, pha rất nhanh. Buổi sáng đi làm tiện vô cùng.",
  },
  {
    id: 4,
    productId: 11,
    author: "Phạm Văn Hoàng",
    rating: 5,
    date: "2026-05-19",
    title: "Cơm dẻo thơm đúng chuẩn",
    content: "Gạo thật, nấu lên thơm mùi lá dứa. Nhà mình dùng cố định loại này.",
  },
];

// ---- API Integration & Helper Functions ----

export function mapApiProductToFrontend(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    type: p.type ? p.type.toLowerCase() : "food",
    category: p.categorySlug,
    categoryName: p.categoryName,
    brand: p.brand,
    price: p.price,
    oldPrice: p.oldPrice,
    unit: p.unit,
    stock: p.stockQuantity,
    rating: p.rating || 0.0,
    reviewCount: p.reviewCount || 0,
    badge: p.badge,
    images: p.images && p.images.length > 0 ? p.images : ["/images/default.jpg"],
    shortDescription: p.shortDescription,
    description: p.description,
    nutrition: {
      energy: p.nutritionEnergy,
      protein: p.nutritionProtein,
      fat: p.nutritionFat,
      carb: p.nutritionCarb
    },
    origin: p.origin,
    expiry: p.expiry,
    storage: p.storage,
    categoryActive: cActive(p.categorySlug),
    active: p.status === "ACTIVE"
  };
}

export function cActive(slug) {
  const found = CATEGORIES.find((c) => c.slug === slug);
  return found ? found.active : true; // default to active if not found
}

export async function initializeProducts() {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
    
    // 1. Fetch categories
    const catRes = await fetch(`${API_BASE_URL}/api/categories`);
    if (catRes.ok) {
      const catData = await catRes.json();
      if (catData.data && catData.data.length > 0) {
        CATEGORIES.length = 0;
        catData.data.forEach(c => {
          CATEGORIES.push({
            id: c.id,
            slug: c.slug,
            name: c.name,
            type: c.label ? c.label.toLowerCase() : "food",
            active: c.status === "ACTIVE"
          });
        });
      }
    }

    // 2. Fetch products
    const prodRes = await fetch(`${API_BASE_URL}/api/products?size=1000`);
    if (prodRes.ok) {
      const prodData = await prodRes.json();
      if (prodData.data && prodData.data.content) {
        PRODUCTS.length = 0;
        prodData.data.content.forEach(p => {
          PRODUCTS.push(mapApiProductToFrontend(p));
        });
        
        // Recalculate PRICE_MAX
        if (PRODUCTS.length > 0) {
          PRICE_MAX = Math.max(...PRODUCTS.map((p) => p.price));
        }
      }
    }
  } catch (err) {
    console.error("Failed to initialize products from API, falling back to local seed data", err);
  }
}

// Alias for re-fetching after admin CRUD operations
export const refreshProducts = initializeProducts;

export function getAllProducts() {
  return PRODUCTS;
}

export function getProductById(id) {
  return PRODUCTS.find((p) => String(p.id) === String(id)) || null;
}

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  return PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, limit);
}

export function getCategoriesByType(type) {
  if (!type) return CATEGORIES;
  return CATEGORIES.filter((c) => c.type === type);
}

export function getCategoryName(slug) {
  const found = CATEGORIES.find((c) => c.slug === slug);
  return found ? found.name : slug;
}

export function getBrands() {
  return [...new Set(PRODUCTS.map((p) => p.brand).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "vi")
  );
}

export const PRICE_MIN = 0;
export let PRICE_MAX = Math.max(...PRODUCTS.map((p) => p.price));

export default PRODUCTS;

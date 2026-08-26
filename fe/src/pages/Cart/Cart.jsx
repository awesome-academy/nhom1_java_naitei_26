import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import ScrollToTop from "../ScrollToTop";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/format";

const Cart = () => {
  const {
    cartItems,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
    selectedItemIds,
    toggleSelectItem,
    selectAllItems,
    validateCartApi,
  } = useCart();
  const navigate = useNavigate();

  const [inputQuantities, setInputQuantities] = React.useState({});
  const [isValidating, setIsValidating] = React.useState(false);

  const handleClearCart = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Làm rỗng giỏ hàng?",
      text: "Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng?",
      showCancelButton: true,
      confirmButtonText: "Xóa tất cả",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#dc3545",
    });
    if (result.isConfirmed) {
      await clearCart();
    }
  };

  // Mặc định tự động chọn tất cả sản phẩm khi vừa tải danh sách
  React.useEffect(() => {
    if (cartItems.length > 0 && selectedItemIds.length === 0) {
      selectAllItems(cartItems.map((i) => i.id || i.productId));
    }
  }, [cartItems]);

  const allSelected =
    cartItems.length > 0 &&
    cartItems.every((item) => selectedItemIds.includes(item.id || item.productId));

  const handleToggleAll = () => {
    if (allSelected) {
      selectAllItems([]);
    } else {
      selectAllItems(cartItems.map((i) => i.id || i.productId));
    }
  };

  const handleQuantityInputChange = (itemId, value) => {
    setInputQuantities((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleQuantityBlur = (item) => {
    const itemId = item.id || item.productId;
    const rawVal = inputQuantities[itemId];
    if (rawVal === undefined) return;

    let newQty = parseInt(rawVal, 10);
    if (isNaN(newQty) || newQty < 1) {
      newQty = 1;
    }
    updateQuantity(itemId, newQty);
    setInputQuantities((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const handleRemove = async (item) => {
    const productName = item.productName || item.product?.name;
    const result = await Swal.fire({
      icon: "warning",
      title: "Xoá sản phẩm?",
      text: `Xoá "${productName}" khỏi giỏ hàng?`,
      showCancelButton: true,
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      confirmButtonColor: "#dc3545",
    });
    if (result.isConfirmed) {
      removeItem(item.id || item.productId);
    }
  };

  const selectedCartItems = cartItems.filter((item) =>
    selectedItemIds.includes(item.id || item.productId)
  );

  const selectedSubtotal = selectedCartItems.reduce((sum, item) => {
    const price = item.price || item.product?.price || 0;
    return sum + (item.subtotal || price * item.quantity);
  }, 0);

  const handleProceedToCheckout = async () => {
    if (selectedCartItems.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Vui lòng chọn sản phẩm",
        text: "Bạn cần tích chọn ít nhất 1 mặt hàng trong giỏ để tiến hành thanh toán.",
      });
      return;
    }

    setIsValidating(true);
    try {
      await validateCartApi();
      navigate("/thanh-toan");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Kiểm tra giỏ hàng thất bại",
        text: err.message || "Giỏ hàng có sản phẩm không hợp lệ hoặc hết tồn kho.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div>
      <ScrollToTop />

      <div className="container mt-6">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Trang chủ</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Giỏ hàng
            </li>
          </ol>
        </nav>
      </div>

      <section className="mt-4 mb-lg-14 mb-8">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-6">
            <h1 className="h2 fw-bold mb-0">Giỏ hàng của bạn</h1>
            {cartItems.length > 0 && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={handleClearCart}
                title="Xóa toàn bộ sản phẩm khỏi giỏ hàng"
              >
                <i className="fas fa-trash-alt me-1" />
                Làm rỗng giỏ hàng
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-10">
              <i className="fas fa-shopping-basket fa-3x text-muted mb-3" />
              <h5>Giỏ hàng đang trống</h5>
              <p className="text-muted">Hãy chọn thêm vài món ngon vào giỏ nhé.</p>
              <Link to="/thuc-pham-do-uong" className="btn btn-primary">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="row">
              <div className="col-lg-8">
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr className="text-muted small text-uppercase">
                        <th className="text-center align-middle" style={{ width: 45 }}>
                          <div className="d-flex justify-content-center align-items-center">
                            <input
                              type="checkbox"
                              className="form-check-input m-0"
                              checked={allSelected}
                              onChange={handleToggleAll}
                              title="Chọn tất cả"
                            />
                          </div>
                        </th>
                        <th style={{ width: "40%" }}>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th style={{ width: 140 }}>Số lượng</th>
                        <th>Thành tiền</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => {
                        const itemId = item.id || item.productId;
                        const productName = item.productName || item.product?.name || "Sản phẩm";
                        const imageUrl = item.productImageUrl || item.product?.images?.[0] || "https://via.placeholder.com/64";
                        const price = item.price || item.product?.price || 0;
                        const subtotalAmount = item.subtotal || price * item.quantity;
                        const isSelected = selectedItemIds.includes(itemId);
                        const currentInputVal = inputQuantities[itemId] !== undefined
                          ? inputQuantities[itemId]
                          : item.quantity;

                        return (
                          <tr key={itemId} className={isSelected ? "table-active" : ""}>
                            <td className="text-center align-middle">
                              <div className="d-flex justify-content-center align-items-center">
                                <input
                                  type="checkbox"
                                  className="form-check-input m-0"
                                  checked={isSelected}
                                  onChange={() => toggleSelectItem(itemId)}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src={imageUrl}
                                  alt={productName}
                                  style={{ width: 64, height: 64, objectFit: "cover" }}
                                  className="rounded-2"
                                />
                                <div>
                                  <Link
                                    to={`/san-pham/${item.productId}`}
                                    className="text-decoration-none text-dark fw-semibold"
                                  >
                                    {productName}
                                  </Link>
                                  {item.product?.unit && (
                                    <div className="small text-muted">{item.product.unit}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>{formatPrice(price)}</td>
                            <td>
                              <div className="input-group input-group-sm" style={{ width: 130 }}>
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <i className="fas fa-minus" />
                                </button>
                                <input
                                  type="number"
                                  className="form-control text-center"
                                  value={currentInputVal}
                                  min={1}
                                  onChange={(e) => handleQuantityInputChange(itemId, e.target.value)}
                                  onBlur={() => handleQuantityBlur(item)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleQuantityBlur(item);
                                  }}
                                />
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                >
                                  <i className="fas fa-plus" />
                                </button>
                              </div>
                            </td>
                            <td className="fw-semibold text-primary">
                              {formatPrice(subtotalAmount)}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-link text-danger"
                                onClick={() => handleRemove(item)}
                                title="Xoá sản phẩm"
                              >
                                <i className="fas fa-trash-alt" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Link to="/thuc-pham-do-uong" className="btn btn-outline-secondary">
                  <i className="fas fa-arrow-left me-2" />
                  Tiếp tục mua sắm
                </Link>
              </div>

              <div className="col-lg-4 mt-6 mt-lg-0">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Tóm tắt đơn hàng</h5>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Đã chọn ({selectedCartItems.length} món)</span>
                      <span>{formatPrice(selectedSubtotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3 small text-muted">
                      <span>Phí vận chuyển</span>
                      <span>Tính ở bước thanh toán</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-4 fw-bold fs-5">
                      <span>Tổng cộng</span>
                      <span className="text-primary">{formatPrice(selectedSubtotal)}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      onClick={handleProceedToCheckout}
                      disabled={isValidating || selectedCartItems.length === 0}
                    >
                      {isValidating ? (
                        <span>
                          <i className="fas fa-spinner fa-spin me-2" />
                          Đang kiểm tra...
                        </span>
                      ) : (
                        `Tiến hành thanh toán (${selectedCartItems.length})`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Cart;

import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Component/Header";
import Footer from "../Component/Footer";

// Khung chung của user site. Tách riêng để các route /admin
// có thể dùng layout khác mà không kèm Header/Footer bán hàng.
const PublicLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default PublicLayout;

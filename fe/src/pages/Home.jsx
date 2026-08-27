import slider1 from "../images/slide-1.jpg";
import abouticon from "../images/about-icons-1.svg";
import slider2 from "../images/slider-2.jpg";
import adbanner1 from "../images/ad-banner-1.jpg";
import adbanner2 from "../images/ad-banner-2.jpg";
import adbanner3 from "../images/ad-banner-3.jpg";
import attaricedal from "../images/atta-rice-dal.png";
import petcare from "../images/pet-care.png";
import cleaningessentials from "../images/cleaning-essentials.png";
import babycare from "../images/baby-care.png";
import chickenmeatfish from "../images/chicken-meat-fish.png";
import colddrinksjuices from "../images/cold-drinks-juices.png";
import teacoffeedrinks from "../images/tea-coffee-drinks.png";
import instantfood from "../images/instant-food.png";
import bakerybiscuits from "../images/bakery-biscuits.png";
import snackmunchies from "../images/snack-munchies.png";
import fruitsvegetables from "../images/fruits-vegetables.png";
import dairybreadeggs from "../images/dairy-bread-eggs.png";
import grocerybanner from "../images/grocery-banner.png";
import grocerybanner2 from "../images/grocery-banner-2.jpg";
import map from "../images/map.png";
import iphone from "../images/iphone-2.png";
import googleplay from "../images/googleplay-btn.svg";
import appstore from "../images/appstore-btn.svg";
import bannerdeal from "../images/banner-deal1.jpg";
import product11 from "../images/product-img-11.jpg";
import product12 from "../images/product-img-12.jpg";
import product13 from "../images/product-img-13.jpg";
import clock from "../images/clock.svg";
import gift from "../images/gift.svg";
import package1 from "../images/package.svg";
import refresh from "../images/refresh-cw.svg";
import product1 from "../images/category-baby-care.jpg";
import product2 from "../images/category-atta-rice-dal.jpg";
import product3 from "../images/category-bakery-biscuits.jpg";
import product4 from "../images/category-chicken-meat-fish.jpg";
import product5 from "../images/category-cleaning-essentials.jpg";
import product6 from "../images/category-dairy-bread-eggs.jpg";
import product7 from "../images/category-instant-food.jpg";
import product8 from "../images/category-pet-care.jpg";
import product9 from "../images/category-snack-munchies.jpg";
import product10 from "../images/category-tea-coffee-drinks.jpg";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import FeaturedProducts from "../components/FeaturedProducts";
import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
import { Slide, Zoom } from "react-awesome-reveal";
import { useEffect } from "react";
// import { PulseLoader } from 'react-spinners';
import { MagnifyingGlass } from "react-loader-spinner";
const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const settings1 = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    initialSlide: 1,
    responsive: [
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    autoplay: true,
    autoplaySpeed: 2000,
  };
  const settings2 = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 2,
    initialSlide: 1,
    responsive: [
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    autoplay: true,
    autoplaySpeed: 2000,
  };
  // loading
  const [loaderStatus, setLoaderStatus] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setLoaderStatus(false);
    }, 1500);
  }, []);

  return (
    <div>
      <div>
        {loaderStatus ? (
          <div className="loader-container">
            {/* <PulseLoader loading={loaderStatus} size={50} color="#0aad0a" /> */}
            <MagnifyingGlass
              visible={true}
              height="100"
              width="100"
              ariaLabel="magnifying-glass-loading"
              wrapperStyle={{}}
              wrapperclassName="magnifying-glass-wrapper"
              glassColor="#c0efff"
              color="#0aad0a"
            />
          </div>
        ) : (
          <>
            <>
              <div className="scroll-to-top">
                <button
                  onClick={scrollToTop}
                  className={`scroll-to-top-button ${isVisible ? "show" : ""}`}
                >
                  ↑
                </button>
              </div>
              <section className="hero-section">
                <div className="container mt-8">
                  <div
                    id="carouselExampleFade"
                    className="carousel slide carousel-fade"
                    data-bs-ride="carousel"
                  >
                    <div className="carousel-inner">
                      <div className="carousel-item active">
                        <div
                          style={{
                            background: `url(${slider1}) no-repeat`,
                            backgroundSize: "cover",
                            borderRadius: ".5rem",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="ps-lg-12 py-lg-16 col-xxl-5 col-md-7 py-14 px-8 text-xs-center">
                            <span className="badge text-bg-warning">
                              Opening Sale Discount 50%
                            </span>
                            <h2 className="text-dark display-5 fw-bold mt-4">
                              SuperMarket Daily <br /> Fresh Grocery
                            </h2>
                            <p className="lead">
                              Introduced a new model for online grocery shopping
                              and convenient home delivery.
                            </p>
                            <Link to="#!" className="btn btn-dark mt-3">
                              Shop Now{" "}
                              <i className="feather-icon icon-arrow-right ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="carousel-item">
                        <div
                          style={{
                            background: `url(${slider2}) no-repeat`,
                            backgroundSize: "cover",
                            borderRadius: ".5rem",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="ps-lg-12 py-lg-16 col-xxl-5 col-md-7 py-14 px-8 text-xs-center">
                            <span className="badge text-bg-warning">
                              Free Shipping - orders over $100
                            </span>
                            <h2 className="text-dark display-5 fw-bold mt-4">
                              Free Shipping on <br /> orders over{" "}
                              <span className="text-primary">$100</span>
                            </h2>
                            <p className="lead">
                              Free Shipping to First-Time Customers Only, After
                              promotions and discounts are applied.
                            </p>
                            <Link to="#!" className="btn btn-dark mt-3">
                              Shop Now{" "}
                              <i className="feather-icon icon-arrow-right ms-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link
                      className="carousel-control-prev"
                      to="#carouselExampleFade"
                      role="button"
                      data-bs-slide="prev"
                    >
                      <span
                        className="carousel-control-prev-icon"
                        aria-hidden="true"
                      />
                      <span className="visually-hidden">Previous</span>
                    </Link>
                    <Link
                      className="carousel-control-next"
                      to="#carouselExampleFade"
                      role="button"
                      data-bs-slide="next"
                    >
                      <span
                        className="carousel-control-next-icon"
                        aria-hidden="true"
                      />
                      <span className="visually-hidden">Next</span>
                    </Link>
                  </div>
                </div>
              </section>
            </>
            <>
              <FeaturedProducts />
            </>
            <>
              {/* cta section */}
              <section>
                <div
                  className="container"
                  style={{
                    background: `url(${map})no-repeat`,
                    backgroundSize: "cover",
                  }}
                >
                  {/* <hr className="my-lg-14 my-8"> */}
                  {/* row */}
                  <div className="row align-items-center text-center justify-content-center">
                    <div className=" col-lg-6 col-md-6 fade-in-left">
                      <Slide direction="left">
                        <div className="mb-6">
                          <div className="mb-7">
                            {/* heading */}
                            <h1>Get the FreshCart app</h1>
                            <h5 className="mb-0">
                              We will send you a link, open it on your phone to
                              download the app.
                            </h5>
                          </div>
                          <div className="mb-5">
                            {/* form check */}
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="flexRadioDefault"
                                id="flexRadioDefault1"
                              />
                              <label
                                className="form-check-label"
                                htmlFor="flexRadioDefault1"
                              >
                                Email
                              </label>
                            </div>
                            {/* form check */}
                            <div className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="flexRadioDefault"
                                id="flexRadioDefault2"
                                defaultChecked
                              />
                              <label
                                className="form-check-label"
                                htmlFor="flexRadioDefault2"
                              >
                                Phone
                              </label>
                            </div>
                            {/* form */}
                            {/* <form className="row g-3 mt-2">

          
          <div className="col-6 ">
            
            <input type="text" className="form-control" placeholder="Phone">
          </div>
           
          <div className="col-6">
            <button type="submit" className="btn btn-primary mb-3">Share app link</button>
          </div>
        </form> */}
                          </div>
                          <div>
                            {/* app */}
                            {/* <small>Download app from</small> */}
                            <ul className="list-inline mb-0 mt-2 ">
                              {/* list item */}
                              <li className="list-inline-item">
                                {/* img */}
                                <Link to="#!">
                                  {" "}
                                  <img
                                    src={appstore}
                                    alt="appstore"
                                    style={{ width: 140 }}
                                  />
                                </Link>
                              </li>
                              <li className="list-inline-item">
                                {/* img */}
                                <Link to="#!">
                                  {" "}
                                  <img
                                    src={googleplay}
                                    alt="googleplay"
                                    style={{ width: 140 }}
                                  />
                                </Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </Slide>
                    </div>
                    <div className=" offset-lg-2 col-lg-4 col-md-6 fade-zoom">
                      <Slide direction="right">
                        <div className="text-lg-start">
                          {/* img */}
                          <img
                            src={iphone}
                            alt="iphone"
                            className=" img-fluid"
                          />
                        </div>
                      </Slide>
                    </div>
                  </div>
                  {/* <hr className="my-lg-14 my-8"> */}
                </div>
              </section>
            </>
            <>
              <section>
                <div className="container">
                  <div className="row">
                    <div className="col-md-12 mb-6">
                      <div className="section-head text-center mt-8">
                        <h3 className="h3style" data-title="Daily Best Sells">
                          Daily Best Sells
                        </h3>
                        <div className="wt-separator bg-primarys"></div>
                        <div className="wt-separator2 bg-primarys"></div>
                        {/* <p>Connecting with entrepreneurs online, is just a few clicks away.</p> */}
                      </div>
                    </div>
                  </div>
                  <div className="row row-cols-1 row-cols-md-3 g-4">
                    <div className="col-md-3 fade-in-left">
                      <div
                        className=" pt-8 px-8 rounded-3"
                        style={{
                          background: `url(${bannerdeal})no-repeat`,
                          backgroundSize: "cover",
                          height: 400,
                        }}
                      >
                        <div>
                          <h3 className="fw-bold text-white">
                            100% Organic Coffee Beans.
                          </h3>
                          <p className="text-white">
                            Get the best deal before close.
                          </p>
                          <Link to="#!" className="btn btn-primary">
                            Shop Now{" "}
                            <i className="feather-icon icon-arrow-right ms-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-9 ">
                      <div className="image-itemss">
                        <Slider {...settings1}>
                          <div className="images swiper-slide px-4 ">
                            <div className="col ">
                              <div className="card card-product">
                                <div className="card-body">
                                  <div className="text-center  position-relative ">
                                    {" "}
                                    <Link to="#!">
                                      <img
                                        src={product11}
                                        alt="Grocery Ecommerce Template"
                                        className="mb-3 img-fluid"
                                      />
                                    </Link>
                                    <div className="card-product-action">
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="modal"
                                        data-bs-target="#quickViewModal"
                                      >
                                        <i
                                          className="bi bi-eye"
                                          data-bs-toggle="tooltip"
                                          data-bs-html="true"
                                          title="Quick View"
                                        />
                                      </Link>
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="tooltip"
                                        data-bs-html="true"
                                        title="Wishlist"
                                      >
                                        <i className="bi bi-heart" />
                                      </Link>
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="tooltip"
                                        data-bs-html="true"
                                        title="Compare"
                                      >
                                        <i className="bi bi-arrow-left-right" />
                                      </Link>
                                    </div>
                                  </div>
                                  <div className="text-small mb-1">
                                    <Link
                                      to="#!"
                                      className="text-decoration-none text-muted"
                                    >
                                      <small>Fruits &amp; Vegetables</small>
                                    </Link>
                                  </div>
                                  <h2 className="fs-6">
                                    <Link
                                      to="#!"
                                      className="text-inherit text-decoration-none"
                                    >
                                      Golden Pineapple
                                    </Link>
                                  </h2>
                                  <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                      <span className="text-dark">$13</span>{" "}
                                      <span className="text-decoration-line-through text-muted">
                                        $18
                                      </span>
                                    </div>
                                    <div>
                                      <small className="text-warning">
                                        {" "}
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-half" />
                                      </small>
                                      <span>
                                        <small>4.5</small>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="d-grid mt-2">
                                    <Link to="#!" className="btn btn-primary ">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={16}
                                        height={16}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="feather feather-plus"
                                      >
                                        <line x1={12} y1={5} x2={12} y2={19} />
                                        <line x1={5} y1={12} x2={19} y2={12} />
                                      </svg>{" "}
                                      Add to cart{" "}
                                    </Link>
                                  </div>
                                  <div className="d-flex justify-content-start text-center mt-3">
                                    <div
                                      className="deals-countdown w-100"
                                      data-countdown="2022/11/11 00:00:00"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="images swiper-slide px-4">
                            <div className="col">
                              <div className="card card-product">
                                <div className="card-body">
                                  <div className="text-center  position-relative ">
                                    {" "}
                                    <Link to="#!">
                                      <img
                                        src={product12}
                                        alt="Grocery Ecommerce Template"
                                        className="mb-3 img-fluid"
                                      />
                                    </Link>
                                    <div className="card-product-action">
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="modal"
                                        data-bs-target="#quickViewModal"
                                      >
                                        <i
                                          className="bi bi-eye"
                                          data-bs-toggle="tooltip"
                                          data-bs-html="true"
                                          title="Quick View"
                                        />
                                      </Link>
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="tooltip"
                                        data-bs-html="true"
                                        title="Wishlist"
                                      >
                                        <i className="bi bi-heart" />
                                      </Link>
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="tooltip"
                                        data-bs-html="true"
                                        title="Compare"
                                      >
                                        <i className="bi bi-arrow-left-right" />
                                      </Link>
                                    </div>
                                  </div>
                                  <div className="text-small mb-1">
                                    <Link
                                      to="#!"
                                      className="text-decoration-none text-muted"
                                    >
                                      <small>Fruits &amp; Vegetables</small>
                                    </Link>
                                  </div>
                                  <h2 className="fs-6">
                                    <Link
                                      to="#!"
                                      className="text-inherit text-decoration-none"
                                    >
                                      Golden Pineapple
                                    </Link>
                                  </h2>
                                  <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                      <span className="text-dark">$13</span>{" "}
                                      <span className="text-decoration-line-through text-muted">
                                        $18
                                      </span>
                                    </div>
                                    <div>
                                      <small className="text-warning">
                                        {" "}
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-half" />
                                      </small>
                                      <span>
                                        <small>4.5</small>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="d-grid mt-2">
                                    <Link to="#!" className="btn btn-primary ">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={16}
                                        height={16}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="feather feather-plus"
                                      >
                                        <line x1={12} y1={5} x2={12} y2={19} />
                                        <line x1={5} y1={12} x2={19} y2={12} />
                                      </svg>{" "}
                                      Add to cart{" "}
                                    </Link>
                                  </div>
                                  <div className="d-flex justify-content-start text-center mt-3">
                                    <div
                                      className="deals-countdown w-100"
                                      data-countdown="2022/11/11 00:00:00"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="images swiper-slide px-4">
                            <div className="col">
                              <div className="card card-product">
                                <div className="card-body">
                                  <div className="text-center  position-relative ">
                                    {" "}
                                    <Link to="#!">
                                      <img
                                        src={product13}
                                        alt="Grocery Ecommerce Template"
                                        className="mb-3 img-fluid"
                                      />
                                    </Link>
                                    <div className="card-product-action">
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="modal"
                                        data-bs-target="#quickViewModal"
                                      >
                                        <i
                                          className="bi bi-eye"
                                          data-bs-toggle="tooltip"
                                          data-bs-html="true"
                                          title="Quick View"
                                        />
                                      </Link>
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="tooltip"
                                        data-bs-html="true"
                                        title="Wishlist"
                                      >
                                        <i className="bi bi-heart" />
                                      </Link>
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="tooltip"
                                        data-bs-html="true"
                                        title="Compare"
                                      >
                                        <i className="bi bi-arrow-left-right" />
                                      </Link>
                                    </div>
                                  </div>
                                  <div className="text-small mb-1">
                                    <Link
                                      to="#!"
                                      className="text-decoration-none text-muted"
                                    >
                                      <small>Fruits &amp; Vegetables</small>
                                    </Link>
                                  </div>
                                  <h2 className="fs-6">
                                    <Link
                                      to="#!"
                                      className="text-inherit text-decoration-none"
                                    >
                                      Golden Pineapple
                                    </Link>
                                  </h2>
                                  <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                      <span className="text-dark">$13</span>{" "}
                                      <span className="text-decoration-line-through text-muted">
                                        $18
                                      </span>
                                    </div>
                                    <div>
                                      <small className="text-warning">
                                        {" "}
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-half" />
                                      </small>
                                      <span>
                                        <small>4.5</small>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="d-grid mt-2">
                                    <Link to="#!" className="btn btn-primary ">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={16}
                                        height={16}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="feather feather-plus"
                                      >
                                        <line x1={12} y1={5} x2={12} y2={19} />
                                        <line x1={5} y1={12} x2={19} y2={12} />
                                      </svg>{" "}
                                      Add to cart{" "}
                                    </Link>
                                  </div>
                                  <div className="d-flex justify-content-start text-center mt-3">
                                    <div
                                      className="deals-countdown w-100"
                                      data-countdown="2022/11/11 00:00:00"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="images swiper-slide px-4">
                            <div className="col">
                              <div className="card card-product">
                                <div className="card-body">
                                  <div className="text-center  position-relative ">
                                    {" "}
                                    <Link to="#!">
                                      <img
                                        src={product13}
                                        alt="Grocery Ecommerce Template"
                                        className="mb-3 img-fluid"
                                      />
                                    </Link>
                                    <div className="card-product-action">
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="modal"
                                        data-bs-target="#quickViewModal"
                                      >
                                        <i
                                          className="bi bi-eye"
                                          data-bs-toggle="tooltip"
                                          data-bs-html="true"
                                          title="Quick View"
                                        />
                                      </Link>
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="tooltip"
                                        data-bs-html="true"
                                        title="Wishlist"
                                      >
                                        <i className="bi bi-heart" />
                                      </Link>
                                      <Link
                                        to="#!"
                                        className="btn-action"
                                        data-bs-toggle="tooltip"
                                        data-bs-html="true"
                                        title="Compare"
                                      >
                                        <i className="bi bi-arrow-left-right" />
                                      </Link>
                                    </div>
                                  </div>
                                  <div className="text-small mb-1">
                                    <Link
                                      to="#!"
                                      className="text-decoration-none text-muted"
                                    >
                                      <small>Fruits &amp; Vegetables</small>
                                    </Link>
                                  </div>
                                  <h2 className="fs-6">
                                    <Link
                                      to="#!"
                                      className="text-inherit text-decoration-none"
                                    >
                                      Golden Pineapple
                                    </Link>
                                  </h2>
                                  <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                      <span className="text-dark">$13</span>{" "}
                                      <span className="text-decoration-line-through text-muted">
                                        $18
                                      </span>
                                    </div>
                                    <div>
                                      <small className="text-warning">
                                        {" "}
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-fill" />
                                        <i className="bi bi-star-half" />
                                      </small>
                                      <span>
                                        <small>4.5</small>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="d-grid mt-2">
                                    <Link to="#!" className="btn btn-primary ">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width={16}
                                        height={16}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="feather feather-plus"
                                      >
                                        <line x1={12} y1={5} x2={12} y2={19} />
                                        <line x1={5} y1={12} x2={19} y2={12} />
                                      </svg>{" "}
                                      Add to cart{" "}
                                    </Link>
                                  </div>
                                  <div className="d-flex justify-content-start text-center mt-3">
                                    <div
                                      className="deals-countdown w-100"
                                      data-countdown="2022/11/11 00:00:00"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Slider>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
            <>
              <section className="my-lg-14 my-8">
                <div className="container" style={{ marginTop: 50 }}>
                  <div
                    className="row justify-content-center  g-4"
                    style={{ textAlign: "center" }}
                  >
                    <div className="col-md-3 col-sm-6 fade-zoom ">
                      <Zoom>
                        <div className="shadow-effect">
                          <div className="wt-icon-box-wraper center p-a25 p-b50 m-b30 bdr-1 bdr-gray bdr-solid corner-radius step-icon-box bg-white v-icon-effect">
                            <div className="icon-lg m-b20">
                              <div className="mb-6">
                                <img src={refresh} alt="refresh" />
                              </div>
                            </div>
                            <div className="icon-content">
                              <h3 className="h5 mb-3">Easy Returns</h3>
                              <p>
                                Not satisfied with a product? Return it at the
                                doorstep &amp; get a refund within hours. No
                                questions asked
                                <Link to="#!">policy</Link>.
                              </p>
                            </div>
                          </div>
                        </div>
                      </Zoom>
                    </div>
                    <div className="col-md-3 col-sm-12 fade-zoom">
                      <Zoom>
                        <div className="shadow-effect">
                          <div className="wt-icon-box-wraper center p-a25 p-b50 m-b30 bdr-1 bdr-gray bdr-solid corner-radius step-icon-box bg-white v-icon-effect">
                            <div className="icon-lg m-b20">
                              <div className="mb-6">
                                <img src={package1} alt="package" />
                              </div>
                            </div>
                            <div className="icon-content">
                              <h3 className="h5 mb-3">Wide Assortment</h3>
                              <p>
                                Choose from 5000+ products across food, personal
                                care, household, bakery, veg and non-veg &amp;
                                other categories.
                              </p>
                            </div>
                          </div>
                        </div>
                      </Zoom>
                    </div>
                    <div className="col-md-3 col-sm-12 fade-zoom">
                      <Zoom>
                        <div className="shadow-effect">
                          <div className="wt-icon-box-wraper center p-a25 p-b50 m-b30 bdr-1 bdr-gray bdr-solid corner-radius step-icon-box bg-white v-icon-effect">
                            <div className="icon-lg m-b20">
                              <div className="mb-6">
                                <img src={gift} alt="gift" />
                              </div>
                            </div>
                            <div className="icon-content">
                              <h3 className="h5 mb-3">
                                Best Prices &amp; Offers
                              </h3>
                              <p>
                                Cheaper prices than your local supermarket,
                                great cashback offers to top it off. Get best
                                pricess &amp; offers.
                              </p>
                            </div>
                          </div>
                        </div>
                      </Zoom>
                    </div>
                    <div className="col-md-3 col-sm-12 fade-zoom">
                      <Zoom>
                        <div className="shadow-effect">
                          <div className="wt-icon-box-wraper center p-a25 p-b50 m-b30 bdr-1 bdr-gray bdr-solid corner-radius step-icon-box bg-white v-icon-effect">
                            <div className="icon-lg m-b20">
                              <div className="mb-6">
                                <img src={clock} alt="clock" />
                              </div>
                            </div>
                            <div className="icon-content">
                              {/* <h4 className="wt-tilte">Reports</h4> */}
                              <h3 className="h5 mb-3">10 minute grocery now</h3>
                              <p>
                                Get your order delivered to your doorstep at the
                                earliest from FreshCart pickup
                                <p> stores near you.</p>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Zoom>
                    </div>
                  </div>
                </div>
              </section>
            </>
            <>
              <div className="container">
                <Slider {...settings2}>
                  {/* <div className="images swiper-slide p-4">
    <div className="item">
      <Link to="#" className="text-decoration-none text-inherit">
        <div className="card card-product mb-4">
          <div className="card-body text-center py-8">
            <img src={product6} alt="Grocery Ecommerce Template" className="mb-3 style={{paddingLeft:'40px'}} " />
            <div>Dairy, Bread &amp; Eggs</div>
          </div>
        </div>
     </Link>
    </div>
  </div>
  <div className="images swiper-slide p-4">
    <div className="item"> 
    <Link to="#" className="text-decoration-none text-inherit">
        <div className="card card-product mb-4">
          <div className="card-body text-center py-8">
            <img src={product9} alt="Grocery Ecommerce Template" className="mb-3"style={{paddingLeft:'40px'}} />
            <div>Snack &amp; Munchies</div>
          </div>
        </div>
     </Link></div>
  </div>
  <div className="images swiper-slide p-4">
    <div className="item">
       <Link to="#" className="text-decoration-none text-inherit">
        <div className="card card-product mb-4">
          <div className="card-body text-center py-8">
            <img src={product3} alt="Grocery Ecommerce Template" className="mb-3"style={{paddingLeft:'40px'}} />
            <div>Bakery &amp; Biscuits</div>
          </div>
        </div>
     </Link></div>
  </div>
  <div className="images swiper-slide p-4">
    <div className="item"> 
    <Link to="#" className="text-decoration-none text-inherit">
        <div className="card card-product mb-4">
          <div className="card-body text-center py-8">
            <img src={product7} alt="Grocery Ecommerce Template " className="mb-3 " style={{paddingLeft:'40px'}} />
            <div>Instant Food</div>
          </div>
        </div>
     </Link></div>
  </div>
  <div className="images swiper-slide p-4">
    <div className="item"> 
    <Link to="#" className="text-decoration-none text-inherit">
        <div className="card card-product mb-4">
          <div className="card-body text-center py-8">
            <img src={product10} alt="Grocery Ecommerce Template" className="mb-3"style={{paddingLeft:'40px'}} />
            <div>Tea, Coffee &amp; Drinks</div>
          </div>
        </div>
     </Link></div>
  </div>
  <div className="images swiper-slide p-4">
    <div className="item">
      <Link to="#" className="text-decoration-none text-inherit">
        <div className="card card-product mb-4">
          <div className="card-body text-center py-8">
            <img src={product2} alt="Grocery Ecommerce Template" className="mb-3" style={{paddingLeft:'40px'}}/>
            <div>Atta, Rice &amp; Dal</div>
          </div>
        </div>
     </Link></div>
  </div>
  <div className="images swiper-slide p-4">
    <div className="item">
       <Link to="#" className="text-decoration-none text-inherit">
        <div className="card card-product mb-4">
          <div className="card-body text-center py-8">
            <img src={product1} alt="Grocery Ecommerce Template" className="mb-3" style={{paddingLeft:'40px'}}/>
            <div>Baby Care</div>
          </div>
        </div>
     </Link></div>
  </div>
  <div className="images swiper-slide p-4">
    <div className="item"> 
    <Link to="#" className="text-decoration-none text-inherit">
        <div className="card card-product mb-4">
          <div className="card-body text-center py-8">
            <img src={product4} alt="Grocery Ecommerce Template" className="mb-3" style={{paddingLeft:'40px'}}/>
            <div>Chicken, Meat &amp; Fish</div>
          </div>
        </div>
     </Link></div>
  </div>
  <div className="images swiper-slide p-4">
    <div className="item"> 
    <Link to="#" className="text-decoration-none text-inherit">
        <div className="card card-product mb-4">
          <div className="card-body text-center py-8">
            <img src={product5} alt="Grocery Ecommerce Template" className="mb-3" style={{paddingLeft:'40px'}}/>
            <div>Cleaning Essentials</div>
          </div>
        </div>
     </Link></div>
  </div>
  <div className="images swiper-slide p-4">
    <div className="item">
      <Link to="#" className="text-decoration-none text-inherit">
        <div className="card card-product mb-4">
          <div className="card-body text-center py-8">
            <img src={product8} alt="Grocery Ecommerce Template" className="mb-3" style={{paddingLeft:'40px'}}/>
            <div>Pet Care</div>
          </div>
        </div>
     </Link>
    </div>
  </div> */}
                  <div className="m-1">
                    <div className="partner-list">
                      <img
                        src={product1}
                        style={{ objectFit: "cover" }}
                        className="img-fluid "
                        alt="product"
                      />
                      <h6 class="card-title partner">
                      <div>Baby Care</div>
                      </h6>
                    </div>
                  </div>
                  <div className="m-1">
                    <div className="partner-list">
                      <img
                        src={product2}
                        style={{ objectFit: "cover" }}
                        className="img-fluid"
                        alt="product"
                      />
                       <h6 class="card-title">
                       <div>Atta, Rice &amp; Dal</div>
                      </h6>
                    </div>
                  </div>
                  <div className="m-1">
                    <div className="partner-list">
                      <img
                        src={product3}
                        style={{ objectFit: "cover" }}
                        className="img-fluid"
                        alt="product"
                      />
                       <h6 class="card-title">
                       <div>Bakery &amp; Biscuits</div>
                      </h6>
                    </div>
                  </div>
                  <div className="m-1">
                    <div className="partner-list">
                      <img
                        src={product4}
                        style={{ objectFit: "cover" }}
                        className="img-fluid"
                        alt="product"
                      />
                       <h6 class="card-title">
                       <div>Chicken, Meat &amp; Fish</div>
                      </h6>
                    </div>
                  </div>
                  <div className="m-1">
                    <div className="partner-list">
                      <img
                        src={product5}
                        style={{ objectFit: "cover" }}
                        className="img-fluid"
                        alt="product"
                      />
                       <h6 class="card-title">
                       <div>Cleaning Essentials</div>
                      </h6>
                    </div>
                  </div>
                  <div className="m-1">
                    <div className="partner-list">
                      <img
                        src={product6}
                        style={{ objectFit: "cover" }}
                        className="img-fluid"
                        alt="product"
                      />
                       <h6 class="card-title">
                       <div>Dairy, Bread &amp; Eggs</div>
                      </h6>
                    </div>
                  </div>
                  <div className="m-1">
                    <div className="partner-list">
                      <img
                        src={product7}
                        style={{ objectFit: "cover" }}
                        className="img-fluid"
                        alt="product"
                      />
                       <h6 class="card-title">
                       <div>Instant Food</div>
                      </h6>
                    </div>
                  </div>
                  <div className="m-1">
                    <div className="partner-list">
                      <img
                        src={product8}
                        style={{ objectFit: "cover" }}
                        className="img-fluid"
                        alt="product"
                      />
                       <h6 class="card-title">
                      <div>Pet Care</div>
                      </h6>
                    </div>
                  </div>
                  <div className="m-1">
                    <div className="partner-list">
                      <img
                        src={product9}
                        style={{ objectFit: "cover" }}
                        className="img-fluid"
                        alt="product"
                      />
                       <h6 class="card-title">
                       <div>Snack &amp; Munchies</div>
                      </h6>
                    </div>
                  </div>
                  <div className="m-1">
                    <div className="partner-list">
                      <img
                        src={product10}
                        style={{ objectFit: "cover" }}
                        className="img-fluid"
                        alt="product"
                      />
                       <h6 class="card-title">
                       <div>Tea, Coffee &amp; Drinks</div>
                      </h6>
                    </div>
                  </div>
                </Slider>
              </div>
            </>

            
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

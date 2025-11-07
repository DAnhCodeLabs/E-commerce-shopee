import React from "react";
import Banner from "./components/Banner";
import Category from "./components/Category";
import ProductItem from "../../components/Product/ProductItem";
import FeaturesSection from "../../components/FeaturesSection";
import BoxProduct from "../../components/Product/BoxProduct";
import SlideProduct from "../../components/Product/SlideProduct";

const Home = () => {
  return (
    <div>
      <Banner />
      <FeaturesSection />
      <Category />
      <BoxProduct title="Sản phẩm nổi bật">
        <SlideProduct>
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
        </SlideProduct>
      </BoxProduct>
      <BoxProduct title="Sản phẩm nổi bật">
        <SlideProduct>
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
        </SlideProduct>
      </BoxProduct>
      <BoxProduct title="Sản phẩm nổi bật">
        <SlideProduct>
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
          <ProductItem />
        </SlideProduct>
      </BoxProduct>
    </div>
  );
};

export default Home;

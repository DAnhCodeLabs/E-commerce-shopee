import React from "react";
import Banner from "./components/Banner";
import Category from "./components/Category";
import FeaturesSection from "../../components/FeaturesSection";
import FlashSaleSection from "../../components/Product/FlashSaleSection";
import AiFeaturedSection from "../../components/Product/AiFeaturedSection";

const Home = () => {
  return (
    <div>
      <Banner />
      <FeaturesSection />
      <Category />
      <FlashSaleSection />
      <AiFeaturedSection />
    </div>
  );
};

export default Home;

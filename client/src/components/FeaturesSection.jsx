import React from "react";
import { assets } from "../assets/assets";
const FeaturesSection = () => {
  return (
    <div className="h-22 py-4 px-8 bg-white rounded-2xl shadow w-[1400px] mx-auto my-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center justify-center gap-4">
          <img src={assets.shipping} alt="" className="w-14 h-14" />
          <div className="flex flex-col items-start justify-center gap-1">
            <h3 className="font-semibold text-gray-800">Worldwide Shipping</h3>
            <p className="text-sm text-gray-400">Order Above $100</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <img src={assets.refund} alt="" className="w-14 h-14" />
          <div className="flex flex-col items-start justify-center gap-1">
            <h3 className="font-semibold text-gray-800">
              Money Back Guarantee
            </h3>
            <p className="text-sm text-gray-400">Guarante With In 30 Days</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <img src={assets.discount} alt="" className="w-14 h-14" />
          <div className="flex flex-col items-start justify-center gap-1">
            <h3 className="font-semibold text-gray-800">
              Offers And Discounts
            </h3>
            <p className="text-sm text-gray-400">Back Returns In 7 Days</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <img src={assets.support2} alt="" className="w-14 h-14" />
          <div className="flex flex-col items-start justify-center gap-1">
            <h3 className="font-semibold text-gray-800">
              24/7 Support Services
            </h3>
            <p className="text-sm text-gray-400">Any Time Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;

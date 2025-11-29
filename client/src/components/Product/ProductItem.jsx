import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const ProductItem = ({
  productId,
  image,
  name,
  originalPrice,
  salePrice,
  discount,
  rating = 0,
  soldCount = 0,
  location,
  slug,
}) => {
  const displayLocation =
    typeof location === "string"
      ? location
      : location?.city
      ? location.city
      : "Không xác định";

  const calculateDiscount = () => {
    if (discount !== undefined) return discount;
    if (originalPrice && salePrice) {
      return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }
    return 0;
  };

  const currentDiscount = calculateDiscount();
  const displayPrice = salePrice || originalPrice;

  const productImage =
    image?.[0] ||
    image ||
    "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgktdzq4r8jv81.webp";

  return (
    <Link to={`/product/${slug}`} className="block h-full">
      <div className="border border-gray-200 bg-white hover:shadow-md transition-all duration-300 h-full flex flex-col overflow-hidden">
        <div className="flex flex-col w-full h-full relative">
          {currentDiscount > 0 && (
            <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg z-10">
              -{currentDiscount}%
            </div>
          )}

          {/* Image Container với tỷ lệ cố định */}
          <div className="relative pt-[100%] bg-gray-100 overflow-hidden">
            <img
              src={
                "https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mdvkx197ak906b.webp"
              }
              alt={name}
              className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="p-3 flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <FaMapMarkerAlt className="text-xs flex-shrink-0" />
              <span className="truncate">{displayLocation}</span>
            </div>

            <h3 className="text-sm text-gray-900 line-clamp-2 leading-tight">
              {name}
            </h3>

            <div className="mt-auto space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-semibold text-[15px]">
                  {displayPrice?.toLocaleString("vi-VN")} ₫
                </span>
                {originalPrice > salePrice && (
                  <span className="text-gray-500 line-through text-xs">
                    {originalPrice?.toLocaleString("vi-VN")} ₫
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-orange-500 font-medium">
                    {rating > 0 ? rating.toFixed(1) : "0.0"}
                  </span>
                </div>
                <span className="text-gray-600 ml-1">
                  | Đã bán{" "}
                  {soldCount > 1000
                    ? `${(soldCount / 1000).toFixed(1)}k`
                    : soldCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;

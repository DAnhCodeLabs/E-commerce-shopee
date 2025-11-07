import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { Rate } from "antd";

const ProductItem = () => {
  return (
    <div className="border border-gray-200 h-90 box-border cursor-pointer hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex flex-col w-full h-full relative">
        <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg z-10">
          -30%
        </div>

        <div className="h-3/5 overflow-hidden">
          <div className="relative z-0 w-full pt-full h-full">
            <img
              src="https://down-vn.img.susercontent.com/file/vn-11134207-820l4-mgktdzq4r8jv81.webp"
              alt=""
              className="inset-y-0 w-full h-full pointer-events-none object-fill absolute "
            />
          </div>
        </div>

        <div className="h-2/5 p-2 flex flex-col gap-1 justify-center">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FaMapMarkerAlt />
            <p>TP. Hồ Chí Minh</p>
          </div>
          <p className="text-sm line-clamp-2">
            Quần short jean nữ CHAUZI thêu THỎ túi mặt trước sau vải jean mềm
            đẹp Women Pants QS818 Denim
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Rate disabled defaultValue={3} className="!text-xs" />
            <p>(4.9)</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-red-500 font-bold">139.000 ₫</p>
            <p className="text-gray-500 line-through text-sm">199.000 ₫</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;

import React from "react";

const BoxProduct = ({
  children,
  title = "Sản phẩm nổi bật",
  seeAllLink = "#",
}) => {
  return (
    <div className="w-[1400px] mx-auto rounded my-10 bg-white shadow relative">
      <div className="flex items-center justify-between border-b border-gray-300 p-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <a
          href={seeAllLink}
          className="transition text-primary hover:text-primary-dark"
        >
          Xem tất cả
        </a>
      </div>
      {children}
    </div>
  );
};

export default BoxProduct;

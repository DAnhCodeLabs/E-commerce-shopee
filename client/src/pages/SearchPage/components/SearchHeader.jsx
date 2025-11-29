import React from "react";
import { AiTwotoneThunderbolt } from "react-icons/ai";
const SearchHeader = ({ keyword, totalItems }) => {
  return (
    <div className="mb-6">
      <div className="text-lg text-gray-500 flex items-center gap-2">
        <AiTwotoneThunderbolt />

        <span>
          Kết quả tìm kiếm cho:{" "}
          <span className="text-primary">{keyword}</span>
        </span>

        {totalItems > 0 && (
          <span className="text-gray-600">({totalItems})</span>
        )}
      </div>
    </div>
  );
};

export default SearchHeader;

import React from "react";
import { Typography } from "antd"; // Sử dụng Typography của Antd

const { Title } = Typography;

const ProductAttributes = ({ attributes = [] }) => {
  // Lọc bỏ các thuộc tính rác
  const validAttributes = attributes.filter(
    (attr) => attr && attr.attribute_id && attr.value
  );

  if (validAttributes.length === 0) {
    return null;
  }

  return (
    <div className="product-attributes bg-white rounded-lg">
      <Title
        level={4}
        className="!mb-4 !text-base uppercase text-gray-800 border-l-4 border-blue-500 pl-3"
      >
        Thông số kỹ thuật
      </Title>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <tbody>
            {validAttributes.map((attr, index) => {
              const label = attr.attribute_id?.label || attr.attribute_id?.name;

              // Xử lý hiển thị value (nếu là mảng thì nối chuỗi)
              const displayValue = Array.isArray(attr.value)
                ? attr.value.join(", ")
                : attr.value.toString();

              return (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50 transition-colors duration-200`}
                >
                  <td className="py-3 px-4 font-medium text-gray-600 w-[40%] border-b border-gray-100 last:border-0 align-top">
                    {label}
                  </td>
                  <td className="py-3 px-4 text-gray-900 border-b border-gray-100 last:border-0 align-top">
                    {displayValue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductAttributes;

import React, { useState, useEffect } from "react";
import { Spin, Alert } from "antd"; // <-- Thêm component từ Ant Design để có trải nghiệm tốt hơn
import { httpGet } from "../../../services/httpService";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await httpGet("/categories");
        setCategories(response.data || []);
      } catch (err) {
        setError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {

    if (error) {
      return (
        <div className="p-4">
          <Alert message={error} type="error" showIcon />
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <p className="p-4 text-center text-gray-500">
          Không có danh mục nào để hiển thị.
        </p>
      );
    }

    return (
      <div className="w-full flex flex-wrap">
        {categories.map((category) => (
          <div
            key={category._id}
            className="border border-gray-200 h-40 box-border cursor-pointer hover:shadow-lg transition-shadow"
            style={{ width: "calc(100% / 10)" }}
          >
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center p-1">
              <div className="w-20 h-20">
                <img
                  src={category.image}
                  alt={category.display_name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-gray-700 font-medium text-xs leading-tight">
                {category.display_name}
              </h1>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-[1400px] mx-auto mt-10">
      <div className="w-full border border-gray-300 rounded-sm">
        <h1 className="text-xl text-gray-500 w-full p-4 border-b border-gray-200">
          DANH MỤC
        </h1>
        <div
          className="w-full overflow-y-auto scrollbar-hide"
          style={{
            maxHeight: "20rem",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Category;

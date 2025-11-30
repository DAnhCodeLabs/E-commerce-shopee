import React, { useState, useEffect } from "react";
import { Spin, Skeleton } from "antd";
import { httpGet } from "../../services/httpService";
import ProductItem from "./ProductItem";

const RelatedProducts = ({ productId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!productId) return;

      setLoading(true);
      try {
        // Gọi API AI Backend
        const response = await httpGet(`/products/${productId}/related-ai`);
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm liên quan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId]);

  if (!loading && products.length === 0) {
    return null; // Không có sản phẩm thì ẩn luôn section này
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm mt-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase border-l-4 border-red-500 pl-3">
        CÓ THỂ BẠN CŨNG THÍCH
      </h3>

      {loading ? (
        // Skeleton Loading Effect (Hiệu ứng xương khi đang tải)
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white p-2 border border-gray-100">
              <Skeleton.Image active className="!w-full !h-40 mb-2" />
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ))}
        </div>
      ) : (
        // Grid sản phẩm
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {products.map((product) => (
            <div key={product._id} className="h-full">
              <ProductItem
                productId={product._id}
                slug={product.slug}
                image={product.images?.[0]} // Lấy ảnh đầu tiên
                name={product.name}
                originalPrice={product.price}
                salePrice={product.sale_price}
                discount={product.discount_percentage}
                rating={product.item_rating?.rating_star}
                soldCount={product.historical_sold || product.sold_count}
                location={product.location} // Object location {city, country}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedProducts;

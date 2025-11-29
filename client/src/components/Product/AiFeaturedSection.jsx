import React, { useEffect, useState } from "react";
import BoxProduct from "./BoxProduct";
import SlideProduct from "./SlideProduct";
import ProductItem from "./ProductItem";
import { httpGet } from "../../services/httpService";

const AiFeaturedSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAiFeaturedProducts();
  }, []);

  const fetchAiFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Gọi API lấy featured products từ AI
      // httpGet đã trả về response.data, nên response là { success, message, data, pagination }
      const response = await httpGet("/ai/featured-products?limit=20&page=1", {
        showMessage: false, // Không hiển thị thông báo lỗi
      });

      console.log("[DEBUG] AI Featured response:", response);

      if (response?.success && response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.warn("[DEBUG] Invalid response format:", response);
        setError("Không thể tải sản phẩm AI nổi bật");
        setProducts([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm AI nổi bật:", err);
      // Không set error nếu không có dữ liệu, để section không hiển thị thôi
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Nếu không có sản phẩm và không đang loading, không hiển thị section
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <BoxProduct title="🤖 Sản phẩm AI nổi bật" seeAllLink="/products?sort=ai">
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="text-gray-500">Đang tải sản phẩm...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-10">
          <div className="text-red-500">{error}</div>
        </div>
      ) : products.length > 0 ? (
        <SlideProduct>
          {products.map((product) => (
            <div key={product._id} className="px-2">
              <ProductItem
                productId={product._id}
                image={product.images?.[0] || product.thumbnail}
                name={product.name}
                originalPrice={product.price}
                salePrice={product.sale_price}
                discount={product.discount_percentage}
                rating={product.item_rating?.rating_star || 4.5}
                soldCount={product.historical_sold || 0}
                location="TP. Hồ Chí Minh"
                slug={product.slug}
              />
            </div>
          ))}
        </SlideProduct>
      ) : null}
    </BoxProduct>
  );
};

export default AiFeaturedSection;

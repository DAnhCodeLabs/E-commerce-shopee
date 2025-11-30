import React, { useState, useEffect } from "react";
import { Spin, Empty, Breadcrumb, Button } from "antd";
import { HeartFilled, HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import ProductItem from "../../../components/Product/ProductItem";
import { httpGet } from "../../../services/httpService";
import Loader from "../../../components/common/Loader";

const WishlistPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách
  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await httpGet("/user/wishlist");
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error("Lỗi tải wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="h-auto pb-20">
      <div className="max-w-[1200px] mx-auto px-2">

        <div className="flex items-center gap-3 mb-6">
          <HeartFilled className="text-2xl text-red-500" />
          <h1 className="text-xl font-medium text-gray-800 m-0">
            Sản phẩm đã thích
          </h1>
          <span className="text-gray-500 text-sm ml-2">
            ({products.length} sản phẩm)
          </span>
        </div>

        {/* Nội dung chính */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="large" tip="Đang tải danh sách yêu thích..." />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((product) => (
              <div key={product._id} className="h-full">
                {/* Tái sử dụng ProductItem */}
                <ProductItem
                  productId={product._id}
                  slug={product.slug}
                  image={product.images?.[0]}
                  name={product.name}
                  originalPrice={product.price}
                  salePrice={product.sale_price}
                  discount={product.discount_percentage}
                  rating={product.item_rating?.rating_star}
                  soldCount={product.historical_sold || product.sold_count}
                  location={product.location}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <Empty
              description={
                <span className="text-gray-500">
                  Chưa có sản phẩm yêu thích nào
                </span>
              }
            />
            <Link to="/">
              <Button
                type="primary"
                size="large"
                className="mt-6 bg-red-500 border-red-500 hover:bg-red-600"
              >
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

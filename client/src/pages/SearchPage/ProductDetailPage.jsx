import React, { useState, useEffect, useCallback } from "react";
import { Breadcrumb, Row, Col, Spin, Alert, Tabs, message } from "antd";
import { Link, useParams } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons";
import { httpGet, httpPost } from "../../services/httpService";
import ProductImageGallery from "./components/ProductImageGallery";
import ProductBasicInfo from "./components/ProductBasicInfo";
import ProductVariantSelector from "./components/ProductVariantSelector";
import ProductPrice from "./components/ProductPrice";
import ProductActions from "./components/ProductActions";
import ProductShipping from "./components/ProductShipping";
import ProductSellerInfo from "./components/ProductSellerInfo";
import ProductDescription from "./components/ProductDescription";
import ProductAttributes from "./components/ProductAttributes";
import ProductReviews from "./components/ProductReviews";
import Loader from "../../components/common/Loader";
import RelatedProducts from "../../components/Product/RelatedProducts";
import { useAuth } from "../../contexts/AuthContext";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { user } = useAuth(); // Lấy thông tin user đang đăng nhập
  // ... state cũ

  // --- THÊM STATE CHO WISHLIST ---
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(0);
  // Fetch product data từ API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await httpGet(`/products/${slug}`);
        if (response.success) {
          setProduct(response.data);
          setCurrentLikeCount(response.data.liked_count || 0);
          if (user && user.wishlist) {
            const isInWishlist = user.wishlist.some(
              (item) =>
                (typeof item === "string" ? item : item._id) ===
                response.data._id
            );
            setIsLiked(isInWishlist);
          }
        } else {
          setError("Không tìm thấy sản phẩm");
        }
      } catch (err) {
        setError("Lỗi khi tải thông tin sản phẩm");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug, user]);

  const handleToggleWishlist = async () => {
    if (!user) {
      message.warning("Vui lòng đăng nhập để thêm vào yêu thích!");
      return;
    }

    // Optimistic Update (Cập nhật UI trước cho mượt)
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setCurrentLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      await httpPost("/user/wishlist/toggle",{ productId: product._id });
      // Backend trả về kết quả chính xác, có thể set lại nếu muốn chắc chắn
      // const res = await ...; setIsLiked(res.isLiked);
    } catch (error) {
      // Revert nếu lỗi
      setIsLiked(!newIsLiked);
      setCurrentLikeCount((prev) => (!newIsLiked ? prev + 1 : prev - 1));
      message.error("Lỗi cập nhật yêu thích");
    }
  };
  const handleVariantChange = useCallback((model) => {
    console.log("Variant Changed:", model);
    setSelectedModel(model);
    setQuantity(1);
  }, []);

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    // 1. Kiểm tra đăng nhập (đơn giản bằng cách check token trong localStorage)
    const token = localStorage.getItem("token"); // Hoặc lấy từ Redux store
    if (!token) {
      message.warning("Vui lòng đăng nhập để mua hàng!");
      // Có thể navigate tới trang login tại đây
      return;
    }

    // 2. Validate chọn biến thể
    if (product.has_model && !selectedModel) {
      message.warning("Vui lòng chọn phân loại hàng (Màu sắc/Kích thước)!");
      return;
    }

    setAddingToCart(true);
    try {
      // 3. Chuẩn bị dữ liệu gửi lên Backend
      const payload = {
        product_id: product._id,
        quantity: quantity,
        model_id: selectedModel ? selectedModel._id : null, // Gửi _id của model chứ không gửi object
      };

      // 4. Gọi API
      const response = await httpPost("/user/add", payload);

      if (response.success) {
        message.success("Đã thêm sản phẩm vào giỏ hàng thành công!");
        // TODO: Sau này sẽ thêm logic cập nhật số lượng trên icon giỏ hàng ở Header tại đây (Redux/Context)
      } else {
        message.error(response.message || "Không thể thêm vào giỏ hàng");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      // Lấy message lỗi từ backend trả về (nếu có)
      const errorMsg = err.response?.data?.message || "Lỗi kết nối đến server";
      message.error(errorMsg);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = (orderItem) => {
    console.log("Buy now:", orderItem);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Loader size="large" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-[1400px] mx-auto px-4">
          <Alert
            message="Lỗi"
            description={error || "Không tìm thấy sản phẩm"}
            type="error"
            showIcon
          />
        </div>
      </div>
    );
  }

  const availableStock = selectedModel?.stock || product.stock;

  // Đảm bảo shop_id luôn là string
  const getShopId = () => {
    if (!product.shop_id) return null;
    return typeof product.shop_id === "object"
      ? product.shop_id._id
      : product.shop_id;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-[1400px]  mx-auto px-4">
        <div className="bg-white">
          {" "}
          <div className="mb-6">
            <Breadcrumb
              separator=">"
              items={[
                {
                  title: (
                    <Link to="/" className="flex items-center gap-1">
                      <HomeOutlined />
                      <span>Trang chủ</span>
                    </Link>
                  ),
                },
                {
                  title: (
                    <Link
                      to={`/search?category_ids=${product.category_id._id}`}
                    >
                      {product.category_id.display_name}
                    </Link>
                  ),
                },
                {
                  title: <span className="text-gray-600">{product.name}</span>,
                },
              ]}
            />
          </div>
          {/* Product Content */}
          <Row gutter={32}>
            {/* Image Gallery Section */}
            <Col xs={24} lg={12}>
              <div className="p-4 mb-6">
                <ProductImageGallery
                  images={product.images}
                  video_info_list={product.video_info_list}
                />
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="p-6 space-y-6 mb-6">
                <ProductBasicInfo
                  name={product.name}
                  item_rating={product.item_rating}
                  historical_sold={product.historical_sold}
                  liked_count={currentLikeCount}
                  condition={product.condition}
                  location={product.location}
                />

                <ProductVariantSelector
                  has_model={product.has_model}
                  tier_variations={product.tier_variations}
                  models={product.models}
                  onVariantChange={handleVariantChange}
                />

                <ProductPrice
                  price={product.price}
                  sale_price={product.sale_price}
                  discount_percentage={product.discount_percentage}
                  stock={product.stock}
                  currentModel={selectedModel}
                  onQuantityChange={handleQuantityChange}
                />

                <ProductActions
                  productId={product._id}
                  currentModel={selectedModel}
                  quantity={quantity}
                  availableStock={availableStock}
                  onAddToCart={handleAddToCart}
                  isLiked={isLiked}
                  onToggleWishlist={handleToggleWishlist}
                  onBuyNow={handleBuyNow}
                  loading={addingToCart}
                />

                <ProductShipping
                  logistic_info={product.logistic_info}
                  pre_order={product.pre_order}
                  location={product.location}
                />
              </div>
            </Col>
          </Row>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm mt-10">
          <ProductSellerInfo shop_id={getShopId()} productInfo={product} />{" "}
          {/* ✅ FIX */}
        </div>

        {/* Product Description & Reviews Tabs - sẽ làm sau */}
        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <Tabs
            defaultActiveKey="description"
            size="large"
            className="custom-tabs"
            tabBarStyle={{ padding: "0 24px", marginBottom: 0 }}
            items={[
              {
                key: "description",
                label: "CHI TIẾT SẢN PHẨM",
                children: (
                  <div className="p-6">
                    <Row gutter={[32, 32]}>
                      <Col xs={24} lg={16}>
                        <ProductDescription description={product.description} />
                      </Col>

                      <Col xs={24} lg={8}>
                        <div className="sticky top-4">
                          <ProductAttributes attributes={product.attributes} />
                        </div>
                      </Col>
                    </Row>
                  </div>
                ),
              },
              {
                key: "reviews",
                label: `ĐÁNH GIÁ (${product.item_rating?.total_reviews || 0})`,
                children: (
                  <div className="p-6 text-center text-gray-500 min-h-[200px] bg-gray-50">
                    <ProductReviews
                      productId={product._id}
                      itemRating={product.item_rating}
                      productInfo={{
                        shopId:
                          typeof product.shop_id === "object"
                            ? product.shop_id._id
                            : product.shop_id,
                        name: product.name,
                        image: product.images?.[0] || "",
                        variant: selectedModel ? selectedModel.name : "",
                      }}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
        <RelatedProducts productId={product._id} />
      </div>
    </div>
  );
};

export default ProductDetailPage;

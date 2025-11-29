import React from "react";
import {
  Card,
  Pagination,
  Empty,
  Spin,
  Row,
  Col,
  Button,
  Dropdown,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import ProductItem from "../../../components/Product/ProductItem";
import Loader from "../../../components/common/Loader";


// Dữ liệu mẫu cho các bộ lọc mới (cần đồng bộ với FilterSection)
const logisticOptions = [
  { id: 1, name: "Giao Hàng Nhanh (GHN)" },
  { id: 2, name: "J&T Express" },
  { id: 3, name: "Giao Hàng Tiết Kiệm (GHTK)" },
];

const conditionOptions = [
  { value: "NEW", label: "Mới" },
  { value: "USED", label: "Đã sử dụng" },
];

const ProductSection = ({
  products,
  loading,
  pagination,
  filters,
  categories,
  onSortChange,
  onPageChange,
  onFilterChange,
}) => {
  const sortOptions = [
    { label: "Liên Quan", value: "" },
    { label: "Mới Nhất", value: "createdAt_desc" },
    { label: "Bán Chạy", value: "historical_sold_desc" },
  ];

  const priceSortOptions = [
    { label: "Giá: Thấp đến Cao", value: "price_asc" },
    { label: "Giá: Cao đến Thấp", value: "price_desc" },
  ];

  // Hàm xử lý khi click vào button sắp xếp
  const handleSortButtonClick = (value) => {
    onSortChange(value);
  };

  // Hàm xử lý khi chọn option trong dropdown giá
  const handlePriceSortSelect = ({ key }) => {
    onSortChange(key);
  };

  // Hàm lấy tên các danh mục đã chọn
  const getSelectedCategoryNames = () => {
    if (!filters.category_ids || filters.category_ids.length === 0) return "";
    const selectedCategories = categories.filter((cat) =>
      filters.category_ids.includes(cat._id)
    );
    return selectedCategories.map((cat) => cat.display_name).join(", ");
  };

  // Hàm lấy tên đơn vị vận chuyển
  const getLogisticName = (logisticId) => {
    const logistic = logisticOptions.find(
      (l) => l.id.toString() === logisticId
    );
    return logistic ? logistic.name : logisticId;
  };

  // Hàm lấy tên tình trạng
  const getConditionLabel = (conditionValue) => {
    const condition = conditionOptions.find((c) => c.value === conditionValue);
    return condition ? condition.label : conditionValue;
  };

  // Menu dropdown cho giá
  const priceSortMenu = {
    items: priceSortOptions.map((option) => ({
      key: option.value,
      label: option.label,
    })),
    onClick: handlePriceSortSelect,
  };

  // Xác định button nào đang active
  const getActiveSortButton = () => {
    if (!filters.sort) return "Liên Quan";
    if (filters.sort === "createdAt_desc") return "Mới Nhất";
    if (filters.sort === "historical_sold_desc") return "Bán Chạy";
    if (filters.sort.startsWith("price_")) return "Giá";
    return "Liên Quan";
  };

  const activeSortButton = getActiveSortButton();

  return (
    <>
      <Card className="!mb-6 shadow-sm border-0" size="default">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Sắp xếp theo
            </span>

            <div className="flex flex-wrap gap-1">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  type={
                    activeSortButton === option.label ? "primary" : "default"
                  }
                  size="middle"
                  onClick={() => handleSortButtonClick(option.value)}
                  className={`${
                    activeSortButton === option.label
                      ? "!bg-primary !border-primary !text-white"
                      : "!bg-white !border-gray-300 !text-gray-700 hover:!border-primary hover:!text-primary"
                  } transition-colors duration-200`}
                >
                  {option.label}
                </Button>
              ))}

              <Dropdown
                menu={priceSortMenu}
                trigger={["hover"]}
                placement="bottomLeft"
              >
                <Button
                  type={activeSortButton === "Giá" ? "primary" : "default"}
                  size="middle"
                  className={`flex items-center gap-1 transition-colors duration-200 ${
                    activeSortButton === "Giá"
                      ? "!bg-primary !border-primary !text-white"
                      : "!bg-white !border-gray-300 !text-gray-700 hover:!border-primary hover:!text-primary"
                  }`}
                >
                  Giá
                  <DownOutlined className="text-xs" />
                </Button>
              </Dropdown>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 max-w-full">
            {/* Active Category Filter */}
            {filters.category_ids && filters.category_ids.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-sm border border-blue-200">
                <span className="text-blue-700">
                  Danh mục: {getSelectedCategoryNames()}
                </span>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => onFilterChange("category_ids", [])}
                  className="!p-0 !h-4 !min-w-4"
                >
                  ×
                </Button>
              </div>
            )}

            {/* Active Location Filter */}
            {filters.locations && filters.locations.length > 0 && (
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full text-sm border border-green-200">
                <span className="text-green-700">
                  Nơi bán: {filters.locations.join(", ")}
                </span>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => onFilterChange("locations", [])}
                  className="!p-0 !h-4 !min-w-4"
                >
                  ×
                </Button>
              </div>
            )}

            {/* Active Logistic Filter */}
            {filters.logistics && filters.logistics.length > 0 && (
              <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full text-sm border border-purple-200">
                <span className="text-purple-700">
                  Vận chuyển:{" "}
                  {filters.logistics
                    .map((id) => getLogisticName(id))
                    .join(", ")}
                </span>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => onFilterChange("logistics", [])}
                  className="!p-0 !h-4 !min-w-4"
                >
                  ×
                </Button>
              </div>
            )}

            {/* Active Condition Filter */}
            {filters.conditions && filters.conditions.length > 0 && (
              <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full text-sm border border-orange-200">
                <span className="text-orange-700">
                  Tình trạng:{" "}
                  {filters.conditions
                    .map((cond) => getConditionLabel(cond))
                    .join(", ")}
                </span>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => onFilterChange("conditions", [])}
                  className="!p-0 !h-4 !min-w-4"
                >
                  ×
                </Button>
              </div>
            )}

            {/* Active Rating Filter */}
            {filters.rating_min && (
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full text-sm border border-yellow-200">
                <span className="text-yellow-700">
                  Đánh giá từ: {filters.rating_min} sao
                </span>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => onFilterChange("rating_min", "")}
                  className="!p-0 !h-4 !min-w-4"
                >
                  ×
                </Button>
              </div>
            )}

            {/* Active Price Filter */}
            {(filters.price_min || filters.price_max) && (
              <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full text-sm border border-red-200">
                <span className="text-red-700">
                  Giá:{" "}
                  {filters.price_min
                    ? `${filters.price_min.toLocaleString()}₫`
                    : "0₫"}
                  {" - "}
                  {filters.price_max
                    ? `${filters.price_max.toLocaleString()}₫`
                    : "10,000,000₫"}
                </span>
                <Button
                  type="link"
                  danger
                  size="small"
                  onClick={() => {
                    onFilterChange("price_min", "");
                    onFilterChange("price_max", "");
                  }}
                  className="!p-0 !h-4 !min-w-4"
                >
                  ×
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size="large" />
        </div>
      ) : products.length > 0 ? (
        <>
          {/* Grid 5 cột trên desktop, responsive cho mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {products.map((product) => (
              <div key={product._id} className="w-full">
                <ProductItem
                  productId={product._id}
                  image={product.images?.[0]}
                  name={product.name}
                  originalPrice={product.price}
                  salePrice={product.sale_price}
                  discount={product.discount_percentage}
                  rating={product.item_rating?.rating_star}
                  soldCount={product.historical_sold}
                  location={product.location?.city}
                  slug={product.slug}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={pagination.currentPage}
                total={pagination.totalItems}
                pageSize={pagination.limit}
                onChange={onPageChange}
                showSizeChanger={false}
                showQuickJumper
                className="search-pagination"
              />
            </div>
          )}
        </>
      ) : (
        <Empty
          description={"Không tìm thấy sản phẩm phù hợp với từ khóa tìm kiếm"}
          className="flex flex-col items-center justify-center h-64"
        />
      )}
    </>
  );
};

export default ProductSection;

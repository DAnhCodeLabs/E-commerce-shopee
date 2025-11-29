import React from "react";
import {
  Card,
  Slider,
  Rate,
  InputNumber,
  Button,
  Checkbox,
  Collapse,
  Divider,
  Spin,
} from "antd";
import { FilterOutlined, DownOutlined } from "@ant-design/icons";
import Loader from "../../../components/common/Loader";

const { Panel } = Collapse;

// Dữ liệu mẫu cho các bộ lọc mới
const locationOptions = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
  "Khánh Hòa",
];

const logisticOptions = [
  { id: 1, name: "Giao Hàng Nhanh (GHN)" },
  { id: 2, name: "J&T Express" },
  { id: 3, name: "Giao Hàng Tiết Kiệm (GHTK)" },
];

const conditionOptions = [
  { value: "NEW", label: "Mới" },
  { value: "USED", label: "Đã sử dụng" },
];

const FilterSection = ({
  categories,
  categoriesLoading,
  filters,
  onFilterChange,
  onPriceRangeChange,
  onCategoryFilter,
  onLocationFilter,
  onLogisticFilter,
  onConditionFilter,
  onRatingFilter,
  onClearAllFilters,
}) => {
  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold">
            <FilterOutlined className="text-primary" />
            Bộ lọc
          </span>
          <Button
            type="link"
            onClick={onClearAllFilters}
            className="p-0 text-sm text-primary hover:text-red-500 transition-colors"
          >
            Xóa hết
          </Button>
        </div>
      }
      className="shadow-sm border-0 sticky top-4"
    >
      {/* Category Filter */}
      <div className="mb-4">
        <Collapse
          defaultActiveKey={["1", "2", "3", "4", "5", "6"]}
          expandIconPosition="end"
          expandIcon={({ isActive }) => (
            <DownOutlined
              rotate={isActive ? 180 : 0}
              className="text-gray-400"
            />
          )}
          ghost
          size="small"
        >
          <Panel
            header={<span className="font-medium">Danh mục sản phẩm</span>}
            key="1"
          >
            {categoriesLoading ? (
              <div className="flex justify-center py-4">
                <Loader size="small" />
              </div>
            ) : (
              <Checkbox.Group
                value={filters.category_ids || []}
                onChange={onCategoryFilter}
                className="w-full"
              >
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center justify-between hover:bg-gray-50 px-1 py-1 rounded"
                    >
                      <Checkbox value={category._id} className="w-full">
                        <span className="text-sm text-gray-700">
                          {category.display_name}
                        </span>
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </Checkbox.Group>
            )}
          </Panel>

          {/* Location Filter */}
          <Panel header={<span className="font-medium">Nơi bán</span>} key="2">
            <Checkbox.Group
              value={filters.locations || []}
              onChange={onLocationFilter}
              className="w-full"
            >
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {locationOptions.map((location) => (
                  <div
                    key={location}
                    className="flex items-center hover:bg-gray-50 px-1 py-1 rounded"
                  >
                    <Checkbox value={location}>
                      <span className="text-sm text-gray-700">{location}</span>
                    </Checkbox>
                  </div>
                ))}
              </div>
            </Checkbox.Group>
          </Panel>

          {/* Logistic Filter */}
          <Panel
            header={<span className="font-medium">Đơn vị vận chuyển</span>}
            key="3"
          >
            <Checkbox.Group
              value={filters.logistics || []}
              onChange={onLogisticFilter}
              className="w-full"
            >
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {logisticOptions.map((logistic) => (
                  <div
                    key={logistic.id}
                    className="flex items-center hover:bg-gray-50 px-1 py-1 rounded"
                  >
                    <Checkbox value={logistic.id.toString()}>
                      <span className="text-sm text-gray-700">
                        {logistic.name}
                      </span>
                    </Checkbox>
                  </div>
                ))}
              </div>
            </Checkbox.Group>
          </Panel>

          {/* Condition Filter */}
          <Panel
            header={<span className="font-medium">Tình trạng sản phẩm</span>}
            key="4"
          >
            <Checkbox.Group
              value={filters.conditions || []}
              onChange={onConditionFilter}
              className="w-full"
            >
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {conditionOptions.map((condition) => (
                  <div
                    key={condition.value}
                    className="flex items-center hover:bg-gray-50 px-1 py-1 rounded"
                  >
                    <Checkbox value={condition.value}>
                      <span className="text-sm text-gray-700">
                        {condition.label}
                      </span>
                    </Checkbox>
                  </div>
                ))}
              </div>
            </Checkbox.Group>
          </Panel>

          {/* Price Filter */}
          <Panel
            header={<span className="font-medium">Khoảng giá</span>}
            key="5"
          >
            <div className="px-1">
              <Slider
                range
                min={0}
                max={10000000}
                step={10000}
                value={[filters.price_min || 0, filters.price_max || 10000000]}
                onChange={onPriceRangeChange}
                tipFormatter={(value) =>
                  value ? `${(value / 1000).toFixed(0)}k` : "0"
                }
                className="mb-4"
              />
              <div className="flex gap-2">
                <InputNumber
                  placeholder="Từ"
                  min={0}
                  max={10000000}
                  value={filters.price_min}
                  onChange={(value) => onFilterChange("price_min", value)}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  className="w-full text-sm"
                  size="small"
                />
                <InputNumber
                  placeholder="Đến"
                  min={0}
                  max={10000000}
                  value={filters.price_max}
                  onChange={(value) => onFilterChange("price_max", value)}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  className="w-full text-sm"
                  size="small"
                />
              </div>
            </div>
          </Panel>

          {/* Rating Filter */}
          <Panel header={<span className="font-medium">Đánh giá</span>} key="6">
            <div className="space-y-1 px-1">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div
                  key={rating}
                  className={`flex items-center gap-2 cursor-pointer p-2 rounded transition-colors ${
                    filters.rating_min === rating.toString()
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onRatingFilter(rating.toString())}
                >
                  <Rate disabled value={rating} className="!text-sm" />
                  <span className="text-sm text-gray-600 flex-1">
                    từ {rating} sao
                  </span>
                  {filters.rating_min === rating.toString() && (
                    <Button
                      type="link"
                      danger
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFilterChange("rating_min", "");
                      }}
                      className="!p-0 !h-4 !min-w-4"
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Panel>
        </Collapse>
      </div>
    </Card>
  );
};

export default FilterSection;

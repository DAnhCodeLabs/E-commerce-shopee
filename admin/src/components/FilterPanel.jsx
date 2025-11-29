// src/components/common/FilterPanel.jsx
import React, { useState, useEffect, useRef } from "react"; // 1. Import useRef
import { Input, Select, DatePicker, Button, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const FilterPanel = ({
  config,
  onFilterChange,
  initialFilters = {},
  resetIcon = <ReloadOutlined />,
  addLink,
}) => {
  const [filters, setFilters] = useState(initialFilters);
  const isInitialMount = useRef(true);

  const debouncedOnChange = debounce((newFilters) => {
    onFilterChange(newFilters);
  }, 300);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      debouncedOnChange(filters);
    }

    return () => debouncedOnChange.cancel();
  }, [filters]);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Space wrap style={{ marginBottom: 16 }} className="w-full">
      {config.map((item, index) => {
        switch (item.type) {
          case "search":
            return (
              <Search
                key={index}
                placeholder={item.placeholder || "Tìm kiếm..."}
                value={filters[item.key] || ""}
                onChange={(e) => handleChange(item.key, e.target.value)}
                onSearch={(value) => handleChange(item.key, value)}
                style={{ width: item.width || 200 }}
                allowClear
              />
            );
          case "select":
            return (
              <Select
                key={index}
                placeholder={item.placeholder || "Lọc..."}
                value={
                  filters[item.key] !== undefined
                    ? filters[item.key]
                    : undefined
                }
                onChange={(value) => handleChange(item.key, value)}
                style={{ width: item.width || 150 }}
                allowClear
              >
                {item.options.map((opt) => (
                  <Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            );
          case "dateRange":
            return (
              <RangePicker
                key={index}
                value={filters[item.key] || null}
                onChange={(dates) => handleChange(item.key, dates)}
                style={{ width: item.width || 280 }}
                placeholder={item.placeholder || ["Từ ngày", "Đến ngày"]}
                allowClear
              />
            );
          default:
            return null;
        }
      })}
      <Button icon={resetIcon} onClick={handleReset}>
        Làm mới bộ lọc
      </Button>
      {addLink && (
        <Link to={addLink.to}>
          <Button type="primary">{addLink.label || "Thêm"}</Button>
        </Link>
      )}
    </Space>
  );
};

export default FilterPanel;

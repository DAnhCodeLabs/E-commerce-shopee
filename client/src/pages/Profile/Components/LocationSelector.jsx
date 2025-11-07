import React, { useState, useEffect, forwardRef } from "react";
import { Select, Tabs, Spin, Divider } from "antd";
import axios from "axios";

const { TabPane } = Tabs;

const LocationSelector = forwardRef(({ value, onChange, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [displayValue, setDisplayValue] = useState(value || "");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("province");

  useEffect(() => {
    if (open && provinces.length === 0) {
      fetchProvinces();
    }
  }, [open, provinces.length]);

  useEffect(() => {
    setDisplayValue(value || "");
  }, [value]);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://provinces.open-api.vn/api/p/");
      setProvinces(response.data);
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
    setLoading(false);
  };

  const fetchDistricts = async (provinceCode) => {
    setLoading(true);
    setDistricts([]);
    setWards([]);
    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      setDistricts(response.data.districts);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
    setLoading(false);
  };

  const fetchWards = async (districtCode) => {
    setLoading(true);
    setWards([]);
    try {
      const response = await axios.get(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      setWards(response.data.wards);
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
    setLoading(false);
  };

  const handleProvinceSelect = (province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    fetchDistricts(province.code);
    setActiveTab("district");
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    fetchWards(district.code);
    setActiveTab("ward");
  };

  const handleWardSelect = (ward) => {
    const fullAddress = `${ward.name}, ${selectedDistrict.name}, ${selectedProvince.name}`;
    setDisplayValue(fullAddress);

    // Gọi onChange để cập nhật giá trị vào form
    if (onChange) {
      onChange(fullAddress);
    }

    setOpen(false);
  };

  const resetSelection = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
    setDisplayValue("");

    // Gọi onChange để xóa giá trị trong form
    if (onChange) {
      onChange("");
    }

    setActiveTab("province");
  };

  const handleDropdownVisibleChange = (visible) => {
    setOpen(visible);
    if (!visible && !displayValue) {
      resetSelection();
    }
  };

  const renderItemList = (items, onSelect) => (
    <div
      onMouseDown={(e) => e.preventDefault()}
      style={{ maxHeight: 240, overflow: "auto" }}
    >
      {items.map((item) => (
        <div
          key={item.code}
          onClick={() => onSelect(item)}
          style={{ padding: "8px 12px", cursor: "pointer" }}
          className="ant-select-item ant-select-item-option ant-select-item-option-active"
        >
          {item.name}
        </div>
      ))}
    </div>
  );

  return (
    <Select
      ref={ref}
      open={open}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      size="large"
      placeholder="Chọn Tỉnh/Thành phố, Quận/Huyện, Phường/Xã"
      value={displayValue}
      onClear={resetSelection}
      allowClear
      onChange={(value) => {
        setDisplayValue(value);
        if (onChange) {
          onChange(value);
        }
      }}
      dropdownRender={(menu) => (
        <Spin spinning={loading}>
          <Tabs
            activeKey={activeTab}
            onTabClick={(key) => setActiveTab(key)}
            className=""
          >
            <TabPane tab="Tỉnh/Thành phố" key="province">
              {renderItemList(provinces, handleProvinceSelect)}
            </TabPane>
            <TabPane
              tab="Quận/Huyện"
              key="district"
              disabled={!selectedProvince}
            >
              {districts.length > 0 ? (
                renderItemList(districts, handleDistrictSelect)
              ) : (
                <div style={{ padding: 12, textAlign: "center" }}>
                  Vui lòng chọn Tỉnh/Thành phố
                </div>
              )}
            </TabPane>
            <TabPane tab="Phường/Xã" key="ward" disabled={!selectedDistrict}>
              {wards.length > 0 ? (
                renderItemList(wards, handleWardSelect)
              ) : (
                <div style={{ padding: 12, textAlign: "center" }}>
                  Vui lòng chọn Quận/Huyện
                </div>
              )}
            </TabPane>
          </Tabs>
        </Spin>
      )}
      {...props}
    />
  );
});

LocationSelector.displayName = "LocationSelector";

export default LocationSelector;

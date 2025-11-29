import React, { useState, useEffect } from "react";
import { Alert } from "antd";

const ProductVariantSelector = ({
  has_model = false,
  tier_variations = [],
  models = [],
  onVariantChange,
}) => {
  const [selectedTiers, setSelectedTiers] = useState({});
  const [outOfStockOptions, setOutOfStockOptions] = useState(new Set());

  // Log dữ liệu đầu vào khi component load
  useEffect(() => {
    if (has_model) {
      console.log("--- DEBUG VARIANT SELECTOR ---");
      console.log("Tier Variations:", tier_variations);
      console.log("All Models:", models);
    }
  }, [has_model, tier_variations, models]);

  // Khởi tạo outOfStock
  useEffect(() => {
    if (has_model && models && models.length > 0) {
      const outOfStock = new Set();
      models.forEach((model) => {
        if ((model.stock || 0) <= 0) {
          if (model.tier_index && Array.isArray(model.tier_index)) {
            model.tier_index.forEach((index, tierIndex) => {
              outOfStock.add(`${tierIndex}-${index}`);
            });
          }
        }
      });
      setOutOfStockOptions(outOfStock);
    }
  }, [has_model, models]);

  // --- HÀM TÌM KIẾM MODEL (Có Log chi tiết) ---
  const findModel = (currentSelectedTiers) => {
    const selectedKeys = Object.keys(currentSelectedTiers);

    // Chưa chọn đủ
    if (selectedKeys.length < tier_variations.length) {
      return null;
    }

    // Tạo mảng index người dùng chọn
    // Lưu ý: Object keys không đảm bảo thứ tự, nên phải map theo tier_variations
    const userIndices = tier_variations.map((_, idx) =>
      Number(currentSelectedTiers[idx])
    );

    console.log("User đang chọn (Indices):", userIndices);

    // Tìm trong models
    const found = models.find((model) => {
      // Kiểm tra dữ liệu model
      if (!model.tier_index || !Array.isArray(model.tier_index)) {
        console.warn("Model lỗi data (không có tier_index):", model);
        return false;
      }

      // So sánh
      const isMatch =
        model.tier_index.length === userIndices.length &&
        model.tier_index.every(
          (val, idx) => String(val) === String(userIndices[idx])
        );

      if (isMatch) {
        console.log(">>> TÌM THẤY MODEL KHỚP:", model);
      }
      return isMatch;
    });

    if (!found) {
      console.warn(">>> KHÔNG TÌM THẤY MODEL NÀO KHỚP VỚI:", userIndices);
      console.log(
        "Kiểm tra lại danh sách tier_index của các model bên trên xem có cái nào giống không."
      );
    }

    return found || null;
  };

  const handleTierSelect = (tierIndex, optionIndex) => {
    // Cập nhật state
    const newSelectedTiers = {
      ...selectedTiers,
      [tierIndex]: optionIndex,
    };
    setSelectedTiers(newSelectedTiers);

    // Tìm model ngay lập tức
    const foundModel = findModel(newSelectedTiers);

    // Gửi ra ngoài
    if (onVariantChange) {
      onVariantChange(foundModel);
    }
  };

  const isOptionOutOfStock = (tierIndex, optionIndex) => {
    return outOfStockOptions.has(`${tierIndex}-${optionIndex}`);
  };

  const isOptionSelected = (tierIndex, optionIndex) => {
    return selectedTiers[tierIndex] === optionIndex;
  };

  // Tính toán hiển thị
  const currentModelDisplay = findModel(selectedTiers);

  if (!has_model || !tier_variations || tier_variations.length === 0) {
    return null;
  }

  return (
    <div className="product-variant-selector space-y-4 select-none">
      {tier_variations.map((tier, tierIndex) => (
        <div key={tierIndex} className="variant-tier">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-600 text-sm font-medium capitalize">
              {tier.name}:
            </span>
            {selectedTiers[tierIndex] !== undefined && (
              <span className="text-sm font-bold text-gray-900">
                {tier.options[selectedTiers[tierIndex]]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {tier.options.map((option, optionIndex) => {
              const isOutOfStock = isOptionOutOfStock(tierIndex, optionIndex);
              const isSelected = isOptionSelected(tierIndex, optionIndex);

              return (
                <button
                  key={optionIndex}
                  type="button"
                  onClick={() =>
                    !isOutOfStock && handleTierSelect(tierIndex, optionIndex)
                  }
                  disabled={isOutOfStock}
                  className={`
                    px-4 py-2 border rounded text-sm min-w-[3rem] transition-all
                    ${
                      isSelected
                        ? "border-red-500 text-red-500 bg-red-50 font-medium"
                        : "border-gray-200 text-gray-700 bg-white hover:border-red-500"
                    }
                    ${
                      isOutOfStock
                        ? "opacity-40 cursor-not-allowed bg-gray-100 decoration-line-through border-gray-100"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {tier.images && tier.images[optionIndex] && (
                    <img
                      src={tier.images[optionIndex]}
                      alt=""
                      className="w-6 h-6 object-cover inline-block mr-1 rounded-sm"
                    />
                  )}
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(selectedTiers).length < tier_variations.length && (
        <Alert
          message="Vui lòng chọn phân loại hàng"
          type="warning"
          showIcon
          className="mt-2 text-xs"
        />
      )}

      {currentModelDisplay && (
        <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded border border-green-100">
          ✅ Đã chọn: <strong>{currentModelDisplay.name}</strong>
          <span className="ml-2">(Kho: {currentModelDisplay.stock})</span>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;

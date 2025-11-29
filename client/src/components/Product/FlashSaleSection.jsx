import React, { useState, useEffect } from "react";
import BoxProduct from "./BoxProduct";
import SlideProduct from "./SlideProduct";
import ProductItem from "./ProductItem";
import { httpGet } from "../../services/httpService";

const FlashSaleSection = () => {
  const [flashSaleData, setFlashSaleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  // Fetch flash sale data
  const fetchFlashSale = async () => {
    try {
      setLoading(true);
      const response = await httpGet("/flash-sale/homepage");
      setFlashSaleData(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu flash sale:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate countdown
  const updateCountdown = () => {
    if (!flashSaleData?.slotInfo) return;

    const now = new Date();
    const slot = flashSaleData.slotInfo;

    // Create target date based on slot status
    let targetDate;
    if (slot.status === "đang diễn ra") {
      // Countdown to end time
      const [endHour, endMinute] = slot.end_time.split(":").map(Number);
      targetDate = new Date(slot.target_date);
      targetDate.setHours(endHour, endMinute, 0, 0);
    } else {
      // Countdown to start time
      const [startHour, startMinute] = slot.start_time.split(":").map(Number);
      targetDate = new Date(slot.target_date);
      targetDate.setHours(startHour, startMinute, 0, 0);
    }

    const diff = targetDate - now;

    if (diff <= 0) {
      setCountdown("Đã kết thúc");
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setCountdown(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  };

  useEffect(() => {
    fetchFlashSale();
  }, []);

  useEffect(() => {
    if (flashSaleData?.slotInfo) {
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [flashSaleData]);

  if (loading) {
    return (
      <BoxProduct title="Flash Sale">
        <div className="p-4 text-center">Đang tải Flash Sale...</div>
      </BoxProduct>
    );
  }

  if (!flashSaleData?.products?.length) {
    return (
      <BoxProduct title="Flash Sale">
        <div className="p-4 text-center">Hiện không có Flash Sale</div>
      </BoxProduct>
    );
  }

  const getStatusText = () => {
    const status = flashSaleData.slotInfo?.status;
    switch (status) {
      case "đang diễn ra":
        return "Đang diễn ra";
      case "sắp diễn ra":
        return "Sắp diễn ra";
      default:
        return "Flash Sale";
    }
  };

  const getTitle = () => {
    const statusText = getStatusText();
    return `Flash Sale - ${statusText} ${countdown ? `(${countdown})` : ""}`;
  };

  return (
    <BoxProduct title={getTitle()} seeAllLink="/flash-sale">
      <SlideProduct>
        {flashSaleData.products.map((product) => (
          <div key={product._id} className="px-1">
            <ProductItem
              productId={product.product_id}
              image={product.productImage}
              name={product.productName}
              originalPrice={product.original_price}
              salePrice={product.flash_price}
              discount={product.discount_percentage}
              rating={product.rating_star || 4.9}
              soldCount={product.sold_count}
              location="TP. Hồ Chí Minh"
              slug={product.productSlug}
              isFlashSale={true}
              flashStock={product.flash_stock}
            />
          </div>
        ))}
      </SlideProduct>
    </BoxProduct>
  );
};

export default FlashSaleSection;

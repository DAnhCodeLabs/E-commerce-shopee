// src/components/seller/FlashSaleRegistrationForm.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  message,
  Select,
  DatePicker,
  InputNumber,
  Alert,
  Descriptions,
} from "antd";
import dayjs from "dayjs";
import { httpGet, httpPost } from "../../../services/httpService";
import CommonForm from "../../../components/common/CommonForm";

const { Option } = Select;

const FlashSaleRegistrationForm = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  // const [form] = CommonForm.useForm();

  // Lấy danh sách sản phẩm của seller
  const fetchProducts = async () => {
    try {
      const response = await httpGet("/seller/products", {
        params: {
          limit: 100,
          sellerStatus: "NORMAL",
        },
      });

      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  // Lấy danh sách khung giờ flash sale active
  const fetchTimeSlots = async () => {
    try {
      const response = await httpGet("/admin/flash-sale/slots", {
        params: { is_active: true, limit: 50 },
      });

      if (response.success) {
        setTimeSlots(response.data || []);
      }
    } catch (error) {
      console.error("Fetch time slots error:", error);
    }
  };

  // Xử lý khi chọn sản phẩm
  const handleProductChange = (productId) => {
    const product = products.find((p) => p._id === productId);
    setSelectedProduct(product);

    // Auto-fill một số thông tin
    if (product) {
      form.setFieldsValue({
        original_price: product.price,
        available_stock: product.getTotalStock
          ? product.getTotalStock()
          : product.stock,
      });
    }
  };

  // Xử lý khi chọn khung giờ
  const handleTimeSlotChange = (timeSlotId) => {
    const timeSlot = timeSlots.find((ts) => ts._id === timeSlotId);
    setSelectedTimeSlot(timeSlot);
  };

  // Validate flash price
  const validateFlashPrice = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập giá flash sale"));
    }

    if (selectedProduct && value >= selectedProduct.price) {
      return Promise.reject(new Error("Giá flash sale phải thấp hơn giá gốc"));
    }

    if (value <= 0) {
      return Promise.reject(new Error("Giá flash sale phải lớn hơn 0"));
    }

    return Promise.resolve();
  };

  // Validate flash stock
  const validateFlashStock = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng nhập số lượng flash sale"));
    }

    if (value <= 0) {
      return Promise.reject(new Error("Số lượng flash sale phải lớn hơn 0"));
    }

    if (
      selectedProduct &&
      value >
        (selectedProduct.getTotalStock
          ? selectedProduct.getTotalStock()
          : selectedProduct.stock)
    ) {
      return Promise.reject(
        new Error("Số lượng flash sale không được vượt quá tồn kho hiện tại")
      );
    }

    return Promise.resolve();
  };

  // Validate sale date
  const validateSaleDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Vui lòng chọn ngày flash sale"));
    }

    const selectedDate = dayjs(value);
    const today = dayjs().startOf("day");

    if (selectedDate.isBefore(today)) {
      return Promise.reject(new Error("Không thể chọn ngày trong quá khứ"));
    }

    if (selectedTimeSlot) {
      const [startHour, startMinute] = selectedTimeSlot.start_time
        .split(":")
        .map(Number);
      const saleStartDateTime = selectedDate
        .set("hour", startHour)
        .set("minute", startMinute);

      if (saleStartDateTime.isBefore(dayjs())) {
        return Promise.reject(
          new Error("Không thể đăng ký cho khung giờ đã bắt đầu")
        );
      }
    }

    return Promise.resolve();
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const payload = {
        product_id: values.product_id,
        time_slot_id: values.time_slot_id,
        sale_date: dayjs(values.sale_date).format("YYYY-MM-DD"),
        flash_price: Number(values.flash_price),
        flash_stock: Number(values.flash_stock),
      };

      const response = await httpPost("/seller/flash-sale/register", payload);

      if (response.success) {
        message.success(
          response.message || "Đăng ký flash sale thành công! Chờ admin duyệt."
        );
        form.resetFields();
        setSelectedProduct(null);
        setSelectedTimeSlot(null);
      }
    } catch (error) {
      // Lỗi đã được xử lý trong interceptor
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo dữ liệu
  useEffect(() => {
    fetchProducts();
    fetchTimeSlots();
  }, []);

  // Định nghĩa các trường form
  const formFields = [
    {
      name: "product_id",
      label: "Sản phẩm",
      type: "custom",
      rules: [{ required: true, message: "Vui lòng chọn sản phẩm" }],
      customComponent: (
        <Select
          placeholder="Chọn sản phẩm"
          onChange={handleProductChange}
          showSearch
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          allowClear
        >
          {products.map((product) => (
            <Option key={product._id} value={product._id}>
              {product.name} - {product.price?.toLocaleString("vi-VN")}₫ - Tồn:{" "}
              {product.getTotalStock ? product.getTotalStock() : product.stock}
            </Option>
          ))}
        </Select>
      ),
      span: 24,
    },
    {
      name: "time_slot_id",
      label: "Khung giờ flash sale",
      type: "custom",
      rules: [{ required: true, message: "Vui lòng chọn khung giờ" }],
      customComponent: (
        <Select
          placeholder="Chọn khung giờ"
          onChange={handleTimeSlotChange}
          allowClear
        >
          {timeSlots.map((slot) => (
            <Option key={slot._id} value={slot._id}>
              {slot.name} ({slot.start_time} - {slot.end_time})
            </Option>
          ))}
        </Select>
      ),
      span: 24,
    },
    {
      name: "sale_date",
      label: "Ngày flash sale",
      type: "custom",
      rules: [
        { required: true, message: "Vui lòng chọn ngày flash sale" },
        { validator: validateSaleDate },
      ],
      customComponent: (
        <DatePicker
          format="DD/MM/YYYY"
          placeholder="Chọn ngày"
          disabledDate={(current) =>
            current && current < dayjs().startOf("day")
          }
          style={{ width: "100%" }}
        />
      ),
      span: 12,
    },
    {
      name: "flash_price",
      label: "Giá flash sale",
      type: "custom",
      rules: [
        { required: true, message: "Vui lòng nhập giá flash sale" },
        { validator: validateFlashPrice },
      ],
      customComponent: (
        <InputNumber
          placeholder="Nhập giá flash sale"
          style={{ width: "100%" }}
          min={1}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          addonAfter="₫"
          disabled={!selectedProduct}
        />
      ),
      span: 12,
    },
    {
      name: "flash_stock",
      label: "Số lượng flash sale",
      type: "custom",
      rules: [
        { required: true, message: "Vui lòng nhập số lượng flash sale" },
        { validator: validateFlashStock },
      ],
      customComponent: (
        <InputNumber
          placeholder="Nhập số lượng"
          style={{ width: "100%" }}
          min={1}
          disabled={!selectedProduct}
        />
      ),
      span: 12,
    },
  ];

  // Thêm các trường thông tin chỉ đọc
  if (selectedProduct) {
    formFields.push(
      {
        name: "original_price",
        label: "Giá gốc",
        type: "custom",
        customComponent: (
          <InputNumber
            style={{ width: "100%" }}
            value={selectedProduct.price}
            disabled
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            addonAfter="₫"
          />
        ),
        span: 12,
      },
      {
        name: "available_stock",
        label: "Tồn kho hiện tại",
        type: "custom",
        customComponent: (
          <InputNumber
            style={{ width: "100%" }}
            value={
              selectedProduct.getTotalStock
                ? selectedProduct.getTotalStock()
                : selectedProduct.stock
            }
            disabled
          />
        ),
        span: 12,
      }
    );
  }

  return (
    <Card
      title="Đăng ký sản phẩm Flash Sale"
      bordered={false}
      style={{ maxWidth: 800, margin: "0 auto" }}
    >
      <Alert
        message="Lưu ý khi đăng ký Flash Sale"
        description="Sản phẩm phải ở trạng thái 'Đang bán', giá flash sale phải thấp hơn giá gốc và số lượng không vượt quá tồn kho hiện tại. Đăng ký sẽ được admin duyệt trước khi hiển thị."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* Hiển thị thông tin khung giờ nếu được chọn */}
      {selectedTimeSlot && (
        <Descriptions size="small" bordered style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Khung giờ" span={3}>
            {selectedTimeSlot.name}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian" span={3}>
            {selectedTimeSlot.start_time} - {selectedTimeSlot.end_time}
          </Descriptions.Item>
        </Descriptions>
      )}

      <CommonForm
        fields={formFields}
        onSubmit={handleSubmit}
        submitButtonText="Đăng ký Flash Sale"
        cancelButtonText="Hủy"
        onCancel={() => {
          form.resetFields();
          setSelectedProduct(null);
          setSelectedTimeSlot(null);
        }}
        loading={loading}
        layout="vertical"
        formInstance={(formInstance) => {
          // Nhận form instance nếu cần
        }}
        initialValues={{}}
        submitButtonProps={{
          style: { minWidth: 150 },
          disabled: !selectedProduct || !selectedTimeSlot,
        }}
      />
    </Card>
  );
};

export default FlashSaleRegistrationForm;

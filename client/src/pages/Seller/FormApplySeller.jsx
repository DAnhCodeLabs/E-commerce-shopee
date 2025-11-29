import React, { useState } from "react";
import { Divider, Form, message } from "antd";
import CommonForm from "../../components/common/CommonForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { httpPost } from "../../services/httpService";
import { assets } from "../../assets/assets";

const FormApplySeller = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuth();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const payload = {
        shopName: values.shopName,
        shopDescription: values.shopDescription,
        taxcode: values.taxcode,
        PlaceOfGrant: values.PlaceOfGrant,

        addressSeller: {
          street: values.addressSeller?.street || "",
          ward: values.addressSeller?.ward || "",
          district: values.addressSeller?.district || "",
          city: values.addressSeller?.city || "",
          country: values.addressSeller?.country || "Việt Nam",
        },

        addressShop: {
          street: values.addressShop?.street || "",
          ward: values.addressShop?.ward || "",
          district: values.addressShop?.district || "",
          city: values.addressShop?.city || "",
          country: values.addressShop?.country || "Việt Nam",
        },
      };

      const response = await httpPost("/user/profile/register-seller", payload);
      message.success(response.message);

      const fullData = response.data;
      const userData = { ...fullData };
      const token = userData.token;
      delete userData.token;

      setTimeout(() => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
        setUser(userData);
        setToken(token);
        navigate("/seller/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
    } finally {
      setLoading(false);
    }
  };

  const formItems = [
    {
      type: "text",
      name: "shopName",
      label: "Tên cửa hàng",
      placeholder: "Nhập tên cửa hàng",
      rules: [{ required: true, message: "Please input your shop name!" }],
    },
    {
      type: "textarea",
      name: "shopDescription",
      label: "Mô tả cửa hàng",
      placeholder: "Nhập mô tả cửa hàng",
    },
    {
      type: "text",
      name: "taxcode",
      label: "Tax Code (MST / CCCD)",
      placeholder: "Nhập mã số thuế hoặc CCCD",
      rules: [{ required: true, message: "Please input your tax code!" }],
    },
    {
      type: "text",
      name: "PlaceOfGrant",
      label: "Nơi cấp",
      placeholder: "Nhập nơi cấp MST/CCCD",
      rules: [{ required: true, message: "Please input place of grant!" }],
    },

    {
      type: "group",
      label: "Địa chỉ nhà riêng (Seller Address)",
      className: "grid grid-cols-4 gap-4",

      fields: [
        {
          type: "text",
          name: "addressSeller.street",
          label: "Số nhà / Đường",
          rules: [{ required: true }],
        },
        {
          type: "text",
          name: "addressSeller.ward",
          label: "Phường / Xã",
          rules: [{ required: true }],
        },
        {
          type: "text",
          name: "addressSeller.district",
          label: "Quận / Huyện",
          rules: [{ required: true }],
        },
        {
          type: "text",
          name: "addressSeller.city",
          label: "Thành phố",
          rules: [{ required: true }],
        },
      ],
    },
    {
      type: "group",
      label: "Địa chỉ lấy hàng (Shop Address)",
      className: "grid grid-cols-4 gap-4",

      fields: [
        {
          type: "text",
          name: "addressShop.street",
          label: "Số nhà / Đường",
          rules: [{ required: true }],
        },
        {
          type: "text",
          name: "addressShop.ward",
          label: "Phường / Xã",
          rules: [{ required: true }],
        },
        {
          type: "text",
          name: "addressShop.district",
          label: "Quận / Huyện",
          rules: [{ required: true }],
        },
        {
          type: "text",
          name: "addressShop.city",
          label: "Thành phố",
          rules: [{ required: true }],
        },
      ],
    },
  ];

  return (
    <div>
      <div className="w-[1400px] mx-auto my-10">
        <div className="flex justify-between items-center gap-4">
          <div className="w-2/3 border-1 border-[#e0dddd] rounded-xl p-4 flex flex-col gap-4">
            <div>
              <h1 className="text-primary font-bold text-xl">
                Seller Application
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                It is a long established fact that a reader will be distracted
                by the readable content of a page when looking at its many
                desktop publishing packages and web page editors now use layout.
              </p>
              <Divider />
            </div>
            <div>
              <CommonForm
                fields={formItems}
                onSubmit={handleSubmit}
                submitButtonText="Create Seller Account"
                submitButtonProps={{
                  className: "w-full mt-6 !py-4.5 !bg-primary",
                  loading: loading,
                }}
              />
            </div>
          </div>
          <div className="w-1/3 flex flex-col gap-4">
            <div className="py-5 px-12 border-1 border-[#e0dddd] rounded-xl">
              <div className="flex flex-col items-center justify-center gap-2">
                <img className="w-[80px]" src={assets.saleOnline} alt="" />
                <h1 className="text-primary font-extrabold text-2xl">
                  Sell Your Product Online
                </h1>
                <p className="text-gray-600 text-sm text-center">
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page when looking at its layout.
                </p>
              </div>
            </div>
            <div className="py-5 px-12 border-1 border-[#e0dddd] rounded-xl">
              <div className="flex flex-col items-center justify-center gap-2">
                <img className="w-[80px]" src={assets.timelyPayment} alt="" />
                <h1 className="text-primary font-extrabold text-2xl">
                  Get Timely Your Payments
                </h1>
                <p className="text-gray-600 text-sm text-center">
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page when looking at its layout.
                </p>
              </div>
            </div>
            <div className="py-5 px-12 border-1 border-[#e0dddd] rounded-xl">
              <div className="flex flex-col items-center justify-center gap-2">
                <img className="w-[80px]" src={assets.support} alt="" />
                <h1 className="text-primary font-extrabold text-2xl">
                  Support & Marketing Tools
                </h1>
                <p className="text-gray-600 text-sm text-center">
                  It is a long established fact that a reader will be distracted
                  by the readable content of a page when looking at its layout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormApplySeller;

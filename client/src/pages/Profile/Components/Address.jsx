import React, { useState, useEffect } from "react";
import { CiSquarePlus } from "react-icons/ci";
import CommonButton from "../../../components/common/CommonButton";
import { Divider, message, Modal } from "antd";
import LocationSelector from "./LocationSelector";
import CommonForm from "../../../components/common/CommonForm";
import {
  httpDelete,
  httpGet,
  httpPost,
  httpPut,
} from "../../../services/httpService";

const { confirm } = Modal;

const Address = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await httpGet("/auth/address");
      setAddresses(response.addresses || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (editingAddress && form) {
      const fullAddress = [
        editingAddress.ward,
        editingAddress.state,
        editingAddress.city,
      ]
        .filter(Boolean)
        .join(", ");

      form.setFieldsValue({
        name: editingAddress.name,
        phone: editingAddress.phone,
        street: editingAddress.street,
        fullAddress: fullAddress,
      });
    }
  }, [editingAddress, form]);

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    form?.resetFields();
    setOpen(true);
  };

  const handleOpenEditModal = (address) => {
    setEditingAddress(address);
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    setEditingAddress(null);
    form?.resetFields();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const addressParts = values.fullAddress.split(", ");
      const [ward, district, province] = addressParts;

      const addressData = {
        name: values.name,
        street: values.street,
        city: province,
        state: district,
        country: "Vietnam",
        phone: values.phone,
        ward: ward,
      };

      if (editingAddress) {
        const response = await httpPut(
          `/auth/address/${editingAddress._id}`,
          addressData
        );
        message.success(response.message);
      } else {
        const response = await httpPost("/auth/address", addressData);
        message.success(response.message);
      }

      handleCancel();
      await fetchAddresses();
    } catch (error) {
      console.error("Error submitting address:", error);
    } finally {
      setLoading(false);
    }
  };

  const addressFields = [
    {
      name: "name",
      label: "Họ và tên",
      type: "text",
      placeholder: "Nhập họ và tên người nhận",
      rules: [{ required: true, message: "Vui lòng nhập họ và tên" }],
      span: 12,
    },
    {
      name: "phone",
      label: "Số điện thoại",
      type: "text",
      placeholder: "Nhập số điện thoại người nhận",
      rules: [
        { required: true, message: "Vui lòng nhập số điện thoại" },
        {
          pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
          message: "Số điện thoại không hợp lệ",
        },
      ],
      span: 12,
    },
    {
      name: "fullAddress",
      label: "Tỉnh/Thành phố, Quận/Huyện, Phường/Xã",
      placeholder: "Tỉnh/Thành phố, Quận/Huyện, Phường/Xã",
      type: "custom",
      rules: [{ required: true, message: "Vui lòng chọn địa chỉ" }],
      customComponent: <LocationSelector />,
      span: 24,
    },
    {
      name: "street",
      label: "Địa chỉ cụ thể",
      type: "text",
      placeholder: "Nhập số nhà, tên đường, tổ, thôn...",
      rules: [{ required: true, message: "Vui lòng nhập địa chỉ cụ thể" }],
      span: 24,
    },
  ];

  const handleDelete = (addressId) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa địa chỉ này?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      centered: true,
      onOk: async () => {
        try {
          await httpDelete(`/auth/address/${addressId}`);
          await fetchAddresses();
        } catch (error) {
          console.error("Failed to delete address:", error);
        }
      },
    });
  };

  return (
    <>
      <div>
        <div className="w-full mx-auto">
          <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-3">
            <h1 className="text-lg font-medium text-gray-800">
              Địa chỉ của tôi
            </h1>
            <CommonButton
              onClick={handleOpenAddModal}
              icon={<CiSquarePlus className="text-2xl font-medium" />}
              size="large"
              className="!bg-primary !text-white !text-sm !px-6"
            >
              Thêm địa chỉ
            </CommonButton>
          </div>
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Hiện tại bạn chưa có địa chỉ giao hàng nào
              </p>
            </div>
          ) : (
            addresses.map((address) => (
              <div key={address._id}>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start py-2">
                  <div className="text-sm text-gray-700">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-base text-black font-normal">
                        {address.name}
                      </span>
                      <span className="text-gray-800 text-sm font-light relative before:content-['|'] before:mx-2 before:text-gray-800">
                        {`(${address.phone})`}
                      </span>
                    </div>
                    <div>{address.street}</div>
                    <div>
                      {[
                        address.ward,
                        address.state,
                        address.city,
                        address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end text-sm space-y-1 mt-4 md:mt-0">
                    <div className="space-x-4">
                      <button
                        onClick={() => handleOpenEditModal(address)}
                        className="text-blue-600 hover:underline focus:outline-none"
                      >
                        Cập nhật
                      </button>
                      <button
                        onClick={() => handleDelete(address._id)}
                        className="text-blue-600 hover:underline focus:outline-none"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
                <Divider />
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        title={editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
        centered
        open={open}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={{ md: "75%", lg: "55%", xl: "45%", xxl: "35%" }}
      >
        <CommonForm
          fields={addressFields.map((field) => ({ ...field, size: "large" }))}
          onSubmit={handleSubmit}
          submitButtonText={editingAddress ? "Cập nhật" : "Thêm địa chỉ"}
          cancelButtonText="Hủy"
          onCancel={handleCancel}
          loading={loading}
          layout="vertical"
          formInstance={setForm}
          submitButtonProps={{ className: "!bg-primary !text-white" }}
        />
      </Modal>
    </>
  );
};

export default Address;

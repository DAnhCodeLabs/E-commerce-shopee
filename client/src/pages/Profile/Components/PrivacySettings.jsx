import React, { useState } from "react";
import HeaderProfile from "./HeaderProfile";
import CommonButton from "../../../components/common/CommonButton";
import axios from "axios";

const PrivacySettings = () => {
  const [confirmMode, setConfirmMode] = useState(false);

  const handleClick = async () => {
    if (!confirmMode) {
      setConfirmMode(true);
    } else {
      try {
        alert("Tài khoản đã được xóa thành công");
        console.log(res.data);
      } catch (err) {
        console.error(err);
        alert("Xóa tài khoản thất bại");
      }
    }
  };

  return (
    <div>
      <HeaderProfile heading={confirmMode ? "Important" : "Privacy Settings"} />
      <div
        className={`${
          confirmMode
            ? "w-full flex flex-col gap-4"
            : "w-full flex items-center justify-between gap-8"
        }`}
      >
        {confirmMode ? (
          <div>
            <p>
              Nhấn "Tiếp tục" đồng nghĩa với việc bạn đồng ý với các điều khoản
              sau đây:
            </p>
            <ul className="list-disc ml-5">
              <li>
                Sau khi xác nhận xóa tài khoản, bạn sẽ không thể đăng nhập cũng
                như khôi phục lại tài khoản. Vui lòng cân nhắc trước khi xác
                nhận xóa.
              </li>
              <li>Toàn bộ Xu trong kho Shopee Xu của bạn sẽ mất.</li>
              <li>
                Việc xóa tài khoản sẽ không thực hiện được nếu bạn có đơn hàng
                mua/bán chưa hoàn tất hoặc vấn đề pháp lý chưa xử lý xong.
              </li>
              <li>
                Shopee có thể lưu trữ một số dữ liệu của bạn theo quy định pháp
                luật.
              </li>
              <li>
                Shopee có thể từ chối yêu cầu tạo tài khoản mới trong tương lai.
              </li>
              <li>
                Việc xoá tài khoản không loại bỏ toàn bộ nghĩa vụ của bạn liên
                quan đến tài khoản đã xóa.
              </li>
            </ul>
          </div>
        ) : (
          <p>Yêu cầu xóa tài khoản</p>
        )}

        <CommonButton
          size="large"
          onClick={handleClick}
          className="!bg-primary !text-white !text-sm !px-6 w-[160px]"
        >
          {confirmMode ? "Proceed" : "Xóa bỏ"}
        </CommonButton>
      </div>
    </div>
  );
};

export default PrivacySettings;

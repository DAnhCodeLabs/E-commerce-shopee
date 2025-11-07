import asyncHandler from "express-async-handler";
import Account from "../../models/accountModel.js"; // <-- ĐÃ THÊM IMPORT
import validator from "validator"; // <-- ĐÃ THÊM IMPORT
import { generateToken } from "./auth.controller.js"; // <-- ĐÃ THÊM IMPORT (Giả sử auth.controller ở cùng thư mục, nếu không 
const userRegisterSeller = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  const {
    shopName,
    shopDescription,
    taxcode,
    PlaceOfGrant,
    addressShop,
    addressSeller,
  } = req.body;

  if (!shopName) {
    res.status(400);
    throw new Error("Vui lòng cung cấp tên cửa hàng");
  }

  const userAccount = await Account.findById(userId);

  if (!userAccount) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản người dùng.");
  }

  if (userAccount.role !== "user") {
    res.status(400);
    throw new Error(
      `Tài khoản của bạn đã là '${userAccount.role}'. Không thể đăng ký lại.`
    );
  }

  userAccount.role = "seller";
  userAccount.shop = {
    shopName,
    shopDescription: shopDescription || "",
    taxcode,
    PlaceOfGrant,
    addressShop,
    addressSeller,
  };

  const updatedAccount = await userAccount.save();

  const token = generateToken(updatedAccount);

  const userData = updatedAccount.toObject();
  delete userData.password;
  delete userData.otp;
  delete userData.otpExpiry;
  delete userData.pendingEmail;
  delete userData.devices;

  userData.id = userData._id;
  userData.token = token;
  delete userData._id;

  res.status(200).json({
    success: true,
    message:
      "Đăng ký bán hàng thành công! Tài khoản của bạn sẽ được nâng cấp sau 1 đến 3 ngày làm việc.",
    data: userData,
  });
});

const userGetMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  const user = await Account.findById(userId).select(
    "-password -otp -otpExpiry -pendingEmail -devices"
  );

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản.");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

const userUpdateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { username, fullName, email, phoneNumber, gender, birthDate } =
    req.body;

  const user = await Account.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản");
  }

  if (email && !validator.isEmail(email)) {
    res.status(400);
    throw new Error("Email không đúng định dạng.");
  }

  if (gender && !["male", "female", "other"].includes(gender)) {
    res.status(400);
    throw new Error(
      "Giới tính không hợp lệ. Chỉ chấp nhận 'male', 'female', hoặc 'other'."
    );
  }

  if (birthDate) {
    const parsedDate = new Date(birthDate);
    if (isNaN(parsedDate.getTime())) {
      res.status(400);
      throw new Error("Ngày sinh không đúng định dạng.");
    }
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 120);
    if (parsedDate > new Date() || parsedDate < minDate) {
      res.status(400);
      throw new Error("Ngày sinh không hợp lý.");
    }
  }

  if (username !== undefined) {
    const existingUser = await Account.findOne({
      username,
      _id: { $ne: userId },
    });
    if (existingUser) {
      res.status(400);
      throw new Error("Tên người dùng đã tồn tại");
    }
    user.username = username;
  }

  if (email !== undefined) {
    const existingUser = await Account.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      res.status(400);
      throw new Error("Email đã tồn tại");
    }
    user.email = email;
    user.emailVerified = false;
  }

  if (phoneNumber !== undefined) {
    const existingUser = await Account.findOne({
      phoneNumber,
      _id: { $ne: userId },
    });
    if (existingUser) {
      res.status(400);
      throw new Error("Số điện thoại đã tồn tại");
    }
    user.phoneNumber = phoneNumber;
  }

  if (fullName !== undefined) user.fullName = fullName;
  if (gender !== undefined) user.gender = gender;
  if (birthDate !== undefined) user.birthDate = new Date(birthDate);

  user.updatedAt = new Date();

  const updatedUser = await user.save();

  const userData = updatedUser.toObject();
  delete userData.password;
  delete userData.otp;
  delete userData.otpExpiry;
  delete userData.pendingEmail;
  delete userData.devices;
  if (userData.role !== "seller") {
    delete userData.shop;
  }

  userData.id = userData._id;
  delete userData._id;

  res.status(200).json({
    success: true,
    message: "Cập nhật thông tin thành công",
    data: userData,
  });
});

export const profileController = {
  userRegisterSeller,
  userGetMyProfile,
  userUpdateProfile,
};

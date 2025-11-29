import asyncHandler from "express-async-handler";
import Account from "../../models/accountModel.js";

const adminGetAccounts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { search, role, isActive, emailVerified, shopStatus } = req.query;

  const filter = {};

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    filter.$or = [
      { username: searchRegex },
      { email: searchRegex },
      { fullName: searchRegex },
      { phoneNumber: searchRegex },
    ];
  }

  if (role) {
    filter.role = role;
  } else {
    filter.role = { $ne: "admin" };
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  if (emailVerified !== undefined) {
    filter.emailVerified = emailVerified === "true";
  }

  if (shopStatus) {
    filter["shop.verificationStatus"] = shopStatus;
  }

  const accounts = await Account.find(filter)
    .select("-password -otp -otpExpiry")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalAccounts = await Account.countDocuments(filter);
  const totalPages = Math.ceil(totalAccounts / limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách tài khoản thành công",
    data: {
      accounts,
      pagination: {
        currentPage: page,
        totalPages,
        totalAccounts,
      },
    },
  });
});

const adminUpdateAccountStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    res.status(400);
    throw new Error(
      "Trường 'isActive' là bắt buộc và phải là true hoặc false."
    );
  }

  const account = await Account.findById(id);

  if (!account) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản.");
  }

  if (account.role === "admin") {
    res.status(403);
    throw new Error("Không được phép thay đổi trạng thái của tài khoản admin.");
  }

  account.isActive = isActive;
  const updatedAccount = await account.save();

  const message = isActive
    ? "Mở khóa tài khoản thành công."
    : "Khóa tài khoản thành công.";

  res.status(200).json({
    success: true,
    message,
    data: {
      _id: updatedAccount._id,
      username: updatedAccount.username,
      isActive: updatedAccount.isActive,
    },
  });
});

const adminDeleteAccount = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const account = await Account.findById(id);

  if (!account) {
    res.status(4404);
    throw new Error("Không tìm thấy tài khoản.");
  }

  if (account.role === "admin") {
    res.status(403);
    throw new Error("Không thể xóa tài khoản của admin.");
  }

  await Account.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Xóa tài khoản thành công.",
  });
});

const adminVerifySellerApplication = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error(
      'Trạng thái không hợp lệ. Chỉ chấp nhận "approved" hoặc "rejected".'
    );
  }

  const sellerAccount = await Account.findById(sellerId);

  if (!sellerAccount) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản của người bán.");
  }

  if (sellerAccount.role !== "seller") {
    res.status(400);
    throw new Error("Tài khoản này không phải là người bán.");
  }

  if (sellerAccount.shop.verificationStatus !== "pending") {
    res.status(400);
    throw new Error(
      `Yêu cầu này đã được xử lý trước đó với trạng thái: '${sellerAccount.shop.verificationStatus}'.`
    );
  }

  sellerAccount.shop.verificationStatus = status;

  if (status === "approved") {
    sellerAccount.shop.isActive = true;
  } else {
    sellerAccount.shop.isActive = false;
  }

  await sellerAccount.save();
  res.status(200).json({
    success: true,
    message: `Đã cập nhật trạng thái của người bán thành '${status}' thành công.`,
  });
});

const adminGetSellerAccounts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const status = req.query.status;
  const search = req.query.search;

  const skip = (page - 1) * limit;

  const query = { role: "seller" };

  if (status && ["pending", "approved", "rejected"].includes(status)) {
    query["shop.verificationStatus"] = status;
  }

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    query.$or = [
      { username: searchRegex },
      { email: searchRegex },
      { "shop.shopName": searchRegex },
    ];
  }
  const totalSellers = await Account.countDocuments(query);
  const sellers = await Account.find(query)
    .select("-password -otp -otpExpiry")
    .sort({ "shop.joinDate": -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    message: "Lấy danh sách người bán thành công",
    data: sellers,
    pagination: {
      totalItems: totalSellers,
      totalPages: Math.ceil(totalSellers / limit),
      currentPage: page,
      limit: limit,
    },
  });
});

export const adminAccountController = {
  adminGetAccounts,
  adminUpdateAccountStatus,
  adminDeleteAccount,
  adminVerifySellerApplication,
  adminGetSellerAccounts,
};

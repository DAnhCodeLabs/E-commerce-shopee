import asyncHandler from "express-async-handler";
import Account from "../../models/accountModel.js";

const userAddAddress = asyncHandler(async (req, res) => {
  const { name, street, city, state, country, phone } = req.body;
  if (!name || !street || !city || !country || !phone) {
    res.status(400);
    throw new Error(
      "Vui lòng cung cấp đầy đủ đường/phố, thành phố và quốc gia"
    );
  }

  const account = await Account.findById(req.user._id);
  if (!account) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản người dùng.");
  }

  account.address.push({
    name,
    phone,
    street,
    city,
    state,
    country,
  });

  await account.save();

  res.status(201).json({
    message: "Thêm địa chỉ mới thành công!",
    addresses: account.address,
  });
});

const userGetAddresses = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await Account.findById(userId).select("address");
  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy người dùng");
  }

  if (!user.address || user.address.length === 0) {
    return res.status(200).json({
      success: true,
      message: "Hiện tại bạn chưa có địa chỉ giao hàng nào",
      addresses: [],
    });
  }

  res.status(200).json({
    success: true,
    message: "Lấy danh sách địa chỉ thành công",
    addresses: user.address,
  });
});

const userUpdateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { name, street, city, state, country, phone } = req.body;
  const userId = req.user._id;

  if (!addressId) {
    res.status(400);
    throw new Error("Cần có ID của địa chỉ để cập nhật");
  }

  const account = await Account.findById(userId);

  if (!account) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản người dùng");
  }

  const addressToUpdate = account.address.id(addressId);

  if (!addressToUpdate) {
    res.status(404);
    throw new Error("Không tìm thấy địa chỉ cần cập nhật");
  }

  addressToUpdate.name = name || addressToUpdate.name;
  addressToUpdate.phone = phone || addressToUpdate.phone;
  addressToUpdate.street = street || addressToUpdate.street;
  addressToUpdate.city = city || addressToUpdate.city;
  addressToUpdate.state = state || addressToUpdate.state;
  addressToUpdate.country = country || addressToUpdate.country;

  await account.save();

  res.status(200).json({
    message: "Cập nhật địa chỉ thành công",
    addresses: account.address,
  });
});

const userDeleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user._id;

  const account = await Account.findById(userId);

  if (!account) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản người dùng");
  }

  const addressIndex = account.address.findIndex(
    (addr) => addr._id.toString() === addressId
  );

  if (addressIndex === -1) {
    res.status(404);
    throw new Error("Không tìm thấy địa chỉ để xóa");
  }

  account.address.pull(addressId);

  await account.save();

  res.status(200).json({
    message: "Xóa địa chỉ thành công!",
    addresses: account.address,
  });
});

export const addressController = {
  userAddAddress,
  userGetAddresses,
  userUpdateAddress,
  userDeleteAddress,
};

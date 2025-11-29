import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import validator from "validator";
import asyncHandler from "express-async-handler";
import Account from "../../models/accountModel.js";
import { otpEmailTemplate } from "../../utils/emailTemplates.js";
import sendEmail from "../../utils/sendEmail.js";
dotenv.config();

export const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const authRegister = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Vui lòng cung cấp đầy đủ tên người dùng, email, mật khẩu");
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Email không đúng định dạng. Vui lòng kiểm tra lại!");
  }

  const existingUser = await Account.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    res.status(400);
    const message =
      existingUser.username === username
        ? "Tên người dùng đã tồn tại"
        : "Email đã tồn tại";
    throw new Error(message);
  }

  const newUser = new Account({
    username,
    email,
    password,
    role: "user",
    emailVerified: false,
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  newUser.otp = otp;
  newUser.otpExpiry = Date.now() + 10 * 60 * 1000;

  await newUser.save();

  await sendEmail({
    to: email,
    subject: "Mã xác nhận email đăng ký của bạn",
    html: otpEmailTemplate(otp),
  });

  res.status(201).json({
    success: true,
    message:
      "Mã OTP xác thực đã được gửi về Email của bạn. Vui lòng kiểm tra hộp thư!",
  });
});

const authLogin = asyncHandler(async (req, res) => {
  const { identifier, password, type } = req.body;

  if (!identifier || !password || !type) {
    res.status(400);
    throw new Error(
      "Vui lòng cung cấp email/username, mật khẩu và loại tài khoản"
    );
  }

  if (!["user", "admin"].includes(type)) {
    res.status(400);
    throw new Error(
      "Loại đăng nhập không hợp lệ: chỉ chấp nhận 'user' hoặc 'admin'"
    );
  }

  if (type === "admin") {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (identifier === adminEmail && password === adminPassword) {
      const token = generateToken({ _id: "admin_user_id", role: "admin" });
      res.status(200).json({
        success: true,
        message: "Đăng nhập quản trị thành công",
        data: { email: adminEmail, role: "admin", token },
      });
    } else {
      res.status(401);
      throw new Error("Email hoặc mật khẩu admin không đúng");
    }
    return;
  }

  if (type === "user") {
    const account = await Account.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!account) {
      res.status(404);
      throw new Error("Tài khoản không tồn tại");
    }

    if (account.role === "admin") {
      res.status(403);
      throw new Error("Tài khoản admin không được phép đăng nhập tại đây");
    }

    const isMatch = await account.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Mật khẩu không đúng");
    }

    if (!account.isActive) {
      res.status(403);
      throw new Error(
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
      );
    }

    account.lastLogin = new Date();
    await account.save();

    const token = generateToken(account);

    const userData = account.toObject();
    delete userData.password;
    delete userData.otp;
    delete userData.otpExpiry;
    delete userData.pendingEmail;
    delete userData.devices;

    if (userData.role !== "seller") {
      delete userData.shop;
    }

    userData.id = userData._id;
    userData.token = token;
    delete userData._id;

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: userData,
    });
  }
});

const authVerifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400);
    throw new Error("Vui lòng cung cấp email và mã OTP");
  }

  const user = await Account.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("Email không tồn tại");
  }

  if (user.otp !== otp) {
    res.status(400);
    throw new Error("OTP không đúng. Vui lòng kiểm tra lại!");
  }

  if (user.otpExpiry < Date.now()) {
    res.status(400);
    throw new Error("OTP đã hết hạn");
  }

  user.emailVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Email xác thực thành công.",
  });
});

const authForgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email || !validator.isEmail(email)) {
    res.status(400);
    throw new Error("Email không hợp lệ hoặc không được cung cấp!");
  }

  const account = await Account.findOne({ email });
  if (!account) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại!");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  account.otp = otp;
  account.otpExpiry = otpExpiry;
  await account.save();

  await sendEmail({
    to: email,
    subject: "Mã xác nhận để đặt lại mật khẩu của bạn",
    html: otpEmailTemplate(otp),
  });

  res.status(200).json({
    success: true,
    message: "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
  });
});

const authResetPassword = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    res.status(400);
    throw new Error("Vui lòng cung cấp email và mật khẩu mới!");
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error("Email không đúng định dạng.");
  }

  const account = await Account.findOne({ email });
  if (!account) {
    res.status(404);
    throw new Error("Tài khoản không tồn tại!");
  }

  account.password = newPassword;
  await account.save();

  res.status(200).json({
    success: true,
    message: "Mật khẩu đã được đặt lại thành công.",
  });
});

const userChangePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?._id;

  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error("Vui lòng cung cấp mật khẩu cũ và mật khẩu mới");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
  }

  const user = await Account.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản");
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error("Mật khẩu cũ không đúng");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error(
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
    );
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Đổi mật khẩu thành công",
  });
});

export const authController = {
  authRegister,
  authLogin,
  authVerifyOtp,
  authForgotPassword,
  authResetPassword,
  userChangePassword,
};

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import validator from "validator";
import asyncHandler from "express-async-handler";
import sendEmail from "../../utils/sendEmail.js";
import { otpEmailTemplate } from "../../utils/emailTemplates.js";
import Account from "../../models/accountModel.js";
dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp đầy đủ tên người dùng, email, mật khẩu",
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Email không đúng định dạng. Vui lòng kiểm tra lại!",
      });
    }
    const existingUser = await Account.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.username === username
            ? "Tên người dùng đã tồn tại"
            : existingUser.email === email
            ? "Email đã tồn tại"
            : "Thông tin đã tồn tại",
      });
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

    return res.status(201).json({
      success: true,
      message:
        "Mã OTP xác thực đã được gửi về Email của bạn. Vui lòng kiểm tra hộp thư!",
    });
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password, type } = req.body;
    if (!identifier || !password || !type) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp email/username và mật khẩu và type",
      });
    }

    if (!type || !["user", "admin"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chỉ định loại đăng nhập: 'user' hoặc 'admin'",
      });
    }
    if (type === "admin") {
      const adminEmail = process.env.ADMIN_EMAIL;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (identifier === adminEmail && adminPassword) {
        if (password === adminPassword) {
          const token = generateToken({ role: "admin" });

          return res.status(200).json({
            success: true,
            message: "Đăng nhập quản trị thành công",
            data: {
              email: adminEmail,
              role: "admin",
              token,
            },
          });
        } else {
          return res.status(401).json({
            success: false,
            message: "Mật khẩu admin không đúng",
          });
        }
      }
    }

    if (type === "user") {
      const account = await Account.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      });
      if (!account) {
        return res.status(404).json({
          success: false,
          message: "Tài khoản không tồn tại",
        });
      }

      if (account.role === "admin") {
        return res.status(403).json({
          success: false,
          message: "Tài khoản admin không được phép đăng nhập tại đây",
        });
      }
      const isMatch = await account.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Mật khẩu không đúng",
        });
      }
      account.lastLogin = new Date();
      await account.save();
      const token = generateToken(account);
      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          id: account._id,
          username: account.username,
          email: account.email,
          role: account.role,
          token,
        },
      });
    }
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.json({
        success: false,
        message: "Vui lòng cung cấp mã OTP",
      });
    }
    const user = await Account.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Email không tồn tại" });
    }
    if (user.otp !== otp) {
      return res.json({
        success: false,
        message: "OTP không đúng. Vui lòng kiểm tra lại!",
      });
    }

    if (user.otpExpiry < Date.now()) {
      return res.json({ success: false, message: "OTP đã hết hạn" });
    }

    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Email xác thực thành công.",
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      return res
        .status(404)
        .json({ success: false, message: "Email không đúng định dạng!" });
    }

    const account = await Account.findOne({ email });
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Tài khoản không tồn tại!" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    account.otp = otp;
    account.otpExpiry = otpExpiry;
    await account.save();

    await sendEmail({
      to: email,
      subject: "Mã xác nhận email quên mật khẩu:",
      html: otpEmailTemplate(otp),
    });
    res.status(200).json({
      success: true,
      message:
        "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
    });
  } catch (error) {
    console.error("Lỗi khi gửi OTP:", error);
    res
      .status(500)
      .json({ message: "Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại sau." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.json({
        success: false,
        message: "Vui lòng nhập thông tin đầy đủ!",
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Email không đúng định dạng.",
      });
    }
    const account = await Account.findOne({ email });
    if (!account) {
      return res
        .status(404)
        .json({ success: false, message: "Tài khoản không tồn tại!" });
    }

    // if (!account.otp || account.otp !== otp || account.otpExpiry < Date.now()) {
    //   return res
    //     .status(400)
    //     .json({
    //       success: false,
    //       message: "Mã OTP không hợp lệ hoặc đã hết hạn.",
    //     });
    // }
    account.password = newPassword;
    await account.save();

    res.status(200).json({
      success: true,
      message: "Mật khẩu đã được đặt lại thành công.",
    });
  } catch (error) {
    console.error("Lỗi khi đặt lại mật khẩu:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại sau.",
    });
  }
};

// API cập nhật thông tin tài khoản - Phiên bản đơn giản
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { username, fullName, email, phoneNumber, gender, birthDate } =
    req.body;
  const user = await Account.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản");
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

  if (fullName !== undefined) {
    user.fullName = fullName;
  }

  if (email !== undefined) {
    const existingUser = await Account.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      res.status(400);
      throw new Error("Email đã tồn tại");
    }
    user.email = email;
    // user.emailVerified = false;
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

  if (gender !== undefined) {
    user.gender = gender;
  }

  if (birthDate !== undefined) {
    user.birthDate = birthDate;
  }

  user.updatedAt = new Date();

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Cập nhật thông tin thành công",
    data: {
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phoneNumber: updatedUser.phoneNumber,
      gender: updatedUser.gender,
      birthDate: updatedUser.birthDate,
      role: updatedUser.role,
    },
  });
});
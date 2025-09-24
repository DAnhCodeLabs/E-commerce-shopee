import mongoose from "mongoose";
import bcrypt from "bcrypt";

const accountSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Tên người dùng là bắt buộc"],
    unique: true,
    trim: true,
    minlength: [3, "Tên người dùng phải có ít nhất 3 ký tự"],
    maxlength: [50, "Tên người dùng không được vượt quá 50 ký tự"],
    index: true,
  },
  email: {
    type: String,
    required: [true, "Email là bắt buộc"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Email không hợp lệ",
    ],
    index: true,
  },
  password: {
    type: String,
    required: [
      function () {
        return !this.provider;
      },
      "Mật khẩu là bắt buộc nếu không đăng nhập xã hội",
    ],
    minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
  },
  // provider: {
  //   type: String,
  //   enum: ["local", "facebook", "google", "apple"],
  //   default: "local",
  // },
  // socialId: {
  //   type: String,
  //   unique: true,
  //   sparse: true,
  // },
  emailVerified: { type: Boolean, default: false },
  pendingEmail: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },

  // Thông tin cá nhân
  role: {
    type: String,
    enum: ["user", "seller", "admin"],
    default: "user",
  },
  fullName: {
    type: String,
    trim: true,
    maxlength: [100, "Họ tên không được vượt quá 100 ký tự"],
  },
  birthDate: {
    type: Date,
  },
  gender: {
    type: String,
  },
  phoneNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    index: true,
  },
  avatar: { type: String, default: "" },

  // Địa chỉ giao hàng
  address: {
    type: [
      {
        addressName: {
          type: String,
          trim: true,
          maxlength: [50, "Tên địa chỉ không được vượt quá 50 ký tự"],
          default: "Địa chỉ",
        },
        street: {
          type: String,
          required: [true, "Đường/phố là bắt buộc"],
          trim: true,
        },
        city: {
          type: String,
          required: [true, "Thành phố là bắt buộc"],
          trim: true,
        },
        state: { type: String, trim: true },
        country: {
          type: String,
          required: [true, "Quốc gia là bắt buộc"],
          trim: true,
          default: "Việt Nam",
        },
        isDefault: { type: Boolean, default: false },
      },
    ],
    default: [],
    validate: [
      {
        validator: function (addresses) {
          const defaultCount = addresses.filter(
            (addr) => addr.isDefault
          ).length;
          return addresses.length === 0 || defaultCount === 1;
        },
        message:
          "Phải có duy nhất một địa chỉ mặc định nếu danh sách địa chỉ không rỗng.",
      },
      {
        validator: function (addresses) {
          return addresses.length <= 10;
        },
        message: "Số lượng địa chỉ tối đa là 10.",
      },
    ],
  },

  // Ví tiền (ShopeePay-like)
  // wallet: {
  //   type: {
  //     balance: { type: Number, default: 0 },
  //     currency: { type: String, default: "VND" },
  //     isActive: { type: Boolean, default: false }, // Cần verify để active
  //   },
  //   default: { balance: 0, currency: "VND", isActive: false },
  // },

  // Thông tin cửa hàng (cho seller)
  shop: {
    type: {
      shopName: {
        type: String,
        required: [
          function () {
            return this.role === "seller";
          },
          "Tên cửa hàng là bắt buộc",
        ],
        trim: true,
        maxlength: [100, "Tên cửa hàng không được vượt quá 100 ký tự"],
      },
      shopDescription: {
        type: String,
        trim: true,
        maxlength: [500, "Mô tả không vượt quá 500 ký tự"],
      },
      shopLogo: { type: String, default: "" },
      joinDate: { type: Date, default: Date.now },
      location: { type: String, default: "Việt Nam" },
      productsCount: { type: Number, default: 0 },
      verificationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      isActive: { type: Boolean, default: false },
    },
    default: null,
    required: [
      function () {
        return this.role === "seller";
      },
      "Thông tin cửa hàng là bắt buộc cho seller",
    ],
  },

  // Thông tin hệ thống và an ninh
  lastLogin: { type: Date },
  devices: [
    {
      deviceId: String,
      lastUsed: Date,
    },
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index cho hiệu suất
accountSchema.index({ role: 1 });
accountSchema.index({ "shop.verificationStatus": 1 });

// Middleware mã hóa mật khẩu
accountSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Phương thức so sánh mật khẩu
accountSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Account = mongoose.model("Account", accountSchema);
export default Account;

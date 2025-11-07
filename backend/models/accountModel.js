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
  emailVerified: { type: Boolean, default: false },
  pendingEmail: { type: String },
  otp: { type: String },
  otpExpiry: { type: Date },

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

  address: {
    type: [
      {
        name: {
          type: String,
          trim: true,
        },
        phone: {
          type: String,
          trim: true,
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
      },
    ],
    default: [],
  },

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
      taxcode: { type: String, required: true },
      PlaceOfGrant: { type: String, required: true },
      addressSeller: { type: String },
      addressShop: { type: String },
      shopLogo: { type: String, default: "" },
      joinDate: { type: Date, default: Date.now },
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

accountSchema.index({ role: 1 });
accountSchema.index({ "shop.verificationStatus": 1 });

accountSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

accountSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Account = mongoose.model("Account", accountSchema);
export default Account;

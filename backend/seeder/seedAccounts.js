import mongoose from "mongoose";
import readline from "readline";
import Account from "../models/accountModel.js";

const PASSWORD = "Password@123"; // GIỮ NGUYÊN NHƯ MÃ CŨ

// GIỮ NGUYÊN MONGO_URI NHƯ FILE CŨ
const MONGO_URI =
  "mongodb+srv://danhcodelabs_db_user:0000@cluster0.e8amyyc.mongodb.net/eCommerce";

// ===== Helper random dữ liệu =====
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const cities = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];

const streets = [
  "123 Nguyễn Trãi",
  "45 Lê Lợi",
  "789 Trần Phú",
  "56 Hai Bà Trưng",
  "101 Phan Xích Long",
];

const taxAuthority = [
  "Chi cục Thuế TP. Hồ Chí Minh",
  "Chi cục Thuế Hà Nội",
  "Chi cục Thuế Đà Nẵng",
];

// Địa chỉ giao hàng ngẫu nhiên
function generateRandomAddress(fullName, phone) {
  return {
    name: fullName,
    phone,
    street: randomFrom(streets),
    city: randomFrom(cities),
    country: "Việt Nam",
  };
}

// Thông tin shop cho seller
function generateShopInfo(index) {
  return {
    shopName: `Shop người bán ${index}`,
    shopDescription: "Cửa hàng test seed dữ liệu",
    taxcode: `${Math.floor(1000000000 + Math.random() * 9000000000)}`, // 10 số
    PlaceOfGrant: randomFrom(taxAuthority),

    addressShop: {
      street: randomFrom(streets),
      ward: "",
      district: "",
      city: randomFrom(cities),
      country: "Việt Nam",
    },
    addressSeller: {
      street: randomFrom(streets),
      ward: "",
      district: "",
      city: randomFrom(cities),
      country: "Việt Nam",
    },

    joinDate: new Date(),
    productsCount: Math.floor(Math.random() * 40),
    followers: Math.floor(Math.random() * 800),
    response_rate: Math.floor(80 + Math.random() * 20),
    response_time: "trong vài giờ",

    // shop chưa được xác thực
    verificationStatus: "pending",
    isActive: false,
  };
}

// Core seeder
async function seed(role) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Kết nối MongoDB Atlas thành công");

    await Account.deleteMany();
    console.log("Đã xoá toàn bộ tài khoản cũ");

    const accountsToCreate = 5;

    for (let i = 1; i <= accountsToCreate; i++) {
      const fullName = role === "seller" ? `Người Bán ${i}` : `Người Dùng ${i}`;
      const username = `${role}${i}`;
      const email = `${role}${i}@example.com`;
      const phone = `09000000${i}`;

      const baseData = {
        username,
        email,
        password: PASSWORD, // model tự hash qua pre("save")
        emailVerified: true, // tài khoản luôn xác thực email
        role,
        fullName,
        phoneNumber: phone,
        avatar: "",
        address: [generateRandomAddress(fullName, phone)], // mỗi tài khoản 1 địa chỉ giao hàng
        devices: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Nếu là seller thì thêm shop
      if (role === "seller") {
        baseData.shop = generateShopInfo(i);
      }

      const account = new Account(baseData);
      await account.save();

      console.log(`--> Tạo tài khoản ${role} #${i} thành công`);
    }

    console.log(
      `Seed thành công ${accountsToCreate} tài khoản ${role} (tự động hash mật khẩu)`
    );

    process.exit(0);
  } catch (error) {
    console.error("Lỗi seed:", error);
    process.exit(1);
  }
}

// CLI chọn loại tài khoản
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("\nBạn muốn tạo loại tài khoản nào?");
console.log("1. User");
console.log("2. Seller\n");

rl.question("Chọn 1 hoặc 2: ", async (answer) => {
  rl.close();

  if (answer === "1") {
    await seed("user");
  } else if (answer === "2") {
    await seed("seller");
  } else {
    console.log("Lựa chọn không hợp lệ. Thoát...");
    process.exit(0);
  }
});

// seedAccounts.js – Chuẩn senior dev 2025
import "dotenv/config";
import mongoose from "mongoose";
import { confirm, select, input } from "@inquirer/prompts";
import chalk from "chalk";
import ora from "ora";
import { faker } from "@faker-js/faker";
import Account from "../models/accountModel.js";

// ============ CONFIG BẮT BUỘC ============
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(chalk.red("❌ Thiếu MONGO_URI_SEED trong file .env"));
  process.exit(1);
}

// Cấm chạy trên production
if (process.env.NODE_ENV === "production") {
  console.error(chalk.red("🚨 CẤM chạy seed script trên production!"));
  process.exit(1);
}

// ============ DỮ LIỆU GIẢ CHẤT LƯỢNG CAO ============
const cities = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Biên Hòa",
  "Nha Trang",
];
const streets = [
  "Nguyễn Trãi",
  "Lê Lợi",
  "Trần Phú",
  "Hai Bà Trưng",
  "Phan Xích Long",
  "Nguyễn Huệ",
  "Điện Biên Phủ",
  "Lý Thường Kiệt",
  "Hùng Vương",
  "Bà Triệu",
];
const taxAuthorities = [
  "Cục Thuế TP. Hồ Chí Minh",
  "Cục Thuế Thành phố Hà Nội",
  "Cục Thuế TP Đà Nẵng",
  "Chi cục Thuế Quận 1",
  "Chi cục Thuế Quận Bình Thạnh",
  "Chi cục Thuế TP Thủ Đức",
];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

function generateAddress(fullName, phone) {
  return {
    name: fullName,
    phone,
    street: `${faker.number.int({ min: 1, max: 999 })} ${randomItem(streets)}`,
    city: randomItem(cities),
    state: "",
    country: "Việt Nam",
  };
}

function generateShop(index) {
  const shopNames = [
    `Shop ${faker.company.name()}`,
    `${faker.person.lastName()} Store`,
    `Cửa hàng ${faker.commerce.productName()}`,
    `${faker.word.adjective()} Shop`,
    `Siêu Thị ${faker.person.firstName()}`,
    `${faker.color.human()} Fashion`,
  ];

  return {
    shopName: `${randomItem(shopNames).replace(
      /[^a-zA-Z0-9À-ỹ\s]/g,
      ""
    )} #${index}`,
    shopDescription: faker.commerce.productDescription().slice(0, 499),
    taxcode: faker.number.int({ min: 1000000000, max: 9999999999 }).toString(),
    PlaceOfGrant: randomItem(taxAuthorities),
    addressShop: {
      street: `${faker.number.int(1, 999)} ${randomItem(streets)}`,
      ward: `Phường ${faker.number.int(1, 30)}`,
      district: `Quận ${faker.number.int(1, 12)}`,
      city: randomItem(cities),
      country: "Việt Nam",
    },
    addressSeller: {
      street: `${faker.number.int(1, 999)} ${randomItem(streets)}`,
      ward: `Phường ${faker.number.int(1, 30)}`,
      district: `Quận ${faker.number.int(1, 12)}`,
      city: randomItem(cities),
      country: "Việt Nam",
    },
    shopLogo: "",
    joinDate: faker.date.past({ years: 3 }),
    productsCount: faker.number.int({ min: 0, max: 250 }),
    followers: faker.number.int({ min: 0, max: 5000 }),
    response_rate: faker.number.int({ min: 70, max: 100 }),
    response_time: faker.helpers.arrayElement([
      "trong vài phút",
      "trong vài giờ",
      "trong ngày",
    ]),
    verificationStatus: "pending",
    isActive: false,
  };
}

// ============ CORE SEEDER ============
async function seedAccounts({ role, count, emailVerified = true }) {
  const spinner = ora(`Đang tạo ${count} tài khoản ${role}...`).start();

  const operations = [];

  for (let i = 1; i <= count; i++) {
    const fullName =
      role === "admin"
        ? i === 1
          ? "Administrator"
          : `Admin ${i}`
        : role === "seller"
        ? faker.person.fullName()
        : faker.person.fullName();

    const username =
      role === "admin" && i === 1
        ? "admin"
        : `${role}${faker.number.int(1000, 9999)}`;

    const accountData = {
      username,
      email:
        role === "admin" && i === 1
          ? "admin@ecommerce.com"
          : faker.internet.email({
              firstName: fullName.split(" ")[0],
              provider: "example.com",
            }),
      password: "123456789", // sẽ tự hash
      emailVerified,
      role,
      fullName,
      phoneNumber: faker.phone.number({ format: "0#########" }),
      avatar: "",
      address: [
        generateAddress(fullName, faker.phone.number({ format: "0#########" })),
      ],
      isActive: true,
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: new Date(),
    };

    if (role === "seller") {
      accountData.shop = generateShop(i);
    }

    operations.push(new Account(accountData).save());
  }

  await Promise.all(operations);
  spinner.succeed(chalk.green(`Tạo thành công ${count} tài khoản ${role}`));
}

// ============ MAIN FLOW ============
async function main() {
  console.log(
    chalk.cyan.bold("\n🚀 SEEDER TÀI KHOẢN - THƯƠNG MẠI ĐIỆN TỬ VIỆT NAM\n")
  );

  const role = await select({
    message: "Bạn muốn seed loại tài khoản nào?",
    choices: [
      { name: "User thường", value: "user" },
      { name: "Seller (người bán)", value: "seller" },
      { name: "Admin", value: "admin" },
    ],
  });

  const count = await input({
    message: "Số lượng tài khoản muốn tạo?",
    default: role === "admin" ? "1" : "20",
    validate: (val) => (!isNaN(val) && val > 0) || "Phải là số dương!",
  });

  const shouldDelete = await confirm({
    message: chalk.red.bold(
      `XÓA TOÀN BỘ tài khoản ${role} hiện tại trước khi seed?`
    ),
    default: false,
  });

  const finalConfirm = await confirm({
    message: chalk.yellow.bold(
      `Xác nhận cuối: Tạo ${count} tài khoản ${role} ${
        shouldDelete ? "+ xóa cũ" : ""
      }?`
    ),
    default: false,
  });

  if (!finalConfirm) {
    console.log(chalk.blue("Đã hủy. Bye!\n"));
    process.exit(0);
  }

  // Kết nối DB
  const connectSpinner = ora("Kết nối MongoDB...").start();
  await mongoose.connect(MONGO_URI);
  connectSpinner.succeed("Kết nối MongoDB thành công");

  // Xóa cũ nếu cần
  if (shouldDelete) {
    const deleteSpinner = ora(`Đang xóa tài khoản ${role} cũ...`).start();
    await Account.deleteMany({ role });
    deleteSpinner.succeed(`Đã xóa toàn bộ tài khoản ${role} cũ`);
  }

  // Tạo mới
  await seedAccounts({ role, count: Number(count), emailVerified: true });

  await mongoose.disconnect();
  console.log(
    chalk.magenta.bold("\n✅ SEED HOÀN TẤT! Database đã sẵn sàng để test.\n")
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(chalk.red.bold("\n💥 LỖI CHẾT NGƯỜI:"), err);
  process.exit(1);
});

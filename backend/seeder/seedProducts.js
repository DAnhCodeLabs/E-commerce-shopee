// seedProductsCli.js
// Chạy: node seedProductsCli.js
// Yêu cầu: "type": "module" trong package.json, và MONGO_URI trong .env

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import readline from "readline";

import Account from "../models/accountModel.js";
import Category from "../models/categoryModel.js";
import Attribute from "../models/attributeModel.js";
import Product from "../models/productModel.js";

// ====== CONFIG ẢNH DÙNG CHUNG ======
const PRODUCT_IMAGE_URL =
  "https://admatrix.vn/wp-content/uploads/2024/04/Picture5.png";
// ===================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const ask = (q) => new Promise((res) => rl.question(q, (a) => res(a.trim())));

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function calcSale(price, discount) {
  const p = Number(price);
  const d = Number(discount);
  if (isNaN(p)) return 0;
  if (isNaN(d)) return p;
  const val = p - (p * d) / 100;
  return Math.max(0, Math.round(val));
}

// ====== GEN SLUG & SKU GIỐNG MODEL ======
function generateSlug(name) {
  const base = name
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  return `${base}-${uniqueSuffix}`;
}

function generateSku(name) {
  const namePrefix = name
    .toString()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomCode = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${namePrefix}-${timestamp}-${randomCode}`;
}

function generateModelSku(mainSku, modelName) {
  const modelNamePrefix = (modelName || "")
    .toString()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  const randomSuffix = Math.random().toString(36).substr(2, 3).toUpperCase();
  return `${mainSku}-${modelNamePrefix}-${randomSuffix}`;
}

// ====== GIÁ THEO DANH MỤC ======
function guessBasePrice(catName) {
  const name = (catName || "").toLowerCase();
  if (
    name.includes("điện thoại") ||
    name.includes("laptop") ||
    name.includes("máy tính")
  )
    return rand(3000000, 25000000);
  if (
    name.includes("thời trang") ||
    name.includes("áo") ||
    name.includes("quần") ||
    name.includes("giày")
  )
    return rand(79000, 599000);
  if (
    name.includes("sắc đẹp") ||
    name.includes("mỹ phẩm") ||
    name.includes("skincare")
  )
    return rand(59000, 399000);
  if (name.includes("máy ảnh") || name.includes("máy quay"))
    return rand(2000000, 25000000);
  if (name.includes("đồng hồ")) return rand(150000, 3000000);
  if (name.includes("mẹ & bé") || name.includes("mẹ và bé"))
    return rand(49000, 999000);
  if (name.includes("nhà cửa") || name.includes("đời sống"))
    return rand(39000, 299000);
  if (name.includes("sức khỏe")) return rand(69000, 999000);
  return rand(30000, 2000000);
}

// ====== TEMPLATES TÊN THEO NHÓM DANH MỤC (VIỆT 100%) ======
// ====== TEMPLATES SẢN PHẨM CHUYÊN NGHIỆP THEO PHONG CÁCH SHOPEE VIỆT NAM ======
const CATEGORY_TEMPLATES = {
  // 🔥 THỜI TRANG NAM - Hot Seller Shopee Style
  thoi_trang_nam: {
    variant: [
      // 🔥 ÁO THUN (8 sản phẩm khác biệt hoàn toàn)
      "Áo thun nam cotton 100% form rộng mặc hằng ngày",
      "Áo thun nam tay ngắn vải thun co giãn 4 chiều",
      "Áo thun nam Pique thoáng mát chống nắng UV",
      "Áo thun nam oversize phong cách Hàn Quốc",
      "Áo thun nam vải cá sấu dày dặn sang trọng",
      "Áo thun nam thể thao hút mồ hôi nhanh khô",
      "Áo thun nam cổ trụ lịch lãm công sở",
      "Áo thun nam in 3D sắc nét bền màu",

      // 👖 QUẦN JEANS (6 sản phẩm)
      "Quần jeans nam ống suông form chuẩn dáng Việt",
      "Quần jeans nam ống đứng cạp chun co giãn",
      "Quần jeans nam rách phong cách streetwear",
      "Quần jeans nam slim fit tôn dáng cao ráo",
      "Quần jeans nam ống rộng phong cách retro",
      "Quần jeans nam cạp trễ hiphop cá tính",

      // 👔 ÁO SƠ MI (6 sản phẩm)
      "Áo sơ mi nam vải lụa vân kẻ lịch lãm",
      "Áo sơ mi nam cotton không ủi đi làm",
      "Áo sơ mi nam tay ngắn caro năng động",
      "Áo sơ mi nam slim fit công sở chuyên nghiệp",
      "Áo sơ mi nam vải voan thoáng mát mùa hè",
      "Áo sơ mi nam cổ bẻ phong cách thể thao",

      // 🧥 ÁO KHOÁC (4 sản phẩm)
      "Áo khoác nam bomber dáng ngắn thời trang",
      "Áo khoác nam dù chống thấm nhẹ nhàng",
      "Áo khoác nam da lộn phong cách cổ điển",
      "Áo khoác nam hoodie trùm đầu thể thao",
    ],
    single: [
      // ÁO THUN BASIC
      "Áo thun nam cotton 100% mặc mát cả ngày",
      "Áo thun nam form chuẩn dáng người Việt",
      "Áo thun nam vải dày dặn không xù lông",
      "Áo thun nam trơn basic phối mọi quần",

      // QUẦN TÂY
      "Quần tây nam ống suông công sở lịch lãm",
      "Quần tây nam cạp chun co giãn thoải mái",
      "Quần kaki nam vải thô bền đẹp",
      "Quần short nam thể thao ngắn mùa hè",

      // ÁO POLO
      "Áo polo nam vải pique sang trọng",
      "Áo polo nam cotton thoáng khí golf",
      "Áo polo nam cổ bẻ đi chơi",
    ],
  },

  // 💃 THỜI TRANG NỮ - Trendy & Nổi bật
  thoi_trang_nu: {
    variant: [
      // 👗 ĐẦM (8 sản phẩm khác biệt)
      "Đầm suông nữ vải lụa mềm mại thanh lịch",
      "Đầm xòe nữ dáng chữ A tôn vòng eo",
      "Đầm liền thân nữ form ôm nhẹ nhàng",
      "Váy maxi nữ vải chiffon bay bay nữ tính",
      "Đầm công sở nữ lịch sự chuyên nghiệp",
      "Đầm ngủ nữ cotton mềm mại thoải mái",
      "Đầm dạo phố nữ dáng peplum sang trọng",
      "Đầm body nữ tôn dáng khoe đường cong",

      // 👖 QUẦN NỮ (8 sản phẩm)
      "Quần jeans nữ ống loe phong cách 70s",
      "Quần jeans nữ skinny ôm sát tôn dáng",
      "Quần culottes nữ vải linen thoáng mát",
      "Quần ống rộng nữ palazzo sang trọng",
      "Quần short nữ jeans cạp cao thời trang",
      "Quần âu nữ cạp chun công sở thoải mái",
      "Quần jogger nữ vải cotton thể thao",
      "Quần legging nữ co giãn 4 chiều",

      // 👚 ÁO VÁY (6 sản phẩm)
      "Áo sơ mi nữ vải lụa dáng dài thanh lịch",
      "Áo crop top nữ vải thun thể thao",
      "Áo blouse nữ tay phồng lãng mạn",
      "Áo thun nữ oversize phong cách Hàn",
      "Áo hai dây nữ vải lụa mùa hè",
      "Áo khoác blazer nữ công sở chuyên nghiệp",

      // 👗 JUMPSUIT
      "Đồ liền thân nữ jumpsuit ống rộng",
      "Đồ bộ nữ 2 món phối đồ linh hoạt",
    ],
    single: [
      // ĐẦM BASIC
      "Đầm suông nữ basic mặc đi làm",
      "Đầm nữ vải voan nhẹ nhàng nữ tính",
      "Váy liền nữ dáng chữ A dễ mặc",

      // QUẦN SHORT
      "Quần short nữ vải thô mùa hè",
      "Quần short nữ jeans cạp cao",
      "Quần short thể thao nữ co giãn",

      // ÁO BASIC
      "Áo thun nữ trơn basic dễ phối",
      "Áo sơ mi nữ trắng công sở",
      "Áo len mỏng nữ mùa thu",
    ],
  },

  // 👟 GIÀY DÉP NAM - Chất lượng & Bền bỉ
  giay_dep_nam: {
    variant: [
      "Giày sneaker nam đế êm siêu nhẹ",
      "Giày thể thao nam vải lưới thoáng khí",
      "Giày da nam công sở lịch lãm",
      "Giày sneaker nam dây buộc phong cách",
      "Giày thể thao nam đế cao su chống trơn",
      "Giày lười nam da thật thoải mái",
    ],
    single: [
      "Giày sneaker nam basic mặc hằng ngày",
      "Giày thể thao nam đế êm đi bộ",
      "Giày da nam công sở chính hãng",
      "Giày vải nam quai dán tiện lợi",
    ],
  },

  // 👠 GIÀY DÉP NỮ - Xinh xắn & Thời thượng
  giay_dep_nu: {
    variant: [
      "Giày cao gót nữ đế 5cm thanh thoát",
      "Giày bệt nữ vải da mềm mại",
      "Giày sneaker nữ trắng tinh khôi",
      "Sandal nữ quai mảnh thời trang",
      "Giày cao gót nữ mũi nhọn sang trọng",
      "Giày thể thao nữ đế dày trendy",
    ],
    single: [
      "Giày bệt nữ basic dễ phối đồ",
      "Giày sneaker nữ trắng mặc hằng ngày",
      "Sandal nữ quai hậu thoải mái",
      "Giày cao gót nữ đế vuông chắc chắn",
    ],
  },

  // 📱 ĐIỆN THOẠI - Flagship & Best Seller
  dien_thoai: {
    variant: [
      "Samsung Galaxy A15 4GB/128GB chính hãng",
      "OPPO A59 4GB/128GB camera xóa phông đẹp",
      "Xiaomi Redmi Note 13 6GB/128GB pin khủng",
      "Realme C67 8GB/256GB màn hình 120Hz",
      "Vivo Y36 8GB/128GB camera selfie sắc nét",
      "iPhone 13 128GB chính hãng VN/A",
    ],
    single: [
      "Samsung Galaxy A05 4GB/64GB giá rẻ",
      "OPPO A17k 4GB/128GB pin 5000mAh",
      "Xiaomi Redmi 13C 4GB/128GB",
      "Realme C51 4GB/64GB hiệu năng mạnh",
    ],
  },

  // 💻 THIẾT BỊ ĐIỆN TỬ - Công nghệ đỉnh cao
  thiet_bi_dien_tu: {
    variant: [
      "Tai nghe Bluetooth TWS chống ồn chủ động",
      "Loa Bluetooth JBL chống nước IPX7",
      "Tai nghe gaming RGB 7.1 âm thanh vòm",
      "Quạt mini USB cầm tay 3 chế độ gió",
      "Pin sạc dự phòng 20000mAh nhanh PD",
      "Đèn LED thông minh điều khiển app",
    ],
    single: [
      "Tai nghe có dây chất lượng cao",
      "Loa Bluetooth mini gọn nhẹ",
      "Pin dự phòng 10000mAh Anker",
      "Ốp lưng iPhone 15 Pro Max chính hãng",
    ],
  },

  // 🖥️ MÁY TÍNH & LAPTOP - Hiệu năng mạnh mẽ
  may_tinh_laptop: {
    variant: [
      "Laptop Acer Aspire 5 i5-1235U 8GB/512GB",
      "Laptop Lenovo IdeaPad 3 Ryzen 5 8GB/512GB",
      "Laptop Dell Inspiron 15 i5 16GB/512GB SSD",
      "Chuột không dây Logitech MX Master 3S",
      "Bàn phím cơ Gaming RGB 104 phím",
    ],
    single: [
      "Laptop mỏng nhẹ văn phòng 8GB RAM",
      "Chuột gaming DPI 16000 chính hãng",
      "Bàn phím cơ Red Switch êm ái",
      "Ổ cứng SSD 1TB NVMe Samsung 970 EVO",
    ],
  },

  // 📷 MÁY ẢNH & QUAY PHIM - Chuyên nghiệp
  may_anh_quay_phim: {
    variant: [
      "Máy ảnh mirrorless Sony A6400 16-50mm",
      "Máy ảnh Canon EOS M50 Mark II",
      "Đèn ring light 18 inch quay TikTok",
      "Gimbal DJI Osmo Mobile 6 chống rung",
    ],
    single: [
      "Máy ảnh compact Canon PowerShot",
      "Đèn livestream 10 inch 3 chế độ sáng",
      "Micro thu âm chất lượng cao USB",
    ],
  },

  // ⌚ ĐỒNG HỒ - Sang trọng & Đẳng cấp
  dong_ho: {
    variant: [
      "Đồng hồ Casio G-Shock chống sốc chính hãng",
      "Đồng hồ Orient dây kim loại mặt sapphire",
      "Đồng hồ Seiko 5 Sports tự động",
      "Đồng hồ dây da thật lịch lãm",
      "Đồng hồ thể thao chống nước 100m",
    ],
    single: [
      "Đồng hồ Casio Edifice chính hãng",
      "Đồng hồ dây kim loại mặt kính sapphire",
      "Đồng hồ quartz chính xác cao",
      "Đồng hồ thể thao nam dây silicone",
    ],
  },

  // 👶 MẸ & BÉ - An toàn & Chất lượng
  me_be: {
    variant: [
      "Tã quần Huggies Size L 54 miếng",
      "Sữa bột Aptamil Gold 3 900g",
      "Bình sữa Combi 150ml chống sặc",
      "Khăn sữa cotton 100% hữu cơ",
      "Gối chống trào ngược cho bé",
    ],
    single: [
      "Tã dán Bobby Size M 60 miếng",
      "Bình sữa Pigeon 240ml chính hãng",
      "Máy hâm sữa nhanh 2 phút",
      "Áo liền thân trẻ em cotton",
    ],
  },

  // 🏠 NHÀ CỬA ĐỜI SỐNG - Tiện nghi & Đẳng cấp
  nha_cua_doi_song: {
    variant: [
      "Chăn ga gối Hanvico Everon cao cấp",
      "Máy xay sinh tố Philips 1.5L",
      "Nồi chiên không dầu 6L dung tích lớn",
      "Bình đun siêu tốc Sunhouse 1.8L",
      "Máy hút bụi cầm tay Xiaomi",
    ],
    single: [
      "Ga giường cotton 100% thoáng mát",
      "Chảo chống dính inox cao cấp",
      "Thảm chùi chân nhựa dệt bền đẹp",
      "Rèm cửa cách nhiệt 2 lớp",
    ],
  },

  // 💄 SẮC ĐẸP - Chăm sóc & Làm đẹp
  sac_dep: {
    variant: [
      "Kem dưỡng ẩm CeraVe PM 89ml chính hãng",
      "Serum Vitamin C The Ordinary 30ml",
      "Kem chống nắng Anessa SPF50+ PA++++",
      "Son môi MAC matte hoàn hảo",
      "Mặt nạ dưỡng da Innisfree 23ml",
    ],
    single: [
      "Sữa rửa mặt Cerave dịu nhẹ",
      "Nước tẩy trang Bioderma 500ml",
      "Kem nền L'Oréal True Match",
      "Son môi 3CE Velvet Lip Tint",
    ],
  },

  // 💊 SỨC KHỎE - Chăm sóc sức khỏe gia đình
  suc_khoe: {
    variant: [
      "Máy đo huyết áp Omron HEM-7120",
      "Máy massage cổ vai gáy 6 đầu",
      "Viên uống Collagen Meiji Nhật Bản",
      "Máy xông tinh dầu gỗ thông tự nhiên",
    ],
    single: [
      "Máy đo đường huyết Accu-Chek",
      "Gối massage hồng ngoại toàn thân",
      "Dụng cụ tập bụng 8 múi tại nhà",
      "Băng chườm nóng lạnh đa năng",
    ],
  },

  // 🛒 DEFAULT - Sản phẩm đa năng
  default: {
    variant: [
      "Túi xách đa năng chống nước cao cấp",
      "Ốp lưng điện thoại cường lực 360°",
      "Bình nước giữ nhiệt 500ml inox",
      "Cáp sạc nhanh Type-C 2m bền chắc",
      "Bộ dụng cụ cầm tay 108 món",
    ],
    single: [
      "Túi đeo chéo nam thời trang",
      "Ốp lưng silicon mềm mại",
      "Bình nước thể thao 1 lít",
      "Pin sạc dự phòng 10000mAh",
    ],
  },
};

// HẬU TỐ MARKETING CHUYÊN NGHIỆP SHOPEE
const SUFFIX_VARIANT = [
  "nhiều màu - nhiều size freesize",
  "8 màu - 5 size chuẩn form",
  "đầy đủ màu sắc - size từ S-XXL",
  "combo màu sắc thời trang 2024",
  "nhiều lựa chọn phù hợp mọi dáng",
];

const SUFFIX_SINGLE = [
  "chính hãng - freeship toàn quốc",
  "giá sốc - hàng có sẵn",
  "chất lượng cao - bền đẹp",
  "hot trend - bán chạy nhất",
  "đẹp như hình - giao nhanh",
];

// Phân loại category thành key
function detectCategoryKey(catName) {
  const name = (catName || "").toLowerCase();

  if (name.includes("thời trang nam")) return "thoi_trang_nam";
  if (name.includes("thời trang nữ")) return "thoi_trang_nu";
  if (name.includes("giày dép nam")) return "giay_dep_nam";
  if (name.includes("giày dép nữ")) return "giay_dep_nu";
  if (name.includes("điện thoại")) return "dien_thoai";
  if (name.includes("thiết bị điện tử")) return "thiet_bi_dien_tu";
  if (name.includes("máy tính") || name.includes("laptop"))
    return "may_tinh_laptop";
  if (name.includes("máy ảnh") || name.includes("máy quay"))
    return "may_anh_quay_phim";
  if (name.includes("đồng hồ")) return "dong_ho";
  if (name.includes("mẹ & bé") || name.includes("mẹ và bé")) return "me_be";
  if (name.includes("nhà cửa") || name.includes("đời sống"))
    return "nha_cua_doi_song";
  if (name.includes("sắc đẹp")) return "sac_dep";
  if (name.includes("sức khỏe")) return "suc_khoe";

  return "default";
}

// Tạo tên sản phẩm KHÔNG TRÙNG TRONG 1 LẦN SEED
function buildNameSmart(category, hasModel, usedNames, index) {
  const key = detectCategoryKey(category.display_name);
  const cfg = CATEGORY_TEMPLATES[key] || CATEGORY_TEMPLATES.default;

  const pool = hasModel ? cfg.variant : cfg.single;
  const suffixPool = hasModel ? SUFFIX_VARIANT : SUFFIX_SINGLE;

  let tries = 0;
  let name;

  while (tries < 10) {
    const base = pick(pool);
    const suffix = pick(suffixPool);
    // thỉnh thoảng không thêm suffix để tự nhiên
    const finalName = Math.random() < 0.7 ? `${base} ${suffix}` : `${base}`;
    if (!usedNames.has(finalName)) {
      name = finalName;
      break;
    }
    tries++;
  }

  // Nếu vẫn trùng, thêm "mẫu X"
  if (!name) {
    const base = pick(pool);
    name = `${base} mẫu ${index + 1}`;
  }

  usedNames.add(name);
  return name;
}

// ATTRIBUTES
function buildAttributes(category) {
  const result = [];
  const attrs = category.attributes || [];
  for (const attr of attrs) {
    let value = null;
    const t = attr.input_type;
    const opts = attr.options || [];

    if ((t === "select" || t === "multiselect") && opts.length > 0) {
      value = pick(opts);
    } else if (t === "number") {
      value = rand(1, 100);
    } else {
      const label = (attr.label || "").toLowerCase();
      if (label.includes("chất liệu")) {
        value = pick(["Cotton 100%", "Vải thun", "Vải kaki", "Vải linen"]);
      } else if (label.includes("màu")) {
        value = pick(["Đen", "Trắng", "Xám", "Xanh navy", "Be"]);
      } else if (label.includes("thương hiệu")) {
        value = pick(["Nội địa Việt Nam", "Không thương hiệu"]);
      } else {
        value = "Phù hợp nhu cầu sử dụng hằng ngày.";
      }
    }

    result.push({
      attribute_id: attr._id,
      value,
    });
  }
  return result;
}

// MÔ TẢ & TAGS
function buildDescription(name, category) {
  return [
    `${name}`,
    `Danh mục: ${category.display_name}`,
    "",
    "- Thiết kế đơn giản, dễ sử dụng trong cuộc sống hằng ngày.",
    "- Phù hợp với nhu cầu của người dùng Việt.",
    "",
    "Cam kết:",
    "- Sản phẩm giống mô tả.",
    "- Kiểm tra kỹ trước khi gửi.",
    "- Hỗ trợ đổi trả nếu sản phẩm lỗi do nhà sản xuất.",
  ].join("\n");
}

function buildTags(name, category) {
  const s = new Set();
  name
    .toLowerCase()
    .split(/[ ,\-]+/)
    .filter((w) => w.length > 2)
    .forEach((w) => s.add(w));
  s.add((category.display_name || "").toLowerCase());
  s.add("hàng việt");
  s.add("giá tốt");
  return [...s].slice(0, 8);
}

// BIẾN THỂ: TIER + MODELS
function buildVariant(category, basePrice) {
  const c = (category.display_name || "").toLowerCase();

  let tiers = [];
  let models = [];

  if (
    c.includes("thời trang") ||
    c.includes("áo") ||
    c.includes("quần") ||
    c.includes("giày")
  ) {
    const colors = ["Đen", "Trắng", "Xám"];
    const sizes =
      c.includes("giày") || c.includes("giầy")
        ? ["38", "39", "40", "41", "42"]
        : ["S", "M", "L", "XL"];

    tiers = [
      { name: "Màu sắc", options: colors, images: [] },
      { name: "Kích cỡ", options: sizes, images: [] },
    ];

    const combos = [];
    for (let ci = 0; ci < colors.length; ci++) {
      for (let si = 0; si < sizes.length; si++) {
        combos.push([ci, si]);
      }
    }
    const used = combos.slice(0, 6);

    models = used.map(([ci, si]) => {
      const price = basePrice + rand(-30000, 40000);
      const discount = pick([0, 5, 10, 15]);
      return {
        name: `${colors[ci]} - ${sizes[si]}`,
        price,
        discount_percentage: discount,
        sale_price: calcSale(price, discount),
        stock: rand(3, 20),
        tier_index: [ci, si],
      };
    });
  } else if (c.includes("điện thoại")) {
    const colors = ["Đen", "Trắng", "Xanh"];
    const memory = ["64GB", "128GB", "256GB"];
    tiers = [
      { name: "Màu sắc", options: colors, images: [] },
      { name: "Dung lượng", options: memory, images: [] },
    ];
    const combos = [];
    for (let ci = 0; ci < colors.length; ci++) {
      for (let mi = 0; mi < memory.length; mi++) {
        combos.push([ci, mi]);
      }
    }
    const used = combos.slice(0, 5);
    models = used.map(([ci, mi]) => {
      const price = basePrice + mi * 500000;
      const discount = pick([0, 5, 10]);
      return {
        name: `${colors[ci]} - ${memory[mi]}`,
        price,
        discount_percentage: discount,
        sale_price: calcSale(price, discount),
        stock: rand(1, 10),
        tier_index: [ci, mi],
      };
    });
  } else {
    const opts = ["Loại 1", "Loại 2", "Loại 3"];
    tiers = [{ name: "Phân loại", options: opts, images: [] }];

    models = opts.map((opt, idx) => {
      const price = basePrice + idx * rand(10000, 30000);
      const discount = pick([0, 5, 10]);
      return {
        name: opt,
        price,
        discount_percentage: discount,
        sale_price: calcSale(price, discount),
        stock: rand(5, 30),
        tier_index: [idx],
      };
    });
  }

  return { tiers, models };
}

// BUILD PRODUCT DATA THÔ
function buildProductData({ seller, category, hasModel, usedNames, index }) {
  const basePrice = guessBasePrice(category.display_name);
  const name = buildNameSmart(category, hasModel, usedNames, index);
  const description = buildDescription(name, category);
  const tags = buildTags(name, category);
  const attributes = buildAttributes(category);

  const location = {
    city: seller?.shop?.addressShop?.city || "Hà Nội",
    country: seller?.shop?.addressShop?.country || "Việt Nam",
  };

  const data = {
    shop_id: seller._id,
    name,
    description,
    category_id: category._id,
    attributes,
    images: [PRODUCT_IMAGE_URL],
    tags,
    condition: "NEW",
    sellerStatus: "NORMAL",
    isActive: true,
    location,
    logistic_info: [
      {
        logistic_id: 1,
        enabled: true,
        shipping_fee: rand(15000, 30000),
        is_free: false,
      },
    ],
    pre_order: { is_pre_order: false, days_to_ship: 0 },
    video_info_list: [],
    promotions: [],
    item_rating: {
      rating_star: 0,
      total_reviews: 0,
      ratings_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    },
    historical_sold: 0,
    liked_count: 0,
  };

  if (!hasModel) {
    const discount = pick([0, 5, 10, 15, 20]);
    data.has_model = false;
    data.models = [];
    data.tier_variations = [];
    data.price = basePrice;
    data.discount_percentage = discount;
    data.sale_price = calcSale(basePrice, discount);
    data.stock = rand(10, 80);
  } else {
    const { tiers, models } = buildVariant(category, basePrice);
    const prices = models.map((m) => m.price);
    const sales = models.map((m) => m.sale_price);

    data.has_model = true;
    data.tier_variations = tiers;
    data.models = models;
    data.price = Math.min(...prices);
    data.sale_price = Math.min(...sales);
    data.stock = 0;
    data.discount_percentage = 0;
  }

  return data;
}

// ====== MAIN ======
async function main() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("Thiếu MONGO_URI trong .env");
      process.exit(1);
    }

    console.log("Kết nối MongoDB...");
    await mongoose.connect(uri);
    console.log("Đã kết nối MongoDB.\n");

    // B1: chọn seller
    const sellers = await Account.find({
      role: "seller",
      isActive: true,
      "shop.isActive": true,
      "shop.verificationStatus": "approved",
    }).select("_id username shop role");

    if (!sellers.length) {
      console.log("Không có seller hợp lệ.");
      process.exit(0);
    }

    console.log("DANH SÁCH SELLER:");
    sellers.forEach((s, i) => {
      console.log(
        `[${i + 1}]`,
        s.shop?.shopName || s.shop?.name || s.username,
        "|",
        s._id.toString()
      );
    });
    const sIdx = parseInt(await ask("\nChọn seller (số thứ tự): "), 10) - 1;
    const seller = sellers[sIdx];
    if (!seller) {
      console.log("Seller không hợp lệ.");
      process.exit(0);
    }
    console.log(
      `→ Đã chọn seller: ${
        seller.shop?.shopName || seller.shop?.name || seller.username
      }\n`
    );

    // B2: chọn category
    const categories = await Category.find({ is_active: true }).populate({
      path: "attributes",
      model: Attribute,
    });
    if (!categories.length) {
      console.log("Không có danh mục hoạt động.");
      process.exit(0);
    }

    console.log("DANH SÁCH DANH MỤC:");
    categories.forEach((c, i) => {
      const ac = (c.attributes || []).length;
      console.log(`[${i + 1}] ${c.display_name} (thuộc tính: ${ac})`);
    });
    const cIdx = parseInt(await ask("\nChọn danh mục (số thứ tự): "), 10) - 1;
    const category = categories[cIdx];
    if (!category) {
      console.log("Danh mục không hợp lệ.");
      process.exit(0);
    }
    console.log(`→ Đã chọn danh mục: ${category.display_name}\n`);

    // B3: số lượng sản phẩm
    const total = parseInt(await ask("Số sản phẩm cần tạo: "), 10);
    if (!total || total <= 0) {
      console.log("Số lượng không hợp lệ.");
      process.exit(0);
    }

    // B4: số sản phẩm có biến thể
    const variant = parseInt(
      await ask(`Số sản phẩm có biến thể (0-${total}): `),
      10
    );
    if (variant < 0 || variant > total || isNaN(variant)) {
      console.log("Số sản phẩm biến thể không hợp lệ.");
      process.exit(0);
    }

    console.log(
      `\nBẮT ĐẦU TẠO: ${total} sản phẩm (${variant} có biến thể, ${
        total - variant
      } không biến thể)\n`
    );

    const docs = [];
    const usedNames = new Set();

    for (let i = 0; i < total; i++) {
      const hasModel = i < variant;
      const raw = buildProductData({
        seller,
        category,
        hasModel,
        usedNames,
        index: i,
      });

      const slug = generateSlug(raw.name);
      const sku = generateSku(raw.name);

      raw.slug = slug;
      raw.sku = sku;

      if (raw.has_model && raw.models && raw.models.length > 0) {
        raw.models = raw.models.map((m) => ({
          ...m,
          model_sku: generateModelSku(sku, m.name),
        }));
      }

      docs.push(raw);
    }

    let success = 0;

    for (let i = 0; i < docs.length; i++) {
      const data = docs[i];
      try {
        await Product.insertMany([data]);
        console.log(
          `✔ [${i + 1}/${docs.length}] ${
            data.has_model ? "BIẾN THỂ" : "ĐƠN"
          } | ${data.name}`
        );
        success++;
      } catch (err) {
        console.log(
          `✖ [${i + 1}/${docs.length}] lỗi: ${err.message || err.toString()}`
        );
      }
    }

    console.log(`\nHOÀN TẤT: ${success}/${docs.length} sản phẩm được tạo.`);
  } catch (err) {
    console.error("Lỗi seeder:", err);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

main();

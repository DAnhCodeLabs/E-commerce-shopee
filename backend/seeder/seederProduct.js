/**
 * Seeder Product FULL – ĐÃ FIX TẤT CẢ LỖI
 * - Sửa lỗi shop_id
 * - Sửa lỗi item.attributes is not iterable
 * - Chuẩn hóa JSON AI
 * - Chuẩn hóa attributes (object → array)
 * - Không duplicate attribute
 * - Không sửa ProductModel
 * - Hỗ trợ gemini-2.0-flash
 * - Bổ sung location + 1 URL ảnh cố định + logic giá giống controller
 */

import readline from "readline";
import axios from "axios";
import mongoose from "mongoose";
const GEMINI_API_KEY = "AIzaSyAs2zVlmoHb6am84ztbRY4hYtiPVqZ48Sw";
const MONGO_URI =
  "mongodb+srv://danhcodelabs_db_user:0000@cluster0.e8amyyc.mongodb.net/eCommerce";
import Account from "../models/accountModel.js";
import Category from "../models/categoryModel.js";
import Attribute from "../models/attributeModel.js";
import Product from "../models/productModel.js";

// 1 URL ảnh dùng chung cho mọi sản phẩm
const DEFAULT_IMAGE_URL =
  "https://inbat.vn/wp-content/uploads/2024/10/avatar-fb-mac-dinh-39.jpg";

// logistic mặc định nếu AI không trả
const DEFAULT_LOGISTIC_INFO = [
  { logistic_id: 1, enabled: true, shipping_fee: 25000, is_free: false },
];

// CLI helper
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const question = (q) =>
  new Promise((r) => rl.question(q, (ans) => r((ans || "").trim())));

// ========= UTILITIES =========

// Bỏ dấu tiếng Việt + chuyển _ key
function normalizeKey(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

// Loại bỏ ```json ... ``` của AI
function stripCodeFence(text) {
  if (!text) return text;
  let t = text.trim();
  if (t.startsWith("```")) {
    const first = t.indexOf("\n");
    if (first !== -1) t = t.slice(first + 1);
    if (t.endsWith("```")) t = t.slice(0, -3);
  }
  return t.replace(/^`+|`+$/g, "").trim();
}

// CHUẨN HÓA attributes
// AI có thể trả: array, object map, string, null
function normalizeAttributes(rawAttrs) {
  if (!rawAttrs) return [];

  // Trường hợp đúng chuẩn
  if (Array.isArray(rawAttrs)) {
    return rawAttrs
      .filter(
        (a) =>
          a &&
          typeof a === "object" &&
          typeof a.attribute === "string" &&
          a.attribute.trim() !== ""
      )
      .map((a) => ({
        attribute: a.attribute.trim(),
        value: a.value ?? "",
      }));
  }

  // Nếu AI trả object map: {"Size": "M", "Color": "Red"}
  if (typeof rawAttrs === "object") {
    return Object.entries(rawAttrs).map(([k, v]) => ({
      attribute: k,
      value: v,
    }));
  }

  // Nếu là chuỗi → bỏ qua
  return [];
}

// Tính sale_price giống helper (price * (100 - percent) / 100)
function calculateSalePrice(price, percent) {
  const p = Number(price) || 0;
  const per = Number(percent) || 0;
  return Math.round((p * (100 - per)) / 100);
}

// Gemini call
async function callGemini(prompt) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    GEMINI_API_KEY;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const res = await axios.post(url, body);
  return res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

// fallback generator
function fallbackProducts(categoryName, variant, simple, attrLabels) {
  const total = variant + simple;
  const out = [];

  for (let i = 1; i <= total; i++) {
    const isVariant = i <= variant;
    const base = `${categoryName} AutoGen ${Date.now()}-${i}`;

    const attrs = attrLabels.map((lbl) => ({
      attribute: lbl,
      value: "Auto",
    }));

    // base price
    const basePrice = 100000 + i * 50000;

    let has_model = false;
    let price = basePrice;
    let stock = 5 + i;
    let discount_percentage = 0;
    let sale_price = basePrice;
    let tier_variations = [];
    let models = [];

    if (isVariant) {
      has_model = true;

      const modelA = {
        name: `${base} A`,
        price: basePrice + 20000,
        discount_percentage: 10,
        stock: 5,
        tier_index: [0],
      };
      const modelB = {
        name: `${base} B`,
        price: basePrice + 30000,
        discount_percentage: 5,
        stock: 5,
        tier_index: [1],
      };

      modelA.sale_price = calculateSalePrice(
        modelA.price,
        modelA.discount_percentage
      );
      modelB.sale_price = calculateSalePrice(
        modelB.price,
        modelB.discount_percentage
      );

      models = [modelA, modelB];
      tier_variations = [
        {
          name: attrLabels[0] || "Loại",
          options: ["A", "B"],
          images: [],
        },
      ];

      price = Math.min(modelA.price, modelB.price);
      sale_price = Math.min(modelA.sale_price, modelB.sale_price);
      stock = 0;
      discount_percentage = 0;
    }

    out.push({
      name: base,
      tags: ["auto", categoryName],
      meta_title: base,
      meta_description: "Auto desc",
      description: "Mô tả auto",
      attributes: attrs,
      images: [], // sẽ override bằng DEFAULT_IMAGE_URL
      video_info_list: [],
      sellerStatus: "NORMAL",
      price,
      stock,
      discount_percentage,
      sale_price,
      has_model,
      tier_variations,
      models,
      logistic_info: DEFAULT_LOGISTIC_INFO,
      pre_order: { is_pre_order: false, days_to_ship: 0 },
      condition: "NEW",
      promotions: [],
    });
  }
  return out;
}

// === SAVE PRODUCTS ===
async function mapAndSave(products, category, seller) {
  const created = [];

  for (const item of products) {
    try {
      // Chuẩn hóa attributes (từ AI)
      const attrs = normalizeAttributes(item.attributes || []);

      // Map attribute -> attribute_id
      const mapped = [];
      for (const a of attrs) {
        const key = normalizeKey(a.attribute);

        const attrDoc = await Attribute.findOneAndUpdate(
          { name: key },
          {
            $setOnInsert: {
              name: key,
              label: a.attribute,
              input_type: "text",
              options: [],
            },
          },
          { upsert: true, new: true }
        );

        mapped.push({
          attribute_id: attrDoc._id,
          value: a.value ?? "",
        });
      }

      // LOCATION giống controller: lấy từ shop.addressShop
      const location = {
        city: seller?.shop?.addressShop?.city || "",
        country: seller?.shop?.addressShop?.country || "Việt Nam",
      };

      // Chuẩn hóa giá / biến thể giống controller
      const hasModel = !!item.has_model;
      let models = Array.isArray(item.models) ? item.models : [];
      let tierVariations = Array.isArray(item.tier_variations)
        ? item.tier_variations
        : [];
      let price;
      let stock;
      let discountPercentage;
      let salePrice;

      if (hasModel && models.length > 0) {
        // 1) CHUẨN HÓA models, tính sale price
        const modelsWithSalePrice = models.map((model, idx) => {
          const modelPrice = Number(model.price) || 0;
          const modelPercent = Number(model.discount_percentage) || 0;

          return {
            ...model,
            price: modelPrice,
            discount_percentage: modelPercent,
            sale_price:
              model.sale_price ?? calculateSalePrice(modelPrice, modelPercent),
            stock: Number(model.stock) || 0,

            // 🔥 FIX QUAN TRỌNG — ánh xạ biến thể vào option
            // Ở đây là 1 tầng variant => tier_index chỉ có 1 phần tử
            tier_index: [idx],
          };
        });

        models = modelsWithSalePrice;

        // 2) Giá hiển thị = min model
        price = Math.min(...models.map((m) => m.price));
        salePrice = Math.min(...models.map((m) => m.sale_price));

        // 3) Stock tổng = sum model (FE Buyer mới hoạt động đúng)
        stock = models.reduce((acc, m) => acc + m.stock, 0);

        // 4) tier_variations phải khớp models
        //    options phải theo thứ tự index tương ứng
        tierVariations = [
          {
            name: item.tier_variations?.[0]?.name || "Phân loại",
            options: models.map((m) => m.name), // mỗi model là 1 option
            images: [], // có thể bỏ
          },
        ];

        discountPercentage = 0; // 100% chính xác (controller cũng vậy)
      } else {
        // Sản phẩm không có biến thể
        const originalPrice = Number(item.price) || 100000;
        const percent = Number(item.discount_percentage) || 0;

        price = originalPrice;
        stock = Number(item.stock) || 10;
        discountPercentage = percent;
        salePrice =
          item.sale_price ?? calculateSalePrice(originalPrice, percent);

        models = [];
        tierVariations = [];
      }

      const prod = new Product({
        name: item.name,
        tags: Array.isArray(item.tags) ? item.tags : [],
        meta_title: item.meta_title || item.name,
        meta_description: item.meta_description || "",
        description: item.description || "",
        category_id: category._id,
        attributes: mapped,

        // 1 URL ảnh cố định cho mọi sản phẩm
        images: [DEFAULT_IMAGE_URL],

        video_info_list: Array.isArray(item.video_info_list)
          ? item.video_info_list
          : [],
        sellerStatus: item.sellerStatus || "NORMAL",
        price,
        stock,
        discount_percentage: discountPercentage,
        sale_price: salePrice,
        has_model: hasModel,
        tier_variations: tierVariations,
        models,
        logistic_info:
          Array.isArray(item.logistic_info) && item.logistic_info.length > 0
            ? item.logistic_info
            : DEFAULT_LOGISTIC_INFO,
        pre_order:
          item.pre_order && typeof item.pre_order === "object"
            ? item.pre_order
            : { is_pre_order: false, days_to_ship: 0 },
        condition: item.condition || "NEW",
        promotions: Array.isArray(item.promotions) ? item.promotions : [],

        // shop_id + _user bắt buộc để qua validate ProductModel
        shop_id: seller._id,
        location,
      });

      prod._user = seller;

      await prod.save();
      console.log("✓ Created:", prod.name);

      created.push(prod);
    } catch (err) {
      console.error("X Fail:", err.message);
    }
  }

  return created;
}

//
// MAIN
//
(async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✓ MongoDB connected");

    // Seller
    const username = await question("Nhập username (seller): ");
    const seller = await Account.findOne({ username });
    if (!seller) throw new Error("Seller không tồn tại");
    if (seller.role !== "seller") throw new Error("Không phải seller");
    console.log("✓ Seller OK:", seller.username);

    // Category
    const categories = await Category.find();
    categories.forEach((c, i) => console.log(`${i + 1}. ${c.display_name}`));
    const pick = await question("Chọn danh mục: ");

    let cat = /^\d+$/.test(pick)
      ? categories[parseInt(pick) - 1]
      : categories.find(
          (c) => c.display_name.toLowerCase() === pick.toLowerCase()
        );

    if (!cat) throw new Error("Danh mục không tồn tại");

    const category = await Category.findById(cat._id).populate("attributes");

    // Count
    const TOTAL = 10;
    const v = await question("Bao nhiêu sản phẩm có biến thể? (0..10): ");
    const variantCount = Math.max(0, Math.min(10, parseInt(v || 0)));
    const simpleCount = TOTAL - variantCount;

    // Lấy attributes từ DB hoặc fallback
    const attrLabels =
      category.attributes.length > 0
        ? category.attributes.map((a) => a.label)
        : ["Size", "Color"];

    // GEMINI PROMPT
    const prompt = `
Generate EXACTLY ${TOTAL} products as a pure JSON array ONLY. No markdown.
Each product MUST follow this schema:

{
  "name": "",
  "tags": [],
  "meta_title": "",
  "meta_description": "",
  "description": "",
  "attributes": [
      {"attribute": "Size", "value": "M"}
  ],
  "images": [],
  "video_info_list": [],
  "sellerStatus": "NORMAL",
  "price": 0,
  "stock": 0,
  "discount_percentage": 0,
  "sale_price": 0,
  "has_model": false,
  "tier_variations": [],
  "models": [],
  "logistic_info": [
      {"logistic_id":1,"enabled":true,"shipping_fee":25000,"is_free":false}
  ],
  "pre_order": {"is_pre_order": false, "days_to_ship": 0},
  "condition": "NEW",
  "promotions": []
}

Rules:
- Category: "${category.display_name}"
- Attributes MUST be an ARRAY, not object, not map.
- Use attribute labels: ${JSON.stringify(attrLabels)}
- ${variantCount} products must have has_model=true
- ${simpleCount} products must have has_model=false
- Images must be placeholder URLs
`;

    let productsJson = null;

    try {
      console.log("→ Calling Gemini...");
      const raw = await callGemini(prompt);
      const clean = stripCodeFence(raw);

      productsJson = JSON.parse(clean);

      if (!Array.isArray(productsJson) || productsJson.length !== TOTAL)
        throw new Error("JSON không đúng format hoặc sai số lượng");

      console.log("✓ AI JSON OK");
    } catch (err) {
      console.log("AI lỗi → fallback chạy:", err.message);
      productsJson = fallbackProducts(
        category.display_name,
        variantCount,
        simpleCount,
        attrLabels
      );
    }

    // SAVE
    const created = await mapAndSave(productsJson, category, seller);

    console.log("DONE. Created:", created.length, "products");
    rl.close();
    process.exit(0);
  } catch (err) {
    console.error("FATAL:", err.message);
    rl.close();
    process.exit(1);
  }
})();

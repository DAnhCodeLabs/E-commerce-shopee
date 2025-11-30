/**
 * SEEDER SẢN PHẨM THÔNG MINH - KHÔNG DÙNG AI
 * Tạo sản phẩm chất lượng như con người với dữ liệu thật từ DB
 */

import dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import mongoose from "mongoose";

// Config
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Lỗi: Thiếu MONGO_URI trong .env");
  process.exit(1);
}

// Models
import Account from "../models/accountModel.js";
import Category from "../models/categoryModel.js";
import Attribute from "../models/attributeModel.js";
import Product from "../models/productModel.js";

// ========= HỆ THỐNG TEMPLATE THÔNG MINH =========
class SmartTemplateSystem {
  static getTemplates() {
    return {
      "Thời Trang Nam": {
        names: [
          "Áo Thun Cotton Cổ Tròn {brand} - {color}",
          "Quần Jeans Slimfit {brand} - {style}",
          "Áo Polo Phối Màu {brand} - {design}",
          "Áo Khoác Jacket {brand} - {material}",
          "Quần Short Thể Thao {brand} - {pattern}",
          "Áo Sơ Mi Tay Dài {brand} - {fit}",
          "Quần Tây Công Sở {brand} - {color}",
          "Áo Len Cổ Lọ {brand} - {material}",
          "Áo Hoodie In Họa Tiết {brand}",
          "Quần Jogger Co Giãn {brand} - {style}",
        ],
        descriptions: [
          "Chất liệu {material} cao cấp, thoáng mát. Form {fit} ôm vừa vặn, phù hợp {occasion}. Thiết kế {design} trẻ trung, dễ dàng phối đồ.",
          "{material} nhập khẩu, độ bền cao. Kiểu dáng {style} hiện đại. Màu sắc {color} dễ phối đồ. Phù hợp {occasion}.",
          "Sản phẩm {brand} chính hãng. Chất vải {material} mềm mại, thấm hút tốt. Đường may tỉ mỉ, form {fit} chuẩn.",
          "Thiết kế {design} độc đáo, {material} chất lượng. Form {fit} tôn dáng, màu {color} thời thượng. Hoàn hảo cho {occasion}.",
        ],
        patterns: {
          brand: [
            "Lavender Fashion",
            "Style Men",
            "Fashion Hub",
            "Men's Choice",
            "Premium Wear",
            "Elite Style",
          ],
          color: [
            "Đen",
            "Trắng",
            "Xám",
            "Xanh Navy",
            "Nâu",
            "Xanh Rêu",
            "Be",
            "Xanh Đen",
          ],
          material: [
            "Cotton 100%",
            "Cotton PE",
            "Kate",
            "Denim",
            "Nỉ",
            "Len",
            "Lụa",
            "Kaki",
          ],
          fit: ["Regular", "Slim", "Oversize", "Relaxed", "Skinny"],
          style: [
            "Basic",
            "Cổ điển",
            "Hiện đại",
            "Thể thao",
            "Công sở",
            "Đường phố",
          ],
          design: [
            "Trơn",
            "In hình",
            "Thêu logo",
            "Phối màu",
            "Họa tiết",
            "Caros",
            "Sọc kẻ",
          ],
          occasion: [
            "đi làm",
            "du lịch",
            "dạo phố",
            "thể thao",
            "tiệc tùng",
            "hẹn hò",
          ],
          pattern: [
            "Caros",
            "Sọc",
            "Kẻ",
            "Trơn",
            "In chữ",
            "Họa tiết geometric",
          ],
        },
      },
      "Thời Trang Nữ": {
        names: [
          "Đầm Suông Cổ V {brand} - {color}",
          "Áo Thun Tay Lỡ {brand} - {design}",
          "Quần Jeans Ống Rộng {brand}",
          "Chân Váy Chữ A {brand} - {style}",
          "Áo Kiểu Phối Nơ {brand} - {material}",
          "Set Bộ Thời Trang {brand}",
          "Áo Khoác Dáng Dài {brand}",
          "Quần Tây Công Sở {brand} - {fit}",
          "Áo Len Cộc Tay {brand} - {color}",
          "Đầm Body Phối {brand} - {design}",
        ],
        descriptions: [
          "Thiết kế thanh lịch, tôn dáng. Chất liệu {material} cao cấp, mềm mại khi mặc. Phù hợp {occasion}.",
          "Form chuẩn, thiết kế {style} trẻ trung. {material} thoáng mát, dễ dàng phối với nhiều loại trang phục.",
          "Phong cách {style} hiện đại, chất liệu {material} co giãn thoải mái. Màu {color} thời thượng.",
        ],
        patterns: {
          brand: [
            "Lavender Fashion",
            "Style Women",
            "Fashion Queen",
            "Lady Choice",
            "Premium Women",
          ],
          color: [
            "Hồng",
            "Trắng",
            "Đen",
            "Xanh Pastel",
            "Tím",
            "Be",
            "Đỏ",
            "Xanh Ngọc",
          ],
          material: ["Kate Lụa", "Cotton", "Voan", "Ren", "Jeans", "Nỉ", "Len"],
          fit: ["Regular", "Slim", "Oversize", "Body", "A-line"],
          style: ["Công sở", "Dạo phố", "Tiệc", "Thể thao", "Bohemian"],
          design: ["Trơn", "Hoa", "Kẻ sọc", "Đính đá", "Thêu"],
          occasion: ["đi làm", "du lịch", "dạo phố", "tiệc tùng", "hẹn hò"],
        },
      },
      "Điện Thoại & Phụ Kiện": {
        names: [
          "Điện Thoại {brand} {model} - {storage} - {color}",
          "Tai Nghe {brand} {type} - {feature}",
          "Ốp Lưng {brand} {model} - {design}",
          "Sạc Dự Phòng {brand} {capacity}",
          "Cáp Sạc {brand} {length} - {type}",
          "Miếng Dán Màn hình {brand} {model}",
        ],
        descriptions: [
          "Sản phẩm chính hãng {brand}, {feature}. {storage}, màu {color}. Bảo hành {warranty}.",
          "Phụ kiện {brand} chất lượng cao. Thiết kế {design}, {feature}. Tương thích {compatibility}.",
        ],
        patterns: {
          brand: ["Samsung", "iPhone", "Xiaomi", "Oppo", "Realme", "Nokia"],
          model: [
            "Galaxy S23",
            "iPhone 15",
            "Redmi Note 13",
            "Reno 10",
            "C55",
            "8.4",
          ],
          storage: ["128GB", "256GB", "512GB", "1TB"],
          color: ["Đen", "Trắng", "Xám", "Xanh", "Tím", "Đỏ"],
          type: ["Bluetooth", "Có dây", "True Wireless", "Gaming"],
          feature: [
            "chống nước",
            "pin trâu",
            "chụp ảnh đẹp",
            "màn hình AMOLED",
          ],
          design: ["Trong suốt", "Màu đơn", "Hình in", "Trượt"],
          capacity: ["10000mAh", "20000mAh", "5000mAh", "30000mAh"],
          length: ["1m", "2m", "1.5m", "0.5m"],
          warranty: ["12 tháng", "24 tháng", "6 tháng"],
          compatibility: ["mọi điện thoại", "iPhone", "Android"],
        },
      },
      default: {
        names: [
          "Sản phẩm cao cấp {brand}",
          "Sản phẩm chất lượng {brand}",
          "Sản phẩm thời trang {brand}",
        ],
        descriptions: [
          "Sản phẩm được làm từ chất liệu cao cấp, thiết kế tinh tế và hiện đại.",
        ],
        patterns: {
          brand: ["Thương hiệu uy tín", "Shop chất lượng", "Brand Premium"],
          color: ["Đa dạng"],
          material: ["Cao cấp"],
        },
      },
    };
  }

  static fillTemplate(template, patterns) {
    return template.replace(/{(\w+)}/g, (match, key) => {
      const options = patterns[key];
      return options
        ? options[Math.floor(Math.random() * options.length)]
        : match;
    });
  }
}

// ========= ENGINE TẠO SẢN PHẨM THÔNG MINH =========
class SmartProductEngine {
  constructor(seller, category, attributes) {
    this.seller = seller;
    this.category = category;
    this.attributes = attributes;
    this.shopName = seller.shop?.shopName || "Shop Việt Nam";
    this.templates =
      SmartTemplateSystem.getTemplates()[category.display_name] ||
      SmartTemplateSystem.getTemplates()["default"];
  }

  generateProducts(totalProducts, variantCount) {
    const products = [];

    for (let i = 0; i < totalProducts; i++) {
      const isVariant = i < variantCount;
      const product = this.createSingleProduct(i, isVariant);
      products.push(product);
    }

    return products;
  }

  createSingleProduct(index, isVariant) {
    const nameTemplate =
      this.templates.names[index % this.templates.names.length];
    const descTemplate =
      this.templates.descriptions[index % this.templates.descriptions.length];

    const name = SmartTemplateSystem.fillTemplate(
      nameTemplate,
      this.templates.patterns
    );
    const description = SmartTemplateSystem.fillTemplate(
      descTemplate,
      this.templates.patterns
    );

    const price = this.calculateRealisticPrice(index);
    const discount = this.calculateStrategicDiscount(index);

    const product = {
      name: `${name} - ${this.shopName}`,
      description: description,
      price: price,
      stock: isVariant ? 0 : this.calculateStock(index),
      discount_percentage: discount,
      condition: "NEW",
      sellerStatus: "NORMAL",
      has_model: isVariant,
      attributes: this.generateRealAttributes(),
      tags: this.generateSmartTags(),
      meta_title: `${name} - ${this.shopName}`,
      meta_description: description.substring(0, 150),
      images: this.getProductImages(),
      sale_price: Math.round((price * (100 - discount)) / 100),
      isActive: true,
    };

    if (isVariant) {
      this.addRealisticVariants(product, index);
    } else {
      product.models = [];
      product.tier_variations = [];
    }

    return product;
  }

  calculateRealisticPrice(index) {
    const basePrices = {
      "Thời Trang Nam": { min: 80000, max: 500000 },
      "Thời Trang Nữ": { min: 100000, max: 600000 },
      "Điện Thoại & Phụ Kiện": { min: 100000, max: 20000000 },
      "Mẹ & Bé": { min: 50000, max: 1000000 },
      "Nhà Cửa & Đời Sống": { min: 50000, max: 3000000 },
      default: { min: 50000, max: 1000000 },
    };

    const range =
      basePrices[this.category.display_name] || basePrices["default"];
    const basePrice = range.min + index * ((range.max - range.min) / 15);

    // Làm tròn theo tâm lý giá (99k, 199k, 299k)
    return Math.round(basePrice / 1000) * 1000;
  }

  calculateStrategicDiscount(index) {
    const discounts = [0, 0, 5, 5, 10, 10, 15, 15, 20, 25];
    return discounts[index % discounts.length];
  }

  calculateStock(index) {
    return 20 + index * 5;
  }

  generateRealAttributes() {
    const attributes = [];

    // Sử dụng attributes thật từ database (lấy tối đa 3 attributes)
    const availableAttrs = this.attributes.slice(0, 3);

    for (const attr of availableAttrs) {
      let value = "Mặc định";

      if (attr.options && attr.options.length > 0) {
        // Chọn ngẫu nhiên từ options có sẵn
        value = attr.options[Math.floor(Math.random() * attr.options.length)];
      } else {
        // Tạo giá trị phù hợp theo loại attribute
        value = this.generateAttributeValue(attr.label);
      }

      attributes.push({
        attribute: attr.label,
        value: value,
      });
    }

    return attributes;
  }

  generateAttributeValue(attributeLabel) {
    const valueMap = {
      "Chất liệu": [
        "Cotton 100%",
        "Polyester",
        "Len",
        "Kate",
        "Denim",
        "Lụa",
        "Nỉ",
      ],
      "Màu sắc": ["Đen", "Trắng", "Xám", "Xanh Navy", "Nâu", "Hồng", "Xanh lá"],
      "Kích thước": ["S", "M", "L", "XL", "XXL"],
      "Xuất xứ": ["Việt Nam", "Trung Quốc", "Hàn Quốc", "Nhật Bản"],
      "Kiểu dáng": ["Regular", "Slim", "Oversize", "Relaxed", "Body"],
      "Dung lượng": ["128GB", "256GB", "512GB", "1TB"],
      "Bảo hành": ["12 tháng", "24 tháng", "6 tháng", "36 tháng"],
    };

    return valueMap[attributeLabel]?.[0] || "Mặc định";
  }

  addRealisticVariants(product, index) {
    const selectableAttrs = this.attributes
      .filter(
        (attr) =>
          ["select", "multiselect"].includes(attr.input_type) &&
          attr.options &&
          attr.options.length > 0
      )
      .slice(0, 2); // Tối đa 2 loại biến thể

    if (selectableAttrs.length > 0) {
      const { models, tiers } = this.createAttributeBasedVariants(
        product,
        selectableAttrs
      );
      product.models = models;
      product.tier_variations = tiers;
    } else {
      // Fallback: tạo biến thể mặc định
      product.models = this.createDefaultVariants(product, index);
      product.tier_variations = [
        {
          name: "Phân loại",
          options: product.models.map((m) => m.name.split(" - ").pop()),
          images: [],
        },
      ];
    }

    // Cập nhật giá và stock tổng
    product.price = Math.min(...product.models.map((m) => m.price));
    product.sale_price = Math.min(...product.models.map((m) => m.sale_price));
    product.stock = product.models.reduce((sum, m) => sum + m.stock, 0);
    product.discount_percentage = 0;
  }

  createAttributeBasedVariants(baseProduct, variantAttrs) {
    const models = [];
    const tier_variations = variantAttrs.map((attr) => ({
      name: attr.label,
      options: attr.options.slice(0, 3), // Tối đa 3 options mỗi attribute
      images: [],
    }));

    // Tạo các tổ hợp
    const combinations = this.generateCombinations(tier_variations);

    combinations.forEach((combination, index) => {
      const variantName = combination.join(" - ");
      const priceAdjustment = index * 20000;
      const price = baseProduct.price + priceAdjustment;
      const discount = index % 3 === 0 ? 10 : 5;

      models.push({
        name: `${baseProduct.name} - ${variantName}`,
        price: price,
        discount_percentage: discount,
        sale_price: Math.round((price * (100 - discount)) / 100),
        stock: 8 + index * 3,
        model_sku: `MODEL-${Date.now()}-${index}`,
        tier_index: combination.map((_, idx) => idx),
      });
    });

    return { models, tiers: tier_variations };
  }

  createDefaultVariants(baseProduct, index) {
    const sizes = ["Nhỏ", "Vừa", "Lớn"];

    return sizes.map((size, idx) => ({
      name: `${baseProduct.name} - ${size}`,
      price: baseProduct.price + idx * 30000,
      discount_percentage: idx === 0 ? 10 : 5,
      sale_price: Math.round(
        ((baseProduct.price + idx * 30000) * (100 - (idx === 0 ? 10 : 5))) / 100
      ),
      stock: 10 + idx * 5,
      model_sku: `DF-${Date.now()}-${idx}`,
      tier_index: [idx],
    }));
  }

  generateCombinations(tiers) {
    if (tiers.length === 0) return [];
    if (tiers.length === 1) return tiers[0].options.map((opt) => [opt]);

    const result = [];
    const firstTier = tiers[0];
    const restCombinations = this.generateCombinations(tiers.slice(1));

    firstTier.options.forEach((option) => {
      if (restCombinations.length > 0) {
        restCombinations.forEach((comb) => {
          result.push([option, ...comb]);
        });
      } else {
        result.push([option]);
      }
    });

    return result.slice(0, 6); // Giới hạn tối đa 6 biến thể
  }

  generateSmartTags() {
    const categoryTags = {
      "Thời Trang Nam": [
        "thời trang nam",
        "áo thun",
        "quần jeans",
        "phong cách",
        "basic",
        "sale",
      ],
      "Thời Trang Nữ": [
        "thời trang nữ",
        "váy đầm",
        "áo kiểu",
        "nữ tính",
        "thời trang",
        "sale",
      ],
      "Điện Thoại & Phụ Kiện": [
        "điện thoại",
        "phụ kiện",
        "công nghệ",
        "chính hãng",
        "sale",
      ],
      "Mẹ & Bé": ["mẹ và bé", "đồ sơ sinh", "an toàn", "chất lượng", "sale"],
      "Nhà Cửa & Đời Sống": [
        "nhà cửa",
        "đời sống",
        "gia dụng",
        "tiện ích",
        "sale",
      ],
    };

    const baseTags = categoryTags[this.category.display_name] || [
      "sản phẩm",
      "chất lượng",
      "sale",
    ];
    const additionalTags = [
      "giá tốt",
      "giao nhanh",
      "uy tín",
      "chất lượng cao",
    ];

    return [...baseTags.slice(0, 3), ...additionalTags.slice(0, 2)];
  }

  getProductImages() {
    const categoryImages = {
      "Thời Trang Nam": [
        "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lq48pn0sqdjc8f",
      ],
      "Thời Trang Nữ": [
        "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lq48pn0sqdjc8f",
      ],
      "Điện Thoại & Phụ Kiện": [
        "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lq48pn0sqdjc8f",
      ],
      default: [
        "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-lq48pn0sqdjc8f",
      ],
    };

    return (
      categoryImages[this.category.display_name] || categoryImages["default"]
    );
  }
}

// ========= QUẢN LÝ ATTRIBUTES THẬT =========
class RealAttributeManager {
  constructor() {
    this.attributeCache = new Map();
  }

  async initialize(categoryAttributes) {
    for (const attr of categoryAttributes) {
      const key = this.normalizeKey(attr.label);
      this.attributeCache.set(key, {
        id: attr._id,
        label: attr.label,
        name: attr.name,
      });
    }
    console.log(`📋 Đã tải ${this.attributeCache.size} attributes từ danh mục`);
  }

  normalizeKey(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .toLowerCase();
  }

  async processProductAttributes(productAttributes) {
    const results = [];

    for (const attr of productAttributes || []) {
      if (attr.attribute && attr.value) {
        const normalizedKey = this.normalizeKey(attr.attribute);
        const dbAttribute = this.attributeCache.get(normalizedKey);

        if (dbAttribute) {
          results.push({
            attribute_id: dbAttribute.id,
            value: String(attr.value).substring(0, 100),
          });
        } else {
          console.log(`⚠ Attribute không tồn tại: ${attr.attribute}`);
        }
      }
    }

    // Thêm attributes mặc định nếu cần
    if (results.length === 0 && this.attributeCache.size > 0) {
      const defaultAttrs = Array.from(this.attributeCache.values()).slice(0, 2);
      for (const attr of defaultAttrs) {
        results.push({
          attribute_id: attr.id,
          value: "Mặc định",
        });
      }
    }

    return results;
  }
}

// ========= CLI CHUYÊN NGHIỆP =========
class ProfessionalCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.startTime = Date.now();
  }

  question(query) {
    return new Promise((resolve) => {
      this.rl.question(`\x1b[36m${query}\x1b[0m `, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  logSuccess(message) {
    console.log(`\x1b[32m✓ ${message}\x1b[0m`);
  }

  logError(message) {
    console.log(`\x1b[31m✗ ${message}\x1b[0m`);
  }

  logInfo(message) {
    console.log(`\x1b[34mℹ ${message}\x1b[0m`);
  }

  close() {
    this.rl.close();
  }

  getElapsedTime() {
    return Date.now() - this.startTime;
  }

  displayHeader(title) {
    console.log(`\n\x1b[1m${"=".repeat(60)}`);
    console.log(`🎯 ${title}`);
    console.log(`${"=".repeat(60)}\x1b[0m\n`);
  }

  async displayCategoryMenu(categories) {
    console.log(`\n\x1b[1m📦 DANH SÁCH DANH MỤC:\x1b[0m`);
    categories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ${cat.display_name}`);
    });

    const choice = await this.question(
      `\nChọn danh mục (1-${categories.length}): `
    );
    return parseInt(choice) - 1;
  }
}

// ========= CORE SEEDER =========
class SmartProductSeeder {
  static async createProducts(
    products,
    category,
    seller,
    attributeManager,
    cli
  ) {
    const createdProducts = [];
    const location = {
      city: seller?.shop?.addressShop?.city || "Hà Nội",
      country: seller?.shop?.addressShop?.country || "Việt Nam",
    };

    console.log(`🚀 Bắt đầu tạo ${products.length} sản phẩm...`);

    for (let i = 0; i < products.length; i++) {
      const productData = products[i];

      try {
        // Xử lý attributes với attribute manager
        const processedAttributes =
          await attributeManager.processProductAttributes(
            productData.attributes
          );

        // Đảm bảo images là mảng string
        const images = Array.isArray(productData.images)
          ? productData.images.map((img) => String(img))
          : [String(productData.images)];

        const productDoc = new Product({
          name: productData.name,
          description: productData.description,
          category_id: category._id,
          shop_id: seller._id,
          tags: productData.tags,
          meta_title: productData.meta_title,
          meta_description: productData.meta_description,
          images: images,
          video_info_list: [],
          price: productData.price,
          stock: productData.stock,
          discount_percentage: productData.discount_percentage,
          sale_price: productData.sale_price,
          has_model: productData.has_model,
          tier_variations: productData.tier_variations || [],
          models: productData.models || [],
          attributes: processedAttributes,
          logistic_info: [
            {
              logistic_id: 1,
              enabled: true,
              shipping_fee: 25000,
              is_free: false,
            },
          ],
          pre_order: { is_pre_order: false, days_to_ship: 0 },
          condition: productData.condition,
          sellerStatus: productData.sellerStatus,
          isActive: true,
          location: location,
          promotions: [],
        });

        productDoc._user = seller;

        const savedProduct = await productDoc.save();

        const productType = productData.has_model
          ? `BIẾN THỂ (${productData.models?.length || 0} models)`
          : "ĐƠN";

        cli.logSuccess(
          `[${i + 1}] ${productType}: ${
            productData.name
          } - ${productData.price.toLocaleString()}đ`
        );

        createdProducts.push(savedProduct);
      } catch (error) {
        cli.logError(
          `Lỗi sản phẩm ${i + 1} "${productData.name}": ${error.message}`
        );
      }

      // Nghỉ giữa các sản phẩm
      if (i < products.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(
      `✅ Đã tạo ${createdProducts.length}/${products.length} sản phẩm`
    );
    return createdProducts;
  }
}

// ========= MAIN EXECUTION =========
async function main() {
  const cli = new ProfessionalCLI();

  try {
    cli.displayHeader("SEEDER SẢN PHẨM THÔNG MINH - KHÔNG DÙNG AI");

    // Kết nối database
    cli.logInfo("Đang kết nối database...");
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    cli.logSuccess("Kết nối MongoDB thành công");

    // Chọn seller
    const username = await cli.question("Username seller: ");
    const seller = await Account.findOne({ username, role: "seller" }).populate(
      "shop"
    );

    if (!seller) {
      cli.logError("Seller không tồn tại!");
      return;
    }

    if (!seller.isActive) {
      cli.logError("Seller đã bị khóa!");
      return;
    }

    cli.logInfo(`Shop: ${seller.shop?.shopName || "Chưa có tên"}`);

    // Lấy danh mục
    const categories = await Category.find({ is_active: true }).populate(
      "attributes"
    );
    if (categories.length === 0) {
      cli.logError("Không có danh mục!");
      return;
    }

    const categoryIndex = await cli.displayCategoryMenu(categories);
    const selectedCategory = categories[categoryIndex];
    cli.logSuccess(`Đã chọn: ${selectedCategory.display_name}`);

    // Nhập số lượng
    const totalProducts = Math.min(
      20,
      Math.max(1, parseInt(await cli.question("Số sản phẩm (1-20): ")) || 10)
    );

    const variantCount = Math.min(
      totalProducts,
      parseInt(
        await cli.question(`Sản phẩm biến thể (0-${totalProducts}): `)
      ) || 0
    );

    cli.logInfo(`Sẽ tạo: ${totalProducts} sản phẩm (${variantCount} biến thể)`);

    // Khởi tạo Attribute Manager
    const attributeManager = new RealAttributeManager();
    await attributeManager.initialize(selectedCategory.attributes);

    // Tạo sản phẩm với Smart Engine
    cli.logInfo("🔄 Đang tạo sản phẩm thông minh...");
    const productEngine = new SmartProductEngine(
      seller,
      selectedCategory,
      selectedCategory.attributes
    );
    const products = productEngine.generateProducts(
      totalProducts,
      variantCount
    );

    // Tạo sản phẩm trong database
    const createdProducts = await SmartProductSeeder.createProducts(
      products,
      selectedCategory,
      seller,
      attributeManager,
      cli
    );

    // Kết quả
    const totalTime = cli.getElapsedTime();
    console.log(`\n${"=".repeat(50)}`);
    console.log(`🎉 HOÀN THÀNH TRONG ${totalTime}ms`);
    console.log(`${"=".repeat(50)}`);

    const variantProducts = createdProducts.filter((p) => p.has_model);
    const simpleProducts = createdProducts.filter((p) => !p.has_model);

    console.log(
      `📊 Kết quả: ${createdProducts.length}/${totalProducts} sản phẩm`
    );
    console.log(`🔄 Biến thể: ${variantProducts.length} sản phẩm`);
    console.log(`⚡ Đơn giản: ${simpleProducts.length} sản phẩm`);

    if (variantProducts.length > 0) {
      const totalModels = variantProducts.reduce(
        (sum, p) => sum + p.models.length,
        0
      );
      console.log(`📋 Tổng biến thể: ${totalModels} models`);
    }

    // Cập nhật số lượng sản phẩm
    if (seller.shop && createdProducts.length > 0) {
      seller.shop.productsCount =
        (seller.shop.productsCount || 0) + createdProducts.length;
      await seller.save();
      cli.logSuccess(`Đã cập nhật shop: ${seller.shop.productsCount} sản phẩm`);
    }

    if (createdProducts.length > 0) {
      const avgTime = (totalTime / createdProducts.length).toFixed(0);
      cli.logInfo(`Tốc độ trung bình: ${avgTime}ms/sản phẩm`);
    }

    cli.logSuccess("Seeder hoàn tất thành công! 🚀");
  } catch (error) {
    cli.logError(`Lỗi hệ thống: ${error.message}`);
  } finally {
    cli.close();
    await mongoose.connection.close();
  }
}

// Chạy chương trình
main().catch(console.error);

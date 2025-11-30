import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Select,
  Input,
  Row,
  Col,
  Upload,
  Switch,
  InputNumber,
  Space,
  Card,
  Typography,
  message,
  Spin,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  SyncOutlined,
  DeleteOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import CommonInput from "../../../components/common/CommonInput";
import { httpGet, httpPut } from "../../../services/httpService";
import { useRef } from "react";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const definedLogistics = [
  { id: 1, name: "Giao Hàng Nhanh (GHN)", fee: 35000 },
  { id: 2, name: "J&T Express", fee: 25000 },
  { id: 3, name: "Giao Hàng Tiết Kiệm (GHTK)", fee: 15000 },
];

const cartesianProduct = (arrays) =>
  arrays.reduce(
    (acc, curr) => acc.map((a) => curr.map((c) => a.concat([c]))).flat(),
    [[]]
  );

const SizeOptions = ({ value, onChange }) => {
  const selectValue = value
    ? value.map((item) => (typeof item === "string" ? item : item.option_name))
    : [];

  const handleChange = (newValue) => {
    const newOptions = newValue.map((opt) => ({ option_name: opt }));
    onChange(newOptions);
  };

  return (
    <Select
      mode="tags"
      style={{ width: "100%" }}
      placeholder="Nhập size (S, M, L...)"
      value={selectValue}
      onChange={handleChange}
      tokenSeparators={[",", ";"]}
    />
  );
};
const VariantImageUpload = ({ tierIdx, optIdx, value, onChange }) => {
  const handleSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      onChange({ file, preview });
    }
  };

  const clearImage = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  const hasImage = value && value.preview;

  return (
    <div
      style={{
        width: 90,
        height: 90,
        border: "1px dashed #bbb",
        borderRadius: 6,
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        background: "#fafafa",
      }}
      onClick={() =>
        document.getElementById(`input-${tierIdx}-${optIdx}`).click()
      }
    >
      {hasImage ? (
        <>
          <img
            src={value.preview}
            alt="preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            size="small"
            style={{ position: "absolute", top: 2, right: 2 }}
            onClick={clearImage}
          />
        </>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "#666",
            fontSize: 12,
          }}
        >
          <PlusOutlined />
          <div>Ảnh</div>
        </div>
      )}
      <input
        id={`input-${tierIdx}-${optIdx}`}
        type="file"
        accept="image/*"
        onChange={handleSelect}
        style={{ display: "none" }}
      />
    </div>
  );
};

const EditProduct = () => {
  const [form] = Form.useForm();
  const isInitialLoad = useRef(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [hasModel, setHasModel] = useState(false);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [variantFiles, setVariantFiles] = useState({});
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [isAttributeLoading, setIsAttributeLoading] = useState(false);

  const selectedCategoryId = Form.useWatch("category_id", form);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          httpGet(`/seller/products/${id}`),
          httpGet("/admin/categories?limit=1000"),
        ]);

        if (productRes.success && categoriesRes.success) {
          const product = productRes.data;
          setCategories(categoriesRes.data);

          const formattedAttributes =
            product.attributes?.map((attr) => ({
              attribute_id: attr.attribute_id?._id || attr.attribute_id,
              value: attr.value,
              _id: attr._id,
            })) || [];

          const existingLogistics = (product.logistic_info || []).reduce(
            (acc, log) => {
              acc[log.logistic_id] = log;
              return acc;
            },
            {}
          );
          const formattedLogistics = definedLogistics.map((defLog) => {
            const existing = existingLogistics[defLog.id];
            return {
              logistic_id: defLog.id,
              name: defLog.name,
              shipping_fee: defLog.fee,
              enabled: existing ? existing.enabled : false,
              is_free: existing ? existing.is_free : false,
            };
          });

          const formValues = {
            ...product,
            category_id: product.category_id?._id || product.category_id,
            attributes: formattedAttributes,
            pre_order: product.pre_order || { is_pre_order: false },
            is_pre_order: product.pre_order?.is_pre_order || false,
            logistic_info: formattedLogistics,
            status: product.status || "DRAFT",
            tier_variations:
              product.tier_variations?.map((tier) => ({
                ...tier,
                options: tier.options.map((opt) =>
                  typeof opt === "string" ? { option_name: opt } : opt
                ),
              })) || [],
          };
          form.setFieldsValue(formValues);

          setFileList(
            product.images?.map((url, index) => ({
              uid: `existing-${index}`,
              name: `image-${index}`,
              status: "done",
              url: url,
            })) || []
          );
          const initialVariantFiles = {};
          (product.tier_variations || []).forEach((tier, tierIdx) => {
            if (tier.images && tier.images.length > 0) {
              initialVariantFiles[tierIdx] = {};
              tier.images.forEach((imgUrl, optIdx) => {
                if (imgUrl) {
                  initialVariantFiles[tierIdx][optIdx] = {
                    preview: imgUrl,
                    file: null,
                  };
                }
              });
            }
          });
          setVariantFiles(initialVariantFiles);

          setHasModel(product.has_model || false);
          setIsPreOrder(product.pre_order?.is_pre_order || false);

          if (formValues.category_id) {
            const attrsRes = await httpGet(
              `/seller/attributes/category/${formValues.category_id}`
            );
            if (attrsRes.success) {
              setAttributes(attrsRes.data);
            }
          }
        } else {
          message.error("Không thể tải thông tin sản phẩm");
          navigate("/seller/products");
        }
      } catch (error) {
        message.error("Lỗi khi tải dữ liệu sản phẩm");
        navigate("/seller/products");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProductData();
  }, [id, form, navigate]);

  useEffect(() => {
    if (selectedCategoryId) {
      setIsAttributeLoading(true);
      httpGet(`/seller/attributes/category/${selectedCategoryId}`)
        .then((res) => {
          if (res.success) {
            setAttributes(res.data);
          } else {
            setAttributes([]);
          }
        })
        .catch(() => {
          setAttributes([]);
        })
        .finally(() => {
          setIsAttributeLoading(false);
        });
    } else {
      setAttributes([]);
    }
  }, [selectedCategoryId]);

  const handleFileChange = ({ fileList: newFileList }) =>
    setFileList(newFileList);
  const beforeUpload = () => false;

  const handleGenerateModels = () => {
    const tiers = form.getFieldValue("tier_variations") || [];
    const validTiers = tiers
      .map((tier) => ({
        name: tier.name,
        options: (tier.options || [])
          .map((opt) => opt.option_name)
          .filter(Boolean),
      }))
      .filter((t) => t.name && t.options.length > 0);

    if (validTiers.length === 0) {
      form.setFieldValue("models", []);
      return;
    }

    const optionArrays = validTiers.map((t) => t.options);
    const indexArrays = validTiers.map((t) =>
      t.options.map((_, index) => index)
    );
    const modelNamesProduct = cartesianProduct(optionArrays);
    const modelIndicesProduct = cartesianProduct(indexArrays);

    const existingModels = (form.getFieldValue("models") || []).reduce(
      (acc, model) => {
        acc[model.name] = model;
        return acc;
      },
      {}
    );

    const newModels = modelNamesProduct.map((nameArray, i) => {
      const name = nameArray.join(", ");
      const existing = existingModels[name];
      return (
        existing || {
          name: name,
          tier_index: modelIndicesProduct[i],
          price: 0,
          stock: 0,
          discount_percentage: 0,
          model_sku: "",
        }
      );
    });

    form.setFieldValue("models", newModels);
    message.success(`Đã cập nhật ${newModels.length} phân loại sản phẩm.`);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    const formData = new FormData();

    const newFiles = fileList.filter((f) => f.originFileObj);
    const oldUrls = fileList.filter((f) => !f.originFileObj).map((f) => f.url);

    if (newFiles.length === 0 && oldUrls.length === 0) {
      message.error("Sản phẩm phải có ít nhất 1 hình ảnh.");
      setLoading(false);
      return;
    }

    newFiles.forEach((file) => {
      formData.append("new_main_images", file.originFileObj);
    });
    const processedImages = [
      ...oldUrls,
      ...newFiles.map((_, index) => `TEMP_MAIN_${index}`),
    ];
    formData.append("images", JSON.stringify(processedImages));

    const processedTiers = (values.tier_variations || []).map(
      (tier, tierIdx) => {
        const newTier = { name: tier.name, options: [], images: [] };
        (tier.options || []).forEach((option, optIdx) => {
          newTier.options.push(option.option_name);

          const variantFile = variantFiles[tierIdx]?.[optIdx];

          if (variantFile && variantFile.file) {
            const placeholder = `TEMP_${tierIdx}_${optIdx}`;
            formData.append(placeholder, variantFile.file);
            newTier.images.push(placeholder);
          } else if (variantFile && variantFile.preview) {
            newTier.images.push(variantFile.preview);
          } else {
            newTier.images.push("");
          }
        });
        return newTier;
      }
    );
    formData.append("tier_variations", JSON.stringify(processedTiers));

    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("category_id", values.category_id);
    formData.append("condition", values.condition);
    formData.append("status", values.status || "DRAFT");
    formData.append("meta_title", values.meta_title || "");
    formData.append("meta_description", values.meta_description || "");

    formData.append("attributes", JSON.stringify(values.attributes || []));
    formData.append("tags", JSON.stringify(values.tags || []));
    formData.append(
      "video_info_list",
      JSON.stringify(values.video_info_list || [])
    );
    formData.append(
      "logistic_info",
      JSON.stringify(values.logistic_info || [])
    );
    const preOrderData = {
      is_pre_order: values.is_pre_order || false,
      days_to_ship: values.days_to_ship || null,
    };
    formData.append("pre_order", JSON.stringify(preOrderData));
    formData.append("has_model", hasModel);

    if (hasModel) {
      formData.append("models", JSON.stringify(values.models || []));
    } else {
      if (values.price === undefined || values.stock === undefined) {
        message.error(
          "Sản phẩm không có biến thể bắt buộc phải có 'price' và 'stock'."
        );
        setLoading(false);
        return;
      }
      formData.append("price", values.price);
      formData.append("stock", values.stock);
      formData.append("discount_percentage", values.discount_percentage || 0);
    }
  
    try {
      const res = await httpPut(`/seller/product/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        showMessage: false,
      });
      if (res.success) {
        message.success("Cập nhật sản phẩm thành công!");
        navigate("/seller/products");
      } else {
        message.error(res.message || "Lỗi cập nhật sản phẩm");
      }
    } catch (error) {
      message.error(error.message || "Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div>Đang tải thông tin sản phẩm...</div>
      </div>
    );
  }

  return (
    <Card>
      <Title level={3}>Chỉnh Sửa Sản Phẩm</Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Card title="1. Thông tin cơ bản" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true }]}
              >
                <CommonInput />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category_id"
                label="Danh mục"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  loading={isCategoryLoading}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {categories.map((cat) => (
                    <Option key={cat._id} value={cat._id}>
                      {cat.display_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="Mô tả sản phẩm"
            rules={[{ required: true }]}
          >
            <TextArea rows={6} />
          </Form.Item>
        </Card>

        <Card title="2. Thuộc tính chi tiết" style={{ marginBottom: 16 }}>
          <Spin spinning={isAttributeLoading}>
            <Form.List name="attributes">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <Row key={key} gutter={16} align="baseline">
                      <Col span={10}>
                        <Form.Item
                          {...restField}
                          name={[name, "attribute_id"]}
                          label={index === 0 ? "Thuộc tính" : ""}
                          rules={[{ required: true }]}
                        >
                          <Select
                            placeholder="Chọn thuộc tính"
                            disabled={!selectedCategoryId}
                            onChange={() => {
                              const attrs = form.getFieldValue("attributes");
                              attrs[name].value = undefined;
                              form.setFieldsValue({ attributes: attrs });
                            }}
                          >
                            {attributes.map((attr) => (
                              <Option key={attr._id} value={attr._id}>
                                {attr.label}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          noStyle
                          dependencies={[["attributes", name, "attribute_id"]]}
                        >
                          {() => {
                            const attributeId = form.getFieldValue([
                              "attributes",
                              name,
                              "attribute_id",
                            ]);
                            const details = attributes.find(
                              (a) => a._id === attributeId
                            );
                            let inputComponent = (
                              <CommonInput
                                placeholder="Vui lòng chọn thuộc tính"
                                disabled={!attributeId}
                              />
                            );
                            if (details) {
                              switch (details.input_type) {
                                case "select":
                                  inputComponent = (
                                    <Select placeholder="Chọn một giá trị">
                                      {details.options.map((opt) => (
                                        <Option key={opt} value={opt}>
                                          {opt}
                                        </Option>
                                      ))}
                                    </Select>
                                  );
                                  break;
                                case "multiselect":
                                  inputComponent = (
                                    <Select
                                      mode="multiple"
                                      placeholder="Chọn một hoặc nhiều giá trị"
                                    >
                                      {details.options.map((opt) => (
                                        <Option key={opt} value={opt}>
                                          {opt}
                                        </Option>
                                      ))}
                                    </Select>
                                  );
                                  break;
                                case "number":
                                  inputComponent = (
                                    <InputNumber
                                      style={{ width: "100%" }}
                                      placeholder="Nhập giá trị số"
                                    />
                                  );
                                  break;
                                default:
                                  inputComponent = (
                                    <CommonInput placeholder="Nhập giá trị văn bản" />
                                  );
                              }
                            }
                            return (
                              <Form.Item
                                {...restField}
                                name={[name, "value"]}
                                label={index === 0 ? "Giá trị" : ""}
                                rules={[{ required: true }]}
                              >
                                {inputComponent}
                              </Form.Item>
                            );
                          }}
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                      disabled={!selectedCategoryId || attributes.length === 0}
                    >
                      Thêm thuộc tính
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
            {!selectedCategoryId && (
              <Text type="secondary">
                Vui lòng chọn Danh mục ở mục 1 để thêm thuộc tính.
              </Text>
            )}
          </Spin>
        </Card>

        <Card title="3. Phân loại & Kho hàng" style={{ marginBottom: 16 }}>
          <Form.Item
            name="has_model"
            label="Bật phân loại sản phẩm (Biến thể)"
            valuePropName="checked"
          >
            <Switch
              onChange={(checked) => {
                setHasModel(checked);
              }}
            />
          </Form.Item>
          <hr style={{ margin: "16px 0" }} />
          {!hasModel && (
            <Card title="3.1. Giá & Kho hàng" bordered={false}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="price"
                    label="Giá gốc"
                    rules={[{ required: !hasModel }]}
                  >
                    <InputNumber min={1} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="discount_percentage" label="% Giảm giá">
                    <InputNumber min={0} max={100} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="stock"
                    label="Kho hàng"
                    rules={[{ required: !hasModel }]}
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="low_stock_threshold"
                    label="Ngưỡng báo tồn kho"
                  >
                    <InputNumber min={0} style={{ width: "100%" }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          )}

          {hasModel && (
            <Card title="3. Biến thể sản phẩm" style={{ marginBottom: 16 }}>
              <Title level={5}>3.1. Tầng biến thể</Title>
              <Form.List name="tier_variations">
                {(fields, { add, remove }) => (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    {fields.map(({ key, name: tierName, ...restField }) => (
                      <Card size="small" key={key}>
                        <Row gutter={16} align="middle">
                          <Col span={8}>
                            <Form.Item
                              {...restField}
                              name={[tierName, "name"]}
                              label="Tên tầng"
                              rules={[{ required: true }]}
                            >
                              <CommonInput />
                            </Form.Item>
                          </Col>
                          <Col span={14}>
                            {tierName === 0 ? (
                              <Form.List name={[tierName, "options"]}>
                                {(
                                  optFields,
                                  { add: addOpt, remove: removeOpt }
                                ) => (
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 8,
                                    }}
                                  >
                                    {optFields.map(
                                      ({
                                        key: optKey,
                                        name: optName,
                                        ...optRest
                                      }) => (
                                        <Row
                                          key={optKey}
                                          gutter={8}
                                          align="middle"
                                        >
                                          <Col span={8}>
                                            <Form.Item
                                              {...optRest}
                                              name={[optName, "option_name"]}
                                              rules={[{ required: true }]}
                                            >
                                              <CommonInput placeholder="Tên tùy chọn" />
                                            </Form.Item>
                                          </Col>
                                          <Col span={8}>
                                            <VariantImageUpload
                                              tierIdx={tierName}
                                              optIdx={optName}
                                              value={
                                                variantFiles[tierName]?.[
                                                  optName
                                                ]
                                              }
                                              onChange={(newValue) => {
                                                setVariantFiles((prev) => ({
                                                  ...prev,
                                                  [tierName]: {
                                                    ...(prev[tierName] || {}),
                                                    [optName]: newValue,
                                                  },
                                                }));
                                              }}
                                            />
                                          </Col>
                                          <Col span={1}>
                                            <MinusCircleOutlined
                                              onClick={() => {
                                                removeOpt(optName);
                                              }}
                                            />
                                          </Col>
                                        </Row>
                                      )
                                    )}
                                    <Button
                                      type="dashed"
                                      onClick={() => addOpt()}
                                      block
                                      icon={<PlusOutlined />}
                                    >
                                      Thêm tùy chọn màu
                                    </Button>
                                  </div>
                                )}
                              </Form.List>
                            ) : (
                              // Tầng 2 (Size)
                              <Form.Item
                                {...restField}
                                name={[tierName, "options"]}
                                label="Các tùy chọn size"
                                rules={[{ required: true }]}
                              >
                                <SizeOptions />
                              </Form.Item>
                            )}
                          </Col>
                          <Col span={1}>
                            <MinusCircleOutlined
                              onClick={() => remove(tierName)}
                            />
                          </Col>
                        </Row>
                      </Card>
                    ))}
                    {fields.length < 2 && (
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm tầng biến thể
                      </Button>
                    )}
                  </div>
                )}
              </Form.List>

              <Row style={{ margin: "16px 0" }}>
                <Col>
                  <Space>
                    <Button
                      type="primary"
                      icon={<SyncOutlined />}
                      onClick={handleGenerateModels}
                    >
                      Tạo/Cập nhật danh sách
                    </Button>
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => form.setFieldValue("models", [])}
                    >
                      Xóa danh sách
                    </Button>
                  </Space>
                </Col>
              </Row>

              <Title level={5}>3.2. Danh sách phân loại</Title>
              <Form.List name="models">
                {(fields) => (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <Row gutter={8} align="middle" style={{ opacity: 0.7 }}>
                      <Col span={6}>
                        <Text strong>Tên biến thể</Text>
                      </Col>
                      <Col span={5}>
                        <Text strong>Giá gốc</Text>
                      </Col>
                      <Col span={4}>
                        <Text strong>% Giảm</Text>
                      </Col>
                      <Col span={4}>
                        <Text strong>Kho</Text>
                      </Col>
                      <Col span={4}>
                        <Text strong>SKU</Text>
                      </Col>
                    </Row>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={8} align="middle">
                        <Col span={6}>
                          <Form.Item {...restField} name={[name, "name"]}>
                            <CommonInput disabled />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, "price"]}
                            rules={[{ required: true }]}
                          >
                            <InputNumber min={1} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "discount_percentage"]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item
                            {...restField}
                            name={[name, "stock"]}
                            rules={[{ required: true }]}
                          >
                            <InputNumber min={0} style={{ width: "100%" }} />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Form.Item {...restField} name={[name, "model_sku"]}>
                            <CommonInput placeholder="Tự động" />
                          </Form.Item>
                        </Col>
                        <Col span={1}>
                          <MinusCircleOutlined
                            onClick={() => {
                              /* ... (xóa model) ... */
                            }}
                          />
                        </Col>
                      </Row>
                    ))}
                  </div>
                )}
              </Form.List>
            </Card>
          )}
        </Card>

        <Card title="4. Hình ảnh & Video" style={{ marginBottom: 16 }}>
          <Form.Item
            label="Ảnh sản phẩm chính"
            rules={[
              {
                validator: () =>
                  fileList.filter((f) => !f.originFileObj).length > 0 ||
                  fileList.filter((f) => f.originFileObj).length > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error("Cần ít nhất 1 ảnh")),
              },
            ]}
          >
            <Upload.Dragger
              listType="picture-card"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              multiple
              accept="image/*"
              maxCount={10}
            >
              <p>
                <UploadOutlined />
              </p>
              <p>Nhấp hoặc kéo thả ảnh</p>
            </Upload.Dragger>
          </Form.Item>
        </Card>
        <Card
          title="5. Vận chuyển & Hàng đặt trước"
          style={{ marginBottom: 16 }}
        >
          <Title level={5}>Cài đặt vận chuyển</Title>
          <Form.List name="logistic_info">
            {(fields) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  border: "1px solid #f0f0f0",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                {fields.map(({ key, name, ...restField }) => {
                  const logisticName = form.getFieldValue([
                    "logistic_info",
                    name,
                    "name",
                  ]);
                  const logisticFee = form.getFieldValue([
                    "logistic_info",
                    name,
                    "shipping_fee",
                  ]);
                  return (
                    <Row key={key} gutter={16} align="middle">
                      <Form.Item
                        {...restField}
                        name={[name, "logistic_id"]}
                        noStyle
                      >
                        <Input type="hidden" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "shipping_fee"]}
                        noStyle
                      >
                        <Input type="hidden" />
                      </Form.Item>
                      <Form.Item {...restField} name={[name, "name"]} noStyle>
                        <Input type="hidden" />
                      </Form.Item>

                      <Col span={10}>
                        <Text strong>{logisticName}</Text>
                        <div>
                          Phí: {logisticFee?.toLocaleString("vi-VN")} VNĐ
                        </div>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, "enabled"]}
                          label="Bật/Tắt"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          noStyle
                          dependencies={[["logistic_info", name, "enabled"]]}
                        >
                          {() => (
                            <Form.Item
                              {...restField}
                              name={[name, "is_free"]}
                              label="Miễn phí"
                              valuePropName="checked"
                            >
                              <Switch
                                disabled={
                                  !form.getFieldValue([
                                    "logistic_info",
                                    name,
                                    "enabled",
                                  ])
                                }
                              />
                            </Form.Item>
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                  );
                })}
              </div>
            )}
          </Form.List>

          <hr style={{ margin: "24px 0" }} />
          <Title level={5}>Hàng đặt trước</Title>
          <Form.Item
            name="is_pre_order"
            label="Là hàng đặt trước?"
            valuePropName="checked"
          >
            <Switch onChange={setIsPreOrder} />
          </Form.Item>
          {isPreOrder && (
            <Form.Item
              name={["pre_order", "days_to_ship"]}
              label="Số ngày cần để chuẩn bị hàng"
              rules={[{ required: true }]}
            >
              <InputNumber
                min={7}
                max={30}
                style={{ width: 200 }}
                addonAfter="ngày"
              />
            </Form.Item>
          )}
        </Card>

        <Card title="6. Thông tin khác" style={{ marginBottom: 16 }}>
          <Form.Item name="status" label="Trạng thái sản phẩm">
            <Select>
              <Option value="DRAFT">Lưu nháp</Option>
              <Option value="NORMAL">Đăng bán (Hiển thị)</Option>
              <Option value="UNLIST">Đăng bán (Ẩn)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="condition" label="Tình trạng sản phẩm">
            <Select>
              <Option value="NEW">Mới</Option>
              <Option value="USED">Đã sử dụng</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Select mode="tags" placeholder="Ví dụ: áo thun, cotton, ..." />
          </Form.Item>
          <Title level={5}>Thông tin SEO (Tùy chọn)</Title>
          <Form.Item name="meta_title" label="Meta Title">
            <CommonInput placeholder="Tiêu đề hiển thị trên Google" />
          </Form.Item>
          <Form.Item name="meta_description" label="Meta Description">
            <TextArea rows={2} placeholder="Mô tả ngắn hiển thị trên Google" />
          </Form.Item>
        </Card>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              Cập Nhật Sản Phẩm
            </Button>
            <Button size="large" onClick={() => navigate("/seller/products")}>
              Hủy
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditProduct;

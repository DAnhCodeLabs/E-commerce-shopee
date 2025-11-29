import React, { useState, useEffect } from "react";
import {
  Card,
  Descriptions,
  Tag,
  Image,
  List,
  Table,
  Space,
  Spin,
  Alert,
  Typography,
  Divider,
  Row,
  Col,
} from "antd";
import { useParams } from "react-router-dom";
import { httpGet } from "../../../services/httpService";

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await httpGet(`/seller/products/${id}`, {
          showMessage: false,
        });
        setProduct(response.data);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        style={{ margin: "20px" }}
      />
    );
  }

  if (!product) {
    return (
      <Alert
        message="Thông báo"
        description="Không tìm thấy thông tin sản phẩm"
        type="warning"
        showIcon
        style={{ margin: "20px" }}
      />
    );
  }
  const getAdminStatusTag = (isActive) => {
    return isActive ? (
      <Tag color="green">Đã duyệt (Mở khóa)</Tag>
    ) : (
      <Tag color="red">Bị khóa (Hệ thống)</Tag>
    );
  };
  const getSellerStatusTag = (status) => {
    const statusConfig = {
      NORMAL: { color: "green", text: "Đang bán" },
      UNLIST: { color: "orange", text: "Đã ẩn" },
      DRAFT: { color: "blue", text: "Bản nháp" },
      DELETED: { color: "red", text: "Đã xóa" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getConditionText = (condition) => {
    return condition === "NEW" ? "Mới" : "Đã qua sử dụng";
  };
  const modelColumns = [
    {
      title: "Tên biến thể",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.model_sku || "(Tự động)"}
          </Text>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price, record) => (
        <div>
          {record.discount_percentage > 0 ? (
            <>
              <Text delete type="secondary">
                {price?.toLocaleString()} ₫
              </Text>
              <br />
              <Text strong style={{ color: "#d0011b" }}>
                {record.sale_price?.toLocaleString()} ₫
              </Text>
              <br />
              <Tag color="red">-{record.discount_percentage}%</Tag>
            </>
          ) : (
            <Text strong>{price?.toLocaleString()} ₫</Text>
          )}
        </div>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
    },
  ];

  // Cột cho thuộc tính sản phẩm
  const attributeColumns = [
    {
      title: "Thuộc tính",
      dataIndex: ["attribute_id", "label"],
      key: "attribute",
      render: (label, record) => (
        <Text strong>
          {label || record.attribute_id?.name || "Thuộc tính không xác định"}
        </Text>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
      render: (value) => {
        if (Array.isArray(value)) {
          return value.join(", ");
        }
        return value;
      },
    },
  ];
  return (
    <Card>
      <div style={{ marginBottom: "24px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space align="center">
            <Title level={2} style={{ margin: 0 }}>
              {product.name}
            </Title>
            {getAdminStatusTag(product.isActive)}
            {getSellerStatusTag(product.sellerStatus)}
          </Space>
          <Text type="secondary">SKU Gốc: {product.sku}</Text>
          <Text type="secondary">Slug: {product.slug}</Text>
        </Space>
      </div>
      <Divider />
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {product.images && product.images.length > 0 && (
          <Col xs={24} md={12}>
            <Title level={4}>Hình ảnh sản phẩm</Title>
            <Image.PreviewGroup>
              <Space wrap>
                {product.images.map((image, index) => (
                  <Image
                    key={index}
                    width={150}
                    height={150}
                    src={image}
                    alt={`Product image ${index + 1}`}
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          </Col>
        )}
        {product.video_info_list && product.video_info_list.length > 0 && (
          <Col xs={24} md={12}>
            <Title level={4}>Video sản phẩm</Title>
            <List
              dataSource={product.video_info_list}
              renderItem={(video) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Image width={100} src={video.thumb_url} />}
                    title={
                      <a
                        href={video.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Xem Video
                      </a>
                    }
                    description={`Độ dài: ${video.duration || "N/A"}s`}
                  />
                </List.Item>
              )}
            />
          </Col>
        )}
      </Row>
      <Divider />
      <Title level={4}>Thông tin cơ bản</Title>
      <Descriptions bordered column={2} style={{ marginBottom: "24px" }}>
        <Descriptions.Item label="Danh mục">
          {product.category_id?.display_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Tình trạng">
          {getConditionText(product.condition)}
        </Descriptions.Item>
        <Descriptions.Item label="Mô tả" span={2}>
          <Paragraph
            ellipsis={{ rows: 5, expandable: true, symbol: "xem thêm" }}
          >
            {product.description || "(Không có mô tả)"}
          </Paragraph>
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      {product.has_model ? (
        <>
          <Title level={4}>Thông tin Phân loại & Biến thể</Title>
          {product.tier_variations &&
            product.tier_variations.map((tier, index) => (
              <div key={index} style={{ marginBottom: "16px" }}>
                <Title level={5}>{tier.name || `Phân loại ${index + 1}`}</Title>
                <Space wrap>
                  {tier.options &&
                    tier.options.map((option, optIndex) => (
                      <Card
                        key={optIndex}
                        size="small"
                        bodyStyle={{ textAlign: "center" }}
                      >
                        {tier.images && tier.images[optIndex] ? (
                          <Image
                            width={80}
                            height={80}
                            src={tier.images[optIndex]}
                            alt={option}
                            style={{
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 80,
                              height: 80,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "#f5f5f5",
                              borderRadius: "4px",
                            }}
                          >
                            (No-img)
                          </div>
                        )}
                        <div style={{ marginTop: "8px" }}>
                          <Text>{option}</Text>
                        </div>
                      </Card>
                    ))}
                </Space>
              </div>
            ))}
          <Title level={5} style={{ marginTop: "24px" }}>
            Chi tiết biến thể (Models)
          </Title>
          <Table
            columns={modelColumns}
            dataSource={product.models}
            rowKey={(record) => record.model_sku || record._id}
            pagination={false}
            style={{ marginBottom: "24px" }}
          />
        </>
      ) : (
        <>
          <Title level={4}>Thông tin Giá & Kho (Sản phẩm đơn)</Title>
          <Descriptions bordered column={2} style={{ marginBottom: "24px" }}>
            <Descriptions.Item label="Giá gốc">
              <Text strong style={{ fontSize: "16px" }}>
                {product.price?.toLocaleString()} ₫
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Giảm giá">
              <Text strong style={{ fontSize: "16px", color: "#d0011b" }}>
                -{product.discount_percentage || 0}%
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Giá bán cuối">
              <Text strong style={{ fontSize: "18px", color: "#d0011b" }}>
                {product.sale_price?.toLocaleString()} ₫
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tồn kho">
              <Text strong style={{ fontSize: "16px" }}>
                {product.stock}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngưỡng cảnh báo kho thấp">
              {product.low_stock_threshold || 5}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
      <Divider />
      {product.attributes && product.attributes.length > 0 && (
        <>
          <Title level={4}>Thuộc tính sản phẩm</Title>
          <Table
            columns={attributeColumns}
            dataSource={product.attributes}
            rowKey={(record) => record.attribute_id?._id || record._id}
            pagination={false}
            style={{ marginBottom: "24px" }}
          />
        </>
      )}
      <Title level={4}>Thông tin Vận chuyển & Kích thước</Title>
      <Descriptions bordered column={2} style={{ marginBottom: "16px" }}>
        <Descriptions.Item label="Đặt hàng trước" span={2}>
          {product.pre_order?.is_pre_order ? (
            <Tag color="purple">
              Có (Giao sau {product.pre_order.days_to_ship || "N/A"} ngày)
            </Tag>
          ) : (
            <Tag color="default">Không</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
      {product.logistic_info && product.logistic_info.length > 0 && (
        <List
          header={<Text strong>Các kênh vận chuyển hỗ trợ</Text>}
          bordered
          dataSource={product.logistic_info}
          renderItem={(logistic) => (
            <List.Item>
              <Space>
                <Tag color={logistic.enabled ? "green" : "red"}>
                  {logistic.enabled ? "Đang bật" : "Đang tắt"}
                </Tag>
                <Text>ID Kênh: {logistic.logistic_id}</Text>
                <Text>
                  {logistic.is_free
                    ? "(Miễn phí)"
                    : `(Phí: ${logistic.shipping_fee?.toLocaleString()} ₫)`}
                </Text>
              </Space>
            </List.Item>
          )}
          style={{ marginBottom: "24px" }}
        />
      )}
      <Divider />
      <Title level={4}>Thông tin đánh giá & Thống kê</Title>
      <Descriptions bordered column={2} style={{ marginBottom: "24px" }}>
        <Descriptions.Item label="Sao đánh giá">
          <Text strong style={{ color: "#fadb14", fontSize: "16px" }}>
            {product.item_rating?.rating_star || 0} / 5
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Tổng số đánh giá">
          {product.item_rating?.total_reviews || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Đã bán">
          {product.historical_sold || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Lượt thích">
          {product.liked_count || 0}
        </Descriptions.Item>
        <Descriptions.Item label="Phân phối đánh giá" span={2}>
          {product.item_rating?.ratings_distribution && (
            <Space direction="vertical" style={{ width: "100%" }}>
              {[5, 4, 3, 2, 1].map((star) => (
                <Text key={star}>
                  {star} Sao:{" "}
                  {product.item_rating.ratings_distribution[star] || 0}
                </Text>
              ))}
            </Space>
          )}
        </Descriptions.Item>
      </Descriptions>
      {(product.meta_title || product.meta_description || product.tags) && (
        <>
          <Divider />
          <Title level={4}>Thông tin SEO & Tags</Title>
          <Descriptions bordered column={1} style={{ marginBottom: "16px" }}>
            {product.meta_title && (
              <Descriptions.Item label="Meta Title">
                {product.meta_title}
              </Descriptions.Item>
            )}
            {product.meta_description && (
              <Descriptions.Item label="Meta Description">
                {product.meta_description}
              </Descriptions.Item>
            )}
          </Descriptions>
          {product.tags && product.tags.length > 0 && (
            <Space wrap>
              <Text strong>Tags:</Text>
              {product.tags.map((tag, index) => (
                <Tag key={index} color="blue">
                  {tag}
                </Tag>
              ))}
            </Space>
          )}
        </>
      )}
      <Divider />
      <Descriptions size="small" column={2}>
        <Descriptions.Item label="Ngày tạo">
          {new Date(product.createdAt).toLocaleString("vi-VN")}
        </Descriptions.Item>
        <Descriptions.Item label="Cập nhật lần cuối">
          {new Date(product.updatedAt).toLocaleString("vi-VN")}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default ProductDetail;

import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
const Dashboard = () => {
  return (
    <div>
      <Card title="Danh sách cần làm">
        <div className="flex justify-around items-center gap-4">
          <div className="flex flex-col items-center justify-center gap-2">
            <p>0</p>
            <p>Chờ duyệt</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <p>0</p>
            <p>Đã xử lý</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <p>0</p>
            <p>Đơn trả hàng/Hoàn tiền/Hủy</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <p>0</p>
            <p>Sản Phẩm Bị Tạm Khóa</p>
          </div>
        </div>
      </Card>
      <Card
        title={
          <div className="flex flex-col py-2">
            <p>Phân Tích Bán Hàng</p>
            <p className="text-gray-400 text-sm">
              Hôm nay 00:00 GMT +7 17:00(Dữ liệu thay đổi so với hôm qua)
            </p>
          </div>
        }
        extra={<a href="#">Xem thêm &gt;</a>}
        style={{ width: "100%" }}
      >
        <Row gutter={16} className="flex items-center justify-center">
          <Col span={6} className="text-center">
            <Statistic
              title="Doanh số"
              value={0}
              valueStyle={{ color: "#000" }}
              suffix={
                <span style={{ fontSize: "12px", color: "#cf1322" }}>
                  <ArrowDownOutlined /> 0.00%
                </span>
              }
            />
          </Col>
          <Col span={6} className="text-center">
            <Statistic
              title="Lượt truy cập"
              value={0}
              valueStyle={{ color: "#000" }}
              suffix={
                <span style={{ fontSize: "12px", color: "#cf1322" }}>
                  <ArrowDownOutlined /> 0.00%
                </span>
              }
            />
          </Col>
          <Col span={6} className="text-center">
            <Statistic
              title="Đơn hàng"
              value={0}
              valueStyle={{ color: "#000" }}
              suffix={
                <span style={{ fontSize: "12px", color: "#cf1322" }}>
                  <ArrowDownOutlined /> 0.00%
                </span>
              }
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;

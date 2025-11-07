import React from "react";
import { Table } from "antd";
// Bỏ bớt Input, Button, Space, SearchOutlined vì logic search đã chuyển ra ngoài
// để xử lý tìm kiếm phía server, không phải client-side nữa.

const CommonTable = ({
  columns,
  data,
  loading,
  onRowSelectionChange,
  pagination,
  onChange,
  rowKey,
  expandable,
}) => {

  const rowSelection = onRowSelectionChange
    ? {
        onChange: (selectedRowKeys, selectedRows) => {
          onRowSelectionChange(selectedRowKeys, selectedRows);
        },
      }
    : undefined;

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={onChange}
      rowKey={rowKey || "_id"}
      expandable={expandable} 
      bordered
      scroll={{ x: "max-content" }}
    />
  );
};

export default CommonTable;

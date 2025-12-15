import React, { useState, useEffect } from "react";
import { Button, Table, Card, Skeleton, Space } from "antd";
import axios from "axios";
import { TableOutlined, PrinterOutlined } from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";

export const BroadSheet = () => {
  const [dataSource, setDataSource] = useState([]);
  const { API_BASE_URL, token, loading, setLoading } = useApp();

  const getAllResults = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/api/records/admin/records?session=2025/2026&term=1`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const records = res.data.data || [];

      // ✅ Normalize EXACTLY for broadsheet
      const normalized = records.map((r) => ({
        key: r._id,
        student: r.student,
        firstAssignment: r.firstAssignment,
        secondAssignment: r.secondAssignment,
        firstCA: r.firstCA,
        secondCA: r.secondCA,
        exam: r.exam,
        total: r.total,
        teacherRemark: r.teacherRemark,
        present: "--", // not in API
      }));

      setDataSource(normalized);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllResults();
  }, []);

  // ✅ EXACT BROADSHEET HEADER
  const columns = [
    {
      title: "S/N",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "NAMES OF PUPILS",
      dataIndex: ["student", "fullName"],
      width: 260,
    },
    {
      title: "CLASS",
      dataIndex: ["student", "class"],
      width: 120,
    },
    {
      title: "ADMISSION NO.",
      dataIndex: ["student", "admissionNumber"],
      width: 180,
    },
    // {
    //   title: "NO. OF TIMES PRESENT",
    //   dataIndex: "present",
    //   width: 160,
    //   align: "center",
    // },
    {
      title: "SUBJECTS",
      children: [
        {
          title: "1ST ASS (10%)",
          dataIndex: "firstAssignment",
          align: "center",
        },
        {
          title: "2ND ASS (10%)",
          dataIndex: "secondAssignment",
          align: "center",
        },
        {
          title: "1ST CA TEST (20%)",
          dataIndex: "firstCA",
          align: "center",
        },
        {
          title: "2ND CA TEST (20%)",
          dataIndex: "secondCA",
          align: "center",
        },
      ],
    },
    {
      title: "EXAMS (40%)",
      dataIndex: "exam",
      align: "center",
    },
    {
      title: "TOTAL (100%)",
      dataIndex: "total",
      align: "center",
    },
    {
      title: "REMARK",
      dataIndex: "teacherRemark",
      width: 140,
    },
  ];

  return (
    <Card
      title={
        <Space>
          <TableOutlined />
          <span>Result Broadsheet</span>
        </Space>
      }
      extra={
        <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
          Print
        </Button>
      }
    >
      {loading ? (
        <Skeleton active />
      ) : (
        <Table
          columns={columns}
          dataSource={dataSource}
          bordered
          size="small"
          pagination={false}
          scroll={{ x: "max-content" }}
        />
      )}
    </Card>
  );
};

export default BroadSheet;

import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Space,
  Tabs,
  Skeleton,
  message,
} from "antd";
import {
  EditOutlined,
  BarChartOutlined,
  UserOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  FormOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import EnterResult from "../../../components/result/EnterResult";
import ProgressChart from "../../../components/progress/ProgressChart";
import ResultSheet from "../../../components/resultSheet/ResultSheet";
import axios from "axios";
import { useApp } from "../../../context/AppContext";

const { TabPane } = Tabs;

const MyClasses = () => {
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isViewResultModalOpen, setIsViewResultModalOpen] = useState(false);

  const [activeStudent, setActiveStudent] = useState(null);
  const [activeSubjects, setActiveSubjects] = useState(null);

  const { token, API_BASE_URL } = useApp();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [messageApi, contextHolder] = message.useMessage();
  const [subject, setsubjsect] = useState(null)

  const getTeacherClassDetails = async (pageParam = 1) => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/teacher/students?page=${pageParam}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      setsubjsect( res?.data?.subject)
      const response = res.data;

      messageApi.success(response.message || "Students fetched successfully");

      setStudents(response.students || []);
      setTotal(response.pagination?.total || 0);
      setPage(response.pagination?.page || 1);
    } catch (error) {
      console.error("Error:", error);
      messageApi.error("Unable to fetch students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeacherClassDetails(page);
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    getTeacherClassDetails(newPage);
  };

  // === Columns ===
  const studentColumns = [
    { title: "Reg No", dataIndex: "admissionNumber" },
    { title: "Name", dataIndex: "fullName" },
    {
      title: "Class",
      render: (_, record) =>
        record.class ? `${record.class.name}` : "Not Assigned",
    },
  ];

  const resultsColumns = [
    { title: "Reg No", dataIndex: "admissionNumber" },
    { title: "Name", dataIndex: "fullName" },
    {
      title: "Actions",
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            style={{ backgroundColor: "#52c41a" }}
            onClick={() => {
              setActiveStudent(record);
              console.log(record)
              setActiveSubjects(record.subjects );
              setIsResultModalOpen(true);
              teacherSubject={subject}
            }}
          >
            Enter
          </Button>

          <Button
            type="primary"
            size="small"
            icon={<FormOutlined />}
            onClick={() => {
              setActiveStudent(record);
              setIsResultModalOpen(true);
            }}
          >
            Edit
          </Button>

          <Button
            size="small"
            ghost
            icon={<EyeOutlined />}
            style={{ color: "#722ed1", borderColor: "#722ed1" }}
            onClick={() => {
              setActiveStudent(record);
              setIsViewResultModalOpen(true);
            }}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  const progressColumns = [
    { title: "Reg No", dataIndex: "admissionNumber" },
    { title: "Name", dataIndex: "fullName" },
    {
      title: "Actions",
      width: 200,
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          icon={<BarChartOutlined />}
          onClick={() => {
            setActiveStudent(record);
            setIsProgressModalOpen(true);
          }}
        >
          View Progress
        </Button>
      ),
    },
  ];

  return (
    <div className="flex gap-6">
      {contextHolder}

  

      {/* Main Content */}
      <div className="flex-1">
        <Card className="shadow-md rounded-xl">
          <Tabs defaultActiveKey="1">
            {/* STUDENT TAB */}
            <TabPane
              tab={
                <span>
                  <UserOutlined /> My Students
                </span>
              }
              key="1"
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : (
                <Table
                  dataSource={students}
                  columns={studentColumns}
                  rowKey="_id"
                  bordered
                  size="small"
                  pagination={{
                    current: page,
                    total: total,
                    pageSize: limit,
                    onChange: handlePageChange,
                    position: ["bottomCenter"],
                    className: "custom-pagination",
                  }}
                  scroll={{ x: "max-content" }}
                />
              )}
            </TabPane>

            {/* RESULTS TAB */}
            <TabPane
              tab={
                <span>
                  <EditOutlined /> Results
                </span>
              }
              key="2"
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : (
                <Table
                  dataSource={students}
                  rowKey="_id"
                  bordered
                  size="small"
                  pagination={{
                    current: page,
                    total: total,
                    pageSize: limit,
                    onChange: handlePageChange,
                    position: ["bottomCenter"],
                    className: "custom-pagination",
                  }}
                  columns={resultsColumns}
                  scroll={{ x: "max-content" }}
                />
              )}

              <EnterResult
                open={isResultModalOpen}
                onClose={() => setIsResultModalOpen(false)}
                student={activeStudent}
                subjects={activeSubjects}
                teacherSubject={subject}
              />

              <Modal
                title={`Result Sheet - ${activeStudent?.fullName}`}
                open={isViewResultModalOpen}
                onCancel={() => setIsViewResultModalOpen(false)}
                footer={null}
                width={800}
              >
                <ResultSheet student={activeStudent} />
              </Modal>
            </TabPane>

            {/* PROGRESS TAB */}
            <TabPane
              tab={
                <span>
                  <BarChartOutlined /> Progress
                </span>
              }
              key="3"
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : (
                <Table
                  dataSource={students}
                  columns={progressColumns}
                  rowKey="_id"
                  bordered
                  size="small"
                  pagination={{
                    current: page,
                    total: total,
                    pageSize: limit,
                    onChange: handlePageChange,
                    position: ["bottomCenter"],
                    className: "custom-pagination",
                  }}
                  className="custom-table"
                  scroll={{ x: "max-content" }}
                />
              )}

              <Modal
                title={`Progress - ${activeStudent?.fullName}`}
                open={isProgressModalOpen}
                onCancel={() => setIsProgressModalOpen(false)}
                footer={null}
                width={600}
              >
                <ProgressChart studentName={activeStudent?.fullName} />
              </Modal>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default MyClasses;

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
  const [subject, setSubject] = useState(null);

  const getTeacherClassDetails = async (pageParam = 1) => {
    if (!token) return;

    try {
      setLoading(true);

      // Fetch students
      const res = await axios.get(
        `${API_BASE_URL}/api/teacher/students?page=${pageParam}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const students = res.data.students || [];
      const classId = res.data.students[0]?.class?._id;
      const subjectId = res.data.subject?._id;

      setSubject(res.data.subject);

      // Fetch result status for this class and subject
      const resultRes = await axios.get(
        `${API_BASE_URL}/api/records/teacher/scores/dashboard?classId=${classId}&subjectId=${subjectId}&session=2025/2026&term=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Merge student status
      const studentsWithStatus = students.map((student) => {
        const found = resultRes.data.students.find(
          (s) => s.studentId === student._id
        );
        return {
          ...student,
          hasRecord: found?.status === "recorded",
        };
      });

      setStudents(studentsWithStatus);
      setTotal(res.data.pagination?.total || 0);
      setPage(res.data.pagination?.page || 1);

      message.success(res.data.message || "Students fetched successfully");
    } catch (error) {
      console.error(error);
      message.error("Unable to fetch students");
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

  const handleSubmit = (response) => {
    if (response?.success) {
      // Update the specific student row to show Entered
      setStudents((prev) =>
        prev.map((student) =>
          student._id === activeStudent._id
            ? { ...student, hasRecord: true }
            : student
        )
      );
    }
  };

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
      title: "Status",
      width: 120,
      render: (_, record) =>
        record.hasRecord ? (
          <span style={{ color: "green", fontWeight: 600 }}>
            <CheckCircleOutlined /> Entered
          </span>
        ) : (
          <span style={{ color: "red", fontWeight: 600 }}>Not Entered</span>
        ),
    },
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
              setActiveSubjects(record.subjects);
              setIsResultModalOpen(true);
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
                  scroll={{ x: "max-content" }}
                  columns={resultsColumns}
                />
              )}

              <EnterResult
                open={isResultModalOpen}
                onClose={() => setIsResultModalOpen(false)}
                student={activeStudent}
                subjects={activeSubjects}
                teacherSubject={subject}
                onClick={handleSubmit}
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
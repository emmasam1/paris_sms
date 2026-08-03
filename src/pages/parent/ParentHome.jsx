import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Tag,
  Avatar,
  Button,
  Divider,
  Space,
  Modal,
  Tabs,
  Select,
  Spin,
  message,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  TrophyOutlined,
  StarOutlined,
  LogoutOutlined,
  FileSearchOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { useApp } from "../../context/AppContext";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { logout, user, token, API_BASE_URL, initialized } = useApp();

  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const auth = JSON.parse(sessionStorage.getItem("auth") || "{}");
  const allowedTerms = auth?.allowedTerms || [];
  const termValue = allowedTerms[0] || 1;

  // ------------------------------------------------------------------
  // Fetch Student Results & Data
  // ------------------------------------------------------------------
  const getStudentsResult = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/parent/results?term=${termValue}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(res)
      if (res?.data?.success) {
        setResultData(res.data);
      }
    } catch (error) {
      console.error("Error getting result", error);
      const msg = error?.response?.data?.message;

      if (msg === "Invalid or expired parent token") {
        messageApi.error("Session expired. Logging out...");
        logout();
        return;
      }

      messageApi.error(msg || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized && token) {
      getStudentsResult();
    }
  }, [initialized, token]);

  // ------------------------------------------------------------------
  // Extract Dynamic Values from Response
  // ------------------------------------------------------------------
  const studentInfo = resultData?.student || {};
  const summaryInfo = resultData?.summary || {};

  // Calculate Academic Average %
  const performancePct = Math.round(
    summaryInfo?.finalAverage ??
      (summaryInfo?.totalScoreObtained && summaryInfo?.totalScoreObtainable
        ? (summaryInfo.totalScoreObtained / summaryInfo.totalScoreObtainable) * 100
        : 0)
  );

  // Calculate Attendance %
  const attendancePct =
    studentInfo?.opened && studentInfo?.present
      ? Math.round((studentInfo.present / studentInfo.opened) * 100)
      : 0;

  const childTermLabel =
    termValue === 1
      ? "1st Term"
      : termValue === 2
      ? "2nd Term"
      : termValue === 3
      ? "3rd Term"
      : "";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleViewResult = () => {
    if (!allowedTerms.length) {
      messageApi.error("No allowed term found");
      return;
    }
    const term = allowedTerms[0];
    navigate("/parent/result", { state: { term } });
  };

  const handleDownloadAssignment = () => {
    const studentClass = studentInfo?.className || user?.class;
    if (!studentClass) {
      messageApi.error("Student class not found");
      return;
    }

    const assignment = homeWork.find((hw) => hw.class_name === studentClass);

    if (!assignment?.attachment) {
      messageApi.info("No holiday assignment available for this class");
      return;
    }

    window.open(assignment.attachment, "_blank");
  };

  const homeWork = [
    { id: 1, class_name: "JSS1", attachment: "/docs/JSS1_Holiday_Assignment.pdf" },
    { id: 2, class_name: "JSS2", attachment: "/docs/JSS2_Holiday_Assignment.pdf" },
    { id: 3, class_name: "JSS3", attachment: "/docs/JSS3_Holiday_Assignment.pdf" },
    { id: 4, class_name: "SS1", attachment: "/docs/SS1_Holiday_Assignment.pdf" },
    { id: 5, class_name: "SS2", attachment: "/docs/SS2_Holiday_Assignment.pdf" },
    { id: 6, class_name: "SS3", attachment: "/docs/SS3_Holiday_Assignment.pdf" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {contextHolder}

      <Spin spinning={loading} tip="Loading dashboard details...">
        {/* Welcome / Hero Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <Avatar
              size={72}
              icon={<UserOutlined />}
              className="bg-blue-100 text-blue-600"
            />
            <div>
              <Title level={4} className="!mb-1">
                Welcome, Parent 👋
              </Title>
              <Text type="secondary">
                {resultData?.school || "Paris Africana International School"} • Session:{" "}
                {resultData?.session || "2025/2026"}
              </Text>
            </div>
          </div>
          <div className="flex gap-2 justify-between items-center mt-4 md:mt-0">
            <Tag
              color="blue"
              className="text-sm py-1 px-3 rounded-full"
            >
              {childTermLabel}
            </Tag>
            <Button
              size="small"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Child Summary Info */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={8}>
            <Card className="rounded-2xl shadow-sm h-full">
              <Text type="secondary">Student Name</Text>
              <Title level={5}>
                {studentInfo?.fullName || user?.fullName || "--"}
              </Title>

              <Divider />
              <Space direction="vertical" size={2} className="w-full">
                <Text>
                  <strong>Admission No:</strong>{" "}
                  {studentInfo?.admissionNumber || "--"}
                </Text>
                <Text>
                  <strong>Class:</strong>{" "}
                  {studentInfo?.className || user?.class || "--"}{" "}
                  {studentInfo?.classArm || user?.arm || ""}
                </Text>
                <Text>
                  <strong>Form Teacher:</strong>{" "}
                  {studentInfo?.FormTeacher || "--"}
                </Text>
                <Text>
                  <strong>Overall Grade:</strong>{" "}
                  <Tag color="blue">{summaryInfo?.overallGrade || "--"}</Tag>
                </Text>
                <Text>
                  <strong>Overall Average:</strong> {performancePct}%
                </Text>
              </Space>

              <div className="flex gap-3 mt-4">
                <Button
                  icon={<FileSearchOutlined />}
                  type="primary"
                  className="bg-blue-600"
                  onClick={handleViewResult}
                >
                  View Result
                </Button>
                {/* {studentInfo?.className && (
                  <Button
                    icon={<FilePdfOutlined />}
                    type="primary"
                    className="bg-blue-600"
                    onClick={handleDownloadAssignment}
                  >
                    Assignment
                  </Button>
                )} */}
              </div>
            </Card>
          </Col>

          {/* Academic Performance */}
          <Col xs={24} md={8}>
            <Card className="rounded-2xl shadow-sm text-center h-full flex flex-col justify-center">
              <TrophyOutlined className="text-3xl text-yellow-500 mb-2" />
              <Title level={5}>Academic Performance</Title>
              <Progress
                type="circle"
                percent={performancePct}
                size={80}
                strokeColor="#52c41a"
              />
              <Text className="block mt-2">Overall Average</Text>
              <Text type="secondary" className="text-xs">
                {summaryInfo?.totalScoreObtained ?? 0} /{" "}
                {summaryInfo?.totalScoreObtainable ?? 0} Marks
              </Text>
              {/* <Button
                type="link"
                className="mt-2 text-blue-500"
                onClick={handleViewResult}
              >
                View Full Report →
              </Button> */}
            </Card>
          </Col>

          {/* Attendance */}
          <Col xs={24} md={8}>
            <Card className="rounded-2xl shadow-sm text-center h-full flex flex-col justify-center">
              <CalendarOutlined className="text-3xl text-green-500 mb-2" />
              <Title level={5}>Attendance Record</Title>
              <Progress
                type="circle"
                percent={attendancePct}
                size={80}
                strokeColor="#1890ff"
              />
              <Text className="block mt-2">
                Present: <strong>{studentInfo?.present ?? 0}</strong> /{" "}
                {studentInfo?.opened ?? 0} Days
              </Text>
              <Text type="secondary" className="text-xs">
                Absent: {studentInfo?.absent ?? 0} Days
              </Text>
              {/* <Button
                type="link"
                className="mt-2 text-blue-500"
                onClick={() => navigate("/parent/attendance")}
              >
                View Attendance →
              </Button> */}
            </Card>
          </Col>
        </Row>

        {/* Messages + Achievements */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12}>
            <Card
              className="rounded-2xl shadow-sm h-full"
              title={
                <span className="flex items-center gap-2">
                  <MessageOutlined className="text-purple-500" /> Recent Messages
                </span>
              }
            >
              <div className="mt-2 space-y-2">
                <Text>
                  <strong>School Admin:</strong>
                </Text>
                <p className="text-gray-600">
                  "Next term's resumption date will be communicated shortly via official notice."
                </p>
              </div>
              {/* <Button
                type="link"
                className="mt-3 text-blue-500 !p-0"
                onClick={() => navigate("/parent/messages")}
              >
                View Inbox →
              </Button> */}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              className="rounded-2xl shadow-sm h-full"
              title={
                <span className="flex items-center gap-2">
                  <StarOutlined className="text-amber-500" /> Class Position & Summary
                </span>
              }
            >
              <Space direction="vertical" className="w-full">
                <Text>
                  <strong>Total Subjects Taken:</strong>{" "}
                  {summaryInfo?.totalSubjects || 0}
                </Text>
                <Text>
                  <strong>Class Average:</strong> {summaryInfo?.classAverage || 0}%
                </Text>
                <Text>
                  <strong>Total Students in Class:</strong>{" "}
                  {summaryInfo?.noInClass || 0}
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Announcements */}
        <Card
          className="rounded-2xl shadow-sm"
          title={
            <span className="flex items-center gap-2">
              <CalendarOutlined className="text-orange-500" /> School
              Announcements
            </span>
          }
        >
          <p className="text-gray-600">
            Welcome to the official Parent Portal for {resultData?.school || "Paris Africana International School"}. Please ensure all holiday assignments are submitted before resumption.
          </p>
        </Card>
      </Spin>
    </div>
  );
};

export default ParentDashboard;
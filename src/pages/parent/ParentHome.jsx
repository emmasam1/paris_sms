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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [result, setResult] = useState(null);

  // console.log(user);

  const child = {
    term: "1st Term, 2025",
    avatar: null,
    // performance: 82,
    attendance: 90,
    conduct: "Excellent",
    unreadMessages: 3,
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleViewResult = () => {
    if (!selectedTerm) return;
    setIsModalOpen(false);
    navigate("/parent/result", { state: { term: selectedTerm } }); // Pass term via state
  };

  const getStudentsResult = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/parent/results?term=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Store result in state
      setResult(res.data.data);
    } catch (error) {
      const msg = error?.response?.data?.message;

      if (msg === "Invalid or expired parent token") {
        console.warn("Token invalid or expired. Logging out...");
        logout(); // Replace with your actual logout function
        return;
      }

      console.log("Error get result", error);
      console.error(msg || "No result yet");
    }
  };

  useEffect(() => {
    if (!initialized || !token) return;

    getStudentsResult();
    // getClass();
  }, [initialized, token]);

  const handleDownloadAssignment = () => {
    if (!user?.class) {
      message.error("Student class not found");
      return;
    }

    const assignment = homeWork.find((hw) => hw.class_name === user.class);

    if (!assignment?.attachment) {
      message.info("No holiday assignment available for this class");
      return;
    }

    // ✅ Open PDF in new tab (preview + download)
    window.open(assignment.attachment, "_blank");
  };

  const homeWork = [
    {
      id: 1,
      class_name: "JSS1",
      attachment: "/docs/JSS1_Holiday_Assignment.pdf",
    },
    {
      id: 2,
      class_name: "JSS2",
      attachment: "/docs/JSS2_Holiday_Assignment.pdf",
    },
    {
      id: 3,
      class_name: "JSS3",
      attachment: "/docs/JSS3_Holiday_Assignment.pdf",
    },
    {
      id: 4,
      class_name: "SS1",
      attachment: "/docs/SS1_Holiday_Assignment.pdf",
    },
    {
      id: 5,
      class_name: "SS2",
      attachment: "/docs/SS2_Holiday_Assignment.pdf",
    },
    {
      id: 6,
      class_name: "SS3",
      attachment: "/docs/SS3_Holiday_Assignment.pdf",
    },
  ];
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      {/* Welcome / Hero Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row justify-between items-center mb-6 border border-gray-100">
        <div className="flex items-center gap-4">
          <Avatar
            size={72}
            icon={<UserOutlined />}
            src={child.avatar}
            className="bg-blue-100 text-blue-600"
          />
          <div>
            <Title level={4} className="!mb-1">
              Welcome, Parent👋
            </Title>
            <Text type="secondary">
              Here’s a quick overview of your child’s progress this term.
            </Text>
          </div>
        </div>
        <div className="flex gap-2 justify-between items-center">
          <Tag
            color="blue"
            className="mt-4 md:mt-0 text-sm py-1 px-3 rounded-full"
          >
            {child.term}
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
          <Card className="rounded-2xl shadow-sm">
            <Text type="secondary">Student Name</Text>
            <Title level={5}>
              {user?.fullName === "ODEH EFFIONG ISABELLA DANIEL OKENENI"
                ? "ODEH DANIEL OKENENI"
                : user?.fullName === "NWANKWO ONYINUECHI"
                ? "NWANKWO ONYINYECHI"
                : user?.fullName || "--"}
            </Title>

            <Divider className="" />
            <Space direction="vertical" size={0}>
              <Text>
                <strong>Class:</strong> {user?.class} {user?.arm}
              </Text>
              <Text>
                <strong>Conduct:</strong>{" "}
                <Tag color="green">{child.conduct}</Tag>
              </Text>
              <Text>
                <strong>Overall Average:</strong> {child.performance}%
              </Text>
            </Space>
            <div className="flex gap-3">
              <Button
                icon={<FileSearchOutlined />}
                type="primary"
                className="bg-blue-600 mt-2"
                onClick={() => {
                  setSelectedTerm(null); // reset term selection
                  setIsModalOpen(true);
                }}
              >
                View Result
              </Button>
              <Button
                icon={<FilePdfOutlined />}
                type="primary"
                className="bg-blue-600 mt-2"
                onClick={handleDownloadAssignment}
              >
                Download Holiday Assignment
              </Button>
            </div>
          </Card>
        </Col>

        {/* Modal for term selection */}
        <Modal
          title="Select Term"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={400}
        >
          <div className="flex flex-col gap-4">
            <Select
              placeholder="Select Term"
              onChange={(value) => setSelectedTerm(value)}
            >
              <Option value="1">1st Term</Option>
              <Option value="2">2nd Term</Option>
              <Option value="3">3rd Term</Option>
            </Select>
            <Button
              type="primary"
              disabled={!selectedTerm}
              onClick={handleViewResult}
            >
              Continue
            </Button>
          </div>
        </Modal>

        {/* Academic Performance */}
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm text-center">
            <TrophyOutlined className="text-3xl text-yellow-500 mb-2" />
            <Title level={5}>Academic Performance</Title>
            <Progress
              type="circle"
              percent={child.performance}
              size={80}
              strokeColor="#52c41a"
            />
            <Text className="block mt-2">Overall Average</Text>
            <Button
              type="link"
              className="mt-2 text-blue-500"
              onClick={() => {
                setSelectedTerm(null);
                setIsModalOpen(true);
              }}
            >
              View Full Report →
            </Button>
          </Card>
        </Col>

        {/* Attendance */}
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm text-center">
            <CalendarOutlined className="text-3xl text-green-500 mb-2" />
            <Title level={5}>Attendance Record</Title>
            <Progress
              type="circle"
              percent={child.attendance}
              size={80}
              strokeColor="#1890ff"
            />
            <Text className="block mt-2">Present Days</Text>
            <Button
              type="link"
              className="mt-2 text-blue-500"
              onClick={() => navigate("/parent/attendance")}
            >
              View Attendance →
            </Button>
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
            <div className="mt-4 space-y-2">
              <Text>
                <strong>School Admin:</strong>
              </Text>
              <p>"Next term's resumption date is 12th January, 2026."</p>
            </div>
            <Button
              type="link"
              className="mt-3 text-blue-500"
              onClick={() => navigate("/parent/messages")}
            >
              View Inbox →
            </Button>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            className="rounded-2xl shadow-sm h-full"
            title={
              <span className="flex items-center gap-2">
                <StarOutlined className="text-amber-500" /> Recent Achievements
              </span>
            }
          >
            {/* <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>🏆 Best in Mathematics - February 2025</li>
              <li>⭐ Excellent Conduct Award - March 2025</li>
              <li>🎨 Art Competition Winner - April 2025</li>
            </ul> */}
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
        {/* <ul className="list-disc ml-6 text-gray-700 leading-relaxed space-y-2">
          <li>
            <strong>PTA Meeting:</strong> November 3rd, 2025 at 10:00 AM
          </li>
          <li>
            <strong>Midterm Break:</strong> October 25th – October 30th
          </li>
          <li>
            <strong>End-of-Term Exams:</strong> December 1st to 10th
          </li>
        </ul> */}
      </Card>

      {/* Assignment Modal */}
      {/* <Modal
        title="Holiday Assignment"
        open={isAssignmentModalOpen}
        onOk={handleAssignmentOk}
        onCancel={handleAssignmentCancel}
        width={800}
      >
        {filteredAssignment.length > 0 ? (
          <Tabs
            defaultActiveKey="0"
            items={filteredAssignment.map((item, index) => ({
              key: index.toString(),
              label: item.subject,
              children: (
                <div
                  style={{
                    maxHeight: "65vh",
                    overflowY: "auto",
                    paddingRight: "10px",
                  }}
                >
                  <h3 style={{ fontWeight: 600, marginBottom: 10 }}>
                    {item.subject}
                  </h3>

                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: "14px",
                      lineHeight: "1.7",
                    }}
                  >
                    {item.content}
                  </pre>
                </div>
              ),
            }))}
          />
        ) : (
          <p>No assignment available for this class.</p>
        )}
      </Modal> */}
    </div>
  );
};

export default ParentDashboard;

import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Progress,
  Tag,
  Avatar,
  Button,
  Badge,
  Divider,
  Space,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  TrophyOutlined,
  StarOutlined,
  LogoutOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";

const { Title, Text } = Typography;

const ParentDashboard = () => {
  const navigate = useNavigate();

  const child = {
    name: "David Johnson",
    class: "Primary 5A",
    term: "2nd Term, 2025",
    avatar: null,
    performance: 82,
    attendance: 90,
    conduct: "Excellent",
    unreadMessages: 3,
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

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
              Welcome, Mr. Johnson 👋
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
          <Button size="small" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Child Summary Info */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm">
            <Text type="secondary">Student Name</Text>
            <Title level={5}>{child.name}</Title>
            <Divider className="" />
            <Space direction="vertical" size={0}>
              <Text>
                <strong>Class:</strong> {child.class}
              </Text>
              <Text>
                <strong>Conduct:</strong>{" "}
                <Tag color="green">{child.conduct}</Tag>
              </Text>
              <Text>
                <strong>Overall Average:</strong> {child.performance}%
              </Text>
            </Space>
            <div>
              <Button
                icon={<FileSearchOutlined />}
                type="primary"
                className="bg-blue-600 mt-2"
                 onClick={() => navigate("/parent/result")}
              >
                View Result
              </Button>
            </div>
          </Card>
        </Col>

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
              onClick={() => navigate("/parent/result")}
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
            <Badge count={child.unreadMessages} offset={[10, 0]}>
              <Avatar
                shape="square"
                size={60}
                className="bg-purple-100 text-purple-600 flex items-center justify-center"
                icon={<MessageOutlined />}
              />
            </Badge>
            <div className="mt-4 space-y-2">
              <Text>
                <strong>School Admin:</strong> Mrs. Ada
              </Text>
              <p>"This term's resumption date is January 5th."</p>
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
            <ul className="list-disc ml-6 space-y-1 text-gray-700">
              <li>🏆 Best in Mathematics - February 2025</li>
              <li>⭐ Excellent Conduct Award - March 2025</li>
              <li>🎨 Art Competition Winner - April 2025</li>
            </ul>
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
        <ul className="list-disc ml-6 text-gray-700 leading-relaxed space-y-2">
          <li>
            <strong>PTA Meeting:</strong> November 3rd, 2025 at 10:00 AM
          </li>
          <li>
            <strong>Midterm Break:</strong> October 25th – October 30th
          </li>
          <li>
            <strong>End-of-Term Exams:</strong> December 1st to 10th
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default ParentDashboard;

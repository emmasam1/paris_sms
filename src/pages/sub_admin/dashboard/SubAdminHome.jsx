import React, { useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Button,
  Modal,
  List,
  Tag,
  Space,
} from "antd";
import {
  UserOutlined,
  ApartmentOutlined,
  MessageOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const SubAdminHome = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Staff Meeting Reminder",
      content:
        "Dear teachers, there will be a staff meeting on Monday at 10 AM in the school hall. Attendance is compulsory for all teaching staff.",
      read: false,
    },
    {
      id: 2,
      title: "Result Submission Deadline",
      content:
        "Kindly ensure all results for the current term are entered before Friday. The portal will close at midnight.",
      read: false,
    },
    {
      id: 3,
      title: "New Term Orientation",
      content:
        "We will have an orientation session for new students next week. Teachers are encouraged to assist where necessary.",
      read: true,
    },
  ]);

  const openMessage = (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    setAnnouncements((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, read: true } : m))
    );
  };

  const unreadCount = useMemo(
    () => announcements.filter((m) => !m.read).length,
    [announcements]
  );

  const stats = [
    {
      title: "Total Students",
      value: 48,
      icon: <UserOutlined className="text-2xl !text-blue-600" />,
      color: "!bg-blue-50",
      // path: "/subadmin/dashboard/students",
    },
    {
      title: "Total Classes",
      value: 6,
      icon: <ApartmentOutlined className="text-2xl !text-blue-600" />,
      color: "!bg-blue-50",
      // path: "/subadmin/dashboard/classes",
    },

    {
      title: "Attendance Rate",
      value: "92%",
      icon: <CalendarOutlined className="text-2xl !text-yellow-600" />,
      color: "!bg-yellow-50",
      progress: 92,
      // path: "/subadmin/dashboard/attendance",
    },
    {
      title: "Messages",
      value: unreadCount,
      icon: <MessageOutlined className="text-2xl !text-purple-600" />,
      color: "!bg-purple-50",
      // path: "/subadmin/dashboard/messages",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Welcome, JSS1 Admin 👋
        </h1>
        <p className="text-gray-500">
          Here’s what’s happening in your class today.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        {stats.map((item, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                hoverable
                onClick={() => navigate(item.path)}
                className={`cursor-pointer rounded-xl shadow-sm border ${item.color} transition-transform hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-gray-500">{item.title}</h3>
                    <h2 className="text-2xl font-semibold text-gray-800 mt-1">
                      {item.value}
                    </h2>
                    {item.progress && (
                      <Progress
                        percent={item.progress}
                        showInfo={false}
                        size="small"
                        strokeColor="#1890ff"
                        className="mt-2"
                      />
                    )}
                  </div>
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    {item.icon}
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Quick Actions Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <Space wrap>
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => navigate("/sub-admin/dashboard/attendance")}
          >
            Attendance
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => navigate("/sub-admin/dashboard/results")}
          >
            View Results
          </Button>
        </Space>
      </motion.div>

      {/* Recent Activities Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>

        <ul className="space-y-3 text-gray-700">
          <li className="flex justify-between">
            <span>✅ Attendance for today marked successfully.</span>
            <span className="text-gray-400 text-sm">2 mins ago</span>
          </li>
          <li className="flex justify-between">
            <span>📢 New message from the school administrator.</span>
            <span className="text-gray-400 text-sm">1 hour ago</span>
          </li>
          <li className="flex justify-between">
            <span>📄 Result upload for Mathematics completed.</span>
            <span className="text-gray-400 text-sm">Yesterday</span>
          </li>
        </ul>
      </motion.div>

      {/* Messages Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card
          title={`Messages (${unreadCount} unread)`}
          className="shadow-md rounded-xl"
        >
          {announcements.length === 0 ? (
            <p>No new messages.</p>
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={announcements}
              renderItem={(item) => (
                <List.Item
                  className="cursor-pointer hover:bg-gray-50 p-2 rounded-md transition"
                  onClick={() => openMessage(item)}
                >
                  <List.Item.Meta
                    title={
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">
                          {item.title}
                        </span>
                        <Tag color={item.read ? "green" : "red"}>
                          {item.read ? "Read" : "Unread"}
                        </Tag>
                      </div>
                    }
                    description={
                      <span className="text-gray-600">
                        {item.content.length > 60
                          ? item.content.slice(0, 60) + "..."
                          : item.content}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </motion.div>

      {/* Modal for Full Message */}
      <Modal
        open={isModalOpen}
        title={selectedMessage?.title}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        <p>{selectedMessage?.content}</p>
      </Modal>
    </div>
  );
};

export default SubAdminHome;

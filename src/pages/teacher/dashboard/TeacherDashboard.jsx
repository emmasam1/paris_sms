import React, { useState } from "react";
import { Card, Row, Col, Modal, Button, Tag, List, Badge } from "antd";
import {
  UserOutlined,
  BookOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const TeacherDashboard = () => {
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

    // Mark message as read
    setAnnouncements((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, read: true } : m))
    );
  };

  const unreadCount = announcements.filter((m) => !m.read).length;

  const stats = {
    students: 120,
    classes: 4,
    totalResults: 36,
    resultsEntered: 20,
    resultsLeft: 16,
    messages: announcements.length,
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* My Students */}
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-md rounded-xl">
            <div className="flex items-center space-x-4">
              <UserOutlined className="text-3xl !text-blue-500" />
              <div>
                <p className="text-gray-500">My Students</p>
                <p className="text-xl font-bold">{stats.students}</p>
              </div>
            </div>
          </Card>
        </Col>

        {/* My Classes */}
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-md rounded-xl">
            <div className="flex items-center space-x-4">
              <BookOutlined className="text-3xl !text-green-500" />
              <div>
                <p className="text-gray-500">My Classes</p>
                <p className="text-xl font-bold">{stats.classes}</p>
              </div>
            </div>
          </Card>
        </Col>

        {/* Total Results */}
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-md rounded-xl">
            <div className="flex items-center space-x-4">
              <BarChartOutlined className="text-3xl !text-purple-500" />
              <div>
                <p className="text-gray-500">Total Results</p>
                <p className="text-xl font-bold">{stats.totalResults}</p>
              </div>
            </div>
          </Card>
        </Col>

        {/* Results Entered */}
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-md rounded-xl">
            <div className="flex items-center space-x-4">
              <CheckCircleOutlined className="text-3xl !text-green-600" />
              <div>
                <p className="text-gray-500">Results Entered</p>
                <p className="text-xl font-bold">{stats.resultsEntered}</p>
              </div>
            </div>
          </Card>
        </Col>

        {/* Results Left */}
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-md rounded-xl">
            <div className="flex items-center space-x-4">
              <ClockCircleOutlined className="text-3xl !text-orange-500" />
              <div>
                <p className="text-gray-500">Results Left</p>
                <p className="text-xl font-bold">{stats.resultsLeft}</p>
              </div>
            </div>
          </Card>
        </Col>

        {/* Messages with unread badge */}
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-md rounded-xl relative">
            <div className="flex items-center space-x-4">
              <MessageOutlined className="text-3xl !text-pink-500" />
              <div className="flex-1 relative">
                <p className="text-gray-500">Messages</p>
                <p className="text-xl font-bold">{stats.messages}</p>

                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-[2px] rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Announcements */}
      <div className="mt-8">
        <Card title="Announcements" className="shadow-md rounded-xl">
          {announcements.length === 0 ? (
            <p>No new announcements.</p>
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
                        <span className="font-medium">{item.title}</span>
                        <Tag color={item.read ? "green" : "red"}>
                          {item.read ? "Read" : "Unread"}
                        </Tag>
                      </div>
                    }
                    description={
                      <span>
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
      </div>

      {/* Modal for full message */}
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

export default TeacherDashboard;

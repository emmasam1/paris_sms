import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Modal,
  Button,
  Tag,
  List,
  Skeleton,
  message,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useApp } from "../../../context/AppContext";

const TeacherDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token, API_BASE_URL } = useApp();
  const [dashboardData, setDashboardData] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

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

  // Fetch user info
  const getUser = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard analytics
  const getDashboardDetails = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/teacher/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      messageApi.success(res.data?.message || "Dashboard data fetched successfully");
      setDashboardData(res.data);
    } catch (error) {
      console.error("Error fetching dashboard details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
    getDashboardDetails();
  }, []);

  const openMessage = (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);

    setAnnouncements((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, read: true } : m))
    );
  };

  const unreadCount = announcements.filter((m) => !m.read).length;

  // Compute total students from backend data
  const totalStudents =
    dashboardData?.data?.subjectAnalytics?.reduce(
      (acc, item) => acc + (item.students?.length || 0),
      0
    ) || 0;

  const resultsEntered = 0; // always 0 for now

  // Final stats
  const stats = {
    students: totalStudents,
    classes: dashboardData?.data?.subjectAnalytics?.length || 0,
    totalResults: totalStudents,
    resultsEntered: resultsEntered,
    resultsLeft: totalStudents - resultsEntered,
    messages: announcements.length,
  };

  // Welcome text
  const getWelcomeText = () => {
    if (!user) return "";
    const isFormTeacher = user.formClass?.name;
    if (isFormTeacher) {
      return `Welcome, ${user.formClass.name} ${user.formClass.arm} Form Teacher`;
    }
    return `Welcome ${user.title} ${user.firstName} ${user.lastName}`;
  };

  return (
    <div>
      {contextHolder}

      {/* Welcome */}
      <Skeleton loading={loading} active paragraph={false}>
        <h2 className="text-xl font-bold mb-4">{getWelcomeText()}</h2>
      </Skeleton>

      {/* Stats cards */}
      <Row gutter={[16, 16]}>
        {[
          {
            title: "My Students",
            value: stats.students,
            icon: <UserOutlined className="text-3xl !text-blue-500" />,
          },
          {
            title: "My Classes",
            value: stats.classes,
            icon: <BookOutlined className="text-3xl !text-green-500" />,
          },
          {
            title: "Total Results",
            value: stats.totalResults,
            icon: <BarChartOutlined className="text-3xl !text-purple-500" />,
          },
          {
            title: "Results Entered",
            value: stats.resultsEntered,
            icon: <CheckCircleOutlined className="text-3xl !text-green-600" />,
          },
          {
            title: "Results Left",
            value: stats.resultsLeft,
            icon: <ClockCircleOutlined className="text-3xl !text-orange-500" />,
          },
          {
            title: "Messages",
            value: stats.messages,
            icon: <MessageOutlined className="text-3xl !text-pink-500" />,
            extra: unreadCount > 0 && !loading && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-[2px] rounded-full">
                {unreadCount} unread
              </span>
            ),
          },
        ].map((stat, idx) => (
          <Col xs={24} sm={12} md={6} key={idx}>
            <Card className="shadow-md rounded-xl relative">
              <Skeleton loading={loading} active avatar paragraph={{ rows: 1 }}>
                <div className="flex items-center space-x-4">
                  {stat.icon}
                  <div className="flex-1 relative">
                    <p className="text-gray-500">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                    {stat.extra}
                  </div>
                </div>
              </Skeleton>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Announcements */}
      <div className="mt-8">
        <Card title="Announcements" className="shadow-md rounded-xl">
          {loading ? (
            <div>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  active
                  title
                  paragraph={{ rows: 1 }}
                  className="mb-4"
                />
              ))}
            </div>
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
                      item.content.length > 60
                        ? item.content.slice(0, 60) + "..."
                        : item.content
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>

      {/* Modal */}
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

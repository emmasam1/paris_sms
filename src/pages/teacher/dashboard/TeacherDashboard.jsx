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
import ChangePassword from "../../../components/chnagePassword/ChangePassword";

const TeacherDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  // const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { token, API_BASE_URL, user, setUser } = useApp();
  const [dashboardData, setDashboardData] = useState(null);
  const [statsData, setStatsData] = useState({
    totalResults: 0,
    resultsEntered: 0,
    resultsLeft: 0,
    totalStudents: 0,
    totalClasses: 0,
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [userLoaded, setUserLoaded] = useState(false);

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

  // Fetch teacher user info
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
      setUserLoaded(true);
    }
  };

  // console.log(token, API_BASE_URL)

  // Fetch students to get classId and subjectId, then fetch dashboard stats
  const getDashboardStats = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // 1️⃣ Fetch students
      const res = await axios.get(`${API_BASE_URL}/api/teacher/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("res from teachers dashboard", res)
      // `${API_BASE_URL}/api/teacher/students?page=1&limit=20`,
      const students = res.data.students || [];
      if (!students.length) return;

      const classId = students[0]?.class?._id;
      const subjectId =
        students[0]?.subjects?.[0]?._id || res.data.subject?._id;

      // 2️⃣ Fetch dashboard results using classId and subjectId
      if (classId && subjectId) {
        const resultRes = await axios.get(
          `${API_BASE_URL}/api/records/teacher/scores/dashboard?classId=${classId}&subjectId=${subjectId}&session=2025/2026&term=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // console.log("testing",resultRes);

        if (resultRes.data.success) {
          const stats = resultRes.data.stats;

          setStatsData({
            totalResults: stats.totalStudents,
            resultsEntered: stats.numberRecorded,
            resultsLeft: stats.numberNotRecorded,
            totalStudents: students.length,
            totalClasses: new Set(students.map((s) => s.class._id)).size,
          });

          setDashboardData(resultRes.data);
          messageApi.success(
            resultRes.data.message || "Dashboard fetched successfully"
          );
        }
      }
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUser();
    getDashboardStats();
  }, []);

  const openMessage = (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);

    setAnnouncements((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, read: true } : m))
    );
  };

  const unreadCount = announcements.filter((m) => !m.read).length;

  // Stats cards
  const stats = [
    {
      title: "My Students",
      value: statsData.totalStudents,
      icon: <UserOutlined className="text-3xl !text-blue-500" />,
    },
    {
      title: "My Classes",
      value: statsData.totalClasses,
      icon: <BookOutlined className="text-3xl !text-green-500" />,
    },
    {
      title: "Total Results",
      value: statsData.totalResults,
      icon: <BarChartOutlined className="text-3xl !text-purple-500" />,
    },
    {
      title: "Results Entered",
      value: statsData.resultsEntered,
      icon: <CheckCircleOutlined className="text-3xl !text-green-600" />,
    },
    {
      title: "Results Left",
      value: statsData.resultsLeft,
      icon: <ClockCircleOutlined className="text-3xl !text-orange-500" />,
    },
    {
      title: "Messages",
      value: announcements.length,
      icon: <MessageOutlined className="text-3xl !text-pink-500" />,
      extra: unreadCount > 0 && !loading && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-[2px] rounded-full">
          {unreadCount} unread
        </span>
      ),
    },
  ];

  // Welcome text
  const getWelcomeText = () => {
    if (!user) return "";
    const isFormTeacher = user.formClass?.name;
    if (isFormTeacher) {
      return `Welcome, ${user.formClass.name} ${user.formClass.arm} Form Teacher`;
    }
    return `Welcome ${user.title} ${user.firstName} ${user.lastName}`;
  };

  // console.log(user)

  return (
    <div>
      {contextHolder}

      {userLoaded && user?.needsPasswordChange && <ChangePassword />}

      {/* Welcome */}
      <Skeleton loading={loading} active paragraph={false}>
        <h2 className="text-xl font-bold mb-4">{getWelcomeText()}</h2>
      </Skeleton>

      {/* Stats cards */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, idx) => (
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

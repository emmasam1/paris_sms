// src/pages/admin/dashboard/Dashboard.jsx
import { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Table,
  Tag,
  Tooltip,
  message,
  Skeleton,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  SolutionOutlined,
  PlusCircleOutlined,
  KeyOutlined,
  DollarOutlined,
  MessageOutlined,
  BarChartOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useApp } from "../../../context/AppContext";
import { useNavigate } from "react-router";
import axios from "axios";

import GeneratePin from "../../../components/generatepin/GeneratePin";
import CreateClass from "../../../components/createclass/CreateClass";
import CreateMessage from "../../../components/message/CreateMessage";
import ChangePassword from "../../../components/chnagePassword/ChangePassword";
import CreateTeacher from "../../../components/createTeacher/CreateTeacher";

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [isCreateStaffOpen, setIsStaffClassOpen] = useState(false);
  const [sendMessage, setSendMessage] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [allStudent, setAllStudent] = useState(null);
  const [inactiveStudent, setInActiveStudent] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);
  const [chartData, setChartData] = useState({
    studentGrowth: [],
    revenueGrowth: [],
  });

  const [messageApi, contextHolder] = message.useMessage();

  const { API_BASE_URL, token, user } = useApp();
  const navigate = useNavigate();

  // ===== Recent Activity =====
  const recentActivities = [
    {
      key: "1",
      action: "New Student Registered",
      actor: "Admin",
      time: "2 mins ago",
      status: "success",
    },
    {
      key: "2",
      action: "Class JSS1 Created",
      actor: "Admin",
      time: "10 mins ago",
      status: "processing",
    },
    {
      key: "3",
      action: "PIN Generated for Parents",
      actor: "Admin",
      time: "1 hour ago",
      status: "success",
    },
    {
      key: "4",
      action: "Message Sent to Teachers",
      actor: "Admin",
      time: "Yesterday",
      status: "warning",
    },
  ];

  const columns = [
    { title: "Action", dataIndex: "action", key: "action" },
    { title: "By", dataIndex: "actor", key: "actor" },
    { title: "Time", dataIndex: "time", key: "time" },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      render: (status) => {
        const colors = {
          success: "green",
          processing: "blue",
          warning: "orange",
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  // ===== Fetch Analytics =====
  const getAnalyticsData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(res)
      setAnalytics(res.data.data.totals);
      setActiveStudent(res?.data?.data?.totals?.activeStudents)
      setInActiveStudent(res?.data?.data?.totals?.inactiveStudents)
      setAllStudent(res?.data?.data?.totals?.students)
      messageApi.success(res?.data?.message || "Dashboard loaded.");
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAnalyticsData();
  }, [token]);

  // ===== Stat Cards =====
  const statCards = [
    {
      icon: <UserOutlined className="text-3xl text-blue-500" />,
      label: "All Time Students",
      value: allStudent ?? 0,
      route: "/admin/dashboard/students",
      tooltip: "View active students",
    },
    {
      icon: <UserOutlined className="text-3xl text-blue-500" />,
      label: "Active Students",
      value: activeStudent ?? 0,
      route: "/admin/dashboard/students",
      tooltip: "View active students",
    },
    {
      icon: <UserOutlined className="text-3xl text-blue-500" />,
      label: "Archived Students",
      value: inactiveStudent ?? 0,
      route: "/admin/dashboard/students",
      tooltip: "View active students",
    },
    {
      icon: <IdcardOutlined className="text-3xl text-orange-500" />,
      label: "Staff",
      value: analytics?.staff ?? 0,
      route: "/admin/dashboard/teachers",
      tooltip: "View staff",
    },
    {
      icon: <BookOutlined className="text-3xl text-purple-500" />,
      label: "Classes",
      value: analytics?.classes ?? 0,
      route: "/admin/dashboard/class-management",
      tooltip: "View classes",
    },
    ...(user?.role === "principal"
      ? [
          {
            icon: <KeyOutlined className="text-3xl text-yellow-500" />,
            label: "PINs",
            value: analytics?.pinsGenerated ?? 0,
            route: "/admin/dashboard/pin-management",
            tooltip: "Manage PINs",
          },
          {
            icon: <DollarOutlined className="text-3xl text-green-500" />,
            label: "Revenue",
            value: analytics?.totalRevenue
              ? `₦${analytics.totalRevenue.toLocaleString()}`
              : "₦0",
            tooltip: "View revenue",
          },
        ]
      : []),
  ];

  // ===== Dummy Charts =====
  useEffect(() => {
    if (user?.role !== "principal") return;
    setChartData({
      studentGrowth: [
        { month: "Jan", count: 120 },
        { month: "Feb", count: 145 },
        { month: "Mar", count: 160 },
        { month: "Apr", count: 180 },
        { month: "May", count: 200 },
        { month: "Jun", count: 230 },
      ],
      revenueGrowth: [
        { month: "Jan", amount: 520000 },
        { month: "Feb", amount: 610000 },
        { month: "Mar", amount: 700000 },
        { month: "Apr", amount: 820000 },
        { month: "May", amount: 960000 },
        { month: "Jun", amount: 1100000 },
      ],
    });
  }, [user]);

  return (
    <div className="space-y-6">
      {contextHolder}

      {user?.needsPasswordChange && <ChangePassword />}

      {/* ===== Stat Cards ===== */}
      <Row gutter={[16, 16]}>
        {statCards.map((item, i) => (
          <Col xs={24} sm={12} md={6} key={i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Tooltip title={item.tooltip}>
                <Card
                  hoverable
                  onClick={() => navigate(item.route)}
                  className="rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all duration-200"
                >
                  {loading ? (
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: "100%" }}
                    />
                  ) : (
                    <div className="flex items-center space-x-4">
                      {item.icon}
                      <div>
                        <Text type="secondary">{item.label}</Text>
                        <Title level={4} className="!m-0">
                          {item.value}
                        </Title>
                      </div>
                    </div>
                  )}
                </Card>
              </Tooltip>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* ===== Quick Actions ===== */}
      {user?.role === "principal" && (
        <Card className="rounded-xl shadow-sm !mb-3">
          <Title level={4}>
            {loading ? (
              <Skeleton.Input active size="small" style={{ width: 150 }} />
            ) : (
              "Quick Actions"
            )}
          </Title>

          <div className="flex flex-wrap gap-3 mt-3">
            <Tooltip title="Generate parent access PINs">
              <Button
                icon={<KeyOutlined />}
                onClick={() => setIsPinModalVisible(true)}
                className="!bg-yellow-500 hover:!bg-yellow-600 !text-white !border-none"
              >
                Generate PIN
              </Button>
            </Tooltip>

            <Tooltip title="Create a new class">
              <Button
                icon={<PlusCircleOutlined />}
                onClick={() => setIsCreateClassOpen(true)}
                className="!bg-green-500 hover:!bg-green-600 !text-white !border-none"
              >
                Create Class
              </Button>
            </Tooltip>

            <Tooltip title="Messages and announcements">
              <Button
                icon={<MessageOutlined />}
                onClick={() => setSendMessage(true)}
                className="!bg-indigo-500 hover:!bg-indigo-600 !text-white !border-none"
              >
                Messages
              </Button>
            </Tooltip>

            <Tooltip title="Manage teacher accounts">
              <Button
                icon={<SolutionOutlined />}
                onClick={() => setIsStaffClassOpen(true)}
                className="!bg-orange-500 hover:!bg-orange-600 !text-white !border-none"
              >
                Register Staff
              </Button>
            </Tooltip>
          </div>
        </Card>
      )}

      {/* ===== Growth Charts (Principal) ===== */}
      {user?.role === "principal" && (
        <Card className="rounded-xl shadow-md">
          <Title level={4}>School Growth Analytics</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card
                title="Student Growth"
                className="rounded-xl shadow-sm"
                bodyStyle={{ padding: 10 }}
                headStyle={{ borderBottom: "none" }}
              >
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData.studentGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="Revenue Growth"
                className="rounded-xl shadow-sm"
                bodyStyle={{ padding: 10 }}
                headStyle={{ borderBottom: "none" }}
              >
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData.revenueGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* ===== Recent Activity ===== */}
      <Card className="rounded-xl shadow-md">
        <Title level={4}>Recent Activity</Title>
        <Table
          columns={columns}
          dataSource={recentActivities}
          bordered
          size="small"
          pagination={{
            pageSize: 7,
            position: ["bottomCenter"],
            className: "custom-pagination", // ✅ preserve your styling
          }}
          scroll={{ x: "max-content" }}
          className="custom-table"
        />
      </Card>

      {/* ===== Modals ===== */}
      <GeneratePin
        open={isPinModalVisible}
        onClose={() => setIsPinModalVisible(false)}
      />
      <CreateTeacher
        open={isCreateStaffOpen}
        onClose={() => setIsStaffClassOpen(false)}
      />
      <CreateClass
        open={isCreateClassOpen}
        onClose={() => setIsCreateClassOpen(false)}
      />
      <CreateMessage open={sendMessage} onClose={() => setSendMessage(false)} />
    </div>
  );
};

export default Dashboard;

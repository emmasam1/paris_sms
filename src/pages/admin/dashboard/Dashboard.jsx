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
  UploadOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  // Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useApp } from "../../../context/AppContext";
import { useNavigate } from "react-router";
import axios from "axios";

import UploadResult from "../../../components/uploadresult/UploadResult";
import GeneratePin from "../../../components/generatepin/GeneratePin";
import CreateClass from "../../../components/createclass/CreateClass";
import CreateMessage from "../../../components/message/CreateMessage";
import ChangePassword from "../../../components/chnagePassword/ChangePassword";

const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [sendMessage, setSendMessage] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [chatDetali, setChatDetail] = useState(null)

  const [messageApi, contextHolder] = message.useMessage();


  const { API_BASE_URL, token, user } = useApp();
  const navigate = useNavigate();

  // ===== Dummy activity data =====
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

  // ===== API CALL: Fetch Analytics =====
  const getAnalyticsData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data.data.totals);
      messageApi.success(
        res?.data?.message || "Dashboard data loaded successfully."
      );
    } catch (error) {
      console.error("Error fetching analytics:", error);
      messageApi.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAnalyticsData();
  }, [token]);

  // ===== Cards with navigation =====
  const statCards = [
    {
      icon: <UserOutlined className="text-3xl !text-blue-500" />,
      label: "Students",
      value: analytics?.students ?? 0,
      route: "/admin/dashboard/students",
      tooltip: "View and manage all students",
    },
    {
      icon: <IdcardOutlined className="text-3xl !text-orange-500" />,
      label: "Total Staff",
      value: analytics?.staff ?? 0,
      route: "/admin/dashboard/teachers",
      tooltip: "View and manage staff members",
    },
    {
      icon: <BookOutlined className="text-3xl !text-purple-500" />,
      label: "Classes",
      value: analytics?.classes ?? 0,
      route: "/admin/dashboard/class-management",
      tooltip: "View all school classes",
    },
    ...(user?.role === "principal"
      ? [
          {
            icon: <KeyOutlined className="text-3xl !text-yellow-500" />,
            label: "Total PINs",
            value: analytics?.pinsGenerated ?? 0,
            route: "/admin/dashboard/pin-management",
            tooltip: "Manage generated PINs",
          },
        ]
      : []),
    ...(user?.role === "principal"
      ? [
          {
            icon: <DollarOutlined className="text-3xl !text-emerald-500" />,
            label: "Revenue",
            value: analytics?.totalRevenue
              ? `₦${analytics.totalRevenue.toLocaleString()}`
              : "₦0",
            tooltip: "View revenue reports",
          },
        ]
      : []), // if not principal → add nothing
  ];

useEffect(() => {
  if (user?.role !== "principal") return;

  const dummyStudentGrowth = [
    { month: "Jan", count: 120 },
    { month: "Feb", count: 145 },
    { month: "Mar", count: 160 },
    { month: "Apr", count: 180 },
    { month: "May", count: 200 },
    { month: "Jun", count: 230 },
  ];

  const dummyRevenueGrowth = [
    { month: "Jan", amount: 520000 },
    { month: "Feb", amount: 610000 },
    { month: "Mar", amount: 700000 },
    { month: "Apr", amount: 820000 },
    { month: "May", amount: 960000 },
    { month: "Jun", amount: 1100000 },
  ];

  setChatDetail((prev) => ({
    ...prev,
    studentGrowth: prev?.studentGrowth?.length ? prev.studentGrowth : dummyStudentGrowth,
    revenueGrowth: prev?.revenueGrowth?.length ? prev.revenueGrowth : dummyRevenueGrowth,
  }));
}, [user]);


  return (
    <div className="space-y-6">
      {contextHolder}

      {user?.needsPasswordChange === true ? (
        <ChangePassword />
      ) : (null)}

      {/* ===== Stats Section ===== */}
      <Row gutter={[16, 16]}>
        {statCards.map((item, i) => (
          <Col xs={24} sm={12} md={6} key={i}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="h-full"
            >
              <Tooltip title={item.tooltip}>
                <Card
                  hoverable
                  onClick={() => navigate(item.route)}
                  className="shadow-md rounded-xl cursor-pointer hover:shadow-lg transition-all duration-200"
                >
                  {loading ? (
                    <Skeleton active paragraph={{ rows: 1 }} />
                  ) : (
                    <div className="flex items-center space-x-4">
                      {item.icon}
                      <div>
                        <p className="text-gray-500">{item.label}</p>
                        <p className="text-xl font-bold">{item.value}</p>
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
      <Card className="shadow-sm rounded-xl !mb-3">
        <Title level={4}>
          {loading ? (
            <Skeleton.Input active size="small" style={{ width: 150 }} />
          ) : (
            "Quick Actions"
          )}
        </Title>

        {loading ? (
          <div className="flex flex-wrap gap-3 mt-3">
            {Array(5)
              .fill()
              .map((_, i) => (
                <Skeleton.Button
                  key={i}
                  active
                  size="large"
                  style={{ width: 150 }}
                />
              ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 mt-3">
            <Tooltip title="Upload student results">
              <Button
                icon={<UploadOutlined />}
                onClick={() => setIsUploadModalVisible(true)}
                className="!bg-blue-500 hover:!bg-blue-600 !text-white !border-none"
              >
                Upload Result
              </Button>
            </Tooltip>

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
                onClick={() => message.info("Opening message center...")}
                className="!bg-orange-500 hover:!bg-orange-600 !text-white !border-none"
              >
                Manage Teachers
              </Button>
            </Tooltip>

            <Tooltip title="View school reports">
              <Button
                icon={<BarChartOutlined />}
                onClick={() => message.info("Generating reports...")}
                className="!bg-gray-600 hover:!bg-gray-700 !text-white !border-none"
              >
                Reports
              </Button>
            </Tooltip>
          </div>
        )}
      </Card>

      {/* ===== Principal Only: Growth Charts ===== */}
      {user?.role === "principal" && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6"
        >
          {/* ==== Dummy Data ==== */}
   

          <Card className="shadow-md rounded-xl border-none">
            <Title level={4}>School Growth Analytics</Title>

            <Row gutter={[16, 16]}>
              {/* Student Growth Chart */}
              <Col xs={24} md={12}>
                <Card
                  title="Student Growth"
                  className="rounded-xl border-none"
                  bodyStyle={{ padding: 10 }}
                  headStyle={{ borderBottom: "none" }}
                >
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chatDetali?.studentGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
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

              {/* Revenue Growth Chart */}
              <Col xs={24} md={12}>
                <Card
                  title="Revenue Growth"
                  className="rounded-xl border-none"
                  bodyStyle={{ padding: 10 }}
                  headStyle={{ borderBottom: "none" }}
                >
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chatDetali?.revenueGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
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
        </motion.div>
      )}

      {/* ===== Recent Activity ===== */}
      <Card className="shadow-md rounded-xl">
        <Title level={4}>Recent Activity</Title>
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={recentActivities}
            bordered
            size="small"
            pagination={{
              pageSize: 7,
              position: ["bottomCenter"],
              className: "custom-pagination",
            }}
            scroll={{ x: "max-content" }}
            className="custom-table"
          />
        )}
      </Card>

      {/* ===== Modals ===== */}
      <UploadResult
        open={isUploadModalVisible}
        onClose={() => setIsUploadModalVisible(false)}
      />
      <GeneratePin
        open={isPinModalVisible}
        onClose={() => setIsPinModalVisible(false)}
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

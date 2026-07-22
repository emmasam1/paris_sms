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
  Modal,
  Spin,
  Descriptions,
} from "antd";
import {
  UserOutlined,
  BookOutlined,
  SolutionOutlined,
  PlusCircleOutlined,
  KeyOutlined,
  DollarOutlined,
  MessageOutlined,
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
import { useApp } from "../../../context/AppContext";
import { useNavigate } from "react-router";
import axios from "axios";
import moment from "moment";

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
  const [isCreateStaffOpen, setIsCreateStaffOpen] = useState(false);
  const [sendMessage, setSendMessage] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [allStudent, setAllStudent] = useState(null);
  const [inactiveStudent, setInActiveStudent] = useState(null);
  const [activeStudent, setActiveStudent] = useState(null);
  const [chartData, setChartData] = useState({
    studentGrowth: [],
    revenueGrowth: [],
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const { API_BASE_URL, token, user } = useApp();
  const navigate = useNavigate();

  // Helper function to format object keys into human-readable labels
  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Render object properties as a clean Ant Design Descriptions grid
  const renderFormattedDetails = (data) => {
    if (!data || typeof data !== "object") {
      return <Text type="secondary">No records found</Text>;
    }

    // Exclude assignment fields completely
    const keysToExclude = ["firstAssignment", "secondAssignment"];
    const entries = Object.entries(data).filter(
      ([key]) => !keysToExclude.includes(key)
    );

    if (entries.length === 0) {
      return <Text type="secondary">No relevant changes recorded</Text>;
    }

    return (
      <Descriptions column={1} bordered size="small" className="bg-gray-50 rounded-md">
        {entries.map(([key, value]) => {
          let displayValue = value;

          if (typeof value === "boolean") {
            displayValue = <Tag color={value ? "green" : "red"}>{value ? "True" : "False"}</Tag>;
          } else if (typeof value === "object" && value !== null) {
            displayValue = JSON.stringify(value);
          } else if (value === null || value === undefined || value === "") {
            displayValue = <Text type="secondary">N/A</Text>;
          }

          return (
            <Descriptions.Item key={key} label={formatLabel(key)}>
              {displayValue}
            </Descriptions.Item>
          );
        })}
      </Descriptions>
    );
  };

  // ===== Fetch Analytics =====
  const getAnalyticsData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data.data.totals);
      setActiveStudent(res?.data?.data?.totals?.activeStudents);
      setInActiveStudent(res?.data?.data?.totals?.inactiveStudents);
      setAllStudent(res?.data?.data?.totals?.students);
      messageApi.success(res?.data?.message || "Dashboard loaded.");
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const getLog = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/activity-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activities = Array.isArray(res?.data?.data) ? res.data.data : [];
      setRecentActivities(activities);
    } catch (error) {
      console.error("Failed to fetch recent activities:", error);
      messageApi.error("Failed to fetch recent activities");
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLog();
    getAnalyticsData();
  }, [token]);

  // Fetch single activity by ID when button is clicked
  const showDetails = async (activityId) => {
    if (!token) return;
    setModalLoading(true);
    setModalVisible(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/activity-logs/${activityId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedActivity(res.data.data);
    } catch (error) {
      console.error("Failed to fetch activity details:", error);
      messageApi.error("Failed to fetch activity details");
      setModalVisible(false);
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    {
      title: "By",
      dataIndex: "actor",
      key: "actor",
      render: (actor) => actor?.fullName || "Unknown",
    },
    {
      title: "Action",
      dataIndex: "message",
      key: "message",
    },
    {
      title: "Time",
      dataIndex: "createdAt",
      key: "time",
      render: (createdAt) =>
        createdAt ? moment(createdAt).format("YYYY-MM-DD HH:mm") : "-",
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "action",
      render: (action) => {
        const statusMap = {
          STUDENT_ARCHIVED: { text: "Archived", color: "orange" },
          STUDENT_UNARCHIVED: { text: "Active", color: "green" },
        };
        const { text, color } = statusMap[action] || {
          text: action,
          color: "blue",
        };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Action",
      key: "details",
      render: (_, record) => (
        <Button type="link" onClick={() => showDetails(record._id)}>
          View Details
        </Button>
      ),
    },
  ];

  // ===== Stat Cards =====
  const statCards = [
    {
      icon: <UserOutlined />,
      label: "All Time Students",
      value: allStudent ?? 0,
      route: "/admin/dashboard/students",
      bgColor: "#f0f2f5",
      iconBg: "#d9e2ec",
      textColor: "#334e68",
    },
    {
      icon: <UserOutlined />,
      label: "Active Students",
      value: activeStudent ?? 0,
      route: "/admin/dashboard/students",
      bgColor: "#f1f7f6",
      iconBg: "#cce0db",
      textColor: "#00695c",
    },
    {
      icon: <UserOutlined />,
      label: "Archived Students",
      value: inactiveStudent ?? 0,
      route: "/admin/dashboard/students",
      bgColor: "#fff5f5",
      iconBg: "#f7d6d6",
      textColor: "#a64452",
    },
    {
      icon: <IdcardOutlined />,
      label: "Staff",
      value: analytics?.staff ?? 0,
      route: "/admin/dashboard/teachers",
      bgColor: "#fdf8f3",
      iconBg: "#f3e4d4",
      textColor: "#8d6e63",
    },
    {
      icon: <BookOutlined />,
      label: "Classes",
      value: analytics?.classes ?? 0,
      route: "/admin/dashboard/class-management",
      bgColor: "#f5f3ff",
      iconBg: "#e0e0f7",
      textColor: "#5e5ce6",
    },
    ...(user?.role === "principal"
      ? [
          {
            icon: <KeyOutlined />,
            label: "PINs",
            value: analytics?.pinsGenerated ?? 0,
            route: "/admin/dashboard/pin-management",
            bgColor: "#fcfaf2",
            iconBg: "#f0e6c1",
            textColor: "#85754e",
          },
          {
            icon: <DollarOutlined />,
            label: "Revenue",
            value: analytics?.totalRevenue
              ? `₦${analytics.totalRevenue.toLocaleString()}`
              : "₦0",
            bgColor: "#f2fcf5",
            iconBg: "#c6e9d1",
            textColor: "#2d6a4f",
          },
        ]
      : []),
  ];

  // ===== Charts Data =====
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
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={index}>
            <Card
              hoverable
              style={{
                backgroundColor: card.bgColor,
                borderRadius: "12px",
                border: "none",
              }}
              onClick={() => card.route && navigate(card.route)}
            >
              <div className="flex items-center gap-4">
                {/* Circular Icon Container */}
                <div
                  style={{
                    backgroundColor: card.iconBg,
                    color: card.textColor,
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                  }}
                  className="flex items-center justify-center text-2xl shrink-0"
                >
                  {card.icon}
                </div>

                {/* Text Content / Skeleton Loader */}
                <div className="w-full">
                  <p style={{ color: "#595959", marginBottom: 0 }}>
                    {card.label}
                  </p>
                  {loading ? (
                    <Skeleton.Input
                      active
                      size="small"
                      style={{ width: 80, marginTop: 4 }}
                    />
                  ) : (
                    <Title
                      level={4}
                      style={{ margin: 0, color: card.textColor }}
                    >
                      {card.value}
                    </Title>
                  )}
                </div>
              </div>
            </Card>
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
                onClick={() => setIsCreateStaffOpen(true)}
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
                {loading ? (
                  <Skeleton active paragraph={{ rows: 6 }} />
                ) : (
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
                )}
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title="Revenue Growth"
                className="rounded-xl shadow-sm"
                bodyStyle={{ padding: 10 }}
                headStyle={{ borderBottom: "none" }}
              >
                {loading ? (
                  <Skeleton active paragraph={{ rows: 6 }} />
                ) : (
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
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* ===== Recent Activity ===== */}
      <Card className="rounded-xl shadow-md !mt-4">
        <Title level={4}>Recent Activity</Title>
        {loading ? (
          <div className="p-4">
            <Skeleton active avatar paragraph={{ rows: 5 }} />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={recentActivities}
            rowKey="_id"
            bordered
            size="small"
            pagination={{
              pageSize: 7,
              position: ["bottomCenter"],
              className: "custom-pagination",
            }}
            scroll={{ x: "max-content" }}
            className="custom-table"
            locale={{ emptyText: "No recent activity" }}
          />
        )}

        <Modal
          title="Activity Details"
          open={modalVisible}
          footer={null}
          width={600}
          onCancel={() => setModalVisible(false)}
        >
          {modalLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            selectedActivity && (
              <div className="space-y-4">
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Action">
                    <Tag color="blue">{selectedActivity.action}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Message">
                    {selectedActivity.message}
                  </Descriptions.Item>
                  <Descriptions.Item label="By">
                    {selectedActivity.actor?.fullName || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {selectedActivity.actor?.email || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Role">
                    {selectedActivity.actor?.role || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created At">
                    {moment(selectedActivity.createdAt).format(
                      "YYYY-MM-DD HH:mm"
                    )}
                  </Descriptions.Item>
                </Descriptions>

                {selectedActivity.changes?.before && (
                  <div>
                    <Text strong className="block mb-1">
                      Previous State
                    </Text>
                    {renderFormattedDetails(selectedActivity.changes.before)}
                  </div>
                )}

                {selectedActivity.changes?.after && (
                  <div>
                    <Text strong className="block mb-1">
                      Updated State
                    </Text>
                    {renderFormattedDetails(selectedActivity.changes.after)}
                  </div>
                )}
              </div>
            )
          )}
        </Modal>
      </Card>

      {/* ===== Modals ===== */}
      <GeneratePin
        open={isPinModalVisible}
        onClose={() => setIsPinModalVisible(false)}
      />
      <CreateTeacher
        open={isCreateStaffOpen}
        onClose={() => setIsCreateStaffOpen(false)}
      />
      <CreateClass
        open={isCreateClassOpen}
        onClose={() => setIsCreateClassOpen(false)}
      />
      <CreateMessage
        open={sendMessage}
        onClose={() => setSendMessage(false)}
      />
    </div>
  );
};

export default Dashboard;
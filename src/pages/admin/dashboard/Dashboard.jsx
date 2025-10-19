import { useState } from "react";
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
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  SolutionOutlined,
  PlusCircleOutlined,
  KeyOutlined,
  DollarOutlined,
  MessageOutlined,
  BarChartOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import UploadResult from "../../../components/uploadresult/UploadResult";
import GeneratePin from "../../../components/generatepin/GeneratePin";
import CreateClass from "../../../components/createclass/CreateClass";
import CreateMessage from "../../../components/message/CreateMessage";

const { Title } = Typography;

const Dashboard = () => {
  const totalPins = 1240;
  const revenue = 356000;

  // Modal states
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [isCreateClassOpen, setIsCreateClassOpen] = useState(false);
  const [sendMessage, setSendMessage] = useState(false);

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

  // Handlers
  const  handleManageTeachers = () => message.info("Opening message center...");
  const handleViewReports = () => message.info("Generating reports...");

  // Modals
  const handleUploadResult = () => setIsUploadModalVisible(true);
  const handleCloseUploadModal = () => setIsUploadModalVisible(false);

  const handleGeneratePIN = () => setIsPinModalVisible(true);
  const handleClosePinModal = () => setIsPinModalVisible(false);

  const handleCreateClass = () => setIsCreateClassOpen(true);
  const handleCloseCreateClass = () => setIsCreateClassOpen(false);

  const handleViewMessages = () => setSendMessage(true);
  const handleCloseMessageModal = () => setSendMessage(false);

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <Row gutter={[16, 16]}>
        {[
          {
            icon: <UserOutlined className="text-3xl !text-blue-500" />,
            label: "Students",
            value: "1,245",
          },
          {
            icon: <TeamOutlined className="text-3xl !text-green-500" />,
            label: "Teachers",
            value: "58",
          },
          {
            icon: <BookOutlined className="text-3xl !text-purple-500" />,
            label: "Classes",
            value: "36",
          },
          {
            icon: <KeyOutlined className="text-3xl !text-yellow-500" />,
            label: "Total PINs",
            value: totalPins,
          },
          {
            icon: <DollarOutlined className="text-3xl !text-emerald-500" />,
            label: "Revenue",
            value: `₦${revenue.toLocaleString()}`,
          },
        ].map((item, i) => (
          <Col xs={24} sm={12} md={6} key={i}>
            <Card className="shadow-md rounded-xl hover:shadow-lg transition">
              <div className="flex items-center space-x-4">
                {item.icon}
                <div>
                  <p className="text-gray-500">{item.label}</p>
                  <p className="text-xl font-bold">{item.value}</p>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Card className="shadow-sm rounded-xl !mb-3">
        <Title level={4}>Quick Actions</Title>
        <div className="flex flex-wrap gap-3 mt-3">
          <Tooltip title="Upload student results">
            <Button
              icon={<UploadOutlined />}
              onClick={handleUploadResult}
              className="!bg-blue-500 hover:!bg-blue-600 !text-white !border-none"
            >
              Upload Result
            </Button>
          </Tooltip>

          <Tooltip title="Generate parent access PINs">
            <Button
              icon={<KeyOutlined />}
              onClick={handleGeneratePIN}
              className="!bg-yellow-500 hover:!bg-yellow-600 !text-white !border-none"
            >
              Generate PIN
            </Button>
          </Tooltip>

          <Tooltip title="Create a new class">
            <Button
              icon={<PlusCircleOutlined />}
              onClick={handleCreateClass}
              className="!bg-green-500 hover:!bg-green-600 !text-white !border-none"
            >
              Create Class
            </Button>
          </Tooltip>

          <Tooltip title="messages and announcements">
            <Button
              icon={<MessageOutlined />}
              onClick={handleViewMessages}
              className="!bg-indigo-500 hover:!bg-indigo-600 !text-white !border-none"
            >
              Messages
            </Button>
          </Tooltip>

          <Tooltip title="Manage teacher accounts">
            <Button
              icon={<SolutionOutlined />}
              onClick={handleManageTeachers}
              className="!bg-orange-500 hover:!bg-orange-600 !text-white !border-none"
            >
              Manage Teachers
            </Button>
          </Tooltip>

          <Tooltip title="View school reports">
            <Button
              icon={<BarChartOutlined />}
              onClick={handleViewReports}
              className="!bg-gray-600 hover:!bg-gray-700 !text-white !border-none"
            >
              Reports
            </Button>
          </Tooltip>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-md rounded-xl">
        <Title level={4}>Recent Activity</Title>
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
        />
      </Card>

      {/* Modals */}
      <UploadResult open={isUploadModalVisible} onClose={handleCloseUploadModal}/>
      <GeneratePin open={isPinModalVisible} onClose={handleClosePinModal} />
      <CreateClass open={isCreateClassOpen} onClose={handleCloseCreateClass} />
      <CreateMessage open={sendMessage} onClose={handleCloseMessageModal} />
    </div>
  );
};

export default Dashboard;

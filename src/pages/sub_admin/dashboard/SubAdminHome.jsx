import React from "react";
import { Card, Row, Col, Progress, Button } from "antd";
import {
  UserOutlined,
  ReadOutlined,
  MessageOutlined,
  CalendarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const SubAdminHome = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Students",
      value: 48,
      icon: <UserOutlined className="text-2xl text-blue-600" />,
      color: "!bg-blue-50",
      path: "/subadmin/dashboard/students",
    },
    {
      title: "Subjects Offered",
      value: 9,
      icon: <ReadOutlined className="text-2xl text-green-600" />,
      color: "!bg-green-50",
      path: "/subadmin/dashboard/subjects",
    },
    {
      title: "Attendance Rate",
      value: "92%",
      icon: <CalendarOutlined className="text-2xl text-yellow-600" />,
      color: "!bg-yellow-50",
      progress: 92,
      path: "/subadmin/dashboard/attendance",
    },
    {
      title: "Messages",
      value: 3,
      icon: <MessageOutlined className="text-2xl text-purple-600" />,
      color: "!bg-purple-50",
      path: "/subadmin/dashboard/messages",
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
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
                className={`cursor-pointer rounded-xl shadow-sm border ${item.color} transition-transform transform hover:scale-[1.02]`}
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

      {/* Recent Activities Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>

        <ul className="space-y-3">
          <li className="flex justify-between text-gray-700">
            <span>✅ Attendance for today marked successfully.</span>
            <span className="text-gray-400 text-sm">2 mins ago</span>
          </li>
          <li className="flex justify-between text-gray-700">
            <span>📢 New message from the school administrator.</span>
            <span className="text-gray-400 text-sm">1 hour ago</span>
          </li>
          <li className="flex justify-between text-gray-700">
            <span>📄 Result upload for Mathematics completed.</span>
            <span className="text-gray-400 text-sm">Yesterday</span>
          </li>
        </ul>
      </motion.div>

      {/* Quick Actions Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => navigate("/subadmin/dashboard/students")}
          >
            View Students
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => navigate("/subadmin/dashboard/results")}
          >
            View Results
          </Button>
          <Button
            icon={<MessageOutlined />}
            onClick={() => navigate("/subadmin/dashboard/messages")}
          >
            View Messages
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SubAdminHome;

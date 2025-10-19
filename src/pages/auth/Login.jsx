import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, Input, Button, Tabs, message } from "antd";
import { useNavigate } from "react-router";
import {
  UserOutlined,
  LockOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

const Login = () => {
  const [activeTab, setActiveTab] = useState("adminTeacher");
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log("Form values:", values);

    if (activeTab === "adminTeacher") {
      if (values.username === "admin" && values.password === "1234") {
        message.success("Admin login successful!");
        navigate("/admin/dashboard");
      } else if (values.username === "teacher" && values.password === "1234") {
        message.success("Teacher login successful!");
        navigate("/teacher/dashboard");
      } else {
        message.error("Invalid credentials");
      }
    }

    if (activeTab === "parent") {
      if (values.pin === "123456") {
        message.success("Parent login successful!");
        navigate("/home");
      } else {
        message.error("Invalid parent PIN");
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <motion.div
        className="bg-white shadow-xl rounded-2xl w-full max-w-sm p-6 border border-gray-100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Branding */}
        <div className="h-15 w-55 flex justify-self-center bg-[url(/src/assets/logo.png)] bg-cover bg-center"></div>
        {/* <h1 className="text-3xl font-bold text-center mb-1 text-slate-900">
          Smart Schola
        </h1> */}
        <p className="text-center text-gray-500 mb-6 text-sm">
          Welcome back! Please sign in to continue.
        </p>

        {/* Tabs */}
        <Tabs
          defaultActiveKey="adminTeacher"
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          centered
          items={[
            { key: "adminTeacher", label: "Staff Login" },
            { key: "parent", label: "Parent Login" },
          ]}
        />

        {/* Forms */}
        <div className="mt-4">
          <AnimatePresence mode="wait">
            {activeTab === "adminTeacher" && (
              <motion.div
                key="adminTeacher"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Form layout="vertical" onFinish={onFinish}>
                  <Form.Item
                    label={<span className="text-sm text-gray-600">Username</span>}
                    name="username"
                    rules={[{ required: true, message: "Please enter username" }]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Enter your username"
                      className="rounded-md bg-gray-50 hover:bg-white focus:bg-white focus:shadow-md transition"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-sm text-gray-600">Password</span>}
                    name="password"
                    rules={[{ required: true, message: "Please enter password" }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Enter your password"
                      className="rounded-md bg-gray-50 hover:bg-white focus:bg-white focus:shadow-md transition"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="!bg-slate-900 !border-none !rounded-md mt-2"
                  >
                    Login
                  </Button>
                </Form>
              </motion.div>
            )}

            {activeTab === "parent" && (
              <motion.div
                key="parent"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Form layout="vertical" onFinish={onFinish}>
                  <Form.Item
                    label={<span className="text-sm text-gray-600">Card PIN</span>}
                    name="pin"
                    rules={[{ required: true, message: "Please enter your Card PIN" }]}
                  >
                    <Input.Password
                      prefix={<IdcardOutlined className="text-gray-400" />}
                      placeholder="Enter your PIN"
                      maxLength={6}
                      className="rounded-md bg-gray-50 hover:bg-white focus:bg-white focus:shadow-md transition"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="!bg-slate-900 !border-none !rounded-md mt-2"
                  >
                    Parent Login
                  </Button>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

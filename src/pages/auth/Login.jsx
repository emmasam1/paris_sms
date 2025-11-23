import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, Input, Button, Tabs, message } from "antd";
import { useNavigate } from "react-router";
import { UserOutlined, LockOutlined, IdcardOutlined } from "@ant-design/icons";
import axios from "axios";
import { useApp } from "../../context/AppContext";

const Login = () => {
  const [activeTab, setActiveTab] = useState("adminTeacher");
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const { API_BASE_URL, loading, setLoading, setUser, setToken } = useApp();

  // ================= STAFF LOGIN ==================
  const handleStaffLogin = async (values) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: values.username,
        password: values.password,
      });

      const { token, user } = res.data;
      messageApi.success(res?.data?.message || "Login successful!");

      // ✅ Save user and token to context (auto-encrypted by AppContext)
      setUser(user);
      setToken(token);

      // Route based on role
      const { role, school } = user;
      switch (role) {
        case "super_admin":
          navigate("/super-admin/dashboard");
          break;
        case "principal":
          if (!school) navigate("/admin/dashboard/settings");
          else navigate("/admin/dashboard");
          break;
        case "school_admin":
          navigate("/admin/dashboard");
          break;
        case "class_admin":
          navigate("/class_admin/dashboard");
          break;
        case "teacher":
          navigate("/teacher/dashboard");
          break;
        default:
          messageApi.warning("Unknown role. Please contact admin.");
      }
    } catch (err) {
      console.error("Login error:", err);
      messageApi.error(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ================= PARENT LOGIN ==================
  // const handleParentLogin = async (values) => {
  //   try {
  //     setLoading(true);
  //     const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
  //       pin: values.pin,
  //     });

  //     const { token, user } = res.data;
  //     messageApi.success(res?.data?.message || "Parent login successful!");

  //     setUser(user);
  //     setToken(token);
  //     navigate("/home");
  //   } catch (err) {
  //     console.error("Parent login error:", err);
  //     messageApi.error(err.response?.data?.message || "Invalid parent PIN");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // ================= PARENT LOGIN (DUMMY) ==================
const handleParentLogin = async (values) => {

  // Dummy PIN check
  if (values.pin === "000000") {
    messageApi.success("Parent login successful!");

    // Set a dummy parent user
    const dummyParent = {
      role: "parent",
      name: "Parent User",
    };

    setUser(dummyParent);
    setToken("dummy-parent-token");

    return navigate("/home");
  }

  // Wrong PIN
  messageApi.error("Invalid parent PIN");
};


  // ================= FORM SUBMIT ==================
  const onFinish = (values) => {
    if (activeTab === "adminTeacher") handleStaffLogin(values);
    else handleParentLogin(values);
  };

  // ================= MOTION VARIANTS ==================
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <motion.div
          className="bg-white shadow-xl rounded-2xl w-full max-w-sm p-6 border border-gray-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Branding */}
          <div className="h-15 w-55 flex justify-self-center bg-[url(/src/assets/logo.png)] bg-cover bg-center"></div>

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
                      label={<span className="text-sm text-gray-600">Email</span>}
                      name="username"
                      rules={[{ required: true, message: "Please enter email" }]}
                    >
                      <Input
                        prefix={<UserOutlined className="text-gray-400" />}
                        placeholder="Enter your email"
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
                      loading={loading}
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
                  <Form layout="vertical" onFinish={handleParentLogin}>
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
                      loading={loading}
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
    </>
  );
};

export default Login;

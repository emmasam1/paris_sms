import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, Input, Button, Tabs, message, Typography } from "antd";
import { useNavigate } from "react-router";
import { UserOutlined, LockOutlined, IdcardOutlined } from "@ant-design/icons";
import { useApp } from "../../context/AppContext";
import http from "../../utils/http";
import logo from "../../assets/logo.png";

const { Text } = Typography;

/* ================= TEXT (i18n READY) ================= */
const TEXT = {
  title: "Education Management Platform",
  subtitle: "Secure access to your account",
  staffTab: "Staff & Administrators",
  parentTab: "Parents / Guardians",
  email: "Email address",
  password: "Password",
  pin: "Student Access Code",
  signIn: "Sign in",
  slowNetwork: "A slow network connection was detected. Please wait.",
  loginSuccess: "Login successful",
  loginError: "Unable to sign in. Please check your credentials.",
};

const Login = () => {
  const [activeTab, setActiveTab] = useState("adminTeacher");
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { API_BASE_URL, loading, setLoading, setUser, setToken } = useApp();

  /* ================= NETWORK AWARENESS ================= */
  const isSlowNetwork =
    navigator.connection &&
    ["slow-2g", "2g"].includes(navigator.connection.effectiveType);

  /* ================= PIN FORMATTER ================= */
  const formatPinInstant = (value = "") => {
    let raw = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const sizes = [3, 4, 4, 4, 4];

    let result = "";
    let index = 0;

    for (let i = 0; i < sizes.length; i++) {
      const part = raw.slice(index, index + sizes[i]);
      if (!part) break;

      result += part;
      index += sizes[i];

      if (part.length === sizes[i] && index < raw.length) {
        result += "-";
      }
    }

    return result;
  };

  /* ================= STAFF LOGIN ================= */
  const handleStaffLogin = async (values) => {
    try {
      if (isSlowNetwork) {
        messageApi.info(TEXT.slowNetwork);
      }

      setLoading(true);

      const res = await http.post(`${API_BASE_URL}/api/auth/login`, {
        email: values.email,
        password: values.password,
      });

      const { token, user } = res.data;

      setUser(user);
      setToken(token);
      sessionStorage.setItem("auth", JSON.stringify({ token, user }));

      switch (user.role) {
        case "super_admin":
          navigate("/super-admin/dashboard");
          break;
        case "principal":
          user.school
            ? navigate("/admin/dashboard")
            : navigate("/admin/dashboard/settings");
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
          messageApi.warning("Unknown user role. Please contact support.");
      }

      messageApi.success(res.data.message || TEXT.loginSuccess);
    } catch (err) {
      messageApi.error(err.response?.data?.message || TEXT.loginError);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PARENT LOGIN ================= */
  const handleParentLogin = async (values) => {
    try {
      if (isSlowNetwork) {
        messageApi.info(TEXT.slowNetwork);
      }

      setLoading(true);

      const res = await http.post(`${API_BASE_URL}/api/parent/login`, {
        pinCode: values.pinCode,
      });

      console.log(res)

      const user = res.data.student;
      const token = res.data.token;

      setUser({ ...user, role: "parent" });
      setToken(token);

      sessionStorage.setItem(
        "auth",
        JSON.stringify({ token, user: { ...user, role: "parent" } }),
      );

      messageApi.success(res.data.message || TEXT.loginSuccess);
      navigate("/home");
    } catch (err) {
      messageApi.error(err.response?.data?.message || TEXT.loginError);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ANIMATION ================= */
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <>
      {contextHolder}
      <div className="bg-white min-h-screen w-full overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT SIDE: Form */}
        <div
          className="hidden md:flex bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/student-with-yellow-t-shirt-writing-blackboard.jpg')",
          }}
        ></div>

        {/* RIGHT SIDE: Image */}
        <div className="bg-white flex items-center justify-center min-h-screen ">
          <motion.div
            className="  rounded-2xl w-full max-w-md p-8 border border-gray-100"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* LOGO */}
            <div className="flex flex-col items-center mb-6">
              <img src={logo} alt="Logo" className="h-12 mb-2" />
              <Text type="secondary" className="text-xs tracking-wide">
                {TEXT.title}
              </Text>
              <p className="text-center text-gray-500 text-sm mt-1">
                {TEXT.subtitle}
              </p>
            </div>

            {/* TABS */}
            <Tabs
              centered
              size="small"
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                { key: "adminTeacher", label: TEXT.staffTab },
                { key: "parent", label: TEXT.parentTab },
              ]}
            />

            <AnimatePresence mode="wait">
              {activeTab === "adminTeacher" && (
                <motion.div
                  key="staff"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Form layout="vertical" onFinish={handleStaffLogin}>
                    <Form.Item
                      label={TEXT.email}
                      name="email"
                      rules={[
                        { required: true, message: "Email is required" },
                        {
                          type: "email",
                          message: "Enter a valid email address",
                        },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="name@example.com"
                        autoComplete="email"
                        aria-label="Email address"
                        disabled={loading}
                      />
                    </Form.Item>

                    <Form.Item
                      label={TEXT.password}
                      name="password"
                      rules={[
                        { required: true, message: "Password is required" },
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        aria-label="Password"
                        disabled={loading}
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      className="!bg-slate-800 hover:!bg-slate-900 h-10 rounded-md"
                    >
                      {TEXT.signIn}
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
                  <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleParentLogin}
                  >
                    <Form.Item
                      label={TEXT.pin}
                      name="pinCode"
                      extra="Enter the access code provided by the school"
                      rules={[
                        {
                          required: true,
                          message: "Access code is required",
                        },
                      ]}
                    >
                      <Input
                        prefix={<IdcardOutlined />}
                        placeholder="PAR-2025-XXXX-XXXX-XXXX"
                        maxLength={24}
                        disabled={loading}
                        onChange={(e) =>
                          form.setFieldsValue({
                            pinCode: formatPinInstant(e.target.value),
                          })
                        }
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      disabled={loading}
                      block
                      className="!bg-slate-800 hover:!bg-slate-900 h-10 rounded-md"
                    >
                      {loading ? "Signing in…" : "Sign in"}
                    </Button>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FOOTER */}
            <p className="text-xs text-center text-gray-400 mt-6">
              © {new Date().getFullYear()} Smart Schola. All rights reserved.
              <br />
              Secure access • Encrypted sessions • GDPR-ready
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Login;

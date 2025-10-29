// src/layouts/admin/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  SettingOutlined,
  KeyOutlined,
  LogoutOutlined,
  MessageOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Grid, Dropdown, Avatar, message } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useApp } from "../../context/AppContext";
import logo from "../../assets/logo.jpeg";
import axios from "axios";

const menu_items = [
  { key: "profile", label: "Profile" },
  { key: "logout", label: "Logout", icon: <LogoutOutlined /> },
];

const { Header, Content, Sider } = Layout;
const { useBreakpoint } = Grid;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

const items = [
  getItem("Dashboard", "/admin/dashboard", <DashboardOutlined />),
  getItem("Students", "/admin/dashboard/students", <UserOutlined />),
  getItem("Teachers", "/admin/dashboard/teachers", <TeamOutlined />),
  getItem("Classes", "/admin/dashboard/class-management", <BookOutlined />),
  getItem("Subjects", "/admin/dashboard/subject-management", <ReadOutlined />),
  getItem("Message", "/admin/dashboard/message", <MessageOutlined />),
  getItem("PIN Management", "/admin/dashboard/pin-management", <KeyOutlined />),
  getItem("Settings", "/admin/dashboard/settings", <SettingOutlined />),
];

const routeTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/dashboard/students": "Student Management",
  "/admin/dashboard/teachers": "Teacher Management",
  "/admin/dashboard/class-management": "Class Management",
  "/admin/dashboard/subject-management": "Subject Management",
  "/admin/dashboard/message": "Message",
  "/admin/dashboard/pin-management": "PIN Management",
  "/admin/dashboard/settings": "Settings",
};

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();
  const { API_BASE_URL, clearSession, token, initialized } = useApp();
  const [user, setUser] = useState(null);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Collapse sidebar on small screens
  useEffect(() => {
    setCollapsed(!screens.lg);
  }, [screens]);

  // ✅ Separate redirect check
  useEffect(() => {
    if (initialized && !token) {
      clearSession();
      navigate("/");
    }
  }, [initialized, token, navigate]);

  // ✅ Fetch user when token is ready
  const getUser = async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data.data);
      // console.log("Fetched user:", res.data.data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      message.error("Session expired. Please log in again.");
      clearSession();
      navigate("/");
    }
  };

  useEffect(() => {
    if (initialized && token) {
      getUser();
    }
  }, [initialized, token]);

  // 🧠 Generate initials if no avatar
  const getInitials = () => {
    if (!user) return "";
    const first = user.firstName?.charAt(0)?.toUpperCase() || "";
    const last = user.lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "AD";
  };

  const pageTitle = routeTitles[location.pathname] || "Dashboard";

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      clearSession();
      navigate("/");
    }
    if (key === "profile") {
      navigate("/admin/dashboard/profile");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="!bg-slate-900 !text-white"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
        }}
      >
        {/* Logo */}
        <div
          className={`flex items-center transition-all duration-300 ${
            collapsed ? "justify-center py-6" : "justify-start gap-4 py-6 px-4"
          }`}
        >
          <div
            className={`bg-white rounded-full flex items-center justify-center ${
              collapsed ? "p-2.5" : "p-2"
            }`}
          >
            <img
              src={logo}
              alt="App Logo"
              className={`object-contain ${collapsed ? "h-10 w-10" : "h-12 w-12"}`}
            />
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <p className="text-white font-semibold text-sm uppercase tracking-wide">
                Admin
              </p>
            </div>
          )}
        </div>

        <Menu
          className="!bg-slate-900 !text-white border-r-0"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={items}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      {/* Main layout */}
      <Layout
        style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}
      >
        <Header
          className="!bg-slate-900 !text-white"
          style={{
            padding: "0 16px",
            position: "fixed",
            top: 0,
            left: collapsed ? 80 : 200,
            right: 0,
            zIndex: 1000,
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1 className="text-lg font-bold text-white m-0">{pageTitle}</h1>

          <Dropdown menu={{ items: menu_items, onClick: handleMenuClick }}>
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-slate-800 cursor-pointer"
              onClick={(e) => e.preventDefault()}
            >
              {user?.avatar ? (
                <Avatar size="large" src={user.avatar} />
              ) : (
                <Avatar
                  size="large"
                  style={{
                    backgroundColor: "#1677ff",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                >
                  {getInitials()}
                </Avatar>
              )}

              <span className="text-sm font-medium text-gray-200">
                {user?.firstName && user?.lastName
                  ? `${user.title} ${user.firstName}`
                  : user?.firstName || "Admin"}
              </span>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: "60px 0 0 0", position: "relative" }}>
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              minHeight: "calc(100vh - 60px)",
              borderRadius: borderRadiusLG,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Watermark */}
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.08,
                zIndex: 0,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              <img
                src={logo}
                alt="Watermark"
                style={{
                  width: 400,
                  height: "auto",
                  filter: "grayscale(100%)",
                }}
              />
            </div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <Outlet />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;

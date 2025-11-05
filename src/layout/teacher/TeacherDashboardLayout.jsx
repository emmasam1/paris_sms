import React, { useState, useEffect } from "react";
import {
  DashboardOutlined,
  BookOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Grid, Dropdown, Space, Avatar } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router";
import { useApp } from "../../context/AppContext";
import axios from 'axios' 

const menu_items = [
  {
    key: "profile",
    label: "Profile",
  },
  {
    key: "logout",
    label: "Logout",
    icon: <LogoutOutlined />,
  },
];

const { Header, Content, Sider } = Layout;
const { useBreakpoint } = Grid;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

// Teacher Menu
const items = [
  getItem("Dashboard", "/teacher/dashboard", <DashboardOutlined />),
  getItem("My Classes", "/teacher/dashboard/classes", <BookOutlined />),
  // getItem("Students Progress", "/teacher/dashboard/students-progress", <TeamOutlined />),
  // getItem("Results", "/teacher/dashboard/results", <FileTextOutlined />),
  getItem("Settings", "/teacher/dashboard/settings", <SettingOutlined />),
];

const routeTitles = {
  "/teacher/dashboard": "Dashboard",
  "/teacher/dashboard/classes": "My Classes",
  "/teacher/dashboard/students-progress": "Students Progress",
  // "/teacher/dashboard/results": "Results",
  "/teacher/dashboard/settings": "Account Settings",
  "/teacher/dashboard/profile": "Profile",
};

const TeacherDashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState([]);
  const { API_BASE_URL, clearSession, token, initialized, logout } = useApp();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    setCollapsed(!screens.lg);
  }, [screens]);

  const pageTitle = routeTitles[location.pathname] || "Dashboard";

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      // handle logout
      navigate("/");
    }
    if (key === "profile") {
      navigate("/profile");
    }
  };

  // Fetch user profile
  const getUser = async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.data);
      console.log("user from layout", res);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // message.error("Session expired. Please log in again.");
      clearSession();
      navigate("/");
    }
  };

  useEffect(() => {
    if (initialized && token) {
      getUser();
    }
  }, [initialized, token]);

  // 🧠 Get initials for avatar fallback
  const getInitials = () => {
    if (!user) return "";
    const first = user.firstName?.charAt(0)?.toUpperCase() || "";
    const last = user.lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "AD";
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
        <Menu
          className="!bg-slate-900 !text-white border-r-0"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={items}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      {/* Main Layout */}
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
          {/* Page Title */}
          <h1 className="text-lg font-bold text-white m-0">{pageTitle}</h1>

          {/* User Info */}
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

        <Content style={{ margin: "60px 0 0 0" }}>
          <div
            style={{
              padding: 24,
              background: colorBgContainer,
              minHeight: "80vh",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeacherDashboardLayout;

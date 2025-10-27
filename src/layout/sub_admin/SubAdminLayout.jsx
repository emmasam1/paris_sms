import React, { useState, useEffect } from "react";
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  MessageOutlined,
  ReadOutlined,
  SettingOutlined,
  LogoutOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Grid, Dropdown, Space, Avatar } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router";

const menu_items = [
  {
    key: "profile",
    label: "Profile",
    icon: <UserOutlined />,
  },
  {
    key: "logout",
    label: "Logout",
    icon: <LogoutOutlined />,
  },
];

const { Header, Content, Sider } = Layout;
const { useBreakpoint } = Grid;

// Helper for Menu
function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

// ============================
// 📌 SubAdmin Sidebar Items
// ============================
const items = [
  getItem("Dashboard", "/sub-admin/dashboard", <DashboardOutlined />),
  // getItem("Students", "/sub-admin/dashboard/students", <UserOutlined />),
//   getItem("Subjects", "/sub-admin/dashboard/subjects", <ReadOutlined />),
  getItem("Results", "/sub-admin/dashboard/results", <BookOutlined />),
//   getItem("Messages", "/sub-admin/dashboard/messages", <MessageOutlined />),
  getItem("Attendance", "/sub-admin/dashboard/attendance", <TeamOutlined />),
  // getItem("Settings", "/sub-admin/dashboard/settings", <SettingOutlined />),
];

// Titles for header
const routeTitles = {
  "/sub-admin/dashboard": "Dashboard",
  // "/sub-admin/dashboard/students": "Student Management",
//   "/sub-admin/dashboard/subjects": "Subject Management",
  "/sub-admin/dashboard/results": "Results",
//   "/sub-admin/dashboard/messages": "Messages",
  "/sub-admin/dashboard/attendance": "Attendance",
  // "/sub-admin/dashboard/settings": "Settings",
};

const SubAdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Collapse automatically on small screen
  useEffect(() => {
    setCollapsed(!screens.lg);
  }, [screens]);

  // Current page title
  const pageTitle = routeTitles[location.pathname] || "Dashboard";

  // Handle profile/logout actions
  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      // clear session
      sessionStorage.clear();
      navigate("/");
    }
    if (key === "profile") {
      navigate("/subadmin/dashboard/profile");
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
          zIndex: 100,
        }}
      >
        {/* <div className="flex flex-col items-center py-5 text-center">
          <Avatar size={collapsed ? 40 : 64} icon={<UserOutlined />} />
          {!collapsed && (
            <p className="text-white mt-2 text-sm font-semibold">SubAdmin</p>
          )}
        </div> */}

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
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: "all 0.2s",
        }}
      >
        {/* Header */}
        <Header
          className="!bg-slate-900 !text-white"
          style={{
            padding: "0 20px",
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
          <h1 className="m-0 text-lg font-semibold">{pageTitle}</h1>

          <Dropdown menu={{ items: menu_items, onClick: handleMenuClick }}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar size="large" icon={<UserOutlined />} />
              </Space>
            </a>
          </Dropdown>
        </Header>

        {/* Content Area */}
        <Content
          style={{
            margin: "60px 0 0 0",
            padding: 20,
            background: colorBgContainer,
            minHeight: "calc(100vh - 80px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default SubAdminLayout;

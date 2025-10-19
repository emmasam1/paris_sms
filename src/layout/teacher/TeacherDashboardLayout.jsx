import React, { useState, useEffect } from "react";
import {
  DashboardOutlined,
  BookOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Layout,
  Menu,
  theme,
  Grid,
  Dropdown,
  Space,
  Avatar,
} from "antd";
import { Outlet, useLocation, useNavigate } from "react-router";

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
      navigate("/teacher/dashboard/profile");
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
            // background: colorBgContainer,
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
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
            {pageTitle}
          </h1>

          <Dropdown
            menu={{ items: menu_items, onClick: handleMenuClick }}
            placement="bottomRight"
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar size="large" icon={<UserOutlined />} />
              </Space>
            </a>
          </Dropdown>
        </Header>

        <Content style={{ margin: "80px 5px 0" }}>
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

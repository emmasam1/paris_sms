import React, { useState, useEffect } from "react";
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  SettingOutlined,
  KeyOutlined,
  LogoutOutlined,
  MessageOutlined
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
// import logo from "../../assets/logo.jpg"

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

const items = [
  getItem("Dashboard", "/admin/dashboard", <DashboardOutlined />),
  getItem("Students", "/admin/dashboard/students", <UserOutlined />),
  getItem("Teachers", "/admin/dashboard/teachers", <TeamOutlined />),
  getItem("Classes", "/admin/dashboard/class-management", <BookOutlined />),
  getItem("Message", "/admin/dashboard/message", <MessageOutlined />),
  // getItem("Parents", "/admin/parents", <SolutionOutlined />),
  // getItem("Results", "/admin/results", <FileTextOutlined />),
  getItem("PIN Management", "/admin/dashboard/pin-management", <KeyOutlined />),
  getItem("Settings", "/admin/dashboard/settings", <SettingOutlined />),
];

const routeTitles = {
  "/admin/dashboard": "Dashboard",
  "/admin/dashboard/students": "Student Management",
  "/admin/dashboard/teachers": "Teacher Management",
  "/admin/dashboard/class-management": "Class Management",
  "/admin/dashboard/message": "Message",
  // "/admin/parents": "Parents",
  // "/admin/results": "Results",
  "/admin/dashboard/pin-management": "PIN Management",
  "/admin/dashboard/settings": "Settings",
};

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Auto collapse only on small screens
  useEffect(() => {
    setCollapsed(!screens.lg);
  }, [screens]);

  // Dynamic Page Title
  const pageTitle = routeTitles[location.pathname] || "Dashboard";

  const handleMenuClick = ({ key }) => {
    if (key === "logout") {
      // handle logout
      navigate("/");
    }
    if (key === "profile") {
      navigate("/admin/dashboard/profile");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar fixed */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="!bg-slate-900 !text-white" // override AntD bg
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          height: "100vh",
        }}
      >
        {/* <div className="flex justify-center mb-6 p-5">
            <img src={logo} alt="" className="w-10"/>
          </div> */}
        <Menu
          className="!bg-slate-900 !text-white border-r-0"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={items}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      {/* Main Layout shifted by sidebar width */}
      <Layout
        style={{ marginLeft: collapsed ? 80 : 200, transition: "all 0.2s" }}
      >
        {/* Header fixed */}
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

          <Dropdown menu={{ items: menu_items, onClick: handleMenuClick  }}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar size="large" icon={<UserOutlined />} />
              </Space>
            </a>
          </Dropdown>
        </Header>

        {/* Content */}
        <Content style={{ margin: "80px 5px 0" }}>
          {/* <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[{ title: "Admin" }, { title: pageTitle }]}
          /> */}
          <div
            style={{
              padding: 24,
              //   minHeight: 360,
              background: colorBgContainer,
            //   borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;

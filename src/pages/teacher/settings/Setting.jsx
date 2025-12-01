import React, { useState } from "react";
import {
  Card,
  Button,
  Input,
  Form,
  Switch,
  message,
} from "antd";
import {
  LockOutlined,
  BellOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useApp } from "../../../context/AppContext";

const Setting = () => {
  const [form] = Form.useForm();
  const [notifications, setNotifications] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  const { API_BASE_URL, token, loading, setLoading, logout } = useApp();

  // 🔐 Submit new password
  const handleSubmit = async (values) => {
    const { currentPassword, newPassword, confirmPassword } = values;

    // ✔ Validate confirm password
    if (newPassword !== confirmPassword) {
      messageApi.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        oldPassword: currentPassword,
        newPassword: newPassword,
      };

      const res = await axios.patch(
        `${API_BASE_URL}/api/auth/change-password`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      messageApi.success(res.data.message || "Password changed successfully!");

      // 🔥 Auto logout
      setTimeout(() => {
        logout();
      }, 1000);

      form.resetFields(); // reset form
    } catch (error) {
      messageApi.error(
        error.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {contextHolder}

      {/* Password Change */}
      <Card className="!mb-6 shadow-md rounded-xl">
        <h3 className="text-lg font-semibold mb-3">Change Password</h3>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: "Please enter your current password" }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[{ required: true, message: "Please enter your new password" }]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            rules={[{ required: true, message: "Please confirm your password" }]}
          >
            <Input.Password placeholder="Confirm your password" />
          </Form.Item>

          <Button
            type="primary"
            icon={<LockOutlined />}
            htmlType="submit"
            loading={loading}
          >
            Update Password
          </Button>
        </Form>
      </Card>

      {/* Preferences */}
      <Card className="shadow-md rounded-xl">
        <h3 className="text-lg font-semibold mb-3">Preferences</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellOutlined />
            <span>Email Notifications</span>
          </div>
          <Switch checked={notifications} onChange={setNotifications} />
        </div>
      </Card>
    </div>
  );
};

export default Setting;

import React, { useState } from "react";
import { Card, Upload, Button, Input, Form, Divider, Switch, message } from "antd";
import { UploadOutlined, SaveOutlined, LockOutlined, BellOutlined } from "@ant-design/icons";

const Setting = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSave = (values) => {
    setLoading(true);
    setTimeout(() => {
      message.success("Settings updated successfully!");
      setLoading(false);
    }, 1500);
  };

  const handlePasswordChange = (values) => {
    if (values.newPassword !== values.confirmPassword) {
      return message.error("New password and confirm password do not match!");
    }
    setLoading(true);
    setTimeout(() => {
      message.success("Password changed successfully!");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="">
      <h2 className="text-2xl font-semibold mb-4"></h2>

      {/* Profile Settings */}
      <Card className="!mb-6 shadow-md rounded-xl">
        <h3 className="text-lg font-semibold mb-3">Profile Information</h3>
        <div className="flex items-center gap-5 mb-4">
          <Upload showUploadList={false}>
            <Button icon={<UploadOutlined />}>Change Profile Image</Button>
          </Upload>
          <div>
            <p className="text-gray-700">John Doe</p>
            <p className="text-gray-500 text-sm">Teacher</p>
          </div>
        </div>

        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item label="Full Name" name="name">
            <Input placeholder="John Doe" />
          </Form.Item>
          <Form.Item label="Email Address" name="email">
            <Input placeholder="johndoe@example.com" disabled />
          </Form.Item>
          <Form.Item label="Phone Number" name="phone">
            <Input placeholder="+234 801 234 5678" />
          </Form.Item>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={loading}
          >
            Save Changes
          </Button>
        </Form>
      </Card>

      {/* Password Change */}
      <Card className="!mb-6 shadow-md rounded-xl">
        <h3 className="text-lg font-semibold mb-3">Change Password</h3>
        <Form layout="vertical" onFinish={handlePasswordChange}>
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
            <Input.Password placeholder="Confirm new password" />
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

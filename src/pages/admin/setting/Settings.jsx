// Settings.jsx
import React, { useState } from "react";
import { Row, Col, Card, Form, Input, Button, Select, Divider, Upload, message } from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";

const { Option } = Select;

const sessions = ["2023/2024", "2024/2025", "2025/2026"];
const terms = ["First Term", "Second Term", "Third Term"];

const Settings = () => {
  const [form] = Form.useForm();

  const handleSave = (values) => {
    console.log("Settings saved:", values);
    message.success("Settings updated successfully!");
  };

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        {/* General Settings */}
        <Col xs={24} md={12}>
          <Card title="General Settings" className="rounded-xl shadow-md">
            <Form layout="vertical" form={form} onFinish={handleSave}>
              <Form.Item label="School Name" name="schoolName" rules={[{ required: true }]}>
                <Input placeholder="Enter school name" />
              </Form.Item>

              <Form.Item label="School Address" name="schoolAddress">
                <Input.TextArea rows={2} placeholder="Enter school address" />
              </Form.Item>

              <Form.Item label="Phone Number" name="phone">
                <Input placeholder="Enter phone number" />
              </Form.Item>

              <Form.Item label="Email" name="email">
                <Input type="email" placeholder="Enter email address" />
              </Form.Item>

              <Form.Item label="School Logo" name="logo">
                <Upload>
                  <Button icon={<UploadOutlined />}>Upload Logo</Button>
                </Upload>
              </Form.Item>

              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Save Changes
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Academic Settings */}
        <Col xs={24} md={12}>
          <Card title="Academic Settings" className="rounded-xl shadow-md">
            <Form layout="vertical" onFinish={handleSave}>
              <Form.Item label="Current Session" name="session" rules={[{ required: true }]}>
                <Select placeholder="Select session">
                  {sessions.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Current Term" name="term" rules={[{ required: true }]}>
                <Select placeholder="Select term">
                  {terms.map((t) => (
                    <Option key={t} value={t}>
                      {t}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="PIN Price (₦)" name="pinPrice">
                <Input type="number" placeholder="e.g. 500" />
              </Form.Item>

              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Save Changes
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Account Settings */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Admin Account Settings" className="rounded-xl shadow-md">
            <Form layout="vertical" onFinish={handleSave}>
              <Form.Item label="Admin Name" name="adminName">
                <Input placeholder="Enter your name" />
              </Form.Item>

              <Form.Item label="Admin Email" name="adminEmail">
                <Input type="email" placeholder="Enter your email" />
              </Form.Item>

              <Form.Item label="Password" name="password">
                <Input.Password placeholder="Enter new password" />
              </Form.Item>

              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Update Account
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;

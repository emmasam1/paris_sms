import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  message,
  Modal,
  Space,
  Popconfirm,
} from "antd";
import {
  SendOutlined,
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const AdminMessage = () => {
  const [form] = Form.useForm();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [recipientType, setRecipientType] = useState("teachers");
  const [viewingMessage, setViewingMessage] = useState(null);

  // Dummy recipient data (replace with API later)
  const teacherRecipients = [
    { id: "all_teachers", name: "All Teachers" },
    { id: "teacher1", name: "Mr. John Doe" },
    { id: "teacher2", name: "Ms. Jane Smith" },
    { id: "teacher3", name: "Mr. Samuel Okon" },
  ];

  const parentRecipients = [
    { id: "all_parents", name: "All Parents" },
    { id: "parent1", name: "Mrs. Johnson (Sarah Johnson's Parent)" },
    { id: "parent2", name: "Mr. Daniel (Michael Daniel's Parent)" },
    { id: "parent3", name: "Mrs. Grace (Ada Grace's Parent)" },
  ];

  const getRecipients = () => {
    if (recipientType === "parents") return parentRecipients;
    if (recipientType === "teachers") return teacherRecipients;
    return [
      { id: "all_users", name: "All Users" },
      ...teacherRecipients.slice(1),
      ...parentRecipients.slice(1),
    ];
  };

  // Handle send / edit
  const handleSend = (values) => {
    setLoading(true);
    const currentRecipients = getRecipients();

    setTimeout(() => {
      if (editingMessage) {
        // Update existing message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.key === editingMessage.key
              ? {
                  ...msg,
                  title: values.title,
                  content: values.content,
                  recipient:
                    values.recipient === "all_users"
                      ? "All Users"
                      : currentRecipients.find((r) => r.id === values.recipient)
                          ?.name,
                  recipientType:
                    recipientType.charAt(0).toUpperCase() +
                    recipientType.slice(1),
                  date: new Date().toLocaleString(),
                }
              : msg
          )
        );
        message.success("Message updated successfully!");
      } else {
        // Add new message
        setMessages((prev) => [
          {
            key: Date.now(),
            title: values.title,
            content: values.content,
            recipient:
              values.recipient === "all_users"
                ? "All Users"
                : currentRecipients.find((r) => r.id === values.recipient)
                    ?.name,
            recipientType:
              recipientType.charAt(0).toUpperCase() + recipientType.slice(1),
            date: new Date().toLocaleString(),
          },
          ...prev,
        ]);
        message.success("Message sent successfully!");
      }

      setLoading(false);
      form.resetFields();
      setModalVisible(false);
      setEditingMessage(null);
    }, 800);
  };

  const handleEdit = (record) => {
    setEditingMessage(record);
    setRecipientType(record.recipientType.toLowerCase());
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      recipient:
        getRecipients().find((r) => r.name === record.recipient)?.id ||
        "all_users",
    });
    setModalVisible(true);
  };

  const handleDelete = (key) => {
    setMessages((prev) => prev.filter((msg) => msg.key !== key));
    message.success("Message deleted successfully!");
  };

  const handleView = (record) => {
    setViewingMessage(record);
  };

  const columns = [
    { title: "Title", dataIndex: "title", key: "title" },
    {
      title: "Recipient Type",
      dataIndex: "recipientType",
      key: "recipientType",
    },
    { title: "Recipient", dataIndex: "recipient", key: "recipient" },
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      render: (text) => (text.length > 50 ? text.slice(0, 50) + "..." : text),
    },
    { title: "Date Sent", dataIndex: "date", key: "date" },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this message?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <MessageOutlined className="text-purple-500" /> Sent Messages
            </span>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => {
                setEditingMessage(null);
                form.resetFields();
                setRecipientType("teachers");
                setModalVisible(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              New Message
            </Button>
          </div>
        }
        className="shadow-md rounded-2xl"
      >
        <Table
          columns={columns}
          dataSource={messages}
          bordered
          size="small"
          pagination={{
            pageSize: 7,
            position: ["bottomCenter"],
            className: "custom-pagination",
          }}
          className="custom-table"
          scroll={{ x: "max-content" }}
        />
      </Card>

      {/* Modal for Send/Edit */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            {editingMessage ? "Edit Message" : "Send Message"}
          </span>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        centered
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSend}>
          {/* Recipient Type */}
          <Form.Item
            label="Recipient Type"
            required
            tooltip="Select who should receive this message"
          >
            <Select
              value={recipientType}
              onChange={(value) => {
                setRecipientType(value);
                form.resetFields(["recipient"]);
              }}
            >
              <Option value="teachers">Teachers</Option>
              <Option value="parents">Parents</Option>
              <Option value="all">All Users</Option>
            </Select>
          </Form.Item>

          {/* Recipient */}
          <Form.Item
            name="recipient"
            label="Recipient"
            rules={[{ required: true, message: "Please select a recipient" }]}
          >
            <Select placeholder="Select recipient">
              {getRecipients().map((r) => (
                <Option key={r.id} value={r.id}>
                  {r.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Message Title"
            rules={[{ required: true, message: "Please enter message title" }]}
          >
            <Input placeholder="Enter message title" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Message Content"
            rules={[
              { required: true, message: "Please enter message content" },
            ]}
          >
            <TextArea rows={5} placeholder="Write your message here..." />
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingMessage ? "Update Message" : "Send Message"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View message */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <EyeOutlined /> View Message
          </span>
        }
        open={!!viewingMessage}
        onCancel={() => setViewingMessage(null)}
        footer={[
          <Button key="close" onClick={() => setViewingMessage(null)}>
            Close
          </Button>,
        ]}
        centered
      >
        {viewingMessage && (
          <div>
            <p>
              <strong>Title:</strong> {viewingMessage.title}
            </p>
            <p>
              <strong>Recipient:</strong> {viewingMessage.recipient}
            </p>
            <p>
              <strong>Date:</strong> {viewingMessage.date}
            </p>
            <p>
              <strong>Content:</strong>
              <br />
              {viewingMessage.content}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminMessage;

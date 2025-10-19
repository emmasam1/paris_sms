import { useState } from "react";
import { Form, Input, Select, Button, Modal, Space, message } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const CreateMessage = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [recipientType, setRecipientType] = useState("teachers");

  // Dummy recipients
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

  // Determine which list to show
  const getRecipients = () => {
    if (recipientType === "parents") return parentRecipients;
    if (recipientType === "teachers") return teacherRecipients;
    return [
      { id: "all_users", name: "All Users" },
      ...teacherRecipients.slice(1),
      ...parentRecipients.slice(1),
    ];
  };

  // Send message
  const handleSend = async (values) => {
    setLoading(true);
    try {
      console.log("Message sent:", {
        ...values,
        recipientType,
        date: new Date().toLocaleString(),
      });

      message.success("Message sent successfully!");
      form.resetFields();
      onClose();
    } catch (error) {
      message.error("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel and reset form
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Send Message"
      open={open}
      onCancel={handleCancel}
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

        {/* Title */}
        <Form.Item
          name="title"
          label="Message Title"
          rules={[{ required: true, message: "Please enter message title" }]}
        >
          <Input placeholder="Enter message title" />
        </Form.Item>

        {/* Content */}
        <Form.Item
          name="content"
          label="Message Content"
          rules={[{ required: true, message: "Please enter message content" }]}
        >
          <TextArea rows={5} placeholder="Write your message here..." />
        </Form.Item>

        {/* Actions */}
        <Form.Item className="text-right">
          <Space>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Send Message
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateMessage;

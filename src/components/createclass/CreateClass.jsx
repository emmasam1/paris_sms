import { Form, Input, Select, Modal, Button, message } from "antd";

const { Option } = Select;

const CreateClass = ({ open, onClose }) => {
  const [form] = Form.useForm();

  const handleSave = (values) => {
    message.success(`Class "${values.name}" created successfully!`);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Create Class"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        {/* Class Name */}
        <Form.Item
          label="Class Name"
          name="name"
          rules={[{ required: true, message: "Please enter class name" }]}
        >
          <Input placeholder="Enter class name" />
        </Form.Item>

        {/* Section */}
        <Form.Item
          label="Section"
          name="section"
          rules={[{ required: true, message: "Please select section" }]}
        >
          <Select placeholder="Select section">
            <Option value="Junior">Junior</Option>
            <Option value="Senior">Senior</Option>
          </Select>
        </Form.Item>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateClass;

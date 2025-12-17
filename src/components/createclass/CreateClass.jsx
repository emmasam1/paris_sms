import { useState } from "react";
import axios from "axios";
import { useApp } from "../../context/AppContext";
import { Form, Input, Button, message, Modal, Select } from "antd";

const { Option } = Select;

const CreateClass = ({ open, onClose }) => {
  const { API_BASE_URL, token } = useApp();
  const [form] = Form.useForm();
  const [isClassLoading, setIsClassLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSave = async (values) => {
    setIsClassLoading(true);
    try {
      const payload = {
        name: values.name,
        arm: values.arm,
        level: values.level,
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/class-management/classes`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      messageApi.success(res?.data?.message || "Class created successfully!");
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error saving class:", error);
      messageApi.error(error?.response?.data?.message || "Failed to save class");
    } finally {
      setIsClassLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Create Class"
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnClose
        width={450}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          onFinishFailed={(err) => console.log("Validation Failed:", err)}
        >
          <Form.Item
            label="Class Name"
            name="name"
            rules={[{ required: true, message: "Please enter class name" }]}
          >
            <Input placeholder="e.g. JSS 1" />
          </Form.Item>

          <Form.Item
            label="Arm"
            name="arm"
            rules={[{ required: true, message: "Please enter class arm" }]}
          >
            <Input placeholder="e.g. Empowerment En-cliff" />
          </Form.Item>

          <Form.Item
            label="Level"
            name="level"
            rules={[{ required: true, message: "Please select level" }]}
          >
            <Select placeholder="Select Level">
              <Option value="SSS1">SSS1</Option>
              <Option value="SSS2">SSS2</Option>
              <Option value="SSS3">SSS3</Option>
              <Option value="JSS1">JSS1</Option>
              <Option value="JSS2">JSS2</Option>
              <Option value="JSS3">JSS3</Option>
              <Option value="PRIMARY">PRIMARY</Option>
              <Option value="NURSERY">NURSERY</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => { form.resetFields(); onClose(); }}>
              Cancel
            </Button>

            <Button type="primary" htmlType="submit" loading={isClassLoading}>
              Create
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CreateClass;

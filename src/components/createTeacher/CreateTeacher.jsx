import { useState } from "react";
import {
  Modal,
  Select,
  Form,
  Button,
  message,
  Row,
  Col,
  Input,
  Upload,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useApp } from "../../context/AppContext";

const { Option } = Select;

const CreateTeacher = ({ open, onClose }) => {
  const { API_BASE_URL, token } = useApp();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Convert file to base64
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Image preview
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  // Handle image changes
  const handleChange = async ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const base64 = await getBase64(newFileList[0].originFileObj);
      form.setFieldsValue({ avatar: base64 });
    } else {
      form.setFieldsValue({ avatar: null });
    }
  };

  // Cancel / Close modal
  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setPreviewImage("");
    setPreviewTitle("");
    setPreviewOpen(false);
    onClose(); // call parent close
  };

  const handleCancelsuccess = () => {
    setIsSuccessModalOpen(false);
  };

  // Submit form
  const createStaff = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append("title", values.title || "");
      formData.append("firstName", values.firstName || "");
      formData.append("lastName", values.lastName || "");
      formData.append("email", values.email || "");
      formData.append("phone", values.phone || "");
      formData.append("address", values.address || "");
      formData.append("role", "teacher");

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      messageApi.success(res?.data?.message || "Staff added successfully");
      setSuccessMessage(res?.data?.message);

      // Reset everything after success
      form.resetFields();
      setFileList([]);
      setPreviewImage("");
      setPreviewTitle("");
      setPreviewOpen(false);
      setIsSuccessModalOpen(true);
      onClose();
    } catch (error) {
      console.error("Staff creation failed:", error);
      messageApi.error(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.msg ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {contextHolder}
      <Modal
        title="Register Staff"
        open={open}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={createStaff}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Please select a title" }]}
              >
                <Select placeholder="Select title">
                  {["Mr", "Mrs", "Miss", "Dr", "Prof", "Ms", "Engr"].map(
                    (title) => (
                      <Option key={title} value={title}>
                        {title}
                      </Option>
                    )
                  )}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: "Please enter first name" }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: "Please enter last name" }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", message: "Enter a valid email" }]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item label="Profile Image" name="avatar">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={handlePreview}
                  onChange={handleChange}
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  {fileList.length >= 1 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
                <Modal
                  open={previewOpen}
                  title={previewTitle}
                  footer={null}
                  onCancel={() => setPreviewOpen(false)}
                >
                  <img
                    alt="preview"
                    style={{ width: "100%" }}
                    src={previewImage}
                  />
                </Modal>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Address" name="address">
                <Input.TextArea rows={2} placeholder="Enter address" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Register
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={null} // No default title
        open={isSuccessModalOpen}
        onCancel={handleCancelsuccess}
        footer={null} // custom footer
        centered // center the modal
        bodyStyle={{
          textAlign: "center",
          padding: "2rem 1.5rem",
        }}
        style={{
          borderRadius: 12,
        }}
        closeIcon={null} // hide default close icon
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 flex items-center justify-center rounded-full"
            style={{ backgroundColor: "#4ade80" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <p className="text-lg font-semibold text-gray-900">
            {successMessage}
          </p>

          <Button
            type="primary"
            onClick={handleCancelsuccess}
            style={{
              backgroundColor: "#4ade80",
              borderColor: "#4ade80",
              borderRadius: 8,
              padding: "0.5rem 1.5rem",
            }}
            className="hover:brightness-90"
          >
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CreateTeacher;

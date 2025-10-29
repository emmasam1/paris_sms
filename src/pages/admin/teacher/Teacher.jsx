import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Row,
  Col,
  Descriptions,
  Upload,
  Empty,
  Skeleton,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  StopOutlined,
  CheckCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import teacher_img from "../../../assets/teacher.jpg";
import { useApp } from "../../../context/AppContext";
import axios from "axios";

const { Option } = Select;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const Teacher = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [role, setRole] = useState("Teacher");
  const [messageApi, contextHolder] = message.useMessage();
  const [teachers, setTeachers] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();

  const [staff, setStaff] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // ✅ Fetch teachers
  const getTeachers = async (page = 1, limit = 10, search = "") => {
    if (!token) return;
    setIsFetching(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/management/staff/all?page=${page}&limit=${limit}${
          search ? `&search=${search}` : ""
        }`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = res.data.data || [];

      console.log(result);
      setStaff(result);
      setPagination({
        current: res.data.pagination?.page || 1,
        pageSize: res.data.pagination?.limit || 10,
        total: res.data.pagination?.total || result.length,
      });
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to load staff");
    } finally {
      setIsFetching(false);
    }
  };

  // ✅ Ensure token ready before fetching
  useEffect(() => {
    if (initialized && token) {
      getTeachers(pagination.current, pagination.pageSize, searchText);
    }
  }, [initialized, token]);

  // ✅ Debounced search
  useEffect(() => {
    if (!initialized || !token) return;
    const timeout = setTimeout(() => {
      getTeachers(1, pagination.pageSize, searchText);
    }, 600);
    return () => clearTimeout(timeout);
  }, [searchText]);

  // ✅ Avatar fallback
  const renderAvatar = (record) => {
    if (record.profileImg) {
      return (
        <img
          src={record.profileImg}
          alt="teacher"
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    const initials = `${record.firstName?.[0] || ""}${
      record.lastName?.[0] || ""
    }`;
    return (
      <Avatar style={{ backgroundColor: "#1677ff", color: "#fff" }}>
        {initials.toUpperCase()}
      </Avatar>
    );
  };

  const handleCancelsuccess = () => {
    setIsSuccessModalOpen(false);
  };

  // ✅ Create or Update Staff
  const createStaff = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let res;

      if (selectedTeacher) {
        // 🔄 Update existing staff
        res = await axios.put(
          `${API_BASE_URL}/api/management/staff/update/${selectedTeacher._id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        messageApi.success(res?.data?.message || "Staff updated successfully");
      } else {
        // 🆕 Create new staff
        res = await axios.post(`${API_BASE_URL}/api/auth/register`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // messageApi.success(res?.data?.message || "Staff added successfully");
      }

      setSuccessMessage(res?.data?.message);

      // ✅ Close modal and refresh table
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
      form.resetFields();
      setSelectedTeacher(null);
      getTeachers(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      console.error("Staff creation/update failed:", error);

      // ✅ Smart error handling
      if (error.response?.data?.message) {
        messageApi.error(error.response.data.message);
      } else if (Array.isArray(error.response?.data?.errors)) {
        messageApi.error(
          error.response.data.errors[0]?.msg || "Validation error"
        );
      } else {
        messageApi.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const addTeacher = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/teachers`,
        {
          // teacher data here
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      messageApi.success(res?.data?.message || "Teacher added successfully");
      // Optionally refresh teacher list here
    } catch (error) {}
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSave = (values) => {
    const newTeacher = {
      ...values,
      key: editingTeacher ? editingTeacher.key : Date.now().toString(),
      profileImg: imageUrl || teacher_img,
      status: editingTeacher ? editingTeacher.status : "active",
    };

    if (editingTeacher) {
      setTeachers((prev) =>
        prev.map((t) => (t.key === editingTeacher.key ? newTeacher : t))
      );
      message.success("Teacher updated");
    } else {
      setTeachers((prev) => [...prev, newTeacher]);
      message.success("Teacher registered");
    }

    form.resetFields();
    setImageUrl(null);
    setEditingTeacher(null);
    setIsModalOpen(false);
  };

  const toggleBlock = (record) => {
    setTeachers((prev) =>
      prev.map((t) =>
        t.key === record.key
          ? { ...t, status: t.status === "active" ? "blocked" : "active" }
          : t
      )
    );
    message.info(
      `${record.name} ${
        record.status === "active" ? "blocked" : "unblocked"
      } successfully`
    );
  };

  const handleImageChange = (info) => {
    const file = info.file.originFileObj;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setImageUrl(null);
  };

  const columns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
    {
      title: "Profile",
      key: "profileImg",
      render: (_, record) => renderAvatar(record),
    },
    {
      title: "Full Name",
      key: "name",
      render: (_, record) => `${record.title} ${record.firstName} ${record.lastName}`,
    },
    { title: "Subject", dataIndex: "subject", key: "subject" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Admin Over Classes",
      dataIndex: "adminOver",
      key: "adminOver",
      render: (classes) =>
        classes?.length ? (
          <>
            {classes.map((cls) => (
              <Tag color="blue" key={cls}>
                {cls}
              </Tag>
            ))}
          </>
        ) : (
          <span>—</span>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "active" ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Blocked</Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedTeacher(record);
              setIsDetailsOpen(true);
            }}
          >
            View
          </Button>

          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTeacher(record);
              setRole(record.role);
              setImageUrl(record.profileImg);
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>

          <Button
            type={record.status === "active" ? "default" : "dashed"}
            size="small"
            danger={record.status === "active"}
            icon={
              record.status === "active" ? (
                <StopOutlined />
              ) : (
                <CheckCircleOutlined />
              )
            }
            onClick={() => toggleBlock(record)}
          >
            {record.status === "active" ? "Block" : "Unblock"}
          </Button>
        </Space>
      ),
    },
  ];

  // ✅ Pagination handler
  const handleTableChange = (paginationInfo) => {
    getTeachers(paginationInfo.current, paginationInfo.pageSize, searchText);
  };

  return (
    <div className="space-y-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by teacher name"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm"
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingTeacher(null);
            form.resetFields();
            setImageUrl(null);
            setRole("Teacher");
            setIsModalOpen(true);
          }}
        >
          Register Teacher
        </Button>
      </div>

      {/* Table with Skeleton Loader */}
      {loading ? (
        <div className="p-6 bg-white rounded-md shadow">
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : staff.length === 0 ? (
        <Empty description="No teachers found" />
      ) : (
        <Table
          columns={columns}
          dataSource={staff}
          rowKey="_id"
          bordered
          size="small"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            position: ["bottomCenter"],
            className: "custom-pagination",
          }}
          onChange={handleTableChange}
          className="custom-table"
          scroll={{ x: "max-content" }}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={editingTeacher ? "Edit Staff" : "Register Staff"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={500}
      >
        <Form layout="vertical" form={form} onFinish={createStaff}>
          <Row gutter={16}>
            {/* Role */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: "Please select a title" }]}
              >
                <Select placeholder="Select title">
                  {["Mr", "Mrs", "Miss", "Dr", "Prof", "Ms", "Engr"].map(
                    (title) => (
                      <Select.Option key={title} value={title}>
                        {title}
                      </Select.Option>
                    )
                  )}
                </Select>
              </Form.Item>
            </Col>

            {/* First Name */}
            <Col xs={24} md={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: "Please enter first name" }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </Col>

            {/* Last Name */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: "Please enter last name" }]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>
            </Col>

            {/* Phone */}
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

            {/* Email */}
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: "email", message: "Enter a valid email" }]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>

            {/* Image Upload */}
            <Col xs={24} md={12}>
              <Form.Item label="Profile Image" name="image">
                <Upload
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleImageChange}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Upload Image</Button>
                </Upload>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="mt-2 w-24 h-24 object-cover rounded-md border"
                  />
                )}
              </Form.Item>
            </Col>

            {/* Address (Full width) */}
            <Col span={24}>
              <Form.Item label="Address" name="address">
                <Input.TextArea rows={2} placeholder="Enter address" />
              </Form.Item>
            </Col>
          </Row>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingTeacher ? "Update" : "Register"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/*Success Modal */}
      <Modal
        title="Success"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isSuccessModalOpen}
        footer={null}
        onCancel={handleCancelsuccess}
      >
        {successMessage}
      </Modal>

      {/* Teacher Details */}
      <Modal
        title="Teacher Details"
        open={isDetailsOpen}
        onCancel={() => setIsDetailsOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailsOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        <div className="w-40 h-40 mb-3">
          <img
            src={selectedTeacher?.profileImg || teacher_img}
            alt="Teacher"
            className="object-cover w-full h-full rounded-md"
          />
        </div>

        {selectedTeacher && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Name">
              {selectedTeacher.firstName} {selectedTeacher.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              {selectedTeacher.role}
            </Descriptions.Item>
            <Descriptions.Item label="Subject">
              {selectedTeacher.subject}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedTeacher.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedTeacher.email || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Address">
              {selectedTeacher.address || "—"}
            </Descriptions.Item>
            {selectedTeacher.role === "Admin" && (
              <Descriptions.Item label="Admin Over Classes">
                {selectedTeacher.adminOver?.length
                  ? selectedTeacher.adminOver.join(", ")
                  : "—"}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Status">
              {selectedTeacher.status === "active" ? "Active" : "Blocked"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Teacher;

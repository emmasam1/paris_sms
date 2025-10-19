import React, { useState } from "react";
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

  const [teachers, setTeachers] = useState([
    {
      key: "1",
      name: "Mr. Adams",
      subject: "Mathematics",
      phone: "08012345678",
      email: "adams@example.com",
      username: "adams",
      address: "12 Broad Street, Lagos",
      role: "Admin",
      adminOver: ["JSS1", "JSS2"],
      status: "active",
      profileImg: teacher_img,
      dateJoined: "2023-09-01",
    },
    {
      key: "2",
      name: "Mrs. Johnson",
      subject: "English Language",
      phone: "08087654321",
      email: "johnson@example.com",
      username: "johnson",
      address: "5 Unity Close, Abuja",
      role: "Teacher",
      adminOver: [],
      status: "blocked",
      profileImg: teacher_img,
      dateJoined: "2022-01-15",
    },
  ]);

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
    {
      title: "Profile",
      dataIndex: "profileImg",
      key: "profileImg",
      render: (img) => (
        <img
          src={img}
          alt="teacher"
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Subject", dataIndex: "subject", key: "subject" },
    { title: "Role", dataIndex: "role", key: "role" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Username", dataIndex: "username", key: "username" },
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

  return (
    <div className="space-y-6">
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

      <Table
        columns={columns}
        dataSource={filteredTeachers}
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

      {/* Add/Edit Modal */}
      <Modal
      title={editingTeacher ? "Edit Teacher" : "Register Teacher"}
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      width={500}
    >
      <Form layout="vertical" form={form} onFinish={handleSave}>
        <Row gutter={16}>
          {/* Title */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please select title" }]}
            >
              <Select placeholder="Select title">
                <Option value="Mr">Mr</Option>
                <Option value="Mrs">Mrs</Option>
                <Option value="Miss">Miss</Option>
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
              rules={[{ required: true, message: "Please enter phone number" }]}
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

          {/* Username */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: "Please enter username" }]}
            >
              <Input placeholder="Enter username" />
            </Form.Item>
          </Col>

          {/* Password */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          </Col>

          {/* Role */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: "Please select role" }]}
            >
              <Select
                placeholder="Select role"
                onChange={(val) => setRole(val)}
              >
                <Option value="Teacher">Teacher</Option>
                <Option value="Admin">Admin</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Admin Over Class (if Admin) */}
          {role === "Admin" && (
            <Col xs={24} md={12}>
              <Form.Item
                label="Admin Over Class"
                name="adminOver"
                rules={[
                  { required: true, message: "Please select at least one class" },
                ]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Select class(es)"
                >
                  <Option value="JSS1">JSS1</Option>
                  <Option value="JSS2">JSS2</Option>
                  <Option value="JSS3">JSS3</Option>
                  <Option value="SS1">SS1</Option>
                  <Option value="SS2">SS2</Option>
                  <Option value="SS3">SS3</Option>
                </Select>
              </Form.Item>
            </Col>
          )}

          {/* Subject */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Subject"
              name="subject"
              rules={[{ required: true, message: "Please select subject" }]}
            >
              <Select placeholder="Select subject">
                <Option value="Mathematics">Mathematics</Option>
                <Option value="English Language">English Language</Option>
                <Option value="Biology">Biology</Option>
                <Option value="Physics">Physics</Option>
                <Option value="Chemistry">Chemistry</Option>
                <Option value="Economics">Economics</Option>
                <Option value="Government">Government</Option>
                <Option value="Computer Science">Computer Science</Option>
              </Select>
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

          {/* Address (Full width at bottom) */}
          <Col span={24}>
            <Form.Item label="Address" name="address">
              <Input.TextArea rows={2} placeholder="Enter address" />
            </Form.Item>
          </Col>
        </Row>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {editingTeacher ? "Update" : "Register"}
          </Button>
        </div>
      </Form>
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
              {selectedTeacher.name}
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
            <Descriptions.Item label="Username">
              {selectedTeacher.username}
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

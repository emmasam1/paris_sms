import React, { useEffect, useState } from "react";
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
  Descriptions,
  Avatar,
  Skeleton,
  Empty,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useApp } from "../../../context/AppContext";

const { Option } = Select;

const Teacher = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const { API_BASE_URL, token, initialized, setLoading } = useApp();

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

  // ✅ Create or Update Staff
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (selectedTeacher) {
        // Update existing staff
        const res = await axios.put(
          `${API_BASE_URL}/api/management/staff/update/${selectedTeacher._id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success(res.data.message || "Staff updated successfully");
      } else {
        // Create new staff
        const res = await axios.post(
          `${API_BASE_URL}/api/management/staff/create`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success(res.data.message || "Staff added successfully");
      }

      setIsModalOpen(false);
      form.resetFields();
      setSelectedTeacher(null);
      getTeachers(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Block/Unblock logic (with API)
  const toggleBlock = async (record) => {
    try {
      setLoading(true);
      const action =
        record.status === "active"
          ? "block"
          : "unblock";

      const res = await axios.patch(
        `${API_BASE_URL}/api/management/staff/${action}/${record._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success(res.data.message || `Staff ${action}ed successfully`);
      getTeachers(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      console.error(error);
      message.error("Failed to update staff status");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Table columns (old header, no username)
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
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Role", dataIndex: "role", key: "role" },
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
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedTeacher(record);
              setIsModalOpen(true);
              form.setFieldsValue(record);
            }}
          >
            Edit
          </Button>
          <Button
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
          <Button
            size="small"
            type="default"
            icon={<SettingOutlined />}
            onClick={() =>
              message.info(`Manage ${record.firstName} ${record.lastName}`)
            }
          >
            Manage
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

      {/* Search & Add */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search staff by name or email"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-sm"
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setSelectedTeacher(null);
            setIsModalOpen(true);
          }}
        >
          Register Staff
        </Button>
      </div>

      {/* Table with Skeleton Loader */}
      {isFetching ? (
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

      {/* View Modal */}
      <Modal
        title="Staff Details"
        open={isDetailsOpen}
        onCancel={() => setIsDetailsOpen(false)}
        footer={null}
        width={700}
      >
        {selectedTeacher ? (
          <>
            <div className="mb-4 flex items-center gap-4">
              {renderAvatar(selectedTeacher)}
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedTeacher.firstName} {selectedTeacher.lastName}
                </h3>
                <p className="text-gray-600">{selectedTeacher.role}</p>
              </div>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Email">
                {selectedTeacher.email || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedTeacher.phone || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {selectedTeacher.gender || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                {selectedTeacher.role || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedTeacher.status === "active" ? "Active" : "Blocked"}
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <Skeleton active paragraph={{ rows: 4 }} />
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        title={selectedTeacher ? "Edit Staff" : "Register New Staff"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedTeacher(null);
        }}
        onOk={handleSubmit}
        okText={selectedTeacher ? "Update" : "Create"}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "Enter first name" }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Enter last name" }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Enter email" },
              { type: "email", message: "Enter valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: "Enter phone number" }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            label="Gender"
            name="gender"
            rules={[{ required: true, message: "Select gender" }]}
          >
            <Select placeholder="Select gender">
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Select role" }]}
          >
            <Select placeholder="Select role">
              <Option value="teacher">Teacher</Option>
              <Option value="admin">Admin</Option>
              <Option value="staff">Staff</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Teacher;

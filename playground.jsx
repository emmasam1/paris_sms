// --------------  FULL TEACHER MANAGEMENT PAGE  --------------------

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
  Dropdown,
  Menu,
} from "antd";

import {
  SearchOutlined,
  EditOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  SettingOutlined,
  MoreOutlined,
  PlusOutlined,
  SwapOutlined,
} from "@ant-design/icons";

import teacher_img from "../../../assets/teacher.jpg";
import { useApp } from "../../../context/AppContext";
import axios from "axios";

const { Option } = Select;

const Teacher = () => {
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isFetching, setIsFetching] = useState(false);

  const {
    API_BASE_URL,
    token,
    initialized,
    loading,
    setLoading,
    user,
  } = useApp();

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleValue, setRoleValue] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  // Convert to base64
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Preview uploaded image
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
  };

  const handleChange = async ({ fileList: newList }) => {
    setFileList(newList);
    if (newList.length > 0) {
      const file = newList[0].originFileObj;
      const base64 = await getBase64(file);
      form.setFieldsValue({ avatar: base64 });
    }
  };

  useEffect(() => {
    if (editingTeacher?.avatar) {
      setFileList([
        {
          uid: "-1",
          name: "avatar.png",
          status: "done",
          url: editingTeacher.avatar,
        },
      ]);
      form.setFieldsValue({ avatar: editingTeacher.avatar });
    } else {
      setFileList([]);
    }
  }, [editingTeacher]);

  // Fetch Teachers
  const getTeachers = async (page = 1, limit = 10, search = "") => {
    if (!token) return;
    setIsFetching(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/staff-management/staff/all?page=${page}&limit=${limit}${
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
      messageApi.error("Failed to load staff");
    } finally {
      setIsFetching(false);
    }
  };

  const getClass = async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes?limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(res?.data?.data || []);
    } catch (error) {
      messageApi.error("Failed to fetch classes");
    }
  };

  useEffect(() => {
    getClass();
  }, [token]);

  // Debounced search
  useEffect(() => {
    if (!initialized || !token) return;
    const timeout = setTimeout(() => {
      getTeachers(1, pagination.pageSize, searchText);
    }, 600);
    return () => clearTimeout(timeout);
  }, [searchText]);

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
      formData.append("role", values.role || "teacher");

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }

      let res;
      if (editingTeacher) {
        res = await axios.patch(
          `${API_BASE_URL}/api/management/update-profile/${editingTeacher._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        res = await axios.post(
          `${API_BASE_URL}/api/auth/register`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setSuccessMessage(res?.data?.message);
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
      form.resetFields();
      setFileList([]);
      setEditingTeacher(null);
      getTeachers();
    } catch (error) {
      messageApi.error(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.msg ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const openRoleModal = (staff) => {
    setSelectedStaff(staff);
    setRoleValue(staff.role);
    setIsRoleModalOpen(true);
  };

  const changeStaffRole = async () => {
    if (!selectedStaff) return;
    try {
      setLoading(true);
      const res = await axios.patch(
        `${API_BASE_URL}/api/staff-management/staff/${selectedStaff._id}/change-role`,
        { role: roleValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      messageApi.success(res.data.message);
      setIsRoleModalOpen(false);
      getTeachers();
    } catch (error) {
      messageApi.error("Failed to change role");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAdmin = async () => {
    if (!selectedClass) {
      messageApi.warning("Select a class");
      return;
    }

    try {
      setAssignLoading(true);
      const res = await axios.patch(
        `${API_BASE_URL}/api/staff-management/staff/${selectedStaff._id}/promote-class-admin`,
        { levelName: selectedClass },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      messageApi.success(res.data.message);
      setIsAssignModalOpen(false);
      getTeachers();
    } catch (error) {
      messageApi.error("Failed to assign");
    } finally {
      setAssignLoading(false);
    }
  };

  const removeAdminRole = async (record) => {
    try {
      setLoading(true);
      const res = await axios.patch(
        `${API_BASE_URL}/api/staff-management/staff/${record._id}/demote-class-admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      messageApi.success(res.data.message);
      getTeachers();
    } catch (error) {
      messageApi.error("Error removing admin role");
    } finally {
      setLoading(false);
    }
  };

  const renderAvatar = (record) => {
    const url = record.avatar;
    return url ? (
      <img
        src={url}
        className="w-10 h-10 rounded-full object-cover"
        alt="avatar"
      />
    ) : (
      <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded-full">
        {record.firstName?.[0]}
        {record.lastName?.[0]}
      </div>
    );
  };

  const toggleBlock = (record) => {
    messageApi.info("This is demo block state (not API)");
  };

  const columns = [
    {
      title: "S/N",
      render: (_, __, i) => i + 1,
    },
    {
      title: "Image",
      render: (_, record) => renderAvatar(record),
    },
    {
      title: "Title",
      dataIndex: "title",
    },
    {
      title: "Full Name",
      render: (_, r) => `${r.firstName} ${r.lastName}`,
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) =>
        role === "class_admin" ? "Class Admin" : role === "teacher" ? "Teacher" : role,
    },
    {
      title: "Phone",
      dataIndex: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Action",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="view"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedTeacher(record);
                setIsDetailsOpen(true);
              }}
            >
              View
            </Menu.Item>

            <Menu.Item
              key="edit"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingTeacher(record);
                form.setFieldsValue(record);
                setIsModalOpen(true);
              }}
            >
              Edit
            </Menu.Item>

            {user?.role === "principal" && (
              <Menu.Item
                key="role"
                icon={<SwapOutlined />}
                onClick={() => openRoleModal(record)}
              >
                Change Role
              </Menu.Item>
            )}

            <Menu.Item
              key="admin"
              icon={<SettingOutlined />}
              onClick={() => {
                if (record.role === "class_admin") {
                  removeAdminRole(record);
                } else {
                  setSelectedStaff(record);
                  setIsAssignModalOpen(true);
                }
              }}
            >
              {record.role === "class_admin" ? "Remove Admin Role" : "Assign Admin Role"}
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              key="toggle"
              icon={<StopOutlined />}
              onClick={() => toggleBlock(record)}
            >
              Block/Unblock
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button>
              <MoreOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Header */}
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search staff"
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
            setFileList([]);
            setIsModalOpen(true);
          }}
        >
          Register Staff
        </Button>
      </div>

      {/* Table */}
      {isFetching ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : staff.length === 0 ? (
        <Empty description="No staff found" />
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
          }}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        title={editingTeacher ? "Edit Staff" : "Register Staff"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingTeacher(null);
        }}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={createStaff}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true }]}
              >
                <Select>
                  {["Mr", "Mrs", "Miss", "Dr", "Prof", "Ms"].map((t) => (
                    <Option key={t} value={t}>
                      {t}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Address" name="address">
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Role" name="role">
                <Select>
                  <Option value="teacher">Teacher</Option>
                  <Option value="class_admin">Class Admin</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Avatar">
                <Upload
                  beforeUpload={() => false}
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={handlePreview}
                  onChange={handleChange}
                >
                  {fileList.length < 1 && "+ Upload"}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="mt-4"
          >
            {editingTeacher ? "Update Staff" : "Register Staff"}
          </Button>
        </Form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        open={isDetailsOpen}
        footer={null}
        onCancel={() => setIsDetailsOpen(false)}
        title="Staff Details"
      >
        {selectedTeacher && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Name">
              {selectedTeacher.firstName} {selectedTeacher.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              {selectedTeacher.role}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedTeacher.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedTeacher.email}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Success Modal */}
      <Modal
        open={isSuccessModalOpen}
        onCancel={() => setIsSuccessModalOpen(false)}
        footer={null}
      >
        <h3 className="text-lg font-semibold mb-3">Success</h3>
        <p>{successMessage}</p>
      </Modal>

      {/* Assign Admin Modal */}
      <Modal
        title="Assign Admin Role"
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        onOk={handleAssignAdmin}
        confirmLoading={assignLoading}
      >
        <Select
          className="w-full"
          placeholder="Select Class"
          onChange={(v) => setSelectedClass(v)}
        >
          {classes.map((c) => (
            <Option key={c._id} value={c.name}>
              {c.name} {c.arm}
            </Option>
          ))}
        </Select>
      </Modal>

      {/* Change Role Modal */}
      <Modal
        title="Change Staff Role"
        open={isRoleModalOpen}
        onCancel={() => setIsRoleModalOpen(false)}
        onOk={changeStaffRole}
        confirmLoading={loading}
      >
        <Select
          className="w-full"
          value={roleValue}
          onChange={(v) => setRoleValue(v)}
        >
          <Option value="teacher">Teacher</Option>
          <Option value="class_admin">Class Admin</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default Teacher;

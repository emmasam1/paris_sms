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
  MinusOutlined,
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
  const [imageUrl, setImageUrl] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const [staff, setStaff] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState([]);

  // 🧠 Convert to base64 (for preview and sending)
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // 🧩 Handle image preview
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

  // 🧩 Handle image change (adds/removes from fileList)
  const handleChange = async ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // If you want to save the avatar to form field (for backend)
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      const base64 = await getBase64(file);
      form.setFieldsValue({ avatar: base64 });
    } else {
      form.setFieldsValue({ avatar: null });
    }
  };

  // 🧩 When editing teacher, pre-fill the avatar preview
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

  // ✅ Fetch teachers
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
      messageApi.success(res?.data?.message);
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
    const avatarUrl = record?.avatar;

    return (
      <div className="flex items-center justify-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${record.firstName || "Staff"}'s avatar`}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 text-sm font-semibold">
            {record?.firstName?.[0]?.toUpperCase() || "?"}
            {record?.lastName?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>
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

      // Build FormData (multipart/form-data)
      const formData = new FormData();
      formData.append("title", values.title || "");
      formData.append("firstName", values.firstName || "");
      formData.append("lastName", values.lastName || "");
      formData.append("email", values.email || "");
      formData.append("phone", values.phone || "");
      formData.append("address", values.address || "");
      formData.append("role", values.role || "teacher"); // backend expects role

      // If there's a file uploaded (new file), append it as `avatar`
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("avatar", fileList[0].originFileObj);
      }
      // NOTE: when editing and user didn't upload a new file, do NOT append avatar.
      // Backend will keep existing avatar (as your registerStaff handler checks req.files).

      let res;
      if (editingTeacher) {
        // Update profile (multipart) - server should accept files here too
        res = await axios.patch(
          `${API_BASE_URL}/api/management/update-profile/${editingTeacher._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              // DON'T set Content-Type manually—let the browser set the multipart boundary:
              // "Content-Type": "multipart/form-data"
            },
          }
        );
        messageApi.success(res?.data?.message || "Staff updated successfully");
      } else {
        // Register new staff
        res = await axios.post(`${API_BASE_URL}/api/auth/register`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            // same note: don't set content-type manually
          },
        });
        messageApi.success(res?.data?.message || "Staff added successfully");
      }

      // Success flow
      setSuccessMessage(res?.data?.message);
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
      form.resetFields();
      setFileList([]);
      setEditingTeacher(null);
      getTeachers(pagination.current, pagination.pageSize, searchText);
    } catch (error) {
      console.error("Staff creation/update failed:", error);
      messageApi.error(
        error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.msg ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getClass = async () => {
    if (!token) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setClasses(res?.data?.data || []);
      // console.log(res);
      // messageApi.success(res?.data?.message || "Classes fetched successfully");
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch classes"
      );
    }
  };

  useEffect(() => {
    getClass();
  }, [token]);

  const handleAssignAdmin = async () => {
    const id = selectedStaff?._id;
    if (!selectedClass) {
      messageApi.warning("Please select a class to assign.");
      return;
    }

    const className = selectedClass;

    setAssignLoading(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/staff-management/staff/${id}/promote-class-admin`,
        {
          levelName: className,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      messageApi.success(
        res?.data?.message || "Admin role assigned successfully!"
      );
      setIsAssignModalOpen(false);
      setSelectedClass(null);
      setSelectedStaff(null);
      getTeachers(); // refresh table after assignment
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to assign admin role"
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const removeAdminRole = async (record) => {
    setIsAssignModalOpen(false);
    setLoading(true);
    const id = record?._id;

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/api/staff-management/staff/${id}/demote-class-admin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      messageApi.success(res?.data?.message);
      getTeachers();
    } catch (error) {
      messageApi.error(res?.data?.message);
    } finally {
      setLoading(false);
    }
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
    setEditingTeacher(null);
    form.resetFields();
    setImageUrl(null);
  };

  const handleManageStaff = (record) => {
    setSelectedStaff(record);
    setIsAssignModalOpen(true);
  };

  const columns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
    {
      title: "Image",
      key: "avatar",
      render: (_, record) => renderAvatar(record),
    },
    {
      title: "Title",
      key: "title",
      render: (_, record) => `${record.title || ""}`,
    },
    {
      title: "Full Name",
      key: "name",
      render: (_, record) =>
        ` ${record.firstName || ""} ${record.lastName || ""}`.trim(),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (_, record) => {
        const subjects = record?.subjects || [];
        if (subjects.length === 0) return "-";

        return subjects
          .map((s) => `${s.name} (${s.levels?.join(", ")})`)
          .join(", ");
      },
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role, record) => {
        return record.role === "class_admin" ? (
          <p>Class Admin</p>
        ) : record.role === "teacher" ? (
          <p>Teacher</p>
        ) : (
          role
        );
      },
    },
    {
      title: "Class Teacher",
      dataIndex: "formClass",
      key: "formClass",
      render: (formClass) => {
        return formClass ? (
          <p>
            {formClass.name} {formClass.arm}
          </p>
        ) : (
          <p>--</p>
        );
      },
    },
    {
      title: "Admin Over",
      dataIndex: "adminLevel",
      key: "adminLevel",
      render: (adminLevel, record) => {
        return record.role === "class_admin" ? (
          <p>{adminLevel || "--"}</p>
        ) : (
          <p>--</p>
        );
      },
    },

    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
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
      // width: 50,
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="view"
              icon={<EyeOutlined />}
              onClick={() => {
                console.log(record);
                setSelectedTeacher(record);
                setIsDetailsOpen(true);
              }}
            >
              View Details
            </Menu.Item>

            <Menu.Item
              key="edit"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingTeacher(record);
                form.setFieldsValue(record);
                setImageUrl(record.profileImg);
                setIsModalOpen(true);
              }}
            >
              Edit Staff
            </Menu.Item>

            <Menu.Item
              key="subject"
              onClick={() => handleManageStaff(record)}
            >
              {record.subjects?.length > 0 ? (
                // 🔴 Unassign Subject
                <Button
                  className="!border-0 !p-0 hover:!text-black hover:!bg-transparent flex items-center gap-1"
                  loading={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSubject(record);
                  }}
                  icon={<MinusOutlined />}
                >
                  Unassign Subject
                </Button>
              ) : (
                // 🟢 Assign Subject
                <Button
                  className="!border-0 !p-0 hover:!text-black hover:!bg-transparent flex items-center gap-1"
                  loading={loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    assignSubject(record);
                  }}
                  icon={<PlusOutlined />}
                >
                  Assign Subject
                </Button>
              )}
            </Menu.Item>

            <Menu.Item
              key="manage"
              icon={<SettingOutlined />}
              onClick={() => handleManageStaff(record)} // Only fires for assigning
            >
              {record.role === "class_admin" ? (
                <Button
                  className="!border-0 !p-0 hover:!text-black hover:!bg-transparent"
                  loading={loading}
                  onClick={(e) => {
                    e.stopPropagation(); // 🧠 Prevent modal from opening
                    removeAdminRole(record);
                  }}
                >
                  Remove Admin Role
                </Button>
              ) : (
                "Assign Admin Role"
              )}
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              key="toggle"
              icon={
                record.status === "active" ? (
                  <StopOutlined style={{ color: "red" }} />
                ) : (
                  <CheckCircleOutlined style={{ color: "green" }} />
                )
              }
              onClick={() => toggleBlock(record)}
            >
              {record.status === "active" ? "Block" : "Unblock"}
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
            setIsModalOpen(true);
          }}
        >
          Register Teacher
        </Button>
      </div>

      {isFetching ? (
        <div className="p-6 ">
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
                  beforeUpload={() => false} // prevent auto upload
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
              {editingTeacher ? "Update" : "Register"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Success Modal */}
      <Modal
        title="Success"
        open={isSuccessModalOpen}
        onCancel={handleCancelsuccess}
        footer={[
          <Button key="close" onClick={handleCancelsuccess}>
            OK
          </Button>,
        ]}
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
            src={selectedTeacher?.avatar || teacher_img}
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
            <Descriptions.Item label="Status">
              {selectedTeacher.status === "active" ? "Active" : "Blocked"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Assign Admin Role Modal */}
      <Modal
        title={`Assign Admin Role${
          selectedStaff
            ? ` - ${selectedStaff.firstName} ${selectedStaff.lastName}`
            : ""
        }`}
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsAssignModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="assign"
            type="primary"
            loading={assignLoading}
            onClick={handleAssignAdmin}
          >
            Assign
          </Button>,
        ]}
      >
        <p className="mb-2 text-gray-700">Select class to assign:</p>
        <Select
          style={{ width: "100%" }}
          placeholder="Select a class"
          value={selectedClass}
          onChange={(value) => setSelectedClass(value)}
          options={[
            ...new Map(
              classes.map((cls) => [
                cls.name,
                {
                  value: cls.name,
                  label: cls.name,
                  disabled: teachers?.some(
                    (t) => t.adminLevel === cls.name // 🔒 disable if someone is already admin over this class
                  ),
                },
              ])
            ).values(),
          ]}
        />
      </Modal>
    </div>
  );
};

export default Teacher;

import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Descriptions,
  Dropdown,
  Menu,
  Tabs,
  Skeleton,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserAddOutlined,
  MoreOutlined,
  SwapOutlined,
  MinusCircleOutlined,
  UserDeleteOutlined,
} from "@ant-design/icons";
import MigrateClassModal from "../../../components/migrate/MigrateClassModal";
import { useApp } from "../../../context/AppContext";
import axios from "axios";

const { Option } = Select;
const { TabPane } = Tabs;

const ClassManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const [editingClass, setEditingClass] = useState(null);
  const [viewClass, setViewClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isClassLoading, setIsClassLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [activeTab, setActiveTab] = useState("1");

  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 7,
    total: 0,
  });

  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  const [isMigrateOpen, setIsMigrateOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("JSS1A");

  console.log(token)

  const students = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Mary Johnson" },
    { id: 3, name: "David Smith" },
  ];

  const handleMigrate = (promoted, notPromoted) => {
    console.log("Promoted:", promoted);
    console.log("Not Promoted:", notPromoted);
  };

  // Fetch classes
  const getClass = async (page = 1) => {
  if (!token) return;
  setLoading(true);

  try {
    const res = await axios.get(`${API_BASE_URL}/api/class-management/classes`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // console.log("All class:", res);

    const data = res?.data?.data || [];
    const mapped = data.map((cls) => ({
      ...cls,
      key: cls._id,
    }));

    // 🔹 simulate pagination
    const pageSize = 7;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginated = mapped.slice(start, end);

    setClasses(paginated);

    setPagination({
      current: page,
      total: mapped.length,
      pageSize,
    });

    messageApi.success(res?.data?.message || "Classes fetched successfully");
  } catch (error) {
    console.error(error);
    messageApi.error(error?.response?.data?.message || "Failed to fetch classes");
  } finally {
    setLoading(false);
  }
};


  // Fetch teachers
  const getTeachers = async () => {
    if (!token) return;
    setIsFetching(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/staff-management/staff/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeachers(res?.data?.data || []);
      // console.log(res);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (initialized && token) {
      getTeachers();
      getClass(pagination.current);
    }
  }, [initialized, token]);

  // 🔹 Handle AntD table pagination change
  const handleTableChange = (paginationConfig) => {
    getClass(paginationConfig.current);
  };

  // ✅ Unified Assign/Unassign function
  const assignStaff = async (record, teacherId = null) => {
    const classId = record?._id;

    if (!classId) {
      messageApi.warning("Class ID is missing.");
      return;
    }

    // Determine if assigning or unassigning
    const isAssigning = record.classTeacher === null;
    const action = isAssigning ? "assign" : "unassign";
    const endpoint = `${API_BASE_URL}/api/staff-management/staff/${action}/${classId}`;

    // For assign, ensure a teacher is chosen
    if (isAssigning && !teacherId) {
      messageApi.warning("Please select a teacher to assign.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.patch(
        endpoint,
        { teacherId }, // ✅ both assign and unassign expect teacherId in body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      messageApi.success(
        res?.data?.message ||
          (isAssigning
            ? "Teacher assigned successfully!"
            : "Teacher unassigned successfully!")
      );

      // Close modal if open and refresh
      setIsAssignOpen(false);
      assignForm.resetFields();
      getClass();
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message ||
          `Failed to ${isAssigning ? "assign" : "unassign"} teacher`
      );
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle click — decide to open modal or unassign directly
  const handleAssignClick = (record) => {
    if (record.classTeacher === null) {
      // If no teacher assigned, open modal to pick one
      setSelectedClassId(record);
      setIsAssignOpen(true);
    } else {
      // If already assigned, confirm unassign directly
      assignStaff(record, record.classTeacher?._id);
    }
  };

  // ✅ Modal submit handler
  const onAssignSubmit = (values) => {
    const teacherId = values.teacher;
    assignStaff(selectedClassId, teacherId);
  };

  // Open create/edit modal
  const openModal = (record = null) => {
    setEditingClass(record);
    if (record) {
      form.setFieldsValue({
        name: record.name,
        arm: record.arm,
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // Save single or bulk class
  const handleSave = async (values) => {
  setIsClassLoading(true);
  try {
    let payload = {};
    let res;

    // ✅ EDIT EXISTING CLASS
    if (editingClass?._id) {
      payload = {
        name: values.name,
        arm: values.arm,
      };

      res = await axios.put(
        `${API_BASE_URL}/api/class-management/classes/${editingClass._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success(res?.data?.message || "Class updated successfully!");
    }

    // ✅ SINGLE CREATE
    else if (values.name && values.arm) {
      payload = {
        name: values.name,
        arm: values.arm,
      };

      res = await axios.post(
        `${API_BASE_URL}/api/class-management/classes`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success(res?.data?.message || "Class created successfully!");
    }

    // ✅ BULK CREATE
    else if (values.bulkName && values.arms?.length) {
      payload = {
        name: values.bulkName,
        arms: values.arms,
      };

      res = await axios.post(
        `${API_BASE_URL}/api/class-management/classes/bulk`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success(res?.data?.message || "Bulk classes created successfully!");
    }

    // ⚠️ MISSING FIELDS
    else {
      message.warning("Please fill all required fields before submitting.");
      return;
    }

    // ✅ After success
    setIsModalOpen(false);
    form.resetFields();
    setEditingClass(null);
    getClass();
  } catch (error) {
    console.error("Error saving class:", error);
    message.error(error?.response?.data?.message || "Failed to save class");
  } finally {
    setIsClassLoading(false);
  }
};


  // Delete class
  const handleDelete = async (record) => {
    setLoading(true);
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/class-management/classes/${record?._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      messageApi.success(res?.data?.message || "Class deleted successfully");
      // Optionally remove from local state without refetching
      setClasses((prev) => prev.filter((cls) => cls._id !== record._id));
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to delete class"
      );
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
    { title: "Class Name", dataIndex: "name", key: "name" },
    { title: "Arm", dataIndex: "arm", key: "arm" },
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
      render: (_, record) =>
        record.name?.toLowerCase().includes("jss") ? (
          <span>Junior</span>
        ) : record.name?.toLowerCase().includes("ss") ? (
          <span>Senior</span>
        ) : (
          <span className="text-gray-500">N/A</span>
        ),
    },
    {
      title: "Teacher Assigned",
      dataIndex: "classTeacher",
      key: "classTeacher",
      render: (classTeacher) =>
        classTeacher ? (
          <p>
            {classTeacher.firstName} {classTeacher.lastName}
          </p>
        ) : (
          <span className="text-gray-400">Not Assigned</span>
        ),
    },
    { title: "Students", dataIndex: "students", key: "students" },
    {
      title: "Actions",
      key: "actions",
      width: 60,
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              icon={<EyeOutlined />}
              onClick={() => {
                setViewClass(record);
                setIsViewOpen(true);
              }}
            >
              View
            </Menu.Item>
            <Menu.Item
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            >
              Edit
            </Menu.Item>
            <Menu.Item key="assign">
              {record.classTeacher === null ? (
                <Space onClick={() => handleAssignClick(record)}>
                  <UserAddOutlined style={{ color: "#1890ff" }} />
                  <span>Assign Teacher</span>
                </Space>
              ) : (
                <Popconfirm
                  title="Are you sure you want to unassign this teacher?"
                  onConfirm={() => handleAssignClick(record)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Space>
                    <UserDeleteOutlined style={{ color: "red" }} />
                    <span>Unassign Teacher</span>
                  </Space>
                </Popconfirm>
              )}
            </Menu.Item>

            <Menu.Item
              icon={<SwapOutlined />}
              onClick={() => setIsMigrateOpen(true)}
            >
              Migrate Class
            </Menu.Item>
            <Menu.Item key="delete">
              <Popconfirm
                title="Are you sure you want to delete this class?"
                onConfirm={() => handleDelete(record)}
              >
                <Button type="text" danger icon={<DeleteOutlined />}>
                  Delete
                </Button>
              </Popconfirm>
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
    <div>
      {contextHolder}
      <div className="flex justify-end items-center mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          Create Class
        </Button>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 7 }} />
      ) : (
        <Table
          columns={columns}
          dataSource={classes}
          loading={loading}
          rowKey="key"
          bordered
          size="small"
           pagination={{
          current: pagination.current,
          total: pagination.total,
          pageSize: pagination.pageSize,
          position: ["bottomCenter"],
          className: "custom-pagination",
          showSizeChanger: false,
        }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={editingClass ? "Edit Class" : "Create Class"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
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
          <Tabs
            defaultActiveKey="1"
            onChange={(key) => setActiveTab(key)} // track which tab is active
          >
            <TabPane tab="Single Class" key="1">
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
            </TabPane>

            <TabPane tab="Bulk Upload" key="2">
              <Form.Item
                label="Class Name"
                name="bulkName"
                rules={[{ required: true, message: "Please enter class name" }]}
              >
                <Input placeholder="e.g. JSS 3" />
              </Form.Item>

              <Form.List name="arms" initialValue={[""]}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field) => (
                      <Space
                        key={field.key}
                        style={{ display: "flex", marginBottom: 8 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...field}
                          name={field.name}
                          fieldKey={field.fieldKey}
                          rules={[
                            { required: true, message: "Missing arm name" },
                          ]}
                        >
                          <Input placeholder="Arm name" />
                        </Form.Item>
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            onClick={() => remove(field.name)}
                          />
                        )}
                      </Space>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Add Arm
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </TabPane>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={isClassLoading}
              onClick={async () => {
                try {
                  if (activeTab === "1") {
                    // validate and submit single class
                    const values = await form.validateFields(["name", "arm"]);
                    handleSave(values);
                  } else {
                    // validate and submit bulk upload
                    const values = await form.validateFields([
                      "bulkName",
                      "arms",
                    ]);
                    handleSave(values);
                  }
                } catch (err) {
                  console.log("Validation Failed:", err);
                }
              }}
            >
              {editingClass ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal
        title="Assign Teacher"
        open={isAssignOpen}
        onCancel={() => setIsAssignOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={assignForm} layout="vertical" onFinish={onAssignSubmit}>
          <Form.Item
            label="Select Teacher"
            name="teacher"
            rules={[{ required: true, message: "Please select a teacher" }]}
          >
            <Select
              placeholder="Select teacher"
              loading={isFetching}
              showSearch
              optionFilterProp="children"
            >
              {teachers.map((teacher) => {
                const fullName = `${teacher.title || ""} ${teacher.firstName} ${
                  teacher.lastName
                }`;
                return (
                  <Option key={teacher._id} value={teacher._id}>
                    {fullName.trim()}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Assign
            </Button>
          </div>
        </Form>
      </Modal>

      {/* View Class Modal */}
      <Modal
        title="Class Details"
        open={isViewOpen}
        onCancel={() => setIsViewOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {viewClass && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Class Name">
              {viewClass.name}
            </Descriptions.Item>
            <Descriptions.Item label="Section">
              {viewClass.section}
            </Descriptions.Item>
            <Descriptions.Item label="Teacher Assigned">
              {viewClass.classTeacher === null ? (
                "Not Assigned"
              ) : (
                <p>
                  {viewClass.classTeacher.firstName}{" "}
                  {viewClass.classTeacher.lastName}
                </p>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Total Students">
              {viewClass.students}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <MigrateClassModal
        open={isMigrateOpen}
        onClose={() => setIsMigrateOpen(false)}
        students={students}
        onMigrate={handleMigrate}
        className={selectedClass}
      />
    </div>
  );
};

export default ClassManagement;

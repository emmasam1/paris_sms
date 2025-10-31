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
  const [assignClass, setAssignClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isClassLoading, setIsClassLoading] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  const [isMigrateOpen, setIsMigrateOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("JSS1A");

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
  const getClass = async () => {
    if (!token) return;
    setIsLoadingClasses(true);
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setClasses(res?.data?.data || []);
      messageApi.success(res?.data?.message || "Classes fetched successfully");
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch classes"
      );
    } finally {
      setIsLoadingClasses(false);
      setLoading(false);
    }
  };

  // Fetch teachers
  const getTeachers = async () => {
    if (!token) return;
    setIsFetching(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/management/staff/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (initialized && token) {
      getTeachers();
      getClass();
    }
  }, [initialized, token]);

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
      if (editingClass) {
        // Update single class
        const res = await axios.put(
          `${API_BASE_URL}/api/class-management/classes/${editingClass._id}`,
          { name: values.name, arm: values.arm },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        messageApi.success(res?.data?.message || "Class updated successfully!");
      } else if (values.bulkName && values.arms?.length) {
        const res = await axios.post(
          `${API_BASE_URL}/api/class-management/classes/bulk`,
          {
            name: values.bulkName, // <-- match the input
            arms: values.arms, // <-- array of strings
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        messageApi.success(
          res?.data?.message || "Bulk class uploaded successfully!"
        );
      } else {
        // Single create
        const res = await axios.post(
          `${API_BASE_URL}/api/class-management/classes`,
          { name: values.name, arm: values.arm },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        messageApi.success(res?.data?.message || "Class created successfully!");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingClass(null);
      getClass();
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Something went wrong!"
      );
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

  // Assign teacher
  const handleAssignTeacher = (values) => {
    setClasses((prev) =>
      prev.map((cls) =>
        cls.key === assignClass.key ? { ...cls, teacher: values.teacher } : cls
      )
    );
    message.success(`Teacher assigned to ${assignClass.name}`);
    setIsAssignOpen(false);
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
      dataIndex: "teacher",
      key: "teacher",
      render: (teacher) =>
        teacher || <span className="text-gray-400">Not Assigned</span>,
    },
    { title: "Students", dataIndex: "students", key: "students" },
    {
      title: "Actions",
      key: "actions",
      width: 320,
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
            <Menu.Item
              icon={<UserAddOutlined />}
              onClick={() => {
                setAssignClass(record);
                setIsAssignOpen(true);
                assignForm.setFieldsValue({ teacher: record.teacher });
              }}
            >
              Assign Teacher
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

      {isLoadingClasses ? (
        <Skeleton active paragraph={{ rows: 7 }} />
      ) : (
        <Table
          columns={columns}
          dataSource={classes}
          rowKey="key"
          bordered
          size="small"
          pagination={{
            pageSize: 7,
            position: ["bottomCenter"],
            className: "custom-pagination",
          }}
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
          <Tabs defaultActiveKey="1">
            {/* Single Class */}
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

            {/* Bulk Upload */}
            <TabPane tab="Bulk Upload" key="2">
              <Form.Item
                label="Class Name"
                name="bulkName" // <-- change from 'name'
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
            <Button type="primary" htmlType="submit" loading={isClassLoading}>
              {editingClass ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Assign Teacher Modal */}
      <Modal
        title={`Assign Teacher to ${assignClass?.name}`}
        open={isAssignOpen}
        onCancel={() => setIsAssignOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignTeacher}
        >
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
                  <Option key={teacher._id} value={fullName.trim()}>
                    {fullName.trim()}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsAssignOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
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
              {viewClass.teacher || "Not Assigned"}
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

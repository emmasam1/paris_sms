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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserAddOutlined,
  MoreOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import MigrateClassModal from "../../../components/migrate/MigrateClassModal";
import { useApp } from "../../../context/AppContext";
import axios from "axios";

const { Option } = Select;

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

  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();

  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  // --- move these to your top-level state declarations ---
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

  const getClass = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setClasses(res?.data?.data);
      // messageApi.success(res?.data?.message);
      // console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ Fetch teachers (fixed)
  const getTeachers = async () => {
    if (!token) return;
    setIsFetching(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/management/staff/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = res?.data?.data || [];
      console.log("teachers ", result);
      setTeachers(result);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // ✅ Ensure token ready before fetching
  useEffect(() => {
    if (initialized && token) {
      getTeachers();
    }
  }, [initialized, token]);

  useEffect(() => {
    getClass();
  }, [initialized, token]);

  // Open create or edit modal
  const openModal = (record = null) => {
    setEditingClass(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  // Save class (create or edit)
  const handleSave = (values) => {
    if (editingClass) {
      setClasses((prev) =>
        prev.map((cls) =>
          cls.key === editingClass.key ? { ...editingClass, ...values } : cls
        )
      );
      message.success("Class updated successfully");
    } else {
      const newClass = {
        key: Date.now().toString(),
        students: 0,
        teacher: null,
        ...values,
      };
      setClasses((prev) => [...prev, newClass]);
      message.success("Class created successfully");
    }
    setIsModalOpen(false);
  };

  // Delete class
  const handleDelete = (key) => {
    setClasses((prev) => prev.filter((cls) => cls.key !== key));
    message.success("Class deleted successfully");
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

  // Columns for class table
  const columns = [
    {
      title: "Class Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
      render: (_, record) => {
        if (record.name?.toLowerCase().includes("jss")) {
          return <span className="">Junior</span>;
        } else if (record.name?.toLowerCase().includes("sss")) {
          return <span className="">Senior</span>;
        } else {
          return <span className="text-gray-500">N/A</span>;
        }
      },
    },
    {
      title: "Teacher Assigned",
      dataIndex: "teacher",
      key: "teacher",
      render: (teacher) =>
        teacher || <span className="text-gray-400">Not Assigned</span>,
    },
    {
      title: "Students",
      dataIndex: "students",
      key: "students",
    },
    {
      title: "Actions",
      key: "actions",
      width: 320,
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setViewClass(record);
                setIsViewOpen(true);
              }}
            >
              View
            </Menu.Item>
            <Menu.Item
              icon={<EditOutlined />}
              size="small"
              type="default"
              onClick={() => openModal(record)}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              icon={<UserAddOutlined />}
              size="small"
              type="dashed"
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
              size="small"
              type="dashed"
              className="border-blue-500 text-blue-600 hover:!bg-blue-50"
              onClick={() => setIsMigrateOpen(true)}
            >
              Migrate Class
            </Menu.Item>
            <Menu.Item key="delete" danger>
              <Popconfirm
                title="Are you sure you want to delete this class?"
                onConfirm={() => handleDelete(record.key)}
              >
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  className="!p-0"
                >
                  Delete
                </Button>
              </Popconfirm>
            </Menu.Item>
          </Menu>
        );

        return (
          <Button>
            <Dropdown overlay={menu} trigger={["click"]}>
              <MoreOutlined />
            </Dropdown>
          </Button>
        );
      },
    },
  ];

  return (
    <div className="">
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
        className="custom-table"
        scroll={{ x: "max-content" }}
      />

      {/* Create/Edit Class Modal */}
      <Modal
        title={editingClass ? "Edit Class" : "Create Class"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Class Name"
            name="name"
            rules={[{ required: true, message: "Please enter class name" }]}
          >
            <Input placeholder="Enter class name" />
          </Form.Item>

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

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingClass ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ✅ Assign Teacher Modal (dynamic teachers) */}
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

      {/* View Class Details Modal */}
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

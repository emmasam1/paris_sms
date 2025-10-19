import React, { useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import MigrateClassModal from "../../../components/migrate/MigrateClassModal";


const { Option } = Select;

const ClassManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const [editingClass, setEditingClass] = useState(null);
  const [viewClass, setViewClass] = useState(null);
  const [assignClass, setAssignClass] = useState(null);

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

  const [classes, setClasses] = useState([
    {
      key: "1",
      name: "JSS1",
      section: "Junior",
      teacher: null,
      students: 35,
    },
    {
      key: "2",
      name: "SS1",
      section: "Senior",
      teacher: null,
      students: 42,
    },
  ]);

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
    { title: "Class Name", dataIndex: "name", key: "name" },
    { title: "Section", dataIndex: "section", key: "section" },
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
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setViewClass(record);
              setIsViewOpen(true);
            }}
          >
            View
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            type="default"
            onClick={() => openModal(record)}
          >
            Edit
          </Button>
          <Button
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
          </Button>
          <Button
            size="small"
            type="dashed"
            className="border-blue-500 text-blue-600 hover:!bg-blue-50"
            onClick={() => setIsMigrateOpen(true)}
          >
            Migrate Class
          </Button>

          <Popconfirm
            title="Are you sure you want to delete this class?"
            onConfirm={() => handleDelete(record.key)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="">
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
        // bordered
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
            <Select placeholder="Select teacher">
              <Option value="Mr. Adams">Mr. Adams</Option>
              <Option value="Mrs. Bello">Mrs. Bello</Option>
              <Option value="Mr. Okafor">Mr. Okafor</Option>
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

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
  UserDeleteOutlined,
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
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isClassLoading, setIsClassLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [students, setStudents] = useState([]);

  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  const [isMigrateOpen, setIsMigrateOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState();

  const [studentCountMap, setStudentCountMap] = useState({});

  useEffect(() => {
    const map = {};
    students.forEach((s) => {
      const classId = s.class?._id;
      if (!classId) return;
      map[classId] = (map[classId] || 0) + 1;
    });
    setStudentCountMap(map);
  }, [students]);

  // console.log(token);

  const handleMigrate = (promoted, notPromoted) => {
    console.log("Promoted:", promoted);
    console.log("Not Promoted:", notPromoted);
  };

  // Fetch students (with search)
  const getStudents = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/student-management/student?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // console.log(res);

      const studentsWithFullName = (res?.data?.data || []).map((s) => ({
        ...s,
        key: s._id,
        studentName: `${s.firstName || ""} ${s.lastName || ""}`.trim(),
        arm: `${s.class?.arm || ""}`.trim(),
        name: `${s.class?.name || ""}`.trim(),
      }));

      // messageApi.success(res.data?.message);
      setStudents(studentsWithFullName);
    } catch (error) {
      console.error("Error fetching students:", error);
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch students"
      );
    }
  };

  // Fetch classes
  const getClass = async (page = 1) => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // console.log("All class:", res);

      const data = res?.data?.data || [];
      const mapped = data.map((cls) => ({
        ...cls,
        key: cls._id,
      }));

      // 🔹 simulate pagination
      const pageSize = 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginated = mapped.slice(start, end);

      setClasses(paginated);
      await getStudents();

      setPagination({
        current: page,
        total: mapped.length,
        pageSize,
      });

      // console.log(res);
      messageApi.success(res?.data?.message || "Classes fetched successfully");
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch classes"
      );
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
      getStudents();
    }
  }, [initialized, token]);

  //Add student to class
  const addStudentToClass = async (values) => {
    setLoading(true);
    try {
      if (!currentClass?._id) return;

      const payload = {
        studentIds: values.studentIds, // array of selected student IDs
        classId: currentClass._id,
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/class-management/students/assign-class?limit=30`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      getClass();
      await getStudents();
      message.success(res?.data?.message || "Students added successfully!");
      setIsAddStudentModalOpen(false);
    } catch (error) {
      console.error("Error adding students:", error);
      message.error(error?.response?.data?.message || "Failed to add students");
    } finally {
      setLoading(false);
    }
  };

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

  // Save single class
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
          level: values.level,
        };

        res = await axios.put(
          `${API_BASE_URL}/api/class-management/classes/${editingClass._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        message.success(res?.data?.message || "Class updated successfully!");
      }

      // ✅ SINGLE CREATE
      else if (values.name && values.arm && values.level) {
        payload = {
          name: values.name,
          arm: values.arm,
          level: values.level,
        };

        // console.log(payload);

        res = await axios.post(
          `${API_BASE_URL}/api/class-management/classes`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        message.success(res?.data?.message || "Class created successfully!");
      }

      // console.log(res);

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

  useEffect(() => {
    if (editingClass) {
      form.setFieldsValue(editingClass);
    }
  }, [editingClass]);

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

  const openClassModal = (record) => {
    setCurrentClass(record);
    setIsAddStudentModalOpen(true);
    // console.log(record);
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
    {
      title: "Students",
      key: "students",
      render: (_, record) => {
        const count = studentCountMap[record._id] || 0;
        return (
          <span>
            {count} {count === 1 ? "student" : "students"}
          </span>
        );
      },
    },

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
                //  console.log(record)
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
              icon={<UserAddOutlined />}
              onClick={() => openClassModal(record)}
            >
              Add Student to Class
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
            // showSizeChanger: true,
            // pageSizeOptions: ["10", "20", "50", "100"],
            // position: ["bottomLeft"],
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={editingClass ? "Edit Class" : "Create Class"}
        open={isModalOpen}
        onCancel={() => {
          form.resetFields();
          setEditingClass(null);
          setIsModalOpen(false);
        }}
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

          <Form.Item
            label="Level"
            name="level"
            rules={[{ required: true, message: "Please select level" }]}
          >
            <Select placeholder="Select Levels">
              <Option value="SS1">SSS1</Option>
              <Option value="SS2">SSS2</Option>
              <Option value="SS3">SSS3</Option>
              <Option value="JSS1">JSS1</Option>
              <Option value="JSS2">JSS2</Option>
              <Option value="JSS3">JSS3</Option>
              <Option value="PRIMARY">PRIMARY</Option>
              <Option value="NURSERY">NURSERY</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={() => {
                form.resetFields();
                setEditingClass(null);
                setIsModalOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button type="primary" htmlType="submit" loading={isClassLoading}>
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

      {/* Add student to class modal */}
      <Modal
        title={`Add Student to ${currentClass?.name || ""}`}
        open={isAddStudentModalOpen}
        onCancel={() => setIsAddStudentModalOpen(false)}
        footer={null} // use form buttons instead
      >
        <Form layout="vertical" onFinish={addStudentToClass}>
          <Form.Item
            label="Select Students"
            name="studentIds"
            rules={[
              { required: true, message: "Please select at least one student" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select students"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {students
                .filter((s) => !s.class || s.class === null) // ✅ Only students with no class
                .map((s) => (
                  <Select.Option key={s._id} value={s._id}>
                    {s.studentName} - {s.name} {s.arm}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsAddStudentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Students
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
        currentClass={selectedClass?.name} // pass name
        currentSession="2025/2026" // or dynamic session
        classes={classes} // pass all classes
      />
    </div>
  );
};

export default ClassManagement;

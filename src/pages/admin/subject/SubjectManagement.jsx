import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Form,
  Input,
  Modal,
  Checkbox,
  Select,
  Row,
  Col,
  Skeleton,
  Menu,
  Dropdown,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  MoreOutlined,
  DeleteOutlined,
  BookOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import axios from "axios";

const { Option } = Select;
const LEVELS = ["PRIMARY", "JSS", "SSS"];

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignIsModalOpen] = useState(false);
  const [staff, setStaff] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [singleSubject, setSingleSubject] = useState({
    name: "",
    code: "",
    description: "",
    isCore: false,
    levelsOffered: [],
  });
  const [editingKey, setEditingKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const { API_BASE_URL, token } = useApp();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  // console.log(token)
  // console.log(API_BASE_URL)

  const showAssignModal = (record) => {
    // console.log(record);
    setSelectedSubject(record); // ✅ store the clicked subject
    setIsAssignIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsAssignIsModalOpen(false);
  };


  // 🔹 Open modal for add/edit
  const openModal = (subject = null) => {
    if (subject) {
      setSingleSubject(subject);
      setEditingKey(subject.id);
    } else {
      setSingleSubject({
        name: "",
        code: "",
        description: "",
        isCore: false,
        levelsOffered: [],
      });
      setEditingKey(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSingleSubject({
      name: "",
      code: "",
      description: "",
      isCore: false,
      levelsOffered: [],
    });
    setEditingKey(null);
  };

  // 🔹 Save subject (Add/Edit)
  const handleSave = async () => {
    if (!singleSubject.name.trim() || !singleSubject.code.trim()) {
      return message.warning("Please enter subject name and code");
    }
    if (!token) return;

    setLoading(true);
    try {
      if (editingKey) {
        const res = await axios.patch(
          `${API_BASE_URL}/api/subject-management/subjects/${editingKey}`,
          singleSubject,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubjects(subjects.map((s) => (s.id === editingKey ? res.data : s)));
        message.success("Subject updated successfully!");
      } else {
        const res = await axios.post(
          `${API_BASE_URL}/api/subject-management/subjects`,
          singleSubject,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubjects([...subjects, res.data]);
        message.success("Subject added successfully!");
      }
      closeModal();
      getAllSubjects();
    } catch (error) {
      console.error(error);
      message.error("Failed to save subject");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete subject
  const handleDelete = async (record) => {
    const subjectId = record?._id
    if (!token) return;
    setLoading(true);
    try {
     const res = await axios.delete(
        `${API_BASE_URL}/api/subject-management/subjects/${subjectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      messageApi.success(res?.data?.message || "Subject deleted");
      getAllSubjects(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      messageApi.error(error?.response?.data?.message || "Failed to delete subject");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch subjects (with pagination)
  const getAllSubjects = async (page = 1, limit = 10) => {
    setTableLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/subject-management/subjects?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = res.data;
      console.log("subjects", result)
      setSubjects(result?.data || []);
      setPagination({
        current: result?.pagination?.page || 1,
        pageSize: result?.pagination?.limit || 10,
        total: result?.pagination?.total || 0,
      });

      messageApi.success(result?.message || "Subjects loaded");
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch subjects");
    } finally {
      setTableLoading(false);
    }
  };

  // 🔹 Assign subject to teacher
  const handleAssignClick = async (values) => {
    setLoading(true)
    const payload = {
      subjectId: selectedSubject?._id,
      teacherId: values.teacherId,
      level: values.level,
      academicYear: values.academicYear,
      term: values.term
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/subject-management/subject-levels/assign`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      })
      messageApi.success(res?.data?.message)
      setIsAssignIsModalOpen(false)
      getAllSubjects()
    } catch (error) {
      console.error("Import error:", error);
          messageApi.error(error?.response?.data?.message || "Failed to assign");
    }finally{
      setLoading(false)
    }
   
  };

  // 🔹 Unassign subject from teacher
  const handleUnassignClick = async (record) => {
    console.log(record)

    if (!token) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/api/subject-management/subjects/${record.id}/unassign`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Subject unassigned successfully");
      getAllSubjects(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(error);
      message.error("Failed to unassign subject");
    }
  };

  //Get teachers
  const getTeachers = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/staff-management/staff/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = res.data.data || [];
      console.log(result);
      setStaff(result);
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to load staff");
    }
  };

  useEffect(() => {
    getAllSubjects();
    getTeachers();
  }, []);

  // 🔹 Handle pagination
  const handleTableChange = (newPagination) => {
    getAllSubjects(newPagination.current, newPagination.pageSize);
  };

  // 🔹 Table columns
  const columns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Code", dataIndex: "code", key: "code" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Core Subject",
      dataIndex: "isCore",
      key: "isCore",
      render: (val) => (val ? "Yes" : "No"),
    },
    {
      title: "Assigned Teacher",
      dataIndex: "assignedLevels",
      key: "assignedTeacher",
      render: (assignedLevels) =>
        assignedLevels?.length
          ? assignedLevels.map((i) => i?.teacher?.fullName).join(", ")
          : "--",
    },
    {
      title: "Assigned Level",
      dataIndex: "assignedLevels",
      key: "assignedLevel",
      render: (assignedLevels) =>
        assignedLevels?.length
          ? assignedLevels.map((i) => i?.level).join(", ")
          : "--",
    },
    {
      title: "Academic Year",
      dataIndex: "assignedLevels",
      key: "academicYear",
      render: (assignedLevels) =>
        assignedLevels?.length
          ? assignedLevels.map((i) => i?.academicYear).join(", ")
          : "--",
    },
    {
      title: "Term",
      dataIndex: "assignedLevels",
      key: "term",
      render: (assignedLevels) =>
        assignedLevels?.length
          ? assignedLevels.map((i) => i?.term).join(", ")
          : "--",
    },
    {
      title: "Levels Offered",
      dataIndex: "levelsOffered",
      key: "levelsOffered",
      render: (val) => (val?.length ? val.join(", ") : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const isAssigned =
          record?.assignedLevels && record.assignedLevels.length > 0;

        const menu = (
          <Menu>
            <Menu.Item
              key="edit"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            >
              Edit
            </Menu.Item>

            {/* 🔹 Assign / Unassign Subject */}
            {!isAssigned ? (
              <Menu.Item key="assign" onClick={() => showAssignModal(record)}>
                <Space>
                  <BookOutlined style={{ color: "#1890ff" }} />
                  <span>Assign Subject To Teacher</span>
                </Space>
              </Menu.Item>
            ) : (
              <Menu.Item key="unassign">
                <Popconfirm
                  title="Are you sure you want to unassign this subject?"
                  onConfirm={() => handleUnassignClick(record)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Space>
                    <StopOutlined style={{ color: "red" }} />
                    <span>Unassign Subject</span>
                  </Space>
                </Popconfirm>
              </Menu.Item>
            )}

            {/* 🔹 Delete */}
            <Menu.Item key="delete">
              <Popconfirm
                title="Are you sure to delete this subject?"
                onConfirm={() => handleDelete(record)}
              >
                <Button type="link" danger icon={<DeleteOutlined />}>
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
    <div className="p-4 bg-white shadow-md rounded-lg">
      {contextHolder}

      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Subject Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
          className="!bg-blue-600"
        >
          Add Subject
        </Button>
      </div>

      {/* 🔹 Table */}
      {tableLoading ? (
        <Skeleton active paragraph={{ rows: 7 }} />
      ) : (
        <Table
          dataSource={subjects}
          columns={columns}
          bordered
          size="small"
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            position: ["bottomCenter"],
            className: "custom-pagination",
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      )}

      {/* 🔹 Add/Edit Subject Modal */}
      <Modal
        title={editingKey ? "Edit Subject" : "Add Subject"}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Name" required>
                <Input
                  placeholder="Subject Name"
                  value={singleSubject.name}
                  onChange={(e) =>
                    setSingleSubject({ ...singleSubject, name: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Code" required>
                <Input
                  placeholder="Subject Code"
                  value={singleSubject.code}
                  onChange={(e) =>
                    setSingleSubject({ ...singleSubject, code: e.target.value })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Description">
                <Input
                  placeholder="Description"
                  value={singleSubject.description}
                  onChange={(e) =>
                    setSingleSubject({
                      ...singleSubject,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item>
                <Checkbox
                  checked={singleSubject.isCore}
                  onChange={(e) =>
                    setSingleSubject({
                      ...singleSubject,
                      isCore: e.target.checked,
                    })
                  }
                >
                  Core Subject
                </Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Levels Offered">
                <Select
                  mode="multiple"
                  placeholder="Select Levels"
                  value={singleSubject.levelsOffered}
                  onChange={(val) =>
                    setSingleSubject({
                      ...singleSubject,
                      levelsOffered: val,
                    })
                  }
                >
                  {LEVELS.map((l) => (
                    <Option key={l} value={l}>
                      {l}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            loading={loading}
            onClick={handleSave}
            className="!bg-blue-600"
          >
            {editingKey ? "Update Subject" : "Add Subject"}
          </Button>
        </Form>
      </Modal>

      {/* Teacher modal */}
      {/* 🔹 Assign Teacher Modal */}
      <Modal
        title={`Assign Teacher${
          selectedSubject ? ` - ${selectedSubject.name}` : ""
        }`}
        open={isAssignModalOpen}
        onOk={() => form.submit()}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText="Assign"
      >
        <Form form={form} layout="vertical" onFinish={handleAssignClick}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="teacherId"
                label="Select Teacher"
                rules={[{ required: true, message: "Please select a teacher" }]}
              >
                <Select placeholder="Choose teacher">
                  {staff.map((t) => (
                    <Option key={t._id} value={t._id}>
                      {t.title} {t.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="level"
                label="Level"
                rules={[{ required: true, message: "Please select a level" }]}
              >
                <Select placeholder="Select level">
                  {(selectedSubject?.levelsOffered || []).map((lvl) => (
                    <Option key={lvl} value={lvl}>
                      {lvl}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="academicYear"
                label="Academic Year"
                rules={[
                  { required: true, message: "Please select academic year" },
                ]}
              >
                <Select placeholder="Select academic year">
                  <Option value="2025/2026">2025/2026</Option>
                  <Option value="2026/2027">2026/2027</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="term"
                label="Term"
                rules={[{ required: true, message: "Please select term" }]}
              >
                <Select placeholder="Select term">
                  <Option value="FIRST">FIRST</Option>
                  <Option value="SECOND">SECOND</Option>
                  <Option value="THIRD">THIRD</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectManagement;

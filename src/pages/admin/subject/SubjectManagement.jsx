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
  SearchOutlined,
} from "@ant-design/icons";
import { useApp } from "../../../context/AppContext";
import axios from "axios";

const { Option } = Select;
const LEVELS = ["PRIMARY", "JSS", "SSS"];

const SubjectManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignIsModalOpen] = useState(false);
  const [staff, setStaff] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [classes, setClasses] = useState([]);
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
      setEditingKey(subject._id); // ✅ Use _id
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

  // Fetch classes
  const getClass = async () => {
    if (!token) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res?.data?.data || [];
      const mapped = data.map((cls) => ({
        ...cls,
        key: cls._id,
        levelName: cls.level, // 🔥 this is the string you need: "SSS"
      }));

      console.log("data from class", mapped);
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch classes"
      );
    }
  };

  // 🔹 Save subject (Add/Edit)
  const handleSave = async () => {
    if (!singleSubject.name.trim() || !singleSubject.code.trim()) {
      return message.warning("Please enter subject name and code");
    }
    if (!token) return;

    setLoading(true);
    try {
      let res;
      if (editingKey) {
        // ✅ Use _id
        res = await axios.patch(
          `${API_BASE_URL}/api/subject-management/subjects/${editingKey}`,
          singleSubject,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Update state directly
        setSubjects((prev) =>
          prev.map((s) => (s._id === editingKey ? res.data : s))
        );
        messageApi.success(
          res?.data?.message || "Subject updated successfully!"
        );
        getAllSubjects();
      } else {
        res = await axios.post(
          `${API_BASE_URL}/api/subject-management/subjects`,
          singleSubject,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubjects((prev) => [...prev, res.data]);
        messageApi.success(res?.data?.message || "Subject added successfully!");
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
    const subjectId = record?._id;
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/subject-management/subjects/${subjectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      messageApi.success(res?.data?.message || "Subject deleted");
      setSubjects((prev) => prev.filter((s) => s._id !== subjectId));
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to delete subject"
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch subjects (with pagination)
  const getAllSubjects = async (page = 1, limit = 10, search = "") => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (search) params.append("search", search);

      const res = await axios.get(
        `${API_BASE_URL}/api/subject-management/subjects?page=${page}&limit=${limit}&search=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const result = res.data;
      console.log("subjects", result);
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
    setLoading(true);
    const payload = {
      subjectId: selectedSubject?._id,
      teacherId: values.teacherId,
      level: values.level,
      academicYear: values.academicYear,
      term: values.term,
    };

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/subject-management/subject-levels/assign`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      messageApi.success(res?.data?.message);
      setIsAssignIsModalOpen(false);
      getAllSubjects();
    } catch (error) {
      console.error("Import error:", error);
      messageApi.error(error?.response?.data?.message || "Failed to assign");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Unassign subject from teacher
  const handleUnassignClick = async (record) => {
    console.log(record);

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
    getClass();
  }, []);

  // 🔹 Handle pagination
  const handleTableChange = (newPagination) => {
    getAllSubjects(newPagination.current, newPagination.pageSize, searchText);
  };

  const handleSearch = () => {
    if (!searchText.trim()) {
      getAllSubjects(1, 10, "");
    } else {
      getAllSubjects(1, 10, searchText);
    }
  };

  const getAssignedSubject = async () => {
    setTableLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/subject-management/subject-levels`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = res.data.data || [];

      console.log("Assigned raw:", result);

      // 🔥 TRANSFORM assigned subjects into table format
      const formatted = result.map((item) => ({
        _id: item?.subject?._id, // use subject ID
        name: item?.subject?.name,
        code: item?.subject?.code,
        description: item?.subject?.description || "--",
        isCore: item?.subject?.isCore ?? false,
        levelsOffered: item?.subject?.levelsOffered ?? [],

        // 🔥 this is what your table expects
        assignedLevels: [
          {
            teacher: item.teacher,
            level: item.level,
            academicYear: item.academicYear,
            term: item.term,
          },
        ],
      }));

      console.log("Formatted assigned:", formatted);

      setSubjects(formatted);

      setPagination({
        current: 1,
        pageSize: 10,
        total: formatted.length,
      });
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch assigned subjects");
    } finally {
      setTableLoading(false);
    }
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
      render: (assignedLevels) => {
        if (!assignedLevels?.length) return "--";

        // Extract teacher names
        const teacherNames = assignedLevels
          .map((i) => i?.teacher?.fullName)
          .filter(Boolean);

        // Remove duplicates
        const uniqueTeachers = [...new Set(teacherNames)];

        return uniqueTeachers.join(", ");
      },
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
      render: (assignedLevels) => {
        if (!assignedLevels?.length) return "--";

        const years = assignedLevels
          .map((i) => i?.academicYear)
          .filter(Boolean);

        const uniqueYears = [...new Set(years)];

        return uniqueYears.join(", ");
      },
    },

    {
      title: "Term",
      dataIndex: "assignedLevels",
      key: "term",
      render: (assignedLevels) => {
        if (!assignedLevels?.length) return "--";

        const terms = assignedLevels.map((i) => i?.term).filter(Boolean);

        const uniqueTerms = [...new Set(terms)];

        return uniqueTerms.join(", ");
      },
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
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-1/3 mb-3">
          <Input
            placeholder="Search subject by name"
            prefix={<SearchOutlined />}
            // value={searchText}
            onChange={(e) => {
              const value = e.target.value;
              setSearchText(value);

              // 🔥 When input is cleared, reload all subjects
              if (value.trim() === "") {
                getAllSubjects(1, 10, "");
              }
            }}
            onPressEnter={handleSearch} // ✅ triggers search on Enter
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={loading}
            disabled={loading}
            onClick={handleSearch} // ✅ triggers search on button click
          >
            Search
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select
            allowClear
            placeholder="Search subject by class"
            onChange={(value) => {
              if (!value) {
                getAllSubjects(1, 10, ""); // reload all
                return;
              }

              // 🔥 Filter subjects by class level
              filterSubjectByLevel(value);
            }}
          >
            {classes.map((cls) => (
              <Option key={cls._id} value={cls.levelName}>
                {cls.levelName}
              </Option>
            ))}
          </Select>

          <Select
            allowClear
            placeholder="Search assigned subjects"
            // style={{ width: 200 }}
            onChange={(value) => {
              if (!value) {
                getAllSubjects(1, 10, ""); // on clear load all
                return;
              }
              if (value === "assigned") {
                getAssignedSubject();
              }
            }}
          >
            <Option value="assigned">Assigned Subjects</Option>
          </Select>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            className="!bg-blue-600"
          >
            Add Subject
          </Button>
        </div>
      </div>
      <div className="p-4 bg-white shadow-md rounded-lg">
        {contextHolder}

        {/* 🔹 Header */}

        {/* 🔹 Table */}
        {tableLoading ? (
          <Skeleton active paragraph={{ rows: 7 }} />
        ) : (
          // ✅ Update rowKey to match backend
          <Table
            dataSource={subjects}
            columns={columns}
            bordered
            size="small"
            rowKey="_id"
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
                      setSingleSubject({
                        ...singleSubject,
                        name: e.target.value,
                      })
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
                      setSingleSubject({
                        ...singleSubject,
                        code: e.target.value,
                      })
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
                  rules={[
                    { required: true, message: "Please select a teacher" },
                  ]}
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
    </>
  );
};

export default SubjectManagement;

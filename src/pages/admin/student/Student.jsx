import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Input,
  Select,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Modal,
  Form,
  Descriptions,
  Typography,
  Upload,
  Skeleton,
  Avatar,
  Dropdown,
  Menu,
  Divider,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  BarChartOutlined,
  UploadOutlined,
  MoreOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import std_img from "../../../assets/student.jpg";
import { useApp } from "../../../context/AppContext";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const classes = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
const sessions = ["2023/2024", "2024/2025", "2025/2026"];

const subjects = [
  "Mathematics",
  "English",
  "Physics",
  "Chemistry",
  "Biology",
  "Geography",
  "Economics",
  "Civic Education",
  "Literature",
  "Computer Science",
];

const teacherAssigned = {
  JSS1: "Mr. Adams",
  JSS2: "Mrs. Akande",
  JSS3: "Mr. Brown",
  SS1: "Mrs. Johnson",
  SS2: "Mr. Peters",
  SS3: "Mrs. Gomez",
};

const generatePin = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
const generateRegNo = () => `STU${Date.now().toString().slice(-6)}`;

const Student = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [detailsStudent, setDetailsStudent] = useState(null);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressStudent, setProgressStudent] = useState(null);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [csvFile, setCsvFile] = useState(null);

  // 🧠 Avatar upload states
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  // 🧠 Load existing avatar when editing
  useEffect(() => {
    if (editingStudent) {
      // Populate form fields
      form.setFieldsValue({
        ...editingStudent,
        parentEmail: editingStudent.parentEmail || "",
        parentPhone: editingStudent.parentPhone || "",
        parentAddress: editingStudent.parentAddress || "",
      });

      // Populate avatar if exists
      if (editingStudent.avatar) {
        setFileList([
          {
            uid: "-1",
            name: "avatar.png",
            status: "done",
            url: editingStudent.avatar, // existing image
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [editingStudent, form]);

  // Fetch students
  const getStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/student-management/student`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const studentsWithFullName = (res?.data?.data || []).map((s) => ({
        ...s,
        name: `${s.firstName || ""} ${s.lastName || ""}`.trim(),
      }));

      setStudents(studentsWithFullName);
      messageApi.success(res?.data?.message || "Students fetched successfully");
    } catch (error) {
      console.error("Error fetching students:", error);
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch students"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialized && token) getStudents();
  }, [initialized, token]);

  const handleCsvUpload = async () => {
    if (!csvFile) {
      message.warning("Please select a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/student-management/student/bulk-import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Bulk import response:", res.data);

      // show message from backend
      if (res?.data?.message) {
        messageApi.success(res.data.message);
      }

      // refresh table data
      await getStudents();
    } catch (error) {
      console.error("Bulk import error:", error);

      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to upload CSV file";

      messageApi.error(errMsg);
    } finally {
      setLoading(false);
      setCsvFile(null);
    }
  };

  const openProgressModal = (student) => {
    setProgressStudent({
      ...student,
      results: [
        {
          subject: "Mathematics",
          firstTest: 15,
          secondTest: 18,
          assignment: 10,
          practical: 12,
          exam: 40,
        },
        {
          subject: "English",
          firstTest: 12,
          secondTest: 15,
          assignment: 9,
          practical: 10,
          exam: 35,
        },
      ],
    });
    setIsProgressOpen(true);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);

    form.setFieldsValue({
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      dob: student.dob ? student.dob.split("T")[0] : "",
      gender: student.gender,
      class: student.class?._id || null, // ✅ Use the _id for dropdown
      session: student.session,
      status: student.status || "active",
      house: student.house,
      parentEmail: student.parentEmail,
      parentPhone: student.parentPhone,
      parentAddress: student.parentAddress,
    });

    // Load existing avatar if available
    if (student.avatar) {
      setFileList([
        {
          uid: "-1",
          name: "avatar.png",
          status: "done",
          url: student.avatar,
        },
      ]);
    } else {
      setFileList([]);
    }

    setIsModalOpen(true);
  };

  const openDetails = (record) => {
    setDetailsStudent(record);
    setIsDetailsOpen(true);
  };

  //Get Class
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

      const classData = res?.data?.data || [];

      // Ensure each class has name and arm displayed together
      const formattedClasses = classData.map((c) => ({
        _id: c._id,
        name: c.name,
        arm: c.arm,
        displayName: `${c.name}${c.arm ? " - " + c.arm : ""}`,
      }));

      setClasses(formattedClasses);
      // console.log(res);
      // messageApi.success(res?.data?.message || "Classes fetched successfully");
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

  useEffect(() => {
    getClass();
  }, [token]);

  // 🧩 Save student (add/edit)
  const handleSave = async (values) => {
    const formData = new FormData();

    // Append all fields
    Object.keys(values).forEach((key) => {
      if (key !== "avatar") formData.append(key, values[key]);
    });

    // Append avatar if new file uploaded
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("avatar", fileList[0].originFileObj);
    }

    setLoading(true);

    try {
      let res;
      if (editingStudent) {
        // PATCH request for edit
        res = await axios.patch(
          `${API_BASE_URL}/api/student-management/student/${editingStudent._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        messageApi.success(res.data.message || "Student updated successfully");
      } else {
        // POST request for create
        res = await axios.post(
          `${API_BASE_URL}/api/student-management/student`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        messageApi.success(res.data.message || "Student added successfully");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingStudent(null);
      setFileList([]);
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to save student"
      );
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Render avatar in table
  const renderAvatar = (record) => {
    if (record.avatar) {
      return (
        <img
          src={record.avatar}
          alt="student"
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

  const handleDelete = (record) => {
    setStudents((prev) => prev.filter((s) => s.key !== record.key));
    messageApi.success("Student deleted");
  };

  const columns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
    {
      title: "Image",
      dataIndex: "avatar",
      key: "avatar",
      render: (_, record) => renderAvatar(record),
    },
    {
      title: "Admission No",
      dataIndex: "admissionNumber",
      key: "admissionNumber",
      width: 120,
    },
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
      render: (text, record) => record?.class?.name || record.class,
    },
    {
      title: "Session",
      dataIndex: "session",
      key: "session",
    },
    {
      title: "Parent Name",
      dataIndex: "parentName",
      key: "parentName",
      render: (_, record) => record.parent?.name || "-",
    },
    {
      title: "Parent Phone",
      dataIndex: "parentPhone",
      key: "parentPhone",
      render: (_, record) => record.parent?.phone || "-",
    },
    {
      title: "Actions",
      key: "action",
      width: 200,
      render: (_, record) => {
        const menu = (
          <Menu
            className="p-2 rounded-lg shadow-md"
            style={{ width: 160 }}
            items={[
              {
                key: "1",
                icon: <EyeOutlined />,
                label: "View Details",
                onClick: () => openDetails(record),
              },
              {
                key: "2",
                icon: <EditOutlined />,
                label: "Edit Student",
                onClick: () => openEditModal(record),
              },
              {
                type: "divider",
              },
              {
                key: "3",
                icon: <BarChartOutlined style={{ color: "#52c41a" }} />,
                label: "Progress Report",
                onClick: () => openProgressModal(record),
              },
              {
                type: "divider",
              },
              {
                key: "4",
                icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
                label: (
                  <Popconfirm
                    title="Delete student?"
                    onConfirm={() => handleDelete(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <span className="text-red-500">Delete</span>
                  </Popconfirm>
                ),
              },
            ]}
          />
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Input
          placeholder="Search student by name"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full md:w-1/3"
        />

        <div className="flex items-center gap-3">
          <Select
            placeholder="Select Class"
            // onChange={(value) => setSelectedClass(value)}
            allowClear
            className="w-40"
            value={selectedClass}
          >
            {classes.map((c) => (
              <Option key={c} value={c}>
                {c}
              </Option>
            ))}
          </Select>

          {/* <Select
            placeholder="Select Session"
            // onChange={(value) => setSelectedSession(value)}
            allowClear
            className="w-40"
            value={selectedSession}
          >
            {sessions.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select> */}

          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
            >
              Add Student
            </Button>
            <Upload
              accept=".csv"
              beforeUpload={(file) => {
                setCsvFile(file);
                message.success(`${file.name} selected successfully`);
                return false; // prevent auto upload
              }}
              onRemove={() => setCsvFile(null)}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Select CSV File</Button>
            </Upload>

            <Button
              type="primary"
              disabled={!csvFile}
              loading={loading}
              onClick={handleCsvUpload}
            >
              {loading ? "Uploading..." : "Upload & Import"}
            </Button>
          </Space>
        </div>
      </div>

      {selectedClass && (
        <p className="mb-3 text-gray-600">
          <span className="font-semibold">Teacher Assigned:</span>{" "}
          {teacherAssigned[selectedClass] || "Not Assigned"}
        </p>
      )}

      {/* Skeleton Loader */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Table
          columns={columns}
          dataSource={students}
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
      )}

      {/* ... your modals remain unchanged ... */}

      {/* 🧩 Add/Edit Modal with Avatar Upload */}
      <Modal
        title={editingStudent ? "Edit Student" : "Add Student"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingStudent(null);
          setFileList([]);
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Title level={5} className="mb-2 text-center">
            Student Information
          </Title>

          {/* 🧩 Avatar Upload */}
          <Form.Item label="Student Avatar" name="avatar">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Modal
            open={previewOpen}
            footer={null}
            onCancel={() => setPreviewOpen(false)}
          >
            <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
          </Modal>

          {/* 🧾 Student Info Fields */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: "Please enter first name" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: "Please enter last name" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Admission Number"
                name="admissionNumber"
                rules={[
                  { required: true, message: "Please enter admission number" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Roll Number" name="rollNumber">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Date of Birth"
                name="dob"
                rules={[
                  { required: true, message: "Please enter date of birth" },
                ]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true, message: "Please select gender" }]}
              >
                <Select placeholder="Select gender">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Class"
                name="class"
                rules={[{ required: true, message: "Please select class" }]}
              >
                <Select
                  placeholder="Select class"
                  loading={isLoadingClasses}
                  showSearch
                  optionFilterProp="children"
                >
                  {classes.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {`${c.name}${c.arm ? " - " + c.arm : ""}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Session"
                name="session"
                rules={[{ required: true, message: "Please select session" }]}
              >
                <Select placeholder="Select session">
                  {sessions.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Status" name="status" initialValue="active">
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="House" name="house">
                <Input placeholder="e.g. Blue House" />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} className="mb-2 text-center">
            Parent Information
          </Title>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Parent Email"
                name="parentEmail"
                rules={[
                  { required: true, message: "Please enter parent email" },
                ]}
              >
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Parent Phone"
                name="parentPhone"
                rules={[
                  { required: true, message: "Please enter parent phone" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Parent Address"
                name="parentAddress"
                rules={[
                  { required: true, message: "Please enter parent address" },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
                setEditingStudent(null);
                setFileList([]);
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingStudent ? "Update" : "Save"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title="Student Details"
        open={isDetailsOpen}
        onCancel={() => setIsDetailsOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailsOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        <div className="w-50 h-50 mb-3">
          <img
            src={detailsStudent?.avatar || std_img}
            alt=""
            className="object-cover w-full h-full rounded-md"
          />
        </div>
        {detailsStudent && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Amission No">
              {detailsStudent.admissionNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {detailsStudent.name}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {detailsStudent.gender}
            </Descriptions.Item>
            <Descriptions.Item label="Session">
              {detailsStudent.session}
            </Descriptions.Item>
            <Descriptions.Item label="class">
              {detailsStudent.class?.name}
            </Descriptions.Item>
            <Descriptions.Item label="PIN">
              {detailsStudent.pin}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Name">
              {detailsStudent.parent?.name || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Phone">
              {detailsStudent.parentPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Email">
              {detailsStudent.parentEmail}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Occupation">
              {detailsStudent.parent?.occupation || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Address">
              {detailsStudent.parentAddress || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Class Teacher">
              {teacherAssigned[detailsStudent.class] || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Subjects Offered">
              {detailsStudent.subjects?.length
                ? detailsStudent.subjects.join(", ")
                : "—"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Progress Report Modal */}
      <Modal
        title={`Progress Report - ${progressStudent?.name}`}
        open={isProgressOpen}
        onCancel={() => setIsProgressOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsProgressOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {progressStudent && (
          <Table
            dataSource={progressStudent.results.map((r, idx) => {
              const total =
                r.firstTest +
                r.secondTest +
                r.assignment +
                r.practical +
                r.exam;
              const grade =
                total >= 70
                  ? "A"
                  : total >= 60
                  ? "B"
                  : total >= 50
                  ? "C"
                  : total >= 40
                  ? "D"
                  : "F";
              return { ...r, key: idx, total, grade };
            })}
            columns={[
              { title: "Subject", dataIndex: "subject", key: "subject" },
              { title: "1st Test", dataIndex: "firstTest", key: "firstTest" },
              { title: "2nd Test", dataIndex: "secondTest", key: "secondTest" },
              {
                title: "Assignment",
                dataIndex: "assignment",
                key: "assignment",
              },
              { title: "Practical", dataIndex: "practical", key: "practical" },
              { title: "Exam", dataIndex: "exam", key: "exam" },
              { title: "Total", dataIndex: "total", key: "total" },
              { title: "Grade", dataIndex: "grade", key: "grade" },
            ]}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </Modal>
    </div>
  );
};

export default Student;

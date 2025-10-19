import React, { useState } from "react";
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
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  BarChartOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import std_img from "../../../assets/student.jpg";

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
  const [students, setStudents] = useState([
    {
      key: "1",
      name: "John Doe",
      regNo: "STU000001",
      class: "JSS1",
      session: "2024/2025",
      parent: {
        name: "Mr. Doe",
        phone: "08012345678",
        occupation: "Teacher",
        address: "12 Maple St, Lagos",
      },
      pin: "123456",
      admissionDate: "2023-09-01",
      subjects: ["Mathematics", "English"],
    },
    {
      key: "2",
      name: "Jane Smith",
      regNo: "STU000002",
      class: "SS1",
      session: "2024/2025",
      parent: {
        name: "Mrs. Smith",
        phone: "08087654321",
        occupation: "Nurse",
        address: "45 Palm Ave, Lagos",
      },
      pin: "654321",
      admissionDate: "2022-08-15",
      subjects: ["Biology", "Chemistry", "Physics"],
    },
  ]);

  const [form] = Form.useForm();

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

  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesClass = selectedClass ? s.class === selectedClass : true;
    const matchesSession = selectedSession
      ? s.session === selectedSession
      : true;
    return matchesSearch && matchesClass && matchesSession;
  });

  const openAddModal = () => {
    setEditingStudent(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    setEditingStudent(student);
    form.setFieldsValue({
      name: student.name,
      class: student.class,
      session: student.session,
      admissionDate: student.admissionDate,
      subjects: student.subjects,
      parent: {
        name: student.parent?.name,
        phone: student.parent?.phone,
        occupation: student.parent?.occupation,
        address: student.parent?.address,
      },
    });
    setIsModalOpen(true);
  };

  const openDetails = (student) => {
    setDetailsStudent(student);
    setIsDetailsOpen(true);
  };

  const handleSave = (values) => {
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) =>
          s.key === editingStudent.key
            ? {
                ...s,
                name: values.name,
                class: values.class,
                session: values.session,
                admissionDate: values.admissionDate,
                subjects: values.subjects || [],
                parent: {
                  name: values.parent?.name || "",
                  phone: values.parent?.phone || "",
                  occupation: values.parent?.occupation || "",
                  address: values.parent?.address || "",
                },
              }
            : s
        )
      );
      message.success("Student updated");
    } else {
      const newStudent = {
        key: Date.now().toString(),
        regNo: generateRegNo(),
        pin: generatePin(),
        name: values.name,
        class: values.class,
        session: values.session,
        admissionDate: values.admissionDate || null,
        subjects: values.subjects || [],
        parent: {
          name: values.parent?.name || "",
          phone: values.parent?.phone || "",
          occupation: values.parent?.occupation || "",
          address: values.parent?.address || "",
        },
      };
      setStudents((prev) => [newStudent, ...prev]);
      message.success("Student added");
    }

    setIsModalOpen(false);
    form.resetFields();
    setEditingStudent(null);
  };

  const handleDelete = (key) => {
    setStudents((prev) => prev.filter((s) => s.key !== key));
    message.success("Student deleted");
  };

  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      const importedStudents = json.map((item, idx) => ({
        key: Date.now().toString() + idx,
        regNo: generateRegNo(),
        pin: generatePin(),
        name: item.Name || "",
        class: item.Class || "",
        session: item.Session || "",
        admissionDate: item.AdmissionDate || "",
        parent: {
          name: item.ParentName || "",
          phone: item.ParentPhone || "",
          occupation: item.ParentOccupation || "",
          address: item.ParentAddress || "",
        },
        subjects: item.Subjects ? item.Subjects.split(",") : [],
      }));

      setStudents((prev) => [...importedStudents, ...prev]);
      message.success(
        `Imported ${importedStudents.length} students successfully`
      );
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const columns = [
    {
      title: "Reg No",
      dataIndex: "regNo",
      key: "regNo",
      width: 120,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
      width: 100,
    },
    {
      title: "Session",
      dataIndex: "session",
      key: "session",
      width: 120,
    },
    {
      title: "Parent",
      dataIndex: ["parent", "name"],
      key: "parentName",
      width: 180,
      render: (text, record) => record.parent?.name || "-",
    },
    {
      title: "Actions",
      key: "action",
      width: 260,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => openDetails(record)}
          >
            Details
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete student?"
            onConfirm={() => handleDelete(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
          <Button
            type="default"
            icon={<BarChartOutlined />}
            size="small"
            onClick={() => openProgressModal(record)}
            style={{
              backgroundColor: "#52c41a",
              color: "#fff",
              borderColor: "#52c41a",
            }}
          >
            Progress
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-1/3">
          <Input
            placeholder="Search student by name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <Select
            placeholder="Select Class"
            onChange={(value) => setSelectedClass(value)}
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

          <Select
            placeholder="Select Session"
            onChange={(value) => setSelectedSession(value)}
            allowClear
            className="w-40"
            value={selectedSession}
          >
            {sessions.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>

          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
            >
              Add Student
            </Button>
            <Upload
              accept=".xlsx,.xls"
              beforeUpload={handleExcelUpload}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Upload Excel</Button>
            </Upload>
          </Space>
        </div>
      </div>

      {selectedClass && (
        <p className="mb-3 text-gray-600">
          <span className="font-semibold">Teacher Assigned:</span>{" "}
          {teacherAssigned[selectedClass] || "Not Assigned"}
        </p>
      )}

      <Table
        columns={columns}
        dataSource={filteredStudents}
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

      {/* Add/Edit Modal */}
      <Modal
        title={editingStudent ? "Edit Student" : "Add Student"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingStudent(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Title level={5} className="mb-2 text-center">
            Student Information
          </Title>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Student Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter student name" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Admission Date" name="admissionDate">
                <Input placeholder="YYYY-MM-DD (optional)" />
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
                <Select>
                  {classes.map((c) => (
                    <Option key={c} value={c}>
                      {c}
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
                <Select>
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
            <Col span={24}>
              <Form.Item
                label="Subjects Offered"
                name="subjects"
                rules={[{ required: true, message: "Please select subjects" }]}
              >
                <Select mode="multiple" placeholder="Select subjects">
                  {subjects.map((subj) => (
                    <Option key={subj} value={subj}>
                      {subj}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} className="mb-2 text-center">
            Parent Information
          </Title>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Parent Name"
                name={["parent", "name"]}
                rules={[
                  { required: true, message: "Please enter parent name" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Parent Phone"
                name={["parent", "phone"]}
                rules={[
                  { required: true, message: "Please enter parent phone" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Parent Occupation"
                name={["parent", "occupation"]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Parent Address" name={["parent", "address"]}>
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
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
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
          <img src={std_img} alt="" className="object-contain w-full h-full" />
        </div>
        {detailsStudent && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Reg No">
              {detailsStudent.regNo}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {detailsStudent.name}
            </Descriptions.Item>
            <Descriptions.Item label="Class">
              {detailsStudent.class}
            </Descriptions.Item>
            <Descriptions.Item label="Session">
              {detailsStudent.session}
            </Descriptions.Item>
            <Descriptions.Item label="Admission Date">
              {detailsStudent.admissionDate || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="PIN">
              {detailsStudent.pin}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Name">
              {detailsStudent.parent?.name || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Phone">
              {detailsStudent.parent?.phone || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Occupation">
              {detailsStudent.parent?.occupation || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Address">
              {detailsStudent.parent?.address || "—"}
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

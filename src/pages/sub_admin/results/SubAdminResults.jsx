import React, { useState } from "react";
import { Select, Table, Button, Modal, Tag, message, Space, Card } from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import EnterResult from "../../../components/result/EnterResult.jsx"; // your existing EnterResult component

const { Option } = Select;

// Mock class data
const classList = [
  { id: "jss1a", name: "JSS1 A" },
  { id: "jss1b", name: "JSS1 B" },
  { id: "jss1c", name: "JSS1 C" },
];

// Mock students
const mockStudents = {
  jss1a: [
    { id: 1, name: "John Doe", gender: "Male" },
    { id: 2, name: "Mary James", gender: "Female" },
  ],
  jss1b: [
    { id: 3, name: "Peter Obi", gender: "Male" },
    { id: 4, name: "Jane Thomas", gender: "Female" },
  ],
  jss1c: [
    { id: 5, name: "Chinedu Nnamdi", gender: "Male" },
    { id: 6, name: "Ada Lovelace", gender: "Female" },
  ],
};

const SubAdminResults = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [openEnterModal, setOpenEnterModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // When class is selected
  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    setStudents(mockStudents[classId] || []);
  };

  const handleEditRecord = (student) => {
    setSelectedStudent(student);
    setOpenEnterModal(true);
  };

  const handleViewRecord = (student) => {
    setSelectedStudent(student);
    setOpenViewModal(true);
  };

  const columns = [
    {
      title: "Student Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (text) => (
        <Tag color={text === "Male" ? "blue" : "magenta"}>{text}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditRecord(record)}
          >
            Edit Record
          </Button>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewRecord(record)}
          >
            View Record
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card title="Manage Class Results" className="shadow-md rounded-xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <p className="mb-2 md:mb-0 font-medium">Select Class:</p>
          <Select
            placeholder="Select a class"
            style={{ width: 250 }}
            onChange={handleClassSelect}
            value={selectedClass}
          >
            {classList.map((cls) => (
              <Option key={cls.id} value={cls.id}>
                {cls.name}
              </Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      {selectedClass && (
        <Card className="shadow-md rounded-xl">
          <h2 className="text-lg font-semibold mb-4">
            Students in {classList.find((c) => c.id === selectedClass)?.name}
          </h2>

          <Table
            columns={columns}
            dataSource={students}
            rowKey="id"
            pagination={false}
            bordered
          />
        </Card>
      )}

      {/* Enter Result Modal */}
      {openEnterModal && (
        <EnterResult
          open={openEnterModal}
          onClose={() => setOpenEnterModal(false)}
          student={selectedStudent}
          role="subadmin" // or "admin" or "teacher"
          assignedSubjects={["Mathematics", "English"]} // for teacher
          assignedClass="JSS1A" // for subadmin
          allClasses={["JSS1A", "JSS1B", "JSS2A", "JSS2B"]} // for admin
          allSubjects={[
            "Mathematics",
            "English",
            "Basic Science",
            "Social Studies",
            "Civic",
          ]}
        />
      )}

      {/* View Result Modal */}
      <Modal
        title={`View Record - ${selectedStudent?.name}`}
        open={openViewModal}
        onCancel={() => setOpenViewModal(false)}
        footer={[
          <Button key="close" onClick={() => setOpenViewModal(false)}>
            Close
          </Button>,
        ]}
      >
        <p>This section will show the student's saved result in detail.</p>
      </Modal>
    </div>
  );
};

export default SubAdminResults;

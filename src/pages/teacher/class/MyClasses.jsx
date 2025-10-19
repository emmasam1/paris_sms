import React, { useEffect, useState } from "react";
import { Card, Table, Select, Button, Modal, Space, Tabs } from "antd";
import {
  EditOutlined,
  BarChartOutlined,
  UserOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  FormOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import EnterResult from "../../../components/result/EnterResult";
import ProgressChart from "../../../components/progress/ProgressChart";
import Attendance from "../../../components/attendance/Attendance";
import ResultSheet from "../../../components/resultSheet/ResultSheet";

const { TabPane } = Tabs;

// Dummy data (replace with API later)
const classesData = [
  {
    id: "class1",
    name: "SS1 Science",
    students: [
      { id: 1, name: "John Doe", regNo: "ST001", gender: "Male" },
      { id: 2, name: "Jane Smith", regNo: "ST002", gender: "Female" },
    ],
  },
  {
    id: "class2",
    name: "SS2 Arts",
    students: [
      { id: 3, name: "Michael Johnson", regNo: "ST003", gender: "Male" },
      { id: 4, name: "Emily Davis", regNo: "ST004", gender: "Female" },
    ],
  },
];

const MyClasses = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isViewResultModalOpen, setIsViewResultModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);

  const progressData = [
    { subject: "Mathematics", score: 75 },
    { subject: "English", score: 60 },
    { subject: "Biology", score: 85 },
    { subject: "Chemistry", score: 70 },
  ];

  useEffect(() => {
    if (classesData.length > 0) {
      setSelectedClass(classesData[0]);
    }
  }, []);

  const openResultModal = (student) => {
    setActiveStudent(student);
    setIsResultModalOpen(true);
  };

  const openViewResult = (student) => {
    setActiveStudent(student);
    setIsViewResultModalOpen(true);
  };

  const studentColumns = [
    { title: "Reg No", dataIndex: "regNo", key: "regNo" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
  ];

  const progressColumns = [
    { title: "Reg No", dataIndex: "regNo", key: "regNo" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          icon={<BarChartOutlined />}
          onClick={() => {
            setActiveStudent(record);
            setIsProgressModalOpen(true);
          }}
        >
          View Progress
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Class Select Dropdown */}
      <Card className="!mb-5 shadow-md rounded-xl">
        <Select
          style={{ width: 250 }}
          value={selectedClass?.id}
          onChange={(value) => {
            const cls = classesData.find((c) => c.id === value);
            setSelectedClass(cls);
          }}
        >
          {classesData.map((cls) => (
            <Select.Option key={cls.id} value={cls.id}>
              {cls.name}
            </Select.Option>
          ))}
        </Select>
      </Card>

      {/* Tabs */}
      <Card className="shadow-md rounded-xl">
        <Tabs defaultActiveKey="1">
          {/* Students */}
          <TabPane
            tab={
              <span>
                <UserOutlined /> Students
              </span>
            }
            key="1"
          >
            <Table
              dataSource={selectedClass?.students || []}
              columns={studentColumns}
              rowKey="id"
              bordered
              size="small"
              pagination={false}
            />
          </TabPane>

          {/* Results */}
          <TabPane
            tab={
              <span>
                <EditOutlined /> Results
              </span>
            }
            key="2"
          >
            <Table
              dataSource={selectedClass?.students || []}
              rowKey="id"
              bordered
              size="small"
              pagination={false}
              columns={[
                { title: "Reg No", dataIndex: "regNo", key: "regNo" },
                { title: "Name", dataIndex: "name", key: "name" },
                { title: "Gender", dataIndex: "gender", key: "gender" },
                {
                  title: "Actions",
                  key: "actions",
                  width: 220,
                  render: (_, record) => (
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                        onClick={() => openResultModal(record)}
                      >
                        Enter
                      </Button>
                      <Button
                        type="primary"
                        size="small"
                        icon={<FormOutlined />}
                        onClick={() => openResultModal(record)} // placeholder edit
                      >
                        Edit
                      </Button>
                      <Button
                        type="default"
                        size="small"
                        ghost
                        icon={<EyeOutlined />}
                        style={{ color: "#722ed1", borderColor: "#722ed1" }}
                        onClick={() => openViewResult(record)}
                      >
                        View
                      </Button>
                    </Space>
                  ),
                },
              ]}
            />

            {/* Enter/Edit Result Modal */}
            <EnterResult
              open={isResultModalOpen}
              onClose={() => setIsResultModalOpen(false)}
              student={activeStudent}
            />

            {/* View Result Modal (DUMMY SHEET) */}
            <Modal
              title={`Result Sheet - ${activeStudent?.name}`}
              open={isViewResultModalOpen}
              onCancel={() => setIsViewResultModalOpen(false)}
              footer={[
                <Button key="close" onClick={() => setIsViewResultModalOpen(false)}>
                  Close
                </Button>,
              ]}
              width={800}
            >
              <ResultSheet student={activeStudent} />
            </Modal>
          </TabPane>

          {/* Attendance */}
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined /> Attendance
              </span>
            }
            key="3"
          >
            <Attendance students={selectedClass?.students || []} />
          </TabPane>

          {/* Progress */}
          <TabPane
            tab={
              <span>
                <BarChartOutlined /> Progress
              </span>
            }
            key="4"
          >
            <Table
              dataSource={selectedClass?.students || []}
              columns={progressColumns}
              rowKey="id"
              bordered
              size="small"
              pagination={false}
            />

            <Modal
              title={`Progress of ${activeStudent?.name}`}
              open={isProgressModalOpen}
              onCancel={() => setIsProgressModalOpen(false)}
              footer={[
                <Button key="close" onClick={() => setIsProgressModalOpen(false)}>
                  Close
                </Button>,
              ]}
              width={600}
            >
              <ProgressChart
                data={progressData}
                studentName={activeStudent?.name}
              />
            </Modal>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default MyClasses;

import React, { useState, useEffect } from "react";
import {
  Table,
  Checkbox,
  Card,
  Button,
  Select,
  message,
  Tabs,
  Tag,
  Collapse,
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const SubAdminAttendance = () => {
  const classes = ["JSS1A", "JSS1B", "JSS1C"];

  // Mock data
  const mockStudents = {
    JSS1A: [
      { id: 1, regNo: "JSS1A001", name: "Adeola Johnson" },
      { id: 2, regNo: "JSS1A002", name: "Samuel Nnaji" },
      { id: 3, regNo: "JSS1A003", name: "Esther Ojo" },
    ],
    JSS1B: [
      { id: 4, regNo: "JSS1B001", name: "John Doe" },
      { id: 5, regNo: "JSS1B002", name: "Jane Doe" },
    ],
    JSS1C: [
      { id: 6, regNo: "JSS1C001", name: "Chinedu Obi" },
      { id: 7, regNo: "JSS1C002", name: "Ngozi Okafor" },
    ],
  };

  // State
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [viewRecords, setViewRecords] = useState({});

  const today = dayjs().format("YYYY-MM-DD");

  // When class changes
  useEffect(() => {
    if (selectedClass) {
      setStudents(mockStudents[selectedClass] || []);
      setAttendance({});
      setSubmitted(false);
    }
  }, [selectedClass]);

  // Handle attendance change
  const handleAttendanceChange = (studentId, checked) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: checked,
    }));
  };

  // Submit attendance
  const handleSubmit = () => {
    if (!selectedClass) return message.warning("Please select a class first.");
    if (Object.keys(attendance).length === 0)
      return message.warning("No attendance marked yet.");

    const formatted = students.map((stu) => ({
      id: stu.id,
      regNo: stu.regNo,
      name: stu.name,
      status: attendance[stu.id] ? "Present" : "Absent",
      date: today,
      className: selectedClass,
    }));

    // Save grouped by class
    setViewRecords((prev) => ({
      ...prev,
      [selectedClass]: [...(prev[selectedClass] || []), ...formatted],
    }));

    setSubmitted(true);
    message.success(`Attendance submitted for ${selectedClass} (${today})`);
  };

  // Columns for marking attendance
  const markColumns = [
    { title: "Reg No", dataIndex: "regNo", key: "regNo" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Present",
      key: "present",
      render: (_, record) => (
        <Checkbox
          checked={attendance[record.id] || false}
          onChange={(e) => handleAttendanceChange(record.id, e.target.checked)}
          disabled={submitted}
        />
      ),
    },
  ];

  // Columns for viewing attendance
  const viewColumns = [
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Reg No", dataIndex: "regNo", key: "regNo" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Present" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card className="shadow-md rounded-xl">
        <Tabs defaultActiveKey="1">
          {/* MARK ATTENDANCE */}
          <TabPane tab="Mark Attendance" key="1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
              <div className="flex-1 mb-3 sm:mb-0">
                <label className="text-gray-700 font-medium">
                  Select Class
                </label>
                <Select
                  placeholder="Select class"
                  className="w-full"
                  value={selectedClass}
                  onChange={setSelectedClass}
                >
                  {classes.map((cls) => (
                    <Option key={cls} value={cls}>
                      {cls}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-gray-700 font-medium">Date</label>
                <div className="border border-gray-200 rounded-md p-2 bg-gray-50">
                  {today}
                </div>
              </div>
            </div>

            {students.length > 0 ? (
              <>
                <Table
                  dataSource={students}
                  columns={markColumns}
                  rowKey="id"
                  bordered
                  pagination={false}
                  size="small"
                />
                <div className="text-right mt-4">
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    disabled={submitted}
                  >
                    {submitted ? "Submitted" : "Submit Attendance"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center mt-6">
                Please select a class to view students.
              </p>
            )}
          </TabPane>

          {/* VIEW ATTENDANCE */}
          <TabPane tab="View Attendance" key="2">
            {Object.keys(viewRecords).length > 0 ? (
              <Collapse accordion>
                {Object.entries(viewRecords).map(([className, records]) => (
                  <Panel
                    header={
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{className}</span>
                        <Tag color="blue">{records.length} record(s)</Tag>
                      </div>
                    }
                    key={className}
                  >
                    <Table
                      dataSource={records}
                      columns={viewColumns}
                      rowKey={(record) => `${record.id}-${record.date}`}
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
                  </Panel>
                ))}
              </Collapse>
            ) : (
              <p className="text-gray-500 text-center mt-6">
                No attendance records available yet.
              </p>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SubAdminAttendance;

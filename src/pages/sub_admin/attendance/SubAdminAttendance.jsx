import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Select,
  message,
  Tabs,
  Tag,
  Collapse,
  Radio,
  Statistic,
  Row,
  Col,
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const SubAdminAttendance = () => {
  const today = dayjs().format("YYYY-MM-DD");

  const classes = ["JSS1A", "JSS1B", "JSS1C"];

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

  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [viewRecords, setViewRecords] = useState({}); // { className: { date: [records] } }

  const [selectedDate, setSelectedDate] = useState(today);

  const [summary, setSummary] = useState(null);

  /** Load class students */
  useEffect(() => {
    if (selectedClass) {
      setStudents(mockStudents[selectedClass] || []);
      setAttendance({});
      setSummary(null);
      setSelectedDate(today);
    }
  }, [selectedClass]);

  /** Change Attendance */
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  /** Submit Attendance */
  const handleSubmit = () => {
    if (!selectedClass) return message.warning("Please select a class.");

    if (Object.keys(attendance).length === 0)
      return message.warning("Please mark at least one student.");

    // Prevent duplicate for same class + date
    const existingDateRecords =
      viewRecords[selectedClass]?.[selectedDate] || [];

    if (existingDateRecords.length > 0) {
      return message.error(
        `Attendance for ${selectedClass} on ${selectedDate} is already recorded.`
      );
    }

    const formatted = students.map((stu) => ({
      id: stu.id,
      regNo: stu.regNo,
      name: stu.name,
      status: attendance[stu.id] || "Absent",
      date: selectedDate,
      className: selectedClass,
    }));

    // Push into viewRecords grouped by class and date
    setViewRecords((prev) => ({
      ...prev,
      [selectedClass]: {
        ...(prev[selectedClass] || {}),
        [selectedDate]: formatted,
      },
    }));

    // Create summary
    const summaryCount = {
      Present: 0,
      Absent: 0,
      Late: 0,
      Excused: 0,
    };

    formatted.forEach((r) => {
      summaryCount[r.status]++;
    });

    setSummary(summaryCount);

    message.success(`Attendance submitted for ${selectedClass}`);
  };

  /** Mark Attendance Table Columns */
  const markColumns = [
    { title: "Reg No", dataIndex: "regNo", key: "regNo" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Radio.Group
          onChange={(e) => handleAttendanceChange(record.id, e.target.value)}
          value={attendance[record.id] || ""}
        >
          <Radio value="Present">
            <Tag color="green">Present</Tag>
          </Radio>
          <Radio value="Absent">
            <Tag color="red">Absent</Tag>
          </Radio>
          <Radio value="Late">
            <Tag color="orange">Late</Tag>
          </Radio>
          <Radio value="Excused">
            <Tag color="blue">Excused</Tag>
          </Radio>
        </Radio.Group>
      ),
    },
  ];

  /** View attendance columns */
  const viewColumns = [
    { title: "Reg No", dataIndex: "regNo" },
    { title: "Name", dataIndex: "name" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const color =
          status === "Present"
            ? "green"
            : status === "Late"
            ? "orange"
            : status === "Excused"
            ? "blue"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Card className="rounded-xl">
        <Tabs defaultActiveKey="1">
          {/* --------------------- MARK ATTENDANCE TAB ----------------------- */}
          <TabPane tab="Mark Attendance" key="1">
            <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4">
              <div className="flex-1">
                <label className="font-semibold">Class</label>
                <Select
                  className="w-full"
                  placeholder="Select class"
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
                <label className="font-semibold">Date</label>
                <div className="border border-gray-300 p-1 rounded bg-gray-50">{selectedDate}</div>
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
                  scroll={{ x: "max-content" }}
                />

                {/* SUMMARY BOX */}
                {summary && (
                  <Card className="mt-4 bg-gray-50">
                    <Row gutter={16}>
                      {Object.entries(summary).map(([key, val]) => (
                        <Col span={6} key={key}>
                          <Statistic title={key} value={val} />
                        </Col>
                      ))}
                    </Row>
                  </Card>
                )}

                <div className="text-right mt-4">
                  <Button type="primary" onClick={handleSubmit}>
                    Submit Attendance
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-gray-400 mt-6 text-center">
                Select a class to load students
              </p>
            )}
          </TabPane>

          {/* --------------------- VIEW ATTENDANCE TAB ----------------------- */}
          <TabPane tab="View Attendance" key="2">
            {Object.keys(viewRecords).length > 0 ? (
              <Collapse accordion>
                {Object.entries(viewRecords).map(([className, dates]) => (
                  <Panel
                    header={
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{className}</span>
                        <Tag color="blue">
                          {Object.keys(dates).length} day(s)
                        </Tag>
                      </div>
                    }
                    key={className}
                  >
                    {Object.entries(dates).map(([date, records]) => (
                      <div key={date} className="mb-6">
                        <h4 className="font-medium mb-2">{date}</h4>
                        <Table
                          dataSource={records}
                          columns={viewColumns}
                          rowKey={(r) => r.id}
                          bordered
                          pagination={false}
                          size="small"
                        />
                      </div>
                    ))}
                  </Panel>
                ))}
              </Collapse>
            ) : (
              <p className="text-gray-400 text-center mt-6">
                No attendance records yet.
              </p>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default SubAdminAttendance;

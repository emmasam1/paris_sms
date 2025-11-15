// components/attendance/Attendance.jsx
import React, { useState, useEffect } from "react";
import { Table, Select, Button, Card, Radio, Row, Col, Statistic, Collapse, Tag, message, Tabs } from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { Panel } = Collapse;

const Attendance = ({ students, className }) => {
  const today = dayjs().format("YYYY-MM-DD");

  const [selectedDate, setSelectedDate] = useState(today);
  const [attendance, setAttendance] = useState({}); // { studentId: "Present" | "Absent" | "Late" | "Excused" }
  const [viewRecords, setViewRecords] = useState({}); // { date: [records] }
  const [summary, setSummary] = useState(null);

  // When students change (new class), reset attendance
  useEffect(() => {
    setAttendance({});
    setSummary(null);
  }, [students]);

  // Mark attendance
  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  // Submit attendance for selected date
  const handleSubmit = () => {
    if (students.length === 0) return message.warning("No students in class.");
    if (Object.keys(attendance).length === 0) return message.warning("Mark at least one student.");

    if (viewRecords[selectedDate]) {
      return message.error(`Attendance for ${selectedDate} is already recorded.`);
    }

    const formatted = students.map(stu => ({
      id: stu.id,
      regNo: stu.regNo,
      name: stu.name,
      status: attendance[stu.id] || "Absent",
      date: selectedDate,
      className,
    }));

    // Save records
    setViewRecords(prev => ({ ...prev, [selectedDate]: formatted }));

    // Create summary
    const summaryCount = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    formatted.forEach(r => summaryCount[r.status]++);
    setSummary(summaryCount);

    message.success(`Attendance submitted for ${selectedDate}`);
  };

  // Columns for marking attendance
  const markColumns = [
    { title: "Reg No", dataIndex: "regNo", key: "regNo" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Radio.Group
          onChange={e => handleAttendanceChange(record.id, e.target.value)}
          value={attendance[record.id] || ""}
        >
          <Radio value="Present"><Tag color="green">Present</Tag></Radio>
          <Radio value="Absent"><Tag color="red">Absent</Tag></Radio>
          <Radio value="Late"><Tag color="orange">Late</Tag></Radio>
          <Radio value="Excused"><Tag color="blue">Excused</Tag></Radio>
        </Radio.Group>
      )
    }
  ];

  // Columns for viewing attendance
  const viewColumns = [
    { title: "Reg No", dataIndex: "regNo" },
    { title: "Name", dataIndex: "name" },
    {
      title: "Status",
      dataIndex: "status",
      render: status => {
        const color = status === "Present" ? "green" :
                      status === "Late" ? "orange" :
                      status === "Excused" ? "blue" : "red";
        return <Tag color={color}>{status}</Tag>;
      }
    }
  ];

  return (
    <Card>
      <Select
        value={selectedDate}
        style={{ marginBottom: 16 }}
        onChange={setSelectedDate}
      >
        {/* For simplicity, allow 7 days including today */}
        {[...Array(7)].map((_, i) => {
          const date = dayjs().subtract(i, 'day').format("YYYY-MM-DD");
          return <Option key={date} value={date}>{date}</Option>;
        })}
      </Select>

      <Tabs defaultActiveKey="1">
        {/* Mark Attendance */}
        <Tabs.TabPane tab="Mark Attendance" key="1">
          {students.length === 0 ? (
            <p className="text-gray-400 text-center">Select a class to load students</p>
          ) : (
            <>
              <Table
                dataSource={students}
                columns={markColumns}
                rowKey="id"
                bordered
                pagination={false}
                size="small"
              />

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
          )}
        </Tabs.TabPane>

        {/* View Attendance */}
        <Tabs.TabPane tab="View Attendance" key="2">
          {Object.keys(viewRecords).length === 0 ? (
            <p className="text-gray-400 text-center mt-6">No attendance records yet.</p>
          ) : (
            <Collapse accordion>
              {Object.entries(viewRecords).map(([date, records]) => (
                <Panel
                  header={`${date} (${records.length} students)`}
                  key={date}
                >
                  <Table
                    dataSource={records}
                    columns={viewColumns}
                    rowKey="id"
                    bordered
                    pagination={false}
                    size="small"
                  />
                </Panel>
              ))}
            </Collapse>
          )}
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
};

export default Attendance;

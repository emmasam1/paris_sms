// components/attendance/Attendance.jsx
import React, { useState } from "react";
import { Table, Checkbox, Card } from "antd";

const Attendance = ({ students }) => {
  const [attendance, setAttendance] = useState({});

  const handleAttendanceChange = (studentId, day, checked) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [day]: checked,
      },
    }));
  };

  // Attendance columns (5 days in a week)
  const attendanceColumns = [
    { title: "Reg No", dataIndex: "regNo", key: "regNo" },
    { title: "Name", dataIndex: "name", key: "name" },
    ...["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => ({
      title: day,
      key: day,
      render: (_, record) => (
        <Checkbox
          checked={attendance[record.id]?.[day] || false}
          onChange={(e) =>
            handleAttendanceChange(record.id, day, e.target.checked)
          }
        />
      ),
    })),
  ];

  return (
    <div className="">
      {/* <h3 className="text-lg font-semibold mb-3">Weekly Attendance</h3> */}
      <Table
        dataSource={students}
        columns={attendanceColumns}
        rowKey="id"
        bordered
        size="small"
        pagination={false}
      />
    </div>
  );
};

export default Attendance;

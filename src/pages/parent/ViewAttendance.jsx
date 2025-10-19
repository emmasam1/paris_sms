import React, { useState } from "react";
import { Card, Button, Progress } from "antd";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import { ArrowLeftOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import "dayjs/locale/en";
import { Link } from "react-router";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale("en");

const ViewAttendance = ({ onBack }) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // 🧩 Mock attendance data
  const attendanceData = {
    "2025-10-01": "present",
    "2025-10-02": "present",
    "2025-10-03": "absent",
    "2025-10-04": "present",
    "2025-10-07": "present",
    "2025-10-10": "absent",
  };

  const daysInMonth = currentMonth.daysInMonth();
  const startOfMonth = currentMonth.startOf("month").weekday();

  const generateDays = () => {
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = currentMonth.date(i);
      const dayOfWeek = date.day();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      const status = attendanceData[date.format("YYYY-MM-DD")];

      days.push({
        date,
        isWeekend,
        status: isWeekend ? "noschool" : status || "absent",
      });
    }
    return days;
  };

  const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const days = generateDays();
  const weekdays = dayjs.weekdaysShort();

  // 📊 Summary calculations
  const totalSchoolDays = days.filter((d) => !d.isWeekend).length;
  const presentDays = days.filter((d) => d.status === "present").length;
  const absentDays = days.filter((d) => d.status === "absent").length;
  const attendancePercentage = ((presentDays / totalSchoolDays) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-2 py-4">
        <Link to="/home">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          type="text"
          className="flex items-center"
        >
          Back
        </Button>
        </Link>
        <h1 className="text-xl font-semibold">Student Attendance</h1>
      </div>

      <Card className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 📅 Calendar Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button
                  icon={<LeftOutlined />}
                  onClick={handlePrevMonth}
                  size="small"
                />
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNextMonth}
                  size="small"
                />
              </div>
              <h2 className="text-lg font-semibold">{currentMonth.format("MMMM YYYY")}</h2>
            </div>

            <div className="grid grid-cols-7 text-center font-semibold mb-2 text-gray-600">
              {weekdays.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array(startOfMonth)
                .fill(null)
                .map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

              {days.map(({ date, status }) => (
                <div
                  key={date.format("YYYY-MM-DD")}
                  className={`rounded-lg p-2 border text-sm flex flex-col items-center justify-center transition
                    ${
                      status === "present"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : status === "absent"
                        ? "bg-red-100 text-red-700 border-red-200"
                        : "bg-gray-100 text-gray-400 border-gray-200"
                    }`}
                >
                  <span className="font-semibold">{date.date()}</span>
                  <span className="text-xs capitalize">{status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 📋 Summary Section */}
          <div className="md:border-l border-gray-200 md:pl-8 mt-6 md:mt-0">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Attendance Summary</h3>

            <div className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total School Days</span>
                <b className="text-gray-800">{totalSchoolDays}</b>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Present</span>
                <b className="text-green-600">{presentDays}</b>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Absent</span>
                <b className="text-red-600">{absentDays}</b>
              </div>

              <div className="pt-2">
                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                <Progress
                  percent={Number(attendancePercentage)}
                  size="small"
                  strokeColor="#16a34a"
                />
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs mt-6">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <span>Present</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
                <span>No School</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ViewAttendance;

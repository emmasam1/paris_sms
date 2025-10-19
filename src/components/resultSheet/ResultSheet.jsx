import React from "react";
import { Card, Table, Typography, Divider } from "antd";

const { Title, Text } = Typography;

const studentData = {
  studentName: "John Doe",
  fatherName: "Mr. Richard Doe",
  schoolName: "Bright Future High School",
  rollCode: "32038",
  rollNumber: "2500085",
  registrationNumber: "32038-00144-24",
};

const marksData = [
  { key: 1, subject: "Mathematics", fMarks: 100, pMarks: 30, theory: 45, prac: 17, regulation: "-", total: 62 },
  { key: 2, subject: "English", fMarks: 100, pMarks: 30, theory: 65, prac: "-", regulation: "-", total: 65 },
  { key: 3, subject: "Basic Science", fMarks: 100, pMarks: 30, theory: 57, prac: 15, regulation: "-", total: 72 },
  { key: 4, subject: "Social Studies", fMarks: 100, pMarks: 30, theory: 38, prac: 10, regulation: "-", total: 48 },
];

const columns = [
  { title: "Subject", dataIndex: "subject", key: "subject" },
  { title: "F.Marks", dataIndex: "fMarks", key: "fMarks", align: "center" },
  { title: "P.Marks", dataIndex: "pMarks", key: "pMarks", align: "center" },
  { title: "Theory", dataIndex: "theory", key: "theory", align: "center" },
  { title: "INT/PRAC", dataIndex: "prac", key: "prac", align: "center" },
  { title: "Regulation", dataIndex: "regulation", key: "regulation", align: "center" },
  { title: "Subject Total", dataIndex: "total", key: "total", align: "center" },
];

const ResultSheet = () => {
  return (
    <Card className="shadow-lg p-6" bordered>
      {/* Header */}
      <div className="text-center mb-6">
        <img
          src="/school-logo.png"
          alt="school logo"
          style={{ width: 70, margin: "0 auto" }}
        />
        <Title level={4} style={{ marginBottom: 0 }}>
          Bright Future High School
        </Title>
        <Text strong>ANNUAL SECONDARY EXAMINATION - 2025</Text>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Text>
          <strong>Student Name:</strong> {studentData.studentName}
        </Text>
        <Text>
          <strong>Father’s Name:</strong> {studentData.fatherName}
        </Text>
        <Text>
          <strong>School Name:</strong> {studentData.schoolName}
        </Text>
        <Text>
          <strong>Roll Code:</strong> {studentData.rollCode}
        </Text>
        <Text>
          <strong>Roll Number:</strong> {studentData.rollNumber}
        </Text>
        <Text>
          <strong>Registration Number:</strong> {studentData.registrationNumber}
        </Text>
      </div>

      <Divider />

      {/* Marks Table */}
      <Title level={5}>Marks Details</Title>
      <Table
        dataSource={marksData}
        columns={columns}
        pagination={false}
        bordered
        size="middle"
      />

      <Divider />

      {/* Final Result */}
      <div className="flex justify-between">
        <Text>
          <strong>Result/Division:</strong> 1st Division
        </Text>
        <Text>
          <strong>Total Marks:</strong> 304
        </Text>
      </div>

      <div className="mt-2">
        <Text>
          <strong>Remarks:</strong> Very Good Performance
        </Text>
      </div>

      <Divider />

      {/* Abbreviation */}
      <div>
        <Text strong>Abbreviations Used:</Text>
        <ul style={{ marginLeft: 20 }}>
          <li>F → Fail</li>
          <li>C → Compartmental</li>
          <li>B → Betterment</li>
          <li>U/R → Under Regulation</li>
          <li>ABS → Absent</li>
          <li>INT → Internal</li>
          <li>PRAC → Practical</li>
        </ul>
      </div>
    </Card>
  );
};

export default ResultSheet;

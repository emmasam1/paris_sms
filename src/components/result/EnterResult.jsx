import React, { useState } from "react";
import { Modal, Table, InputNumber, Tag, message } from "antd";

// Subjects list (can be passed from props later)
const subjects = ["Mathematics", "English", "Biology", "Chemistry"];

// Utility for grading
const getGrade = (total) => {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
};

const EnterResult = ({ open, onClose, student }) => {
  const [studentScores, setStudentScores] = useState(
    subjects.map((subj) => ({
      key: subj,
      subject: subj,
      firstTest: 0,
      secondTest: 0,
      assignment: 0,
      practical: 0,
      exam: 0,
      total: 0,
      average: 0,
      grade: "F",
    }))
  );

  // Handle score change
  const handleScoreChange = (key, field, value) => {
    const updatedScores = studentScores.map((row) => {
      if (row.key === key) {
        const newRow = { ...row, [field]: value || 0 };
        const total =
          (newRow.firstTest || 0) +
          (newRow.secondTest || 0) +
          (newRow.assignment || 0) +
          (newRow.practical || 0) +
          (newRow.exam || 0);
        newRow.total = total;
        newRow.average = parseFloat((total / 5).toFixed(2));
        newRow.grade = getGrade(total);
        return newRow;
      }
      return row;
    });
    setStudentScores(updatedScores);
  };

  // Save
  const handleSave = () => {
    console.log("Saved:", { student, scores: studentScores });
    message.success(`Scores saved for ${student?.name}`);
    onClose();
  };

  // Columns
  const scoreColumns = [
    { title: "Subject", dataIndex: "subject", key: "subject" },
    {
      title: "First Test",
      dataIndex: "firstTest",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={20}
          value={record.firstTest}
          onChange={(val) => handleScoreChange(record.key, "firstTest", val)}
        />
      ),
    },
    {
      title: "Second Test",
      dataIndex: "secondTest",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={20}
          value={record.secondTest}
          onChange={(val) => handleScoreChange(record.key, "secondTest", val)}
        />
      ),
    },
    {
      title: "Assignment",
      dataIndex: "assignment",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={10}
          value={record.assignment}
          onChange={(val) => handleScoreChange(record.key, "assignment", val)}
        />
      ),
    },
    {
      title: "Practical",
      dataIndex: "practical",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={10}
          value={record.practical}
          onChange={(val) => handleScoreChange(record.key, "practical", val)}
        />
      ),
    },
    {
      title: "Exam",
      dataIndex: "exam",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={40}
          value={record.exam}
          onChange={(val) => handleScoreChange(record.key, "exam", val)}
        />
      ),
    },
    { title: "Total", dataIndex: "total", key: "total" },
    { title: "Average", dataIndex: "average", key: "average" },
    {
      title: "Grade",
      dataIndex: "grade",
      render: (grade) => {
        const colors = {
          A: "green",
          B: "blue",
          C: "orange",
          D: "volcano",
          E: "purple",
          F: "red",
        };
        return <Tag color={colors[grade]}>{grade}</Tag>;
      },
    },
  ];

  return (
    <Modal
      title={`Enter Scores for ${student?.name}`}
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      width={900}
    >
      <Table
        columns={scoreColumns}
        dataSource={studentScores}
        pagination={false}
        rowKey="key"
        size="small"
        bordered
      />
    </Modal>
  );
};

export default EnterResult;

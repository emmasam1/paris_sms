import React, { useState, useEffect } from "react";
import { Modal, Table, InputNumber, Tag, message, Select } from "antd";

const { Option } = Select;

// Utility for grading
const getGrade = (total) => {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
};

/**
 * Props:
 * role - "admin" | "subadmin" | "teacher"
 * assignedSubjects - array of subjects (for teacher)
 * assignedClass - class name (for subadmin)
 * allClasses - list of classes (for admin)
 * allSubjects - list of all subjects (for admin)
 */
const EnterResult = ({
  open,
  onClose,
  student,
  role,
  assignedSubjects = [],
  assignedClass = "",
  allClasses = [],
  allSubjects = [],
}) => {
  const [studentScores, setStudentScores] = useState([]);
  const [selectedClass, setSelectedClass] = useState(assignedClass || "");
  const [subjectsForEntry, setSubjectsForEntry] = useState([]);

  // Initialize based on role
  useEffect(() => {
    if (role === "teacher") {
      setSubjectsForEntry(assignedSubjects);
    } else if (role === "subadmin") {
      setSubjectsForEntry(allSubjects);
    } else if (role === "admin") {
      setSubjectsForEntry(allSubjects);
    }
  }, [role, assignedSubjects, allSubjects]);

  // Prepare student scores table
  useEffect(() => {
    if (subjectsForEntry?.length) {
      setStudentScores(
        subjectsForEntry.map((subj) => ({
          key: subj,
          subject: subj,
          firstAssignment: 0,
          secondAssignment: 0,
          firstCATest: 0,
          secondCATest: 0,
          exam: 0,
          total: 0,
          grade: "F",
        }))
      );
    }
  }, [subjectsForEntry]);

  // Handle score change
  const handleScoreChange = (key, field, value) => {
    const updated = studentScores.map((row) => {
      if (row.key === key) {
        const newRow = { ...row, [field]: value || 0 };

        const total =
          (newRow.firstAssignment || 0) +
          (newRow.secondAssignment || 0) +
          (newRow.firstCATest || 0) +
          (newRow.secondCATest || 0) +
          (newRow.exam || 0);

        newRow.total = total;
        newRow.grade = getGrade(total);
        return newRow;
      }
      return row;
    });
    setStudentScores(updated);
  };

  const handleSave = () => {
    console.log("Saved:", {
      role,
      class: selectedClass,
      student,
      scores: studentScores,
    });
    message.success(`Scores saved for ${student?.name}`);
    onClose();
  };

  const scoreColumns = [
    { title: "Subject", dataIndex: "subject", key: "subject" },
    {
      title: "1st Assignment (10%)",
      dataIndex: "firstAssignment",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={10}
          value={record.firstAssignment}
          onChange={(val) =>
            handleScoreChange(record.key, "firstAssignment", val)
          }
        />
      ),
    },
    {
      title: "2nd Assignment (10%)",
      dataIndex: "secondAssignment",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={10}
          value={record.secondAssignment}
          onChange={(val) =>
            handleScoreChange(record.key, "secondAssignment", val)
          }
        />
      ),
    },
    {
      title: "1st CA Test (20%)",
      dataIndex: "firstCATest",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={20}
          value={record.firstCATest}
          onChange={(val) =>
            handleScoreChange(record.key, "firstCATest", val)
          }
        />
      ),
    },
    {
      title: "2nd CA Test (20%)",
      dataIndex: "secondCATest",
      render: (_, record) => (
        <InputNumber
          min={0}
          max={20}
          value={record.secondCATest}
          onChange={(val) =>
            handleScoreChange(record.key, "secondCATest", val)
          }
        />
      ),
    },
    {
      title: "Exam (40%)",
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
    {
      title: "Total (100%)",
      dataIndex: "total",
      key: "total",
    },
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
      title={`Enter Scores for ${student?.name || "Student"}`}
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      width={900}
    >
      {role === "admin" && (
        <div className="mb-4">
          <label className="block text-gray-600 font-medium mb-1">
            Select Class
          </label>
          <Select
            placeholder="Select Class"
            value={selectedClass}
            onChange={setSelectedClass}
            className="w-full"
          >
            {allClasses.map((cls) => (
              <Option key={cls} value={cls}>
                {cls}
              </Option>
            ))}
          </Select>
        </div>
      )}

      {subjectsForEntry.length > 0 ? (
        <Table
          columns={scoreColumns}
          dataSource={studentScores}
          pagination={false}
          rowKey="key"
          size="small"
          bordered
        />
      ) : (
        <p className="text-center text-gray-500">
          No subjects assigned to you.
        </p>
      )}
    </Modal>
  );
};

export default EnterResult;

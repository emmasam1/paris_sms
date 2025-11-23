import React, { useState, useEffect } from "react";
import { Modal, Table, InputNumber, Tag, message } from "antd";

const getGrade = (total) => {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
};

const EnterResult = ({ open, onClose, student, subjects, teacherSubject }) => {
  const [studentScores, setStudentScores] = useState([]);

console.log(teacherSubject)

  // Load only subjects the student offers
useEffect(() => {

  if (subjects?.length) {
    const scores = subjects.map((subj) => ({
      key: subj._id,
      subject:teacherSubject?.name,
      subjectId: subj._id,
      firstAssignment: 0,
      secondAssignment: 0,
      firstCATest: 0,
      secondCATest: 0,
      exam: 0,
      total: 0,
      grade: "F",
    }));
    setStudentScores(scores);
  } else {
    setStudentScores([]);
  }
}, [subjects]);





  const handleScoreChange = (key, field, value) => {
    setStudentScores((prev) =>
      prev.map((row) => {
        if (row.key === key) {
          const updated = { ...row, [field]: value || 0 };

          const total =
            updated.firstAssignment +
            updated.secondAssignment +
            updated.firstCATest +
            updated.secondCATest +
            updated.exam;

          updated.total = total;
          updated.grade = getGrade(total);

          return updated;
        }
        return row;
      })
    );
  };

  const handleSave = () => {
    console.log("Saving Result:", {
      studentId: student?._id,
      name: student?.fullName,
      scores: studentScores,
    });

    message.success(`Scores saved for ${student?.fullName}`);
    onClose();
  };

  const scoreColumns = [
    { title: "Subject", dataIndex: "subject" },

    {
      title: "1st Assignment (10%)",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={10}
          value={r.firstAssignment}
          onChange={(v) => handleScoreChange(r.key, "firstAssignment", v)}
        />
      ),
    },

    {
      title: "2nd Assignment (10%)",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={10}
          value={r.secondAssignment}
          onChange={(v) => handleScoreChange(r.key, "secondAssignment", v)}
        />
      ),
    },

    {
      title: "1st CA (20%)",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={20}
          value={r.firstCATest}
          onChange={(v) => handleScoreChange(r.key, "firstCATest", v)}
        />
      ),
    },

    {
      title: "2nd CA (20%)",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={20}
          value={r.secondCATest}
          onChange={(v) => handleScoreChange(r.key, "secondCATest", v)}
        />
      ),
    },

    {
      title: "Exam (40%)",
      render: (_, r) => (
        <InputNumber
          min={0}
          max={40}
          value={r.exam}
          onChange={(v) => handleScoreChange(r.key, "exam", v)}
        />
      ),
    },

    { title: "Total", dataIndex: "total" },

    {
      title: "Grade",
      dataIndex: "grade",
      render: (g) => (
        <Tag
          color={
            g === "A"
              ? "green"
              : g === "B"
              ? "blue"
              : g === "C"
              ? "orange"
              : g === "D"
              ? "volcano"
              : g === "E"
              ? "purple"
              : "red"
          }
        >
          {g}
        </Tag>
      ),
    },
  ];

  return (
    <Modal
      title={`Enter Result – ${student?.fullName}`}
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      width={900}
    >
      {student?.subjects?.length ? (
        <Table
          columns={scoreColumns}
          dataSource={studentScores}
          pagination={false}
          rowKey="key"
          bordered
        />
      ) : (
        <p className="text-center text-gray-500">
          This student is not offering any subject.
        </p>
      )}
    </Modal>
  );
};

export default EnterResult;

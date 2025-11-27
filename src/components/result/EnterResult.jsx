import React, { useState, useEffect } from "react";
import { Modal, Table, InputNumber, Tag, message, Select } from "antd";
import axios from "axios";
import { useApp } from "../../context/AppContext";

const getGrade = (total) => {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
};

const EnterResult = ({
  open,
  onClose,
  student,
  teacherSubject,
  onClick
}) => {
  const [studentScores, setStudentScores] = useState([]);
  const { API_BASE_URL, token, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();

  // NEW STATES
  const [session, setSession] = useState(null);
  const [term, setTerm] = useState(null);

  // ===============================
  // SAVE SCORE FUNCTION
  // ===============================
  const enterScore = async () => {
    if (!student?._id) return message.error("No student selected");
    if (!session) return message.error("Please select session");
    if (!term) return message.error("Please select term");

    // only one subject score exists
    const score = studentScores[0];

    const payload = {
      studentId: student._id,
      subjectId: teacherSubject?._id,
      session,
      term: Number(term), // convert term to number

      firstAssignment: score.firstAssignment,
      secondAssignment: score.secondAssignment,
      firstCA: score.firstCATest,
      secondCA: score.secondCATest,
      exam: score.exam,
    };

    console.log(payload)

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/records/record-score`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(res);
      if (onClick) onClick(res.data);
      messageApi.success(res.data.message || "Result prepared successfully!");
     
      resetForm();
      onClose();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOAD INITIAL EMPTY SCORES
  // ===============================
  useEffect(() => {
    if (teacherSubject) {
      setStudentScores([
        {
          key: teacherSubject._id,
          subject: teacherSubject.name,
          subjectId: teacherSubject._id,
          firstAssignment: 0,
          secondAssignment: 0,
          firstCATest: 0,
          secondCATest: 0,
          exam: 0,
          total: 0,
          grade: "F",
        },
      ]);
    }
  }, [teacherSubject]);

  // ===============================
  // SCORE CHANGE
  // ===============================
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

  const resetForm = () => {
    setSession(null);
    setTerm(null);

    // Reset scores to empty/default
    if (teacherSubject) {
      setStudentScores([
        {
          key: teacherSubject._id,
          subject: teacherSubject.name,
          subjectId: teacherSubject._id,
          firstAssignment: 0,
          secondAssignment: 0,
          firstCATest: 0,
          secondCATest: 0,
          exam: 0,
          total: 0,
          grade: "F",
        },
      ]);
    }
  };

  // ===============================
  // TABLE COLUMNS
  // ===============================
  const scoreColumns = [
    { title: "Subject", dataIndex: "subject" },

    {
      title: "1st Ass (10%)",
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
      title: "2nd Ass (10%)",
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
      onCancel={() => {
        resetForm();
        onClose();
      }}
      okText="Enter Record" // <-- CHANGE BUTTON NAME
      confirmLoading={loading} // <-- ADD LOADING SPINNER
      onOk={enterScore}
      width={900}
    >
      {contextHolder}
      {/* SESSION & TERM SELECT */}
      <div className="flex gap-4 mb-4">
        {/* Session */}
        <div className="flex flex-col w-40">
          <label className="font-semibold mb-1">Session</label>
          <Select
            placeholder="Select session"
            value={session}
            onChange={(v) => setSession(v)}
          >
            <Select.Option value="2024/2025">2024/2025</Select.Option>
            <Select.Option value="2025/2026">2025/2026</Select.Option>
            <Select.Option value="2026/2027">2026/2027</Select.Option>
          </Select>
        </div>

        {/* Term */}
        <div className="flex flex-col w-40">
          <label className="font-semibold mb-1">Term</label>
          <Select
            placeholder="Select term"
            value={term}
            onChange={(v) => setTerm(v)}
          >
            <Select.Option value="1">First Term</Select.Option>
            <Select.Option value="2">Second Term</Select.Option>
            <Select.Option value="3">Third Term</Select.Option>
          </Select>
        </div>
      </div>

      {/* SCORE TABLE */}
      <Table
        columns={scoreColumns}
        dataSource={studentScores}
        pagination={false}
        rowKey="key"
        bordered
        size="small"
      />
    </Modal>
  );
};

export default EnterResult;

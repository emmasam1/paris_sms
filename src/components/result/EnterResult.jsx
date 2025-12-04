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

const EnterResult = ({ open, onClose, student, teacherSubject, onClick, selectedLevel }) => {
  const [studentScores, setStudentScores] = useState([]);
  const { API_BASE_URL, token, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();
  const [hasError, setHasError] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(teacherSubject || null);

  const [session, setSession] = useState(null);
  const [term, setTerm] = useState(null);

  // ------------------------------------------------------
  // Fetch all subjects
  // ------------------------------------------------------
  const getAllSubjects = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/subject-management/subjects?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = res.data;
      // console.log("All subjects:", result.data);
      setSubjects(result.data || []);
    } catch (error) {
      console.error(error);
      messageApi.error("Failed to fetch subjects");
    }
  };

  useEffect(() => {
    getAllSubjects();
  }, []);

  // ------------------------------------------------------
  // Determine if Senior based on selectedLevel
  // ------------------------------------------------------
  const isSenior = selectedLevel?.toUpperCase().startsWith("SS");

  // Set limits dynamically based on level
  const limits = isSenior
    ? { firstAssignment: 5, secondAssignment: 5, firstCATest: 10, secondCATest: 10, exam: 70 }
    : { firstAssignment: 10, secondAssignment: 10, firstCATest: 20, secondCATest: 20, exam: 40 };

  // ------------------------------------------------------
  // Load initial student scores based on selectedSubject
  // ------------------------------------------------------
  useEffect(() => {
    if (selectedSubject) {
      setStudentScores([
        {
          key: selectedSubject._id,
          subject: selectedSubject.name,
          subjectId: selectedSubject._id,
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
  }, [selectedSubject]);

  // ------------------------------------------------------
  // Handle score changes
  // ------------------------------------------------------
  const handleScoreChange = (key, field, value) => {
    const max = limits[field];

    setStudentScores((prev) =>
      prev.map((row) => {
        if (row.key !== key) return row;

        const updated = { ...row, [field]: value || 0 };

        if (value > max) {
          setHasError(true);
        } else {
          const stillInvalid = prev.some((r) =>
            Object.keys(limits).some((f) => r[f] > limits[f])
          );
          setHasError(stillInvalid);
        }

        updated.total =
          updated.firstAssignment +
          updated.secondAssignment +
          updated.firstCATest +
          updated.secondCATest +
          updated.exam;

        updated.grade = getGrade(updated.total);

        return updated;
      })
    );
  };

  // ------------------------------------------------------
  // Submit score
  // ------------------------------------------------------
  const enterScore = async () => {
    if (!student?._id) return message.error("No student selected");
    if (!session) return message.error("Please select session");
    if (!term) return message.error("Please select term");
    if (!selectedSubject?._id) return message.error("Please select subject");
    if (hasError) return message.error("Correct invalid score inputs");

    const score = studentScores[0];

    const payload = {
      studentId: student._id,
      subjectId: selectedSubject._id,
      session,
      term: Number(term),
      firstAssignment: score.firstAssignment,
      secondAssignment: score.secondAssignment,
      firstCA: score.firstCATest,
      secondCA: score.secondCATest,
      exam: score.exam,
    };

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/records/record-score`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onClick && onClick(res.data);
      messageApi.success("Result saved successfully!");
      resetForm();
      onClose();
    } catch (error) {
      console.error(error);
      message.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSession(null);
    setTerm(null);
    if (selectedSubject) {
      setStudentScores([
        {
          key: selectedSubject._id,
          subject: selectedSubject.name,
          subjectId: selectedSubject._id,
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
    setHasError(false);
  };

  // ------------------------------------------------------
  // Table columns
  // ------------------------------------------------------
  const scoreColumns = [
    { title: "Subject", dataIndex: "subject" },
    {
      title: `1st Ass (${limits.firstAssignment}%)`,
      render: (_, r) => (
        <InputNumber
          min={0}
          value={r.firstAssignment}
          onChange={(v) => handleScoreChange(r.key, "firstAssignment", v)}
          style={{
            background: r.firstAssignment > limits.firstAssignment ? "#ffccc7" : "white",
            borderColor: r.firstAssignment > limits.firstAssignment ? "red" : "",
          }}
        />
      ),
    },
    {
      title: `2nd Ass (${limits.secondAssignment}%)`,
      render: (_, r) => (
        <InputNumber
          min={0}
          value={r.secondAssignment}
          onChange={(v) => handleScoreChange(r.key, "secondAssignment", v)}
          style={{
            background: r.secondAssignment > limits.secondAssignment ? "#ffccc7" : "white",
            borderColor: r.secondAssignment > limits.secondAssignment ? "red" : "",
          }}
        />
      ),
    },
    {
      title: `1st CA (${limits.firstCATest}%)`,
      render: (_, r) => (
        <InputNumber
          min={0}
          value={r.firstCATest}
          onChange={(v) => handleScoreChange(r.key, "firstCATest", v)}
          style={{
            background: r.firstCATest > limits.firstCATest ? "#ffccc7" : "white",
            borderColor: r.firstCATest > limits.firstCATest ? "red" : "",
          }}
        />
      ),
    },
    {
      title: `2nd CA (${limits.secondCATest}%)`,
      render: (_, r) => (
        <InputNumber
          min={0}
          value={r.secondCATest}
          onChange={(v) => handleScoreChange(r.key, "secondCATest", v)}
          style={{
            background: r.secondCATest > limits.secondCATest ? "#ffccc7" : "white",
            borderColor: r.secondCATest > limits.secondCATest ? "red" : "",
          }}
        />
      ),
    },
    {
      title: `Exam (${limits.exam}%)`,
      render: (_, r) => (
        <InputNumber
          min={0}
          value={r.exam}
          onChange={(v) => handleScoreChange(r.key, "exam", v)}
          style={{
            background: r.exam > limits.exam ? "#ffccc7" : "white",
            borderColor: r.exam > limits.exam ? "red" : "",
          }}
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
      okButtonProps={{ disabled: hasError }}
      onCancel={() => {
        resetForm();
        onClose();
      }}
      okText="Enter Record"
      confirmLoading={loading}
      onOk={enterScore}
      width={900}
    >
      {contextHolder}

      {/* SESSION & TERM SELECT */}
      <div className="flex gap-4 mb-4">
        <div className="flex flex-col w-40">
          <label className="font-semibold mb-1">Session</label>
          <Select value={session} onChange={setSession} placeholder="Session">
            <Select.Option value="2024/2025">2024/2025</Select.Option>
            <Select.Option value="2025/2026">2025/2026</Select.Option>
            <Select.Option value="2026/2027">2026/2027</Select.Option>
          </Select>
        </div>

        <div className="flex flex-col w-40">
          <label className="font-semibold mb-1">Term</label>
          <Select value={term} onChange={setTerm} placeholder="Term">
            <Select.Option value="1">First Term</Select.Option>
            <Select.Option value="2">Second Term</Select.Option>
            <Select.Option value="3">Third Term</Select.Option>
          </Select>
        </div>
      {/* SUBJECT SELECT */}
      <div className="flex flex-col w-80 mb-4">
        <label className="font-semibold mb-1">Subject</label>
        <Select
          value={selectedSubject?._id}
          onChange={(id) => {
            const fullSub = subjects.find((s) => s._id === id);
            setSelectedSubject(fullSub);

            if (fullSub) {
              setStudentScores([
                {
                  key: fullSub._id,
                  subject: fullSub.name,
                  subjectId: fullSub._id,
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
          }}
          placeholder="Select Subject"
        >
          {subjects?.map((sub) => (
            <Select.Option key={sub._id} value={sub._id}>
              {sub.name}
            </Select.Option>
          ))}
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

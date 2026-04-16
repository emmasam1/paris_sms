import React, { useEffect, useState } from "react";
import axios from "axios";
import { useApp } from "../../../context/AppContext";
import { Table, Button, Tag, Input, Select, message } from "antd";
import CreateQuestionModal from "../../../components/modal/CreateQuestionModal";


const { Option } = Select;

const QuestionBank = () => {
  const { API_BASE_URL, token, initialized } = useApp();
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const getAllSubjects = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/subject-management/subjects?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSubjects(Array.isArray(res.data?.data) ? res.data.data : []);
      // console.log(res);
      messageApi.success(res?.data?.message || "Subjects loaded");
    } catch (error) {
      console.error("Error fetching subjects:", error);
      messageApi.error("Failed to load subjects");
    }
  };

  useEffect(() => {
    getAllSubjects();
  }, [initialized, token]);


  // 🔥 Dummy data (replace with API later)
  const [questions, setQuestions] = useState([
    {
      key: 1,
      question: "What is 2 + 2?",
      subject: "Math",
      difficulty: "easy",
      status: "approved",
    },
    {
      key: 2,
      question: "Capital of France?",
      subject: "Geography",
      difficulty: "medium",
      status: "pending",
    },
  ]);

  // ✅ Table columns
  const columns = [
    {
      title: "Question",
      dataIndex: "question",
      ellipsis: true,
    },
    {
      title: "Subject",
      dataIndex: "subject",
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      render: (d) => (
        <Tag color={d === "easy" ? "green" : d === "medium" ? "orange" : "red"}>
          {d}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "approved" ? "blue" : "gold"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="link">Edit</Button>
          <Button type="link">Approve</Button>
          <Button danger type="link">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      {contextHolder}
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Question Bank</h2>

        <Button type="primary" onClick={() => setOpen(true)}>
          + Add Question
        </Button>
      </div>

      {/* FILTERS (optional but nice UI) */}
      <div className="flex gap-3 mb-4">
        <Input placeholder="Search question..." className="w-64" />

       
          <Select placeholder="Subject" className="w-100">
            {subjects.map((subj) => (
              <Option key={subj._id} value={subj.name}>
                {subj.name}
              </Option>
            ))}
          </Select>

        <Select placeholder="Difficulty" className="w-40">
          <Option value="easy">Easy</Option>
          <Option value="medium">Medium</Option>
          <Option value="hard">Hard</Option>
        </Select>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        dataSource={questions}
        pagination={{
          pageSize: 5,
          position: ["bottomCenter"],
          className: "custom-pagination",
        }}
        size="small"
        bordered
      />

      {/* MODAL */}
      <CreateQuestionModal open={open} setOpen={setOpen} />
    </div>
  );
};

export default QuestionBank;

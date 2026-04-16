import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  Button,
  Radio,
  InputNumber,
  Input,
  message,
  Affix,
  Popconfirm,
  Collapse,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import axios from "axios";
import MathTextarea from "../../../components/mathteaxtarea/MathTextarea";
import { useApp } from "../../../context/AppContext";

const { Option } = Select;
const { Panel } = Collapse;

const AssessmentCreator = () => {
  const [form] = Form.useForm();
  const { API_BASE_URL, token } = useApp();

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [questions, setQuestions] = useState([
    { id: Date.now(), question: "", options: ["", "", "", ""], answerIndex: 0 },
  ]);

  const [activeKey, setActiveKey] = useState("0");

  // ================= AUTO SAVE =================
  useEffect(() => {
    localStorage.setItem("exam_draft", JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    const saved = localStorage.getItem("exam_draft");
    if (saved) setQuestions(JSON.parse(saved));
  }, []);

  // ================= FETCH =================
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/subject-management/subjects?limit=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubjects(res.data?.data || []);
      } catch {
        message.error("Failed to load subjects");
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const getClass = async () => {
      if (!token) return;

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/class-management/classes?limit=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClasses(res?.data?.data || []);
      } catch (error) {
        console.log(error);
      }
    };
    getClass();
  }, [token]);

  // ================= HANDLERS =================
  const updateQuestionText = (index, val) => {
    const updated = [...questions];
    updated[index].question = val;
    setQuestions(updated);
  };

  const updateOptionText = (qIndex, optIndex, val) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = val;
    setQuestions(updated);
  };

  const addQuestion = () => {
    const newIndex = questions.length;

    setQuestions([
      ...questions,
      {
        id: Date.now(),
        question: "",
        options: ["", "", "", ""],
        answerIndex: 0,
      },
    ]);

    setActiveKey(newIndex.toString()); // auto open new question
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
    setActiveKey("0");
  };

  const scrollToQuestion = (index) => {
    setActiveKey(index.toString());
  };

  // ================= VALIDATION =================
  const validate = () => {
    for (let q of questions) {
      if (!q.question.trim()) return "All questions must be filled";
      if (q.options.some((o) => !o.trim()))
        return "All options must be filled";
    }
    return null;
  };

  // ================= SUBMIT =================
  const onFinish = async (values) => {
    const error = validate();
    if (error) return message.error(error);

    setLoading(true);

    const payload = {
      title: values.title,
      subject: values.subject,
      className: values.className,
      durationMinutes: values.duration,
      questions: questions.map((q) => ({
        text: q.question,
        options: q.options,
        answerIndex: q.answerIndex,
      })),
    };

    try {
      await axios.post(`${API_BASE_URL}/api/exams`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Exam created successfully!");
      localStorage.removeItem("exam_draft");
    } catch {
      message.error("Failed to save exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      {/* ================= SIDEBAR ================= */}
      <div className="w-10 sticky top-4 h-fit">

          <div className="flex flex-col gap-2">
            {questions.map((_, i) => (
              <Button key={i} onClick={() => scrollToQuestion(i)}>
                {i + 1}
              </Button>
            ))}
          </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ duration: 60 }}
        >
          {/* HEADER */}
          <Card className="!mb-4 border-t-4 border-indigo-600">
            <h2 className="text-xl font-bold mb-4">Create Assessment</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true }]}
              >
                <Select placeholder="Choose Subject">
                  {subjects.map((s) => (
                    <Option key={s._id} value={s.name}>
                      {s.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="className"
                label="Class"
                rules={[{ required: true }]}
              >
                <Select placeholder="Choose Class">
                  {classes.map((cls) => (
                    <Option key={cls._id} value={cls.name}>
                      {cls.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="duration" label="Time (mins)">
                <InputNumber className="w-full" />
              </Form.Item>
            </div>
          </Card>

          {/* ================= QUESTIONS ACCORDION ================= */}
          <Collapse
            accordion
            activeKey={activeKey}
            onChange={(key) => setActiveKey(key)}
          >
            {questions.map((q, index) => (
              <Panel
                header={`Question ${index + 1}`}
                key={index.toString()}
                extra={
                  <Popconfirm
                    title="Delete this question?"
                    onConfirm={(e) => {
                      e.stopPropagation();
                      removeQuestion(index);
                    }}
                  >
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                }
              >
                {/* QUESTION */}
                <div className="!mb-4">
                  <p className="text-sm text-gray-500 mb-1">Question</p>
                  <MathTextarea
                    value={q.question}
                    onChange={(val) => updateQuestionText(index, val)}
                  />
                </div>

                {/* OPTIONS */}
                <div className="grid md:grid-cols-2 gap-4 !mt-3">
                  {q.options.map((opt, optIdx) => (
                    <Card key={optIdx} size="small" className="">
                      <Radio
                        checked={q.answerIndex === optIdx}
                        onChange={() => {
                          const updated = [...questions];
                          updated[index].answerIndex = optIdx;
                          setQuestions(updated);
                        }}
                      >
                        Correct
                      </Radio>

                      <MathTextarea
                        value={opt}
                        onChange={(val) =>
                          updateOptionText(index, optIdx, val)
                        }
                      />
                    </Card>
                  ))}
                </div>
              </Panel>
            ))}
          </Collapse>

          {/* ACTION BAR */}
          <Affix offsetBottom={20}>
            <div className="flex justify-center gap-4 bg-white p-4 shadow-lg ">
              <Button icon={<PlusOutlined />} onClick={addQuestion}>
                Add Question
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Save ({questions.length})
              </Button>
            </div>
          </Affix>
        </Form>
      </div>
    </div>
  );
};

export default AssessmentCreator;
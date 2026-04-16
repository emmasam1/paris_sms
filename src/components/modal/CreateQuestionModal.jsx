import React, { useEffect, useState } from "react";
import { Modal, Form, Select, Button, Radio, message } from "antd";
import axios from "axios";
import { useApp } from "../../context/AppContext";
import { MdDeleteForever } from "react-icons/md";
import MathTextarea from "../mathteaxtarea/MathTextarea";

const { Option } = Select;

const CreateQuestionModal = ({ open, setOpen }) => {
  const [form] = Form.useForm();
  const [options, setOptions] = useState(["", "", "", ""]);
  const [subjects, setSubjects] = useState([]);
  const { API_BASE_URL, token, initialized } = useApp();
  const correctIndex = Form.useWatch("correctIndex", form);

  // Fetch subjects on load
  useEffect(() => {
    if (initialized) {
      const getAllSubjects = async () => {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/subject-management/subjects?limit=1000`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setSubjects(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      };
      getAllSubjects();
    }
  }, [initialized, token, API_BASE_URL]);

  const handleOptionChange = (content, index) => {
    const newOptions = [...options];
    newOptions[index] = content;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, ""]);

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = async (values) => {
    // Basic validation: Check if question has actual text content
    const hasContent = values.question && values.question !== "<p><br></p>";
    if (!hasContent) return message.error("Please enter a question");

    const payload = {
      question: values.question, // This is the HTML string with all formatting
      subject: values.subject,
      difficulty: values.difficulty,
      options: options, // Array of HTML strings for choices
      answerIndex: values.correctIndex,
    };

    try {
      console.log("Final Payload for DB:", payload);

      const res = await axios.post(`${API_BASE_URL}/api/questions`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200 || res.status === 201) {
        message.success("Question saved successfully!");
        form.resetFields();
        setOptions(["", "", "", ""]);
        setOpen(false);
      }
    } catch (error) {
      console.error("Submit Error:", error);
      message.error("Failed to save question.");
    }
  };

  return (
    <Modal
      title="Create New Question"
      open={open}
      onCancel={() => setOpen(false)}
      width={800}
      footer={null}
      destroyOnClose // Important for resetting the editors
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{ correctIndex: 0, difficulty: "medium" }}
      >
        <div className="">
          {/* LEFT COLUMN: Question & Subject */}
          <section>
            <Form.Item
              name="question"
              label={
                <span className="font-semibold text-lg">Question Content</span>
              }
              rules={[{ required: true }]}
            >
              <MathTextarea placeholder="Type your question. Use the Sigma icon for math." />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true }]}
              >
                <Select placeholder="Choose Subject">
                  {subjects.map((subj) => (
                    <Option key={subj._id} value={subj.name}>
                      {subj.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="difficulty" label="Difficulty">
                <Select shadow-sm>
                  <Option value="easy">Easy</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="hard">Hard</Option>
                </Select>
              </Form.Item>
            </div>
          </section>

          {/* RIGHT COLUMN: Options */}
          <section className="bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">
                Answer Options
              </h3>
              <Button
                type="dashed"
                onClick={addOption}
                className="border-blue-500 text-blue-500 hover:text-blue-600"
              >
                + Add Option
              </Button>
            </div>

            <Form.Item name="correctIndex" noStyle>
              <Radio.Group className="w-full">
                {/* WE MOVE THE GRID HERE: 
          This wrapper ensures the grid logic works regardless of 
          how Ant Design renders the Radio.Group 
      */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {options.map((opt, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col hover:border-blue-300 transition-all"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Radio value={index} />
                          <span className="font-medium text-gray-700">
                            Option {String.fromCharCode(65 + index)}{" "}
                            {index === correctIndex ? "(Correct)" : ""}
                          </span>
                        </div>

                        {options.length > 2 && (
                          <MdDeleteForever
                            className="text-red-400 hover:text-red-600 cursor-pointer"
                            size={24}
                            onClick={() => removeOption(index)}
                          />
                        )}
                      </div>

                      {/* Editor Container */}
                      <div className="flex-grow border border-gray-300 rounded-md">
                        <MathTextarea
                          value={opt}
                          onChange={(val) => handleOptionChange(val, index)}
                          placeholder={`Type answer for option ${String.fromCharCode(65 + index)}...`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>
          </section>
        </div>

        <div className="flex justify-end gap-3 mt-10 pt-5">
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="primary"  htmlType="submit">
            Save to Database
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateQuestionModal;

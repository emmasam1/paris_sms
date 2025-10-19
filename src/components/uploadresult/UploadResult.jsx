import React, { useState, useMemo } from "react";
import {
  Modal,
  Form,
  Select,
  Radio,
  Upload,
  Button,
  message,
  InputNumber,
  Table,
  Tag,
  Input,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const UploadResult = ({ open, onClose }) => {
  const [mode, setMode] = useState("class");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [form] = Form.useForm();

  const classes = ["JSS1", "JSS2", "JSS3"];
  const students = {
    JSS1: ["John Doe", "Mary Jane", "Paul Obi"],
    JSS2: ["Tola Ahmed", "Chioma Eze"],
    JSS3: ["Kingsley Okoro", "Grace Ade"],
  };

  const subjects = ["Mathematics", "English", "Biology", "Chemistry"];

  const initialScores = subjects.map((subj) => ({
    key: subj,
    subject: subj,
    firstTest: 0,
    secondTest: 0,
    assignment: 0,
    practical: 0,
    exam: 0,
    total: 0,
    average: 0,
    grade: "",
  }));

  const [studentScores, setStudentScores] = useState(initialScores);
  const [remark, setRemark] = useState("");

  const getGrade = (total) => {
    if (total >= 70) return "A";
    if (total >= 60) return "B";
    if (total >= 50) return "C";
    if (total >= 45) return "D";
    if (total >= 40) return "E";
    return "F";
  };

  // ✅ Handle score input changes
  const handleScoreChange = (key, field, value) => {
    const updated = studentScores.map((s) => {
      if (s.key === key) {
        const newRow = { ...s, [field]: value || 0 };
        const total =
          (newRow.firstTest || 0) +
          (newRow.secondTest || 0) +
          (newRow.assignment || 0) +
          (newRow.practical || 0) +
          (newRow.exam || 0);
        newRow.total = total;
        newRow.average = (total / 5).toFixed(2);
        newRow.grade = getGrade(total);
        return newRow;
      }
      return s;
    });
    setStudentScores(updated);
  };

  // ✅ Compute overall average
  const overallAverage = useMemo(() => {
    if (studentScores.length === 0) return 0;
    const sum = studentScores.reduce((acc, s) => acc + s.total, 0);
    return (sum / studentScores.length).toFixed(2);
  }, [studentScores]);

  // ✅ Reset everything
  const resetAll = () => {
    form.resetFields();
    setSelectedStudent(null);
    setRemark("");
    setStudentScores(initialScores);
    setMode("class");
  };

  const handleCancel = () => {
    resetAll();
    onClose();
  };

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
          onChange={(v) => handleScoreChange(record.key, "firstTest", v)}
          style={{ width: "100%" }}
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
          onChange={(v) => handleScoreChange(record.key, "secondTest", v)}
          style={{ width: "100%" }}
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
          onChange={(v) => handleScoreChange(record.key, "assignment", v)}
          style={{ width: "100%" }}
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
          onChange={(v) => handleScoreChange(record.key, "practical", v)}
          style={{ width: "100%" }}
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
          onChange={(v) => handleScoreChange(record.key, "exam", v)}
          style={{ width: "100%" }}
        />
      ),
    },
    { title: "Total", dataIndex: "total" },
    { title: "Average", dataIndex: "average" },
    {
      title: "Grade",
      dataIndex: "grade",
      render: (grade) => (
        <Tag
          color={
            grade === "A"
              ? "green"
              : grade === "B"
              ? "blue"
              : grade === "C"
              ? "orange"
              : grade === "D"
              ? "volcano"
              : "red"
          }
        >
          {grade || "-"}
        </Tag>
      ),
    },
  ];

  return (
    <>
      {/* Upload Modal */}
      <Modal
        title="Upload Result"
        open={open}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={(values) => {
            if (mode === "class") {
              message.success(`CSV uploaded for ${values.class}`);
              handleCancel();
            } else {
              setSelectedStudent(values.student);
              onClose();
              setIsScoreModalOpen(true);
            }
          }}
        >
          <Form.Item>
            <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
              <Radio value="class">Whole Class</Radio>
              <Radio value="individual">Individual Student</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Session"
            name="session"
            rules={[{ required: true, message: "Select session" }]}
          >
            <Select placeholder="Select session">
              <Option value="2023/2024">2023/2024</Option>
              <Option value="2024/2025">2024/2025</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Class"
            name="class"
            rules={[{ required: true, message: "Select class" }]}
          >
            <Select placeholder="Select class">
              {classes.map((cls) => (
                <Option key={cls} value={cls}>
                  {cls}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {mode === "individual" && (
            <Form.Item
              label="Student"
              name="student"
              rules={[{ required: true, message: "Select student" }]}
            >
              <Select placeholder="Select student">
                {Object.values(students)
                  .flat()
                  .map((std) => (
                    <Option key={std} value={std}>
                      {std}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          )}

          {mode === "class" && (
            <Form.Item
              label="CSV File"
              name="file"
              rules={[{ required: true, message: "Upload result file" }]}
            >
              <Upload beforeUpload={() => false} accept=".csv" maxCount={1}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>
          )}

          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {mode === "class" ? "Upload" : "Next"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Individual Result Entry Modal */}
      <Modal
        title={`Enter Scores for ${selectedStudent || ""}`}
        open={isScoreModalOpen}
        onCancel={() => {
          resetAll();
          setIsScoreModalOpen(false);
        }}
        onOk={() => {
          console.log(
            "Scores:",
            studentScores,
            "Remark:",
            remark,
            "Average:",
            overallAverage
          );
          message.success("Result saved successfully!");
          resetAll();
          setIsScoreModalOpen(false);
        }}
        width={950}
      >
        <Table
          columns={scoreColumns}
          dataSource={studentScores}
          pagination={false}
          size="small"
          bordered
          rowKey="key"
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={7}>
                <strong>Overall Average</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <strong>{overallAverage}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
            </Table.Summary.Row>
          )}
        />

        <div className="mt-4">
          <label className="font-medium">Teacher’s Remark:</label>
          <Input.TextArea
            rows={3}
            placeholder="Write a comment about this student..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
};

export default UploadResult;

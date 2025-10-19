import { useState } from "react";
import { Modal, Select, Form, Radio, Button, message } from "antd";

const { Option } = Select;

const GeneratePin = ({ open, onClose }) => {
  const [pins, setPins] = useState([]);
  const [mode, setMode] = useState("individual");
  const [selectedClass, setSelectedClass] = useState(null);

  const generatePin = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SCH-${new Date().getFullYear()}-${random}`;
  };

  const classes = ["JSS1", "JSS2", "JSS3"];
  const students = {
    JSS1: ["John Doe", "Mary Jane", "Paul Obi"],
    JSS2: ["Tola Ahmed", "Chioma Eze"],
    JSS3: ["Kingsley Okoro", "Grace Ade"],
  };

  const handleGenerate = (values) => {
    if (mode === "individual") {
      const newPin = {
        key: pins.length + 1,
        code: generatePin(),
        session: values.session,
        class: values.class,
        assignedTo: values.student,
        status: "Unused",
        generatedDate: new Date().toISOString().split("T")[0],
      };
      setPins([...pins, newPin]);
      message.success(`PIN generated for ${values.student}`);
    } else {
      const newPins = students[values.class].map((student, idx) => ({
        key: pins.length + idx + 1,
        code: generatePin(),
        session: values.session,
        class: values.class,
        assignedTo: student,
        status: "Unused",
        generatedDate: new Date().toISOString().split("T")[0],
      }));
      setPins([...pins, ...newPins]);
      message.success(
        `${students[values.class].length} PIN(s) generated for ${values.class}`
      );
    }
    onClose();
  };

  return (
    <Modal
      title="Generate PIN"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form layout="vertical" onFinish={handleGenerate}>
        {/* Mode Switch */}
        <Form.Item label="">
          <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
            <Radio value="individual">Individual Student</Radio>
            <Radio value="class">Whole Class</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Session */}
        <Form.Item
          label="Session"
          name="session"
          rules={[{ required: true, message: "Select session" }]}
        >
          <Select placeholder="Select Session">
            <Option value="2023/2024">2023/2024</Option>
            <Option value="2024/2025">2024/2025</Option>
          </Select>
        </Form.Item>

        {/* Class */}
        <Form.Item
          label="Class"
          name="class"
          rules={[{ required: true, message: "Select class" }]}
        >
          <Select
            placeholder="Select Class"
            onChange={(val) => setSelectedClass(val)}
          >
            {classes.map((cls) => (
              <Option key={cls} value={cls}>
                {cls}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Student (only for individual mode) */}
        {mode === "individual" && (
          <Form.Item
            label="Student"
            name="student"
            rules={[{ required: true, message: "Select a student" }]}
          >
            <Select placeholder="Select Student" disabled={!selectedClass}>
              {(students[selectedClass] || []).map((std) => (
                <Option key={std} value={std}>
                  {std}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Generate
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default GeneratePin;

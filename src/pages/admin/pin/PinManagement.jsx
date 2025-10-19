import React, { useState } from "react";
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Select,
  Radio,
  message,
} from "antd";

const { Option } = Select;

const PinManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pins, setPins] = useState([]); // this will hold generated pins
  const [mode, setMode] = useState("individual");
  const [selectedClass, setSelectedClass] = useState(null);

  // Function to auto-generate PIN
  const generatePin = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SCH-${new Date().getFullYear()}-${random}`;
  };

  // Sample class/student data (normally from API)
  const classes = ["JSS1", "JSS2", "JSS3"];
  const students = {
    JSS1: ["John Doe", "Mary Jane", "Paul Obi"],
    JSS2: ["Tola Ahmed", "Chioma Eze"],
    JSS3: ["Kingsley Okoro", "Grace Ade"],
  };

  // Table columns
  const columns = [
    { title: "PIN Code", dataIndex: "code", key: "code" },
    { title: "Session", dataIndex: "session", key: "session" },
    { title: "Class", dataIndex: "class", key: "class" },
    { title: "Assigned To", dataIndex: "assignedTo", key: "assignedTo" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Generated Date", dataIndex: "generatedDate", key: "generatedDate" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => message.info(`Viewing ${record.code}`)}
          >
            View
          </Button>
          <Button
            size="small"
            onClick={() => {
              const updatedPins = pins.map((p) =>
                p.key === record.key
                  ? { ...p, code: generatePin(), status: "Regenerated" }
                  : p
              );
              setPins(updatedPins);
              message.success(`PIN regenerated for ${record.assignedTo}`);
            }}
          >
            Regenerate
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end items-center">
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Generate PIN
        </Button>
      </div>

      {/* PIN Table */}
        <Table
          rowKey="key"
          columns={columns}
          dataSource={pins}
           bordered
          size="small"
            pagination={{
              pageSize: 7,
              position: ["bottomCenter"],
              className: "custom-pagination",
            }}
            className="custom-table"
            scroll={{ x: "max-content" }}
        />

      {/* Modal for PIN generation */}
      <Modal
        title="Generate PIN"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={(values) => {
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
            setIsModalOpen(false);
          }}
        >
          {/* Mode Switch */}
          <Form.Item label="">
            <Radio.Group
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
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
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Generate
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PinManagement;

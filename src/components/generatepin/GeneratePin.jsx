import { useState, useEffect } from "react";
import { Modal, Select, Form, Radio, Button, message } from "antd";
import axios from "axios";
import { useApp } from "../../context/AppContext";

const { Option } = Select;

const GeneratePin = ({ open, onClose }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
   const [loader, setLoader] = useState(false);
  const [mode, setMode] = useState("individual");
  const { API_BASE_URL, token, initialized } = useApp();

  const getStudents = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/student-management/student?limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(res.data.data);
    } catch (error) {
      messageApi.error("Failed to fetch students");
    }
  };

  const getClass = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes?limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(res.data.data);
    } catch (error) {
      messageApi.error("Failed to fetch classes");
    }
  };

   useEffect(() => {
      if (!initialized || !token) return;
      getStudents();
      getClass();
    }, [initialized, token]);


   const generation = async (values) => {
    try {
      setLoader(true);

      let payload, url;

      if (mode === "whole class") {
        payload = {
          classId: values.classId,
          session: values.session,
          term: Number(values.term),
        };
        url = `${API_BASE_URL}/api/pin/generate-bulk`;
      } else {
        payload = {
          studentId: values.student,
          session: values.session,
          term: Number(values.term),
        };
        url = `${API_BASE_URL}/api/pin/generate-single`;
      }

      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      messageApi.success(res.data.message || "PIN generated successfully");
      await getAllPins();
      setIsModalOpen(false);
    } catch {
      messageApi.error("Failed to generate PIN");
    } finally {
      setLoader(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Generate PIN"
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={generation}>
                <Form.Item>
                  <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
                    <Radio value="individual">Individual Student</Radio>
                    <Radio value="whole class">Whole Class</Radio>
                  </Radio.Group>
                </Form.Item>
      
                {mode === "whole class" && (
                  <Form.Item
                    label="Class"
                    name="classId"
                    rules={[{ required: true, message: "Select a class" }]}
                  >
                    <Select placeholder="Select class">
                      {classes.map((cls) => (
                        <Option key={cls._id} value={cls._id}>
                          {cls.name} {cls.arm}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
      
                <Form.Item
                  label="Session"
                  name="session"
                  rules={[{ required: true, message: "Select session" }]}
                >
                  <Select>
                    <Option value="2024/2025">2024/2025</Option>
                    <Option value="2025/2026">2025/2026</Option>
                    <Option value="2026/2027">2026/2027</Option>
                  </Select>
                </Form.Item>
      
                <Form.Item
                  label="Term"
                  name="term"
                  rules={[{ required: true, message: "Select term" }]}
                >
                  <Select>
                    <Option value="1">1</Option>
                  </Select>
                </Form.Item>
      
                {mode === "individual" && (
                  <Form.Item
                    label="Student"
                    name="student"
                    rules={[{ required: true, message: "Select a student" }]}
                  >
                    <Select
                      showSearch
                      placeholder="Search student by name"
                      optionFilterProp="label"
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                      options={students.map((std) => ({
                        value: std._id,
                        label: `${std.fullName} - ${std.class?.name || ""} ${
                          std.class?.arm || ""
                        }`,
                      }))}
                    />
                  </Form.Item>
                )}
      
                <div className="flex justify-end gap-3">
                  <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="primary" htmlType="submit" loading={loader}>
                    Generate
                  </Button>
                </div>
              </Form>
      </Modal>
    </>
  );
};

export default GeneratePin;

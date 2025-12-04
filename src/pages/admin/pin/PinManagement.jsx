import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Select,
  Radio,
  message,
  Skeleton,
} from "antd";
import { useApp } from "../../../context/AppContext";
import axios from "axios";

const { Option } = Select;

const PinManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pins, setPins] = useState([]); // holds generated pins
  const [mode, setMode] = useState("individual");
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();
  const [loader, setLoader] = useState(false);

  // Auto-generate PIN function for table regeneration
  const generatePin = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SCH-${new Date().getFullYear()}-${random}`;
  };

  // Table columns
  const columns = [
    { title: "PIN Code", dataIndex: "code", key: "code" },
    { title: "Session", dataIndex: "session", key: "session" },
    { title: "Assigned To", dataIndex: "assignedTo", key: "assignedTo" },
    {
      title: "Generated Date",
      dataIndex: "generatedDate",
      key: "generatedDate",
    },
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

  // Fetch all PINs
  const getAllPins = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/pin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pinsData = res.data.data || [];
      const mappedPins = pinsData.map((p, idx) => ({
        key: p._id || idx,
        code: p.pinCode,
        session: p.session,
        assignedTo: p?.student?.fullName || p?.class?.name || "-",
        generatedDate: new Date(p.createdAt).toLocaleDateString(),
      }));

      setPins(mappedPins);
    } catch (error) {
      message.error("Failed to fetch PINs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students
  const getStudents = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/student-management/student?limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudents(res.data.data);
    } catch (error) {
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch students"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes
  const getClass = async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes?limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const mapped = res?.data?.data?.map((cls) => ({
        ...cls,
        key: cls._id,
      }));
      setClasses(mapped);
    } catch (error) {
      messageApi.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  // PIN generation (individual or whole class)
  const generation = async (values) => {
    try {
      setLoader(true);

      let payload;
      let url;

      if (mode === "whole class") {
        payload = {
          classId: values.classId,
          session: values.session,
          effectiveTerms: Number(values.effectiveTerms),
        };
        url = `${API_BASE_URL}/api/pin/generate-bulk`;
      } else {
        payload = {
          studentId: values.student,
          session: values.session,
          effectiveTerms: Number(values.effectiveTerms),
        };
        url = `${API_BASE_URL}/api/pin/generate-single`;
      }

      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      messageApi.success(res.data.message || "PIN generated successfully");
      await getAllPins();
    } catch (error) {
      messageApi.error(
        error?.response?.data?.message || "Failed to generate PIN"
      );
    } finally {
      setIsModalOpen(false);
      setLoader(false);
    }
  };

  useEffect(() => {
    if (!initialized || !token) return;
    getAllPins();
    getStudents();
    getClass();
  }, [initialized, token]);

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Header */}
      <div className="flex justify-end items-center">
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Generate PIN
        </Button>
      </div>

      {/* PIN Table */}
      <div>
        {loading ? (
          <Skeleton active paragraph={{ rows: 7 }} />
        ) : (
          <Table
            rowKey="key"
            columns={columns}
            dataSource={pins}
            bordered
            size="small"
            pagination={{
              pageSize: 25,
              position: ["bottomCenter"],
              className: "custom-pagination",
            }}
            scroll={{ x: "max-content" }}
          />
        )}
      </div>

      {/* Modal */}
      <Modal
        title="Generate PIN"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={generation}>
          {/* Mode Switch */}
          <Form.Item label="">
            <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
              <Radio value="individual">Individual Student</Radio>
              <Radio value="whole class">Whole Class</Radio>
            </Radio.Group>
          </Form.Item>

          {/* Class Select (Whole Class Mode) */}
          {mode === "whole class" && (
            <Form.Item
              label="Class"
              name="classId"
              rules={[{ required: true, message: "Select a class" }]}
            >
              <Select
                showSearch
                placeholder="Search class"
                optionFilterProp="label"
                onChange={(value) => setSelectedClassId(value)}
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              >
                {classes.map((cls) => {
                  const label = `${cls.name} ${cls.arm || ""}`.trim();
                  return (
                    <Option key={cls._id} value={cls._id} label={label}>
                      {label}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          )}

          {/* Session */}
          <Form.Item
            label="Session"
            name="session"
            rules={[{ required: true, message: "Select session" }]}
          >
            <Select placeholder="Select Session">
              <Option value="2024/2025">2024/2025</Option>
              <Option value="2025/2026">2025/2026</Option>
              <Option value="2026/2027">2026/2027</Option>
            </Select>
          </Form.Item>

          {/* Term */}
          <Form.Item
            label="Term"
            name="effectiveTerms"
            rules={[{ required: true, message: "Select term" }]}
          >
            <Select placeholder="Select Term">
              <Option value="1">1</Option>
            </Select>
          </Form.Item>

          {/* Student Select (Individual Mode) */}
          {mode === "individual" && (
            <Form.Item
              label="Student"
              name="student"
              rules={[{ required: true, message: "Select a student" }]}
            >
              <Select
                showSearch
                placeholder="Search student by name, class, or arm"
                optionFilterProp="label"
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
              >
                {students.map((std) => {
                  const label = `${std.fullName} - ${std.class?.name || ""} ${
                    std.class?.arm || ""
                  }`.trim();
                  return (
                    <Option key={std._id} value={std._id} label={label}>
                      {label}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loader}>
              Generate
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PinManagement;

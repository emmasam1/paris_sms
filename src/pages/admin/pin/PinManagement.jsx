import React, { useEffect, useState, useRef } from "react";
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
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const { Option } = Select;

const PinManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pins, setPins] = useState([]);
  const [mode, setMode] = useState("individual");
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loader, setLoader] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const printRef = useRef(null);

  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();

  // 📌 DOWNLOAD PDF FUNCTION (18 per page)
  const downloadPDF = async () => {
    if (!pins.length) return message.info("Nothing to print");

    setDownloadLoading(true);

    const input = printRef.current;

    input.style.display = "block";

    // Slice into pages of 18 items
    const pages = [];
    for (let i = 0; i < pins.length; i += 18) {
      pages.push(pins.slice(i, i + 18));
    }

    const pdf = new jsPDF("p", "mm", "a4");

    let firstPage = true;

    for (const pagePins of pages) {
      // render only current page pins
      input.innerHTML = `
        <h2 style="text-align:center; margin-bottom:15px;">PIN LIST</h2>
        <div style="
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:10px;
        ">
          ${pagePins
            .map(
              (p) => `
            <div style="
              border:1px solid #000;
              padding:10px;
              border-radius:4px;
              background:white;
              font-size:14px;
            ">
              <h3 style="margin:0; font-size:16px;">PIN: ${p.code}</h3>
              <p><b>Name:</b> <span style="text-transform:uppercase; font-weight:600;">${p.assignedTo}</span></p>
              <p><b>Class:</b> ${p.class} - ${p.arm}</p>
              <p><b>Session:</b> ${p.session}</p>
              <p><b>Website:</b> https://paris-sms.vercel.app</p>
            </div>
          `
            )
            .join("")}
        </div>
      `;

      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (!firstPage) pdf.addPage();
      firstPage = false;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    }

    pdf.save("pins.pdf");
    input.style.display = "none";
    setDownloadLoading(false);
  };

  const columns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
    { title: "PIN Code", dataIndex: "code", key: "code" },
    { title: "Session", dataIndex: "session", key: "session" },
    { title: "Assigned To", dataIndex: "assignedTo", key: "assignedTo" },
    { title: "Class", dataIndex: "class", key: "class" },
    { title: "Arm", dataIndex: "arm", key: "arm" },
    {
      title: "Generated Date",
      dataIndex: "generatedDate",
      key: "generatedDate",
    },
  ];

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
        class: p?.student?.class?.name,
        arm: p?.student?.class?.arm,
        generatedDate: new Date(p.createdAt).toLocaleDateString(),
      }));
      setPins(mappedPins);
    } catch (error) {
      message.error("Failed to fetch PINs");
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      messageApi.error("Failed to generate PIN");
    } finally {
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

      {/* HEADER BUTTONS */}
      <div className="flex justify-end items-center gap-2">
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Generate PIN
        </Button>

        <Button type="default" onClick={downloadPDF} loading={downloadLoading}>
          Download PDF
        </Button>
      </div>

      {/* TABLE */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 7 }} />
      ) : (
        <Table
          rowKey="key"
          columns={columns}
          dataSource={pins}
          bordered
          size="small"
          pagination={false}
        />
      )}

      {/* HIDDEN PRINT AREA */}
      <div
        ref={printRef}
        style={{
          padding: "20px",
          background: "white",
          display: "none",
          width: "1000px",
        }}
      ></div>

      {/* MODAL */}
      <Modal
        title="Generate PIN"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={generation}>
          <Form.Item label="">
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
              <Select placeholder="Select student">
                {students.map((std) => (
                  <Option key={std._id} value={std._id}>
                    {std.fullName} - {std.class?.name} {std.class?.arm}
                  </Option>
                ))}
              </Select>
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
    </div>
  );
};

export default PinManagement;

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

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);

  // PAGINATION STATE
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const printRef = useRef(null);

  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();

  // console.log(token);

  // ------------------ DOWNLOAD FULL TABLE (ALL PINS) ------------------
  const downloadPDF = async () => {
    if (!pins.length) return message.info("Nothing to print");

    setDownloadLoading(true);

    const input = printRef.current;
    input.style.display = "block";

    const pageSize = 18; // 9 rows × 2 columns per A4 page
    const pages = [];

    for (let i = 0; i < pins.length; i += pageSize) {
      pages.push(pins.slice(i, i + pageSize));
    }

    const pdf = new jsPDF("p", "mm", "a4");
    let first = true;

    for (let i = 0; i < pages.length; i++) {
      const pagePins = pages[i];

      // Insert HTML for this page
      input.innerHTML = `
      <h2 style="text-align:center; margin-bottom:15px;">PIN LIST (Page ${
        i + 1
      })</h2>

      <div style="
        display:grid;
        grid-template-columns:repeat(2, 1fr);
        gap:10px;
      ">
        ${pagePins
          .map(
            (p) => `
            <div style="
              border:1px solid #000;
              padding:12px;
              border-radius:6px;
              background:white;
              font-size:14px;
              min-height:120px;
            ">
              <h3 style="margin:0 0 5px 0; font-size:16px;">PIN: ${p.pin}</h3>
              <p><b>Name:</b> ${p.studentName}</p>
              <p><b>Class:</b> ${p.class} - ${p.arm}</p>
              <p><b>Session:</b> ${p.session} (1st Term)</p>
              <p><b>Website:</b> https://paris-sms.vercel.app</p>
            </div>
          `,
          )
          .join("")}
      </div>
    `;

      // Convert to canvas
      const canvas = await html2canvas(input, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // Fit inside A4
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      if (!first) pdf.addPage();
      first = false;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save("all-pins.pdf");

    input.style.display = "none";
    setDownloadLoading(false);
  };

  // ------------------ TABLE COLUMNS ------------------
  const columns = [
    {
      title: "S/N",
      key: "sn",
      render: (_, __, index) => (page - 1) * limit + index + 1,
    },
    { title: "PIN Code", dataIndex: "pin", key: "pin" },
    { title: "Session", dataIndex: "session", key: "session" },
    {
      title: "Assigned To",
      key: "studentName",
      render: (_, record) =>
        `${record.firstName || ""} ${record.lastName || ""}`,
    },
    { title: "Class", dataIndex: "class", key: "class" },
    { title: "Arm", dataIndex: "arm", key: "arm" },
    {
      title: "Generated Date",
      dataIndex: "generatedDate",
      key: "generatedDate",
    },
  ];

  // ------------------ FETCH ALL PINS ------------------
  const getAllPins = async (filters = {}) => {
    if (!token) return;

    try {
      setLoading(true);

      // Build query params only if values exist
      const query = new URLSearchParams({
        ...(filters.classId ? { classId: filters.classId } : {}),
        ...(filters.session ? { session: filters.session } : {}),
        ...(filters.term ? { term: filters.term } : {}),
        limit: 1000,
      }).toString();

      const url = `${API_BASE_URL}/api/pin/dashboard?${query}`;
      // console.log("Fetching URL:", url); // <- check the URL

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pinsArray = res.data?.data || [];

      const mappedPins = pinsArray.map((item, idx) => ({
        key: item._id || idx,
        pin: item.pinCode || "--",
        session: item.session || "--",
        firstName: item.student?.firstName || "--",
        lastName: item.student?.lastName || "--",
        class: item.student?.class?.name || "--",
        arm: item.student?.class?.arm || "--",
        generatedDate: new Date(item.createdAt).toLocaleDateString(),
      }));

      setPins(mappedPins);
    } catch (err) {
      console.log(err);
      messageApi.error("Failed to fetch PINs");
    } finally {
      setLoading(false);
    }
  };

  const getStudents = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/student-management/student?limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } },
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setClasses(res.data.data);
    } catch (error) {
      messageApi.error("Failed to fetch classes");
    }
  };

  // ------------------ GENERATE PINS ------------------
const generation = async (values) => {
  try {
    setLoader(true);

    let payload, url;

    if (mode === "whole class") {
      payload = {
        classId: values.classId,
        session: values.session,
        term: values.term, // keep as string if backend expects "first", "second", "third"
      };
      url = `${API_BASE_URL}/api/pin/generate-bulk`;
    } else {
      payload = {
        studentId: values.student,
        session: values.session,
        term: values.term,
      };
      url = `${API_BASE_URL}/api/pin/generate-single`;
    }

    const res = await axios.post(url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    messageApi.success(res.data.message || "PIN generated successfully");

    // ✅ Refresh pins for same session & term after generation
    await getAllPins({
      classId: values.classId || null,
      session: values.session,
      term: values.term,
    });

    setIsModalOpen(false);
  } catch (error) {
    messageApi.error(error?.response?.data?.message);
    console.log(error);
  } finally {
    setLoader(false);
  }
};

  const generateSessions = (num = 2) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 - 11

    // Assume session starts around September
    const startYear = month >= 8 ? year : year - 1;

    return Array.from({ length: num }, (_, i) => {
      const start = startYear - i;
      const end = start + 1;

      return {
        id: `${start}/${end}`,
        name: `${start}/${end}`,
      };
    });
  };

  const sessions = generateSessions(2);

  const terms = [
    { id: 1, name: "First Term" },
    { id: 2, name: "Second Term" },
    { id: 3, name: "Third Term" },
  ];

  useEffect(() => {
    if (!initialized || !token) return;
    // getAllPins();
    getStudents();
    getClass();
  }, [initialized, token]);

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* HEADER */}

      <div className="flex justify-between items-center">
        <div className="flex justify-end items-center gap-2">
          <Select
            placeholder="Select a session"
            className="w-fit"
            allowClear
            onChange={setSelectedSession} // store selected session
          >
            {sessions.map((session) => (
              <Option key={session.id} value={session.id}>
                {session.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Select a term"
            className="w-fit"
            allowClear
            onChange={setSelectedTerm} // store selected term
          >
            {terms.map((term) => (
              <Option key={term.id} value={term.id}>
                {term.name}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={() =>
              getAllPins({
                classId: selectedClass,
                session: selectedSession,
                term: selectedTerm,
              })
            }
          >
           {loading ? "Getting Record" : " Get Record"}
          </Button>
        </div>
        <div className="flex justify-end items-center gap-2">
          <Button type="primary" onClick={() => setIsModalOpen(true)}>
            Generate PIN
          </Button>

          <Button
            type="default"
            onClick={downloadPDF}
            loading={downloadLoading}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 7 }} />
      ) : (
        <Table
          rowKey="key"
          columns={columns}
          dataSource={pins} // FIXED: show full data
          bordered
          size="small"
          pagination={{
            pageSizeOptions: ["10", "20", "50", "100"],
            showSizeChanger: true,
            current: page,
            pageSize: limit,
            total: pins.length,
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
            position: ["bottomCenter"],
            className: "custom-pagination",
          }}
          scroll={{ x: "max-content" }}
        />
      )}

      {/* Hidden Print Container */}
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
            <Select placeholder="Select Session">
            {sessions.map((session) => (
              <Option key={session.id} value={session.id}>
                {session.name}
              </Option>
            ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Term"
            name="term"
            rules={[{ required: true, message: "Select term" }]}
          >
            <Select placeholder="Select Term">
              <Option value="1">First Term</Option>
              <Option value="2">Second Term</Option>
              <Option value="3">Third Term</Option>
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
    </div>
  );
};

export default PinManagement;

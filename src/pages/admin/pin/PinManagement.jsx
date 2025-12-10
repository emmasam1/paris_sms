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

  // PAGINATION STATE
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const printRef = useRef(null);

  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();

  // ------------------ PDF DOWNLOAD ------------------
//   const downloadPDF = async () => {
//   if (!pins.length) return message.info("Nothing to print");

//   setDownloadLoading(true);
//   const input = printRef.current;
//   input.style.display = "block";

//   const pages = [];
//   for (let i = 0; i < pins.length; i += 18) {
//     pages.push(pins.slice(i, i + 18));
//   }

//   const pdf = new jsPDF("p", "mm", "a4");
//   let firstPage = true;

//   for (const pagePins of pages) {
//     // Inject HTML into hidden element
//     input.innerHTML = `
//       <h2 style="text-align:center; margin-bottom:15px;">PIN LIST</h2>
//       <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px;">
//         ${pagePins
//           .map(
//             (p) => `
//               <div style="
//                 border:1px solid #000;
//                 padding:10px;
//                 border-radius:4px;
//                 background:white;
//                 font-size:14px;
//               ">
//                 <h3 style="margin:0; font-size:16px;">PIN: ${p.pin}</h3>
//                 <p><b>Name:</b> ${p.studentName}</p>
//                 <p><b>Class:</b> ${p.class} - ${p.arm}</p>
//                 <p><b>Session:</b> ${p.session}</p>
//                 <p><b>Website:</b> https://paris-sms.vercel.app</p>
//               </div>
//             `
//           )
//           .join("")}
//       </div>
//     `;

//     const canvas = await html2canvas(input, { scale: 2 });
//     const imgData = canvas.toDataURL("image/png");

//     // ⭐ FIX: Prevent stretching
//     const imgProps = pdf.getImageProperties(imgData);
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

//     if (!firstPage) pdf.addPage();
//     firstPage = false;

//     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//   }

//   pdf.save("pins.pdf");
//   input.style.display = "none";
//   setDownloadLoading(false);
// };

// ------------------ PDF DOWNLOAD (ALWAYS 17 PINS PER PAGE) ------------------
// const downloadPDF = async () => {
//   if (!pins.length) return message.info("Nothing to print");

//   setDownloadLoading(true);

//   const input = printRef.current;
//   input.style.display = "block";

//   // ALWAYS take 17 records per page
//   const fixedSize = 17;
//   const startIndex = (page - 1) * fixedSize;
//   const endIndex = startIndex + fixedSize;

//   const currentPins = pins.slice(startIndex, endIndex);

//   // Inject current page (17 pins)
//   input.innerHTML = `
//     <h2 style="text-align:center; margin-bottom:15px;">PIN LIST (Page ${page})</h2>
//     <div style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px;">
//       ${currentPins
//         .map(
//           (p) => `
//             <div style="
//               border:1px solid #000;
//               padding:10px;
//               border-radius:4px;
//               background:white;
//               font-size:14px;
//             ">
//               <h3 style="margin:0; font-size:16px;">PIN: ${p.pin}</h3>
//               <p><b>Name:</b> ${p.studentName}</p>
//               <p><b>Class:</b> ${p.class} - ${p.arm}</p>
//               <p><b>Session:</b> ${p.session}</p>
//               <p><b>Website:</b> https://paris-sms.vercel.app</p>
//             </div>
//           `
//         )
//         .join("")}
//     </div>
//   `;

//   const canvas = await html2canvas(input, { scale: 2 });
//   const imgData = canvas.toDataURL("image/png");

//   const pdf = new jsPDF("p", "mm", "a4");
//   const imgProps = pdf.getImageProperties(imgData);
//   const pdfWidth = pdf.internal.pageSize.getWidth();
//   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

//   pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//   pdf.save(`pins-page-${page}.pdf`);

//   input.style.display = "none";
//   setDownloadLoading(false);
// };

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
      <h2 style="text-align:center; margin-bottom:15px;">PIN LIST (Page ${i + 1})</h2>

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
              <p><b>Session:</b> ${p.session}</p>
              <p><b>Website:</b> https://paris-sms.vercel.app</p>
            </div>
          `
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
    { title: "Assigned To", dataIndex: "studentName", key: "studentName" },
    { title: "Class", dataIndex: "class", key: "class" },
    { title: "Arm", dataIndex: "arm", key: "arm" },
    {
      title: "Generated Date",
      dataIndex: "generatedDate",
      key: "generatedDate",
    },
  ];

  // ------------------ FETCH ALL PINS ------------------
  const getAllPins = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE_URL}/api/pin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("PIN RESPONSE:", res);

      const pinsArray = res.data?.data || [];

      const mappedPins = pinsArray.map((item, idx) => ({
        key: item._id || idx,

        // Root level
        pin: item.pinCode || "--",
        session: item.session || "--",
        generatedDate: new Date(item.createdAt).toLocaleDateString(),

        // Student info
        studentName: item.student?.fullName || "--",
        class: item.student?.class?.name || "--",
        arm: item.student?.class?.arm || "--",
        avatar: item.student?.avatar || "",
        studentId: item.student?._id,
      }));

      setPins(mappedPins);
    } catch (error) {
      console.log(error);
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

  // ------------------ GENERATE PINS ------------------
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

  useEffect(() => {
    if (!initialized || !token) return;
    getAllPins();
    getStudents();
    getClass();
  }, [initialized, token]);

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* HEADER */}
     
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

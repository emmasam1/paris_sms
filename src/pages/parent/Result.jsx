// ParentResult.jsx
import React, { useEffect, useRef, useState } from "react";
import { Card, Table, Button, Space, message } from "antd";
import {
  FilePdfOutlined,
  PrinterOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { useNavigate } from "react-router";
import logo from "../../assets/logo.jpeg";
import axios from "axios";
import { useApp } from "../../context/AppContext";
import SmartScholaLoader from "../../components/loader/SmartScholaLoader";
import { useLocation } from "react-router";
import principalSignature from "../../assets/SIGNATURE.png";
import "./result.css";

const ParentResult = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [result, setResult] = useState([]);
  const { API_BASE_URL, token, loading, setLoading, initialized } = useApp();
  const [classes, setClasses] = useState([]);
  const location = useLocation();
  const { term } = location.state || {};
  const [messageApi, contextHolder] = message.useMessage();
  const [printLoading, setPrintLoading] = useState(false);

  //Get Student Result
  const getStudentsResult = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE_URL}/api/parent/results?term=${term}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("RESULT:", res);

      setResult(res?.data || []);
      // messageApi.success(res.data.message);
    } catch (error) {
      console.log("Error get result", error);
      messageApi.error(error?.response?.data?.message || "No result yet");
    } finally {
      setLoading(false);
    }
  };

  // const getClass = async () => {
  //   if (!token) return;
  //   setLoading(true);

  //   try {
  //     const res = await axios.get(
  //       `${API_BASE_URL}/api/class-management/classes?limit=100`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     const data = res?.data?.data || [];

  //     console.log("all class", data);

  //     setClasses(mapped);
  //     setPagination((prev) => ({
  //       ...prev,
  //       total: mapped.length,
  //     }));

  //     // messageApi.success(res?.data?.message || "Classes fetched successfully");
  //   } catch (error) {
  //     console.log(error);
  //     // messageApi.error(
  //     // error?.response?.data?.message || "Failed to fetch classes"
  //     //);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    if (!initialized || !token) return;

    getStudentsResult();
    // getClass();
  }, [initialized, token]);

 

  const gradeLegendData = [
    { key: "1", grade: "A1", rate: '80-100 "EXCELLENT"' },
    { key: "2", grade: "B2", rate: '70-79 "BRILLIANT"' },
    { key: "3", grade: "B3", rate: '65-69 "MERIT"' },
    { key: "4", grade: "C4", rate: '60-64 "VERY GOOD"' },
    { key: "5", grade: "C5", rate: '50-59 "CREDIT"' },
    { key: "6", grade: "C6", rate: '45-49 "PASS"' },
    { key: "7", grade: "D7", rate: '40-44 "FAIR"' },
    { key: "8", grade: "F9", rate: '0-39 "FAIL"' },
  ];

  const ratingKeyData = [
    { key: "1", rating: "5=A+", remark: "EXCELLENT" },
    { key: "2", rating: "4=A", remark: "BRILLIANT" },
    { key: "3", rating: "3=B", remark: "V. GOOD" },
    { key: "4", rating: "2=C", remark: "GOOD" },
    { key: "5", rating: "1=D", remark: "FAIR" },
    { key: "6", rating: "0=E", remark: "POOR" },
  ];

  const isJunior = result?.student?.className?.toUpperCase().includes("JSS");

  const columns = [
    {
      title: "SUBJECTS",
      dataIndex: "subjectName",
      key: "subjectName",
      align: "left",
      width: 200,
      render: (subjectName) => (
        <span className="font-medium">{subjectName}</span>
      ),
    },
    {
      title: `1st Ass. ${isJunior ? 10 : 5}%`,
      dataIndex: "firstCA",
      key: "firstCA",
      align: "center",
      width: 70,
    },
    {
      title: `2nd Ass. ${isJunior ? 10 : 5}%`,
      dataIndex: "secondCA",
      key: "secondCA",
      align: "center",
      width: 70,
    },
    {
      title: `1st Test ${isJunior ? 20 : 10}%`,
      dataIndex: "firstAssignment",
      key: "firstAssignment",
      align: "center",
      width: 70,
    },
    {
      title: `2nd Test ${isJunior ? 20 : 10}%`,
      dataIndex: "secondAssignment",
      key: "secondAssignment",
      align: "center",
      width: 70,
    },
    {
      title: `EXAM ${isJunior ? 40 : 70}%`,
      dataIndex: "exam",
      key: "exam",
      align: "center",
      width: 70,
    },
    {
      title: "TOTAL 100%",
      dataIndex: "total",
      key: "total",
      align: "center",
      width: 70,
      render: (v) => <span className="font-semibold">{v}</span>,
    },
    {
      title: "GRADE",
      dataIndex: "grade",
      key: "grade",
      align: "center",
      width: 40,
    },
    {
      title: "REMARKS",
      dataIndex: "remark",
      key: "remark",
      align: "center",
      width: 80,
    },
  ];

  const domainColumns = [
    {
      title: "DOMAIN",
      dataIndex: "domain",
      key: "domain",
      align: "left",
      width: 180,
    },
    {
      title: "RATING",
      dataIndex: "rating",
      key: "rating",
      align: "center",
      // width: 100,
    },
  ];

  // const totalScore = scores.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
  // const totalScoreObtainable = scores.length * 100;
  // const finalAverage = scores.length
  //   ? (totalScore / scores.length).toFixed(2)
  //   : "0.00";
  // const totalGrade = scores.filter((r) => r.grade).length;

  const studentInfo = {
    termStarted: "15TH JANUARY, 2025",
    termEnded: "5TH JANUARY, 2025",
    nextTermBegins: "12TH JANUARY, 2026",
    schoolOpened: result?.student?.opened,
    present: result?.student?.present,
    absent: result?.student?.absent,
    // noOfSubjects: pdfSubjects.length,
    totalNoInClass: result?.summary?.noInClass,
    noOfArm: result?.student?.totalArmsInLevel,
    classAverage: "55.50",
    formTeacher: "Mrs. Ngozi Okoro",
  };

   const affectiveDomainData = [
    {
      key: "1",
      domain: "ATTENTIVENESS",
      rating: result?.domains?.attentiveness || "",
    },
    { key: "2", domain: "HONESTY", rating: result?.domains?.honesty || "" },
    { key: "3", domain: "NEATNESS", rating: result?.domains?.neatness || "" },
    {
      key: "4",
      domain: "PUNCTUALITY",
      rating: result?.domains?.punctuality || "",
    },
    {
      key: "5",
      domain: "RELATIONSHIP WITH OTHERS",
      rating: result?.domains?.relationshipWithOthers || "",
    },
    {
      key: "6",
      domain: "LEADERSHIP TRAITS",
      rating: result?.domains?.leadershipTraits || "",
    },
  ];

  const psychomotorDomainData = [
    {
      key: "1",
      domain: "CLUB INTEREST/GAMES AND SPORTS",
      rating: result?.domains?.clubInterestsAndSports || "",
    },
    {
      key: "2",
      domain: "HAND WRITING",
      rating: result?.domains?.handWriting || "",
    },
    { key: "3", domain: "AGILITY", rating: result?.domains?.agility || "" },
    {
      key: "4",
      domain: "ORATORY SKILLS",
      rating: result?.domains?.organisationalSkills || "",
    },
    { key: "5", domain: "SELF CARE", rating: result?.domains?.selfCare || "" },
    {
      key: "6",
      domain: "ORGANISATIONAL SKILLS",
      rating: result?.domains?.organisationalSkills || "",
    },
  ];

  const handlePDF = async () => {
    if (!printRef.current) return;
    try {
      setPrintLoading(true);

      const element = printRef.current;

      // Save original style
      const originalWidth = element.style.width;
      const originalMinWidth = element.style.minWidth;

      // Force fixed A4 width in pixels (approx 794px at 96 DPI)
      element.style.width = "794px";
      element.style.minWidth = "794px";

      const dataUrl = await toPng(printRef.current, {
        cacheBust: true,
        backgroundColor: "#FFFFFF",
        pixelRatio: 3,
        quality: 1,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();

      img.src = dataUrl;
      img.onload = () => {
        const imgAspect = img.height / img.width;
        const pdfAspect = pdfHeight / pdfWidth;

        let renderWidth, renderHeight;
        if (imgAspect > pdfAspect) {
          renderHeight = pdfHeight;
          renderWidth = pdfHeight / imgAspect;
        } else {
          renderWidth = pdfWidth;
          renderHeight = pdfWidth * imgAspect;
        }
        // pdf.addImage(dataUrl, "PNG", x, y, renderWidth, renderHeight);
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);

        pdf.save("Paris Africana.pdf");
        setPrintLoading(false);
      };
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Check console for details.");
      setPrintLoading(false);
    }
  };

  // small Tailwind/Ant classes for Ant Table adjustments (if you use Tailwind)
  const customTableStyle =
    "[&_.ant-table-cell]:text-[15px] [&_.ant-table-cell]:p-1 [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:text-[13px] [&_.ant-table]:border-black [&_.ant-table-tbody>tr>td]:border-black [&_.ant-table-thead>tr>th]:border-black [&_.ant-table-cell]:text-[13px]";

  return (
    <>
      <style>{`
        .custom-result-table * {
          font-size: 10px !important;
          padding: 2px !important;
        }

        .result-container * {
          font-size: 11px;
        }

        .ant-table-cell {
          padding: 2px !important;
          line-height: 1 !important;
        }

        .ant-table-thead > tr > th {
          padding: 2px !important;
          font-size: 11px !important;
        }

        .ant-table-tbody > tr > td {
          padding: 2px !important;
          font-size: 10px !important;
        }

        .ant-table {
          font-size: 10px !important;
        }

        .ant-table table {
          table-layout: fixed !important;
        }

        @media print {
          .result-container {
            transform: scale(0.92);
            transform-origin: top left;
          }
        }
      `}</style>

      <div ref={printRef} className="result-container">
        <div className="p-6 relative">
          {contextHolder}
          {loading ? (
            <SmartScholaLoader />
          ) : (
            <Card
              title={
                <div className="flex items-center justify-between w-full">
                  <h2 className="text-1lg font-bold uppercase">
                    Student Result Sheet
                  </h2>
                  <div className="flex gap-2">
                    <Space>
                      <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => navigate("/home")}
                      >
                        Close
                      </Button>
                      {/* <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                  Print
                </Button> */}
                      <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        onClick={handlePDF}
                        loading={printLoading}
                      >
                        Save PDF
                      </Button>
                    </Space>
                  </div>
                </div>
              }
              className="rounded-1lg shadow-md"
            >
              <div
                ref={printRef}
                className="bg-white mx-auto relative overflow-hidden"
                style={{
                  width: "794px", // exact A4 width at 96 DPI
                  padding: "8px", // reduce padding
                }}
              >
                {/* Watermark Behind Content */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0.1,
                    zIndex: 20,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  <img
                    src={logo}
                    alt="Watermark"
                    style={{
                      width: "60%",
                      maxWidth: 500,
                      filter: "grayscale(100%)",
                    }}
                  />
                </div>

                {/* Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-[100px] h-[100px]">
                    <img
                      src={logo}
                      alt="School logo"
                      className="w-full h-full object-contain header-logo"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div className="flex-1 text-center">
                    <h1 className="text-lg font-extrabold uppercase leading-tight">
                      {result?.school}
                    </h1>
                    <p className="font-bold mt-1 text-[14px] leading-tight uppercase">
                      {result?.address}
                    </p>
                    <p className="text-lg font-extrabold text-[#990099] uppercase leading-tight">
                      MOTTO: KNOWLEDGE AND DISCIPLINE
                    </p>
                    <p className="font-extrabold mt-1 text-lg leading-tight">
                      {result?.student?.className?.startsWith("JSS")
                        ? "JUNIOR SECONDARY SCHOOL"
                        : "SENIOR SECONDARY SCHOOL"}
                    </p>

                    <p className="font-bold mt-1 text-lg leading-tight">
                      END OF FIRST TERM RESULT FOR {result?.session} ACADEMIC
                      SESSION
                    </p>
                  </div>

                  {/* image */}
                  {result?.student?.avatar && (
                    <div className="w-[100px] h-[100px] overflow-hidden">
                      <img
                        src={result.student.avatar}
                        alt=""
                        className="w-full object-containe"
                      />
                    </div>
                  )}
                </div>

                {/* Student Info and Attendance */}
                <div className="grid grid-cols-12 gap-y-1 mb-3 text-xs font-semibold border border-black p-1">
                  <div className="col-span-8 grid grid-cols-2 gap-y-1">
                    <div className="">
                      NAME:{" "}
                      <span className="font-bold">
                        {result?.student?.fullName}
                      </span>
                    </div>
                    <div className="">
                      ADMISSION NO:{" "}
                      <span className="font-bold">
                        {result?.student?.admissionNumber}
                      </span>
                    </div>
                    <div className="">
                      GENDER:{" "}
                      <span className="font-bold capitalize">
                        {result?.student?.gender}
                      </span>
                    </div>
                    <div className="">
                      CLASS:{" "}
                      <span className="font-bold uppercase">
                        {result?.student?.className} {result?.student?.classArm}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-4 grid grid-cols-1 gap-y-1 text-[10px] border-l border-black pl-2">
                    <div className="font-bold text-lg">ATTENDANCE</div>
                    <div className="text-[12px]">
                      NO. OF TIMES SCHOOL OPENED:{" "}
                      <span className="font-extrabold">
                        {studentInfo.schoolOpened}
                      </span>
                    </div>
                    <div className="text-[12px]">
                      NO. OF TIMES PRESENT:{" "}
                      <span className="font-extrabold">
                        {studentInfo.present}
                      </span>
                    </div>
                    <div className="text-[12px]">
                      NO. OF TIMES ABSENT:{" "}
                      <span className="font-extrabold">
                        {studentInfo.absent}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-12 grid grid-cols-3 gap-x-2 border-t border-black pt-1 text-[12px]">
                    <div>
                      TERM STARTED:{" "}
                      <span className="font-extrabold">
                        {studentInfo.termStarted}
                      </span>
                    </div>
                    <div>
                      TERM ENDED:{" "}
                      <span className="font-extrabold">
                        {studentInfo.termEnded}
                      </span>
                    </div>
                    <div>
                      NEXT TERM BEGINS:{" "}
                      <span className="font-extrabold">
                        {studentInfo.nextTermBegins}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject Table */}
                <Table
                  columns={columns}
                  dataSource={result.subjects}
                  pagination={false}
                  bordered
                  size="small"
                  rowKey={(record) => record._id}
                  className="custom-result-table !text-[12px]"
                />

                {/* Summary and Grading/Rating */}
                <div className="grid grid-cols-12 gap-x-4 mt-2 text-xs">
                  <div className="col-span-5 grid grid-cols-2 gap-y-1">
                    <div className="col-span-2 font-bold underline">
                      SUMMARY
                    </div>
                    <div>NO. OF SUBJECTS OFFERED:</div>
                    <div className="font-bold">
                      {result?.summary?.totalSubjects}
                    </div>

                    <div>TOTAL SCORE OBTAINED:</div>
                    <div className="font-bold">
                      {result?.summary?.totalScoreObtained}
                    </div>

                    <div>TOTAL SCORE OBTAINABLE:</div>
                    <div className="font-bold">
                      {result?.summary?.totalScoreObtainable}
                    </div>

                    <div>FINAL AVERAGE:</div>
                    <div className="font-bold">
                      {result?.summary?.finalAverage}
                    </div>

                    <div>CLASS AVERAGE:</div>
                    <div className="font-bold">
                      {result?.summary?.classAverage}
                    </div>

                    <div>TOTAL GRADE:</div>
                    <div className="font-bold">
                      {result?.summary?.overallGrade}
                    </div>

                    <div>NO. OF ARM:</div>
                    <div className="font-bold">{studentInfo.noOfArm}</div>

                    <div>TOTAL NO. IN CLASS:</div>
                    <div className="font-bold">
                      {studentInfo.totalNoInClass}
                    </div>

                    <div className="col-span-2 mt-2">
                      <Table
                        columns={[
                          {
                            title: "GRADE",
                            dataIndex: "grade",
                            key: "grade",
                            align: "center",
                            width: 60,
                            render: (g) => <b>{g}</b>,
                          },
                          {
                            title: "RATE",
                            dataIndex: "rate",
                            key: "rate",
                            align: "center",
                          },
                        ]}
                        dataSource={gradeLegendData}
                        pagination={false}
                        bordered
                        size="small"
                        rowKey="key"
                      />
                    </div>
                  </div>

                  <div className="col-span-7 grid grid-cols-2 gap-x-2">
                    <div>
                      <Table
                        columns={domainColumns}
                        dataSource={affectiveDomainData}
                        pagination={false}
                        bordered
                        size="small"
                        rowKey="key"
                      />
                    </div>
                    <div>
                      <Table
                        columns={domainColumns}
                        dataSource={psychomotorDomainData}
                        pagination={false}
                        bordered
                        size="small"
                        rowKey="key"
                      />
                    </div>

                    <div className="col-span-2 mt-2">
                      <Table
                        columns={[
                          {
                            title: "RATING",
                            dataIndex: "rating",
                            key: "rating",
                            align: "center",
                            width: 80,
                            render: (t) => <b>{t}</b>,
                          },
                          {
                            title: "REMARK",
                            dataIndex: "remark",
                            key: "remark",
                            align: "center",
                          },
                        ]}
                        dataSource={ratingKeyData.map((r) => ({
                          key: r.key,
                          rating: r.rating,
                          remark: r.remark,
                        }))}
                        pagination={false}
                        bordered
                        size="small"
                        rowKey="key"
                      />
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="mt-4 text-xs font-semibold grid grid-cols-2 gap-x-8">
                  <div>
                    <p className="uppercase font-semibold">
                      FORM TEACHER'S COMMENT: {result?.teacherRemark}.
                    </p>
                    <p className="my-2">
                      FORM TEACHER'S NAME:{" "}
                      <span className="font-semibold uppercase">
                        {result?.student?.FormTeacher}
                      </span>
                    </p>
                    <p>
                      DATE:{" "}
                      <span className="font-bold">12th December, 2025</span>
                    </p>
                  </div>
                  <div>
                    <p className="uppercase font-semibold">
                      PRINCIPAL'S COMMENT: {result?.principalRemark}
                    </p>
                    <p className="my-2 flex items-center gap-2">
                      PRINCIPAL'S SIGNATURE:{" "}
                      <img
                        src={principalSignature}
                        alt=""
                        className="w-25 -mt-2"
                      />
                    </p>
                    <p>
                      DATE:{" "}
                      <span className="font-bold">12th December, 2025</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default ParentResult;

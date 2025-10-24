// ParentResult.jsx
import React, { useRef } from "react";
import { Card, Table, Button, Space } from "antd";
import {
  FilePdfOutlined,
  PrinterOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { useNavigate } from "react-router";
import logo from "../../assets/logo.jpeg"; // adjust path if needed

// Grading helper (keeps original grading boundaries you provided)
function computeGradeAndRemark(total) {
  if (total >= 80) return { grade: "A1", remark: "EXCELLENT" };
  if (total >= 70) return { grade: "B2", remark: "BRILLIANT" };
  if (total >= 65) return { grade: "B3", remark: "MERIT" };
  if (total >= 60) return { grade: "C4", remark: "VERY GOOD" };
  if (total >= 50) return { grade: "C5", remark: "CREDIT" };
  if (total >= 45) return { grade: "C6", remark: "PASS" };
  if (total >= 40) return { grade: "D7", remark: "FAIR" };
  if (total >= 30) return { grade: "E8", remark: "FAIL" };
  return { grade: "F9", remark: "FAIL" };
}

/* Example subjects and scores (you can pass real data via props) */
const pdfSubjects = [
  "MATHEMATICS",
  "ENGLISH LANGUAGE",
  "DIGITAL TECHNOLOGIES",
  "INTERMEDIATE SCIENCE",
  "SOCIAL AND CITIZENSHIP STUDIES (SCS)",
  "CREATIVE AND CULTURAL ARTS (CCA)",
  "HISTORY",
  "PHYSICAL AND HEALTH EDUCATION (PHE)",
  "HAUSA",
  "RELIGIOUS STUDIES (IRS/CRS)",
  "TRADE",
  "BUSINESS STUDIES",
  "FRENCH",
];

const exampleScores = pdfSubjects.map((s, i) => {
  const ass1 = [9, 8, 9, 7, 8, 9, 8, 9, 7, 10, 8, 9, 9][i % 13];
  const ass2 = [9, 9, 8, 8, 7, 9, 9, 8, 9, 9, 8, 9, 9][i % 13];
  const test1 = [18, 17, 19, 16, 17, 18, 17, 19, 18, 20, 17, 18, 18][i % 13];
  const test2 = [19, 18, 20, 17, 18, 19, 18, 20, 19, 20, 18, 19, 19][i % 13];
  const exam = [38, 36, 39, 35, 36, 37, 36, 38, 37, 40, 35, 38, 38][i % 13];
  const total = ass1 + ass2 + test1 + test2 + exam;
  const { grade, remark } = computeGradeAndRemark(total);
  return {
    key: `${i + 1}`,
    subject: s,
    ass1,
    ass2,
    test1,
    test2,
    exam,
    total,
    grade,
    remarks: remark,
  };
});

const affectiveDomainData = [
  { key: "1", domain: "ATTENTIVENESS", rating: "A+", score: 5 },
  { key: "2", domain: "HONESTY", rating: "A+", score: 5 },
  { key: "3", domain: "NEATNESS", rating: "A+", score: 5 },
  { key: "4", domain: "PUNCTUALITY", rating: "A+", score: 5 },
  { key: "5", domain: "RELATIONSHIP WITH OTHERS", rating: "A", score: 4 },
  { key: "6", domain: "LEADERSHIP TRAITS", rating: "A+", score: 5 },
];

const psychomotorDomainData = [
  { key: "1", domain: "CLUB INTEREST/GAMES AND SPORTS", rating: "A", score: 4 },
  { key: "2", domain: "HAND WRITING", rating: "A", score: 4 },
  { key: "3", domain: "AGILITY", rating: "A+", score: 5 },
  { key: "4", domain: "ORATORY SKILLS", rating: "A+", score: 5 },
  { key: "5", domain: "SELF CARE", rating: "A+", score: 5 },
  { key: "6", domain: "ORGANISATIONAL SKILLS", rating: "A+", score: 5 },
];

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

const ParentResult = ({ scores = exampleScores }) => {
  const navigate = useNavigate();
  const printRef = useRef(null);

  const columns = [
    {
      title: "SUBJECTS",
      dataIndex: "subject",
      key: "subject",
      align: "left",
      width: 200,
      render: (t) => <span className="font-medium">{t}</span>,
    },
    {
      title: "1st Ass. 10%",
      dataIndex: "ass1",
      key: "ass1",
      align: "center",
      width: 70,
    },
    {
      title: "2nd Ass. 10%",
      dataIndex: "ass2",
      key: "ass2",
      align: "center",
      width: 70,
    },
    {
      title: "1st Test 20%",
      dataIndex: "test1",
      key: "test1",
      align: "center",
      width: 70,
    },
    {
      title: "2nd Test 20%",
      dataIndex: "test2",
      key: "test2",
      align: "center",
      width: 70,
    },
    {
      title: "EXAM 40%",
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
      dataIndex: "remarks",
      key: "remarks",
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
      width: 200,
    },
    {
      title: "RATING",
      dataIndex: "rating",
      key: "rating",
      align: "center",
      width: 100,
    },
  ];

  const totalScore = scores.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
  const totalScoreObtainable = scores.length * 100;
  const finalAverage = scores.length
    ? (totalScore / scores.length).toFixed(2)
    : "0.00";
  const totalGrade = scores.filter((r) => r.grade).length;

  const studentInfo = {
    name: "JOHN DOE",
    admissionNo: "ST/001/JSS2",
    className: "JSS 2A",
    gender: "Male",
    termStarted: "15TH SEPT., 2025",
    termEnded: "13TH DEC., 2024",
    nextTermBegins: "13TH JAN., 2025",
    schoolOpened: "60",
    present: "58",
    absent: "2",
    noOfSubjects: pdfSubjects.length,
    totalNoInClass: "35",
    noOfArm: "A",
    classAverage: "55.50",
    formTeacher: "Mrs. Ngozi Okoro",
  };

  // Print (opens new window and prints)
  // const handlePrint = () => {
  //   if (!printRef.current) return;
  //   const content = printRef.current.innerHTML;
  //   const win = window.open("", "", "width=900,height=650");
  //   win.document.write(`
  //   <html>
  //     <head>
  //       <title>Student Result</title>
  //       <style>
  //         @page {
  //           size: A4 portrait;
  //           margin: 10mm;
  //         }
  //         @media print {
  //           html, body {
  //             width: 210mm;
  //             height: 297mm;
  //             margin: 0;
  //             padding: 0;
  //             font-family: Arial, sans-serif;
  //             -webkit-print-color-adjust: exact !important;
  //             print-color-adjust: exact !important;
  //           }
  //           body {
  //             display: flex;
  //             justify-content: center;
  //             align-items: flex-start;
  //             padding: 10mm;
  //             box-sizing: border-box;
  //           }
  //           .print-container {
  //             width: 190mm;
  //             min-height: 277mm;
  //             background: white;
  //             border: 1px solid #000;
  //             box-sizing: border-box;
  //             zoom: 1;
  //           }
  //           table {
  //             width: 100%;
  //             border-collapse: collapse;
  //             font-size: 10px;
  //           }
  //           th, td {
  //             border: 1px solid #000;
  //             padding: 3px;
  //             text-align: center;
  //           }
  //           th {
  //             font-weight: 700;
  //             background: #fff;
  //           }
  //           .no-border td, .no-border th {
  //             border: none !important;
  //             padding: 1px 4px;
  //             text-align: left;
  //           }
  //         }
  //       </style>
  //     </head>
  //     <body>
  //       <div class="print-container">${content}</div>
  //     </body>
  //   </html>
  // `);
  //   win.document.close();
  //   win.focus();
  //   setTimeout(() => win.print(), 400);
  // };

  // Save as PDF using html-to-image + jspdf (avoids html2canvas oklch error)

  const handlePDF = async () => {
    if (!printRef.current) return;
    try {
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

        const x = (pdfWidth - renderWidth) / 2;
        const y = 0; // Start at top

        pdf.addImage(dataUrl, "PNG", x, y, renderWidth, renderHeight);
        pdf.save("student_result.pdf");
      };
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  // small Tailwind/Ant classes for Ant Table adjustments (if you use Tailwind)
  const customTableStyle =
    "[&_.ant-table-cell]:text-[15px] [&_.ant-table-cell]:p-1 [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:text-[13px] [&_.ant-table]:border-black [&_.ant-table-tbody>tr>td]:border-black [&_.ant-table-thead>tr>th]:border-black [&_.ant-table-cell]:text-[13px]";

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center justify-between w-full">
            <h2 className="text-2xl font-bold uppercase">
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
                >
                  Save PDF
                </Button>
              </Space>
            </div>
          </div>
        }
        className="rounded-2xl shadow-md"
      >
        <div
          ref={printRef}
          className="bg-white p-4 mx-auto"
          // style={{ width: "210mm", minHeight: "297mm" }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-[150px] h-[150px] flex-shrink-0">
              <img
                src={logo}
                alt="School logo"
                className="w-full h-full object-contain header-logo"
                crossOrigin="anonymous"
              />
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-3xl font-extrabold uppercase leading-tight">
                PARIS AFRICANA INTERNATIONAL SCHOOL
              </h1>
              <p className="font-bold mt-1 text-[14px] leading-tight">
                NO: 5 PARIS AFRICANA ROAD OFF TANKO-ALMAKURA ROAD VIA SANI
                ABACHA ROAD, MARARABA
              </p>
              <p className="text-xl font-extrabold text-[#990099] uppercase leading-tight">
                MOTTO: KNOWLEDGE AND DISCIPLINE
              </p>
              <p className="font-extrabold mt-1 text-xl leading-tight">
                JUNIOR SECONDARY SCHOOL
              </p>
              <p className="font-bold mt-1 text-xl leading-tight">
                END OF FIRST TERM RESULT FOR 2025/2026 ACADEMIC SESSION
              </p>
            </div>
          </div>

          {/* Student Info and Attendance */}
          <div className="grid grid-cols-12 gap-y-1 mb-3 text-xs font-semibold border border-black p-1">
            <div className="col-span-8 grid grid-cols-2 gap-y-1">
              <div className="text-xl">
                NAME: <span className="font-bold">{studentInfo.name}</span>
              </div>
              <div className="text-xl">
                ADMISSION NO:{" "}
                <span className="font-bold">{studentInfo.admissionNo}</span>
              </div>
              <div className="text-xl">
                GENDER: <span className="font-bold">{studentInfo.gender}</span>
              </div>
              <div className="text-xl">
                CLASS:{" "}
                <span className="font-bold">{studentInfo.className}</span>
              </div>
            </div>

            <div className="col-span-4 grid grid-cols-1 gap-y-1 text-[10px] border-l border-black pl-2">
              <div className="font-bold text-xl">ATTENDANCE</div>
              <div className="text-[12px]">
                NO. OF TIMES SCHOOL OPENED:{" "}
                <span className="font-extrabold">
                  {studentInfo.schoolOpened}
                </span>
              </div>
              <div className="text-[12px]">
                NO. OF TIMES PRESENT:{" "}
                <span className="font-extrabold">{studentInfo.present}</span>
              </div>
              <div className="text-[12px]">
                NO. OF TIMES ABSENT:{" "}
                <span className="font-extrabold">{studentInfo.absent}</span>
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
                <span className="font-extrabold">{studentInfo.termEnded}</span>
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
            dataSource={scores}
            pagination={false}
            bordered
            size="small"
            rowKey="key"
            className={`${customTableStyle} !text-[12px]`}
          />

          {/* Summary and Grading/Rating */}
          <div className="grid grid-cols-12 gap-x-4 mt-2 text-xs">
            <div className="col-span-5 grid grid-cols-2 gap-y-1">
              <div className="col-span-2 font-bold underline">SUMMARY</div>
              <div>NO. OF SUBJECTS OFFERED:</div>
              <div className="font-bold">{studentInfo.noOfSubjects}</div>

              <div>TOTAL SCORE OBTAINED:</div>
              <div className="font-bold">{totalScore}</div>

              <div>TOTAL SCORE OBTAINABLE:</div>
              <div className="font-bold">{totalScoreObtainable}</div>

              <div>FINAL AVERAGE:</div>
              <div className="font-bold">{finalAverage}</div>

              <div>CLASS AVERAGE:</div>
              <div className="font-bold">{studentInfo.classAverage}</div>

              <div>TOTAL GRADE:</div>
              <div className="font-bold">{totalGrade}</div>

              <div>NO. OF ARM:</div>
              <div className="font-bold">{studentInfo.noOfArm}</div>

              <div>TOTAL NO. IN CLASS:</div>
              <div className="font-bold">{studentInfo.totalNoInClass}</div>

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
              <p>FORM TEACHER'S COMMENT: Keep up the good work.</p>
              <p>
                FORM TEACHER'S NAME:{" "}
                <span className="underline">{studentInfo.formTeacher}</span>
              </p>
              <p>
                DATE: <span className="underline">13TH DEC., 2024</span>
              </p>
            </div>
            <div>
              <p>PRINCIPAL'S COMMENT: ____________________________</p>
              <p>PRINCIPAL'S SIGNATURE: ____________________________</p>
              <p>DATE: ____________________________</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ParentResult;

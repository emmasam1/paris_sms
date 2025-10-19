// import React, { useRef } from "react";
// import { Card, Table, Button } from "antd";
// import {
//   FilePdfOutlined,
//   PrinterOutlined,
//   CloseOutlined,
// } from "@ant-design/icons";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import { useNavigate } from "react-router";
// import logo from "../../assets/logo.jpg";

// const subjectsData = [
//   "MATHEMATICS",
//   "ENGLISH LANGUAGE",
//   "BASIC SCIENCE",
//   "DIGITAL TECHNOLOGIES",
//   "INTERMEDIATE SCIENCE",
//   "SOCIAL AND CITIZENSHIP STUDIES (SCS)",
//   "CREATIVE AND CULTURAL ARTS (CCA)",
//   "HISTORY",
//   "PHYSICAL AND HEALTH EDUCATION (PHE)",
//   "HAUSA",
//   "RELIGIOUS STUDIES (IRS/CRS)",
//   "CIVIC EDUCATION",
//   "AGRICULTURAL SCIENCE",
//   "FRENCH",
//   "YORUBA",
//   "IGBO",
//   "COMPUTER STUDIES",
//   "HOME ECONOMICS",
//   "BUSINESS STUDIES",
//   "COMMERCE",
// ];

// function computeGrade(total) {
//   if (total >= 75) return "A";
//   if (total >= 65) return "B";
//   if (total >= 50) return "C";
//   if (total >= 40) return "D";
//   return "F";
// }
// function computeRemark(grade) {
//   switch (grade) {
//     case "A":
//       return "Excellent";
//     case "B":
//       return "Very Good";
//     case "C":
//       return "Good";
//     case "D":
//       return "Fair";
//     default:
//       return "Poor";
//   }
// }

// const exampleScores = subjectsData.map((s, i) => {
//   const ass1 = [8, 7, 9, 6, 8, 7, 7, 8, 9, 10][i % 10];
//   const ass2 = [9, 8, 8, 7, 9, 8, 8, 9, 8, 9][i % 10];
//   const test1 = [18, 16, 19, 15, 17, 16, 17, 18, 19, 18][i % 10];
//   const test2 = [19, 17, 20, 16, 18, 17, 18, 19, 20, 19][i % 10];
//   const exam = [35, 36, 38, 34, 37, 36, 35, 36, 38, 37][i % 10];
//   const total = ass1 + ass2 + test1 + test2 + exam;
//   return {
//     key: `${i + 1}`,
//     subject: s,
//     ass1,
//     ass2,
//     test1,
//     test2,
//     exam,
//     total,
//     grade: computeGrade(total),
//     remarks: computeRemark(computeGrade(total)),
//   };
// });

// const ParentResult = ({ scores = exampleScores }) => {
//   const navigate = useNavigate();
//   const printRef = useRef(null);

//   const columns = [
//     {
//       title: "Subject",
//       dataIndex: "subject",
//       key: "subject",
//       align: "left",
//       width: 185,
//       render: (text) => <span className="font-medium">{text}</span>,
//     },
//     {
//       title: "1st Ass. 10%",
//       dataIndex: "ass1",
//       key: "ass1",
//       align: "center",
//       width: 70,
//     },
//     {
//       title: "2nd Ass. 10%",
//       dataIndex: "ass2",
//       key: "ass2",
//       align: "center",
//       width: 70,
//     },
//     {
//       title: "1st Test 20%",
//       dataIndex: "test1",
//       key: "test1",
//       align: "center",
//       width: 70,
//     },
//     {
//       title: "2nd Test 20%",
//       dataIndex: "test2",
//       key: "test2",
//       align: "center",
//       width: 70,
//     },
//     {
//       title: "Exam 40%",
//       dataIndex: "exam",
//       key: "exam",
//       align: "center",
//       width: 70,
//     },
//     {
//       title: "Total 100%",
//       dataIndex: "total",
//       key: "total",
//       align: "center",
//       render: (val) => <span className="font-semibold">{val}</span>,
//       width: 70
//     },
//     { title: "Grade", dataIndex: "grade", key: "grade", align: "center", width: 40 },
//     { title: "Remarks", dataIndex: "remarks", key: "remarks", align: "center", width: 40},
//   ];

//   const totalScore = scores.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
//   const average = scores.length
//     ? (totalScore / scores.length).toFixed(2)
//     : "0.00";

//   const handlePrint = () => {
//     if (!printRef.current) return;
//     const content = printRef.current.innerHTML;
//     const win = window.open("", "", "width=900,height=650");
//     win.document.write(`
//       <html>
//         <head>
//           <title>Student Result</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 18px; color: #000; }
//             table { width: 100%; border-collapse: collapse; margin-top: 10px; }
//             th, td { border: 1px solid #000; padding: 6px; text-align: center; font-size: 12px; }
//             th { background: #f9f9f9; font-weight: bold; }
//             .header { text-align: center; margin-bottom: 10px; }
//             .header img { width: 80px; height: 80px; border-radius: 50%; }
//           </style>
//         </head>
//         <body>${content}</body>
//       </html>
//     `);
//     win.document.close();
//     win.onload = () => win.print();
//   };

//   const handlePDF = async () => {
//     if (!printRef.current) return;
//     const canvas = await html2canvas(printRef.current, { scale: 2 });
//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
//     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//     pdf.save(`student_result.pdf`);
//   };

//   const studentInfo = {
//     name: "John Doe",
//     admissionNo: "ST/001",
//     className: "JSS 2A",
//     term: "2nd Term",
//     session: "2025/2026",
//   };

//   return (
//     <div className="p-6">
//       <Card
//         title={
//           <div className="flex items-center justify-between w-full">
//             <h2 className="text-2xl font-bold uppercase">Student Result</h2>
//             <div className="flex gap-2">
//               <Button
//                 danger
//                 icon={<CloseOutlined />}
//                 onClick={() => navigate("/home")}
//               >
//                 Close
//               </Button>
//               <Button icon={<PrinterOutlined />} onClick={handlePrint}>
//                 Print
//               </Button>
//               <Button
//                 type="primary"
//                 icon={<FilePdfOutlined />}
//                 onClick={handlePDF}
//               >
//                 Save PDF
//               </Button>
//             </div>
//           </div>
//         }
//         className="rounded-2xl shadow-md"
//       >
//         <div ref={printRef} className="bg-white px-6 py-4">
//           {/* Header */}
//           <div className="flex items-center gap-4 mb-4">
//             <img
//               src={logo}
//               alt="School logo"
//               className="w-20 h-20 rounded-full object-cover"
//             />
//             <div className="flex-1 text-center">
//               <h1 className="text-3xl font-extrabold uppercase">
//                 Paris Africana International School
//               </h1>
//               <p className="font-semibold mt-1 text-sm">
//                 No. 5 Paris Africana Road, Off Tanko-Almakura Road, Via Sani
//                 Abacha Road, Mararaba.
//               </p>
//               <p className="text-base font-bold text-purple-700 uppercase">
//                 Motto: Knowledge and Discipline
//               </p>
//               <p className="font-bold mt-1 text-base">
//                 Junior Secondary School
//               </p>
//               <p className="font-bold mt-1 text-base">
//                 End of First Term Result for 2025/2026 Academic Session
//               </p>
//             </div>
//           </div>

//           {/* Student Info */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-sm font-semibold">
//             <div>Name: {studentInfo.name}</div>
//             <div>Admission No: {studentInfo.admissionNo}</div>
//             <div>Class: {studentInfo.className}</div>
//             <div>Term: {studentInfo.term}</div>
//             <div>Session: {studentInfo.session}</div>
//             <div>Average: {average}</div>
//           </div>

//           {/* Table */}
//           <Table
//             columns={columns}
//             dataSource={scores}
//             pagination={false}
//             bordered
//             size="small"
//             rowKey="key"
//             className="[&_.ant-table-cell]:text-xs [&_.ant-table-cell]:p-1 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-[13px] [&_.ant-table]:border-black"
//             scroll={{ x: 1000 }}
//           />

//           {/* Footer */}
//           <div className="mt-4 text-sm font-semibold">
//             <p>Teacher's Comment: Keep up the good work.</p>
//             <p>Principal's Remark: ____________________________</p>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default ParentResult;

import React from 'react';
import { Typography } from 'antd';
// Using Tailwind CSS classes heavily for styling

const { Title, Text } = Typography;

const ParentResult = () => {
  // --- Data Definitions (Same as before, used for iteration) ---
  const academicData = [
    { subject: 'MATHEMATICS', scores: ['', '', '', '', '', '', '', ''] }, // 8 cells for 10%x2, 20%x2, 40%, Total, Grade, Remarks
    { subject: 'ENGLISH LANGUAGE', scores: ['', '', '', '', '', '', '', ''] },
    { subject: 'DIGITAL TECHNOLOGY', scores: ['', '', '', '', '', '', '', ''] },
    { subject: 'INTERMEDIATE TECHNOLOGY', scores: ['', '', '', '', '', '', '', ''] },
    { subject: 'CREATIVE AND CULTURAL ARTS', scores: ['', '', '', '', '', '', '', ''] }, // Adjusted text to match image exactly
    { subject: 'HISTORY', scores: ['', '', '', '', '', '', '', ''] },
    { subject: 'GEOGRAPHY', scores: ['', '', '', '', '', '', '', ''] },
    { subject: 'HEALTH EDUCATION', scores: ['', '', '', '', '', '', '', ''] },
    { subject: 'HAUSA', scores: ['', '', '', '', '', '', '', ''] },
    { subject: 'RELIGIOUS STUDIES', scores: ['', '', '', '', '', '', '', ''] },
    { subject: 'VOCATIONAL', scores: ['', '', '', '', '', '', '', ''] },
    { subject: 'TRADE', scores: ['', '', '', '', '', '', '', ''] },
    { subject: 'BUSINESS STUDIES', scores: ['', '', '', '', '', '', '', ''] },
    { subject: 'FRENCH', scores: ['', '', '', '', '', '', '', ''] },
  ];

  const gradeList = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

  const affectiveData = [
    { domain: 'HONESTY', rating: 5, grade: 'A+' },
    { domain: 'ATTENTIVENESS', rating: 5, grade: 'A+' },
    { domain: 'NEATNESS', rating: 5, grade: 'A+' },
    { domain: 'PUNCTUALITY', rating: 5, grade: 'A+' },
    { domain: 'RELATIONSHIP WITH OTHERS', rating: 4, grade: 'A' },
    { domain: 'LEADERSHIP TRAITS', rating: 5, grade: 'A+' },
  ];

  const psychomotorData = [
    { domain: 'HANDLING TOOLS', rating: 4, grade: 'A' },
    { domain: 'INTEREST, GAMES AND SPORTS', rating: 4, grade: 'A' },
    { domain: 'HAND WRITING', rating: 4, grade: 'A' },
    { domain: 'AGILITY', rating: 5, grade: 'A+' },
    { domain: 'ORATORY SKILLS', rating: 5, grade: 'A+' },
    { domain: 'SELF CARE', rating: 5, grade: 'A+' },
    { domain: 'ORGANISATIONAL SKILLS', rating: 5, grade: 'A+' },
  ];
  // --- End Data Definitions ---


  // Tailwind color variables for easier adjustment
  const PURPLE_HEADER = 'bg-purple-950'; // Very dark, almost black-purple

  return (
    <div className="p-1 mx-auto max-w-5xl shadow-2xl border-2 border-black font-serif bg-white text-[10px]">
      {/* HEADER SECTION - Adjusted text sizes and layout */}
      <div className="text-center border-b-2 border-black pb-1 mb-1">
        <div className="flex justify-between items-start">
          <div className="w-[10%] h-16 border border-gray-500 flex items-center justify-center text-[8px] font-sans">
            [LOGO]
          </div>
          <div className="w-[80%]">
            <Title level={4} className="!mb-0 !text-sm !font-extrabold !text-black leading-tight">
              PARIS AFRICANA INTERNATIONAL SCHOOL
            </Title>
            <Text className="!text-[8px] block !font-normal">
              NO: 6 PARIS AFRICANA ROAD OFF TARKO-OLUWASOLA ROAD VIA SORII ADECHA ROAD, NABARADA
            </Text>
            <Text className="!text-[10px] block !font-extrabold !mt-1">
              MOTTO: KNOWLEDGE AND DISCIPLINE
            </Text>
            <Text className="!text-[10px] block !font-bold">JUNIOR SECONDARY SCHOOL</Text>
            <Text className="!text-[10px] block !font-extrabold !mt-1">
              END OF FIRST TERM RESULT FOR 2025/2026 ACADEMIC SESSION
            </Text>
          </div>
          <div className="w-[10%]">
            <div className="border border-black p-[1px] mb-1 text-left text-[8px] font-bold leading-none">
              <Text strong className="!text-[8px] leading-none">ADMISSION NO:</Text>
            </div>
            <div className="h-16 border border-gray-500 flex items-center justify-center text-[8px] font-sans">
              [PHOTO]
            </div>
          </div>
        </div>
      </div>

      {/* STUDENT DETAILS BLOCK - Adjusted font and border */}
      <div className="grid grid-cols-4 gap-x-[3px] text-[10px] mb-1">
        <div className="border border-black p-[1px] flex-1">
          <Text strong>NAME:</Text>
        </div>
        <div className="border border-black p-[1px] flex-1">
          <Text strong>GENDER:</Text>
        </div>
        <div className="border border-black p-[1px] flex-1">
          <Text strong>CLASS:</Text>
        </div>
        <div className="border border-black p-[1px] flex-1">
          <Text strong>TERM STARTED:</Text> 15TH SEPT., 2025. <Text strong>TERM ENDED:</Text> 13TH DEC., 2024. <Text strong>NEXT TERM BEGINS:</Text> 13TH JAN., 2025.
        </div>
      </div>

      {/* --- ACADEMIC ATTENDANCE & SCORES HEADER --- */}
      <div className="border-2 border-black font-bold text-center">
        {/* Row 1: ATTENDANCE / NO. OF TIMES (Combined) */}
        <div className="grid grid-cols-12 text-[10px] border-b border-black">
          <div className={`col-span-3 border-r-2 border-black py-[2px] ${PURPLE_HEADER} text-white`}>
            ATTENDANCE
          </div>
          <div className="col-span-9 grid grid-cols-9">
            <div className={`col-span-4 border-r border-black py-[2px] ${PURPLE_HEADER} text-white`}>
              NO. OF TIMES
            </div>
            <div className={`col-span-3 border-r border-black py-[2px] ${PURPLE_HEADER} text-white`}>
              NO. OF TIMES
            </div>
            <div className={`col-span-2 py-[2px] ${PURPLE_HEADER} text-white`}>
              NO. OF TIMES
            </div>
          </div>
        </div>

        {/* Row 2: Attendance Sub-Headers / Score Headers */}
        <div className="grid grid-cols-12 text-[10px] border-b-2 border-black">
          {/* Attendance Sub-Headers */}
          <div className={`col-span-3 grid grid-cols-3 border-r-2 border-black ${PURPLE_HEADER} text-white`}>
            <div className="col-span-1 border-r border-white py-[1px]">SCHOOL OPENED</div>
            <div className="col-span-1 border-r border-white py-[1px]">PRESENT</div>
            <div className="col-span-1 py-[1px]">ABSENT</div>
          </div>

          {/* Score Headers */}
          <div className="col-span-9 grid grid-cols-9">
            <div className={`col-span-2 border-r border-white py-[1px] ${PURPLE_HEADER} text-white`}>SUBJECTS</div>
            <div className={`col-span-1 border-r border-white py-[1px] ${PURPLE_HEADER} text-white`}>1st Ass. 10%</div>
            <div className={`col-span-1 border-r border-white py-[1px] ${PURPLE_HEADER} text-white`}>2nd Ass. 10%</div>
            <div className={`col-span-1 border-r border-white py-[1px] ${PURPLE_HEADER} text-white`}>1st Test 20%</div>
            <div className={`col-span-1 border-r border-white py-[1px] ${PURPLE_HEADER} text-white`}>2nd Test 20%</div>
            <div className={`col-span-1 border-r border-white py-[1px] ${PURPLE_HEADER} text-white`}>EXAM 40%</div>
            <div className={`col-span-1 border-r border-white py-[1px] ${PURPLE_HEADER} text-white`}>TOTAL 100%</div>
            <div className={`col-span-1 border-r border-white py-[1px] ${PURPLE_HEADER} text-white`}>GRADE</div>
            <div className={`col-span-1 py-[1px] ${PURPLE_HEADER} text-white`}>REMARKS</div>
          </div>
        </div>
      </div>

      {/* --- ACADEMIC SUBJECTS ROWS --- */}
      <div className="border-x-2 border-black border-b-2">
        {academicData.map((item, index) => (
          <div key={index} className="grid grid-cols-12 text-[10px] font-normal text-center border-b border-gray-400">
            {/* Attendance Data Row - Empty in image, but borders match */}
            <div className="col-span-3 grid grid-cols-3 border-r-2 border-black">
              <div className="py-[1px] border-r border-black"></div>
              <div className="py-[1px] border-r border-black"></div>
              <div className="py-[1px]"></div>
            </div>

            {/* Subject and Score Data */}
            <div className="col-span-9 grid grid-cols-9">
              <div className="col-span-2 text-left pl-1 py-[1px] border-r border-black font-bold">
                {item.subject}
              </div>
              {/* Scores (10% x 2, 20% x 2, 40%, TOTAL, GRADE, REMARKS) */}
              <div className="col-span-1 py-[1px] border-r border-black">{item.scores[0]}</div>
              <div className="col-span-1 py-[1px] border-r border-black">{item.scores[1]}</div>
              <div className="col-span-1 py-[1px] border-r border-black">{item.scores[2]}</div>
              <div className="col-span-1 py-[1px] border-r border-black">{item.scores[3]}</div>
              <div className="col-span-1 py-[1px] border-r border-black">{item.scores[4]}</div>
              <div className="col-span-1 py-[1px] border-r border-black">{item.scores[5]}</div>
              <div className="col-span-1 py-[1px] border-r border-black">{item.scores[6]}</div>
              <div className="col-span-1 py-[1px]">{item.scores[7]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* --- TOTALS / AVERAGES / GRADE LIST SECTION --- */}
      <div className="grid grid-cols-12 text-[10px] font-bold border-x-2 border-black border-b-2">
        {/* Left Column (No. of Subjects & Arm details) */}
        <div className="col-span-3 grid grid-rows-[30px_30px_20px_20px] border-r-2 border-black">
          <div className="p-[2px] border-b border-gray-400">
            NO. OF SUBJECTS OFFERED
          </div>
          <div className="p-[2px] border-b border-gray-400">
            NO. OF ARM
          </div>
          <div className="p-[2px] border-b border-gray-400">
            TOTAL NO. IN CLASS
          </div>
          <div className="p-[2px]">
            RATE
          </div>
        </div>
        {/* Score Column 1 (13 & Empty) */}
        <div className="col-span-1 grid grid-rows-[30px_30px_20px_20px] border-r-2 border-black text-center">
          <div className="p-[2px] border-b border-gray-400 flex items-center justify-center">13</div>
          <div className="p-[2px] border-b border-gray-400"></div>
          <div className="p-[2px] border-b border-gray-400"></div>
          <div className="p-[2px]"></div>
        </div>
        {/* Score Column 2 (Total Score, Final/Class Avg) */}
        <div className="col-span-4 grid grid-rows-[15px_15px_30px_20px_20px] border-r-2 border-black">
          <div className="p-[2px] border-b border-gray-400">TOTAL SCORE OBTAINED</div>
          <div className="p-[2px] border-b-2 border-black">TOTAL SCORE</div>
          <div className="p-[2px] border-b border-gray-400"></div>
          <div className="p-[2px] border-b border-gray-400 text-center">FINAL AVERAGE</div>
          <div className="p-[2px] text-center">CLASS AVERAGE</div>
        </div>
        {/* Score Column 3 (1300 & Empty) */}
        <div className="col-span-2 grid grid-rows-[15px_15px_30px_20px_20px] border-r-2 border-black text-right pr-2">
          <div className="p-[2px] border-b border-gray-400"></div>
          <div className="p-[2px] border-b-2 border-black">1300</div>
          <div className="p-[2px] border-b border-gray-400"></div>
          <div className="p-[2px] border-b border-gray-400"></div>
          <div className="p-[2px]"></div>
        </div>
        {/* Grade List Column */}
        <div className="col-span-2 grid grid-rows-[15px_15px_10px_10px_10px_10px_10px_10px_10px_10px_10px] text-[10px] font-normal">
          <div className="py-[1px] border-b border-gray-400 font-bold text-center">GRADE</div>
          {gradeList.map((grade, index) => (
            <div key={grade} className={`py-[1px] text-right pr-2 ${index < gradeList.length - 1 ? 'border-b border-gray-400' : ''}`}>
              {grade}
            </div>
          ))}
        </div>
      </div>

      {/* --- GRADE INTERPRETATION --- */}
      <div className="border-x-2 border-b-2 border-black p-1 text-center text-[9px] font-semibold bg-gray-100 leading-tight">
        <Text>
          90-100 - "<Text strong>EXCELLENT</Text>", 75-89 - "<Text strong>BRILLIANT</Text>", 65-74 - "<Text strong>MERIT</Text>", 60-64 - "<Text strong>CR</Text>", 55-59 - "<Text strong>GOOD</Text>", 50-54 - "<Text strong>CR</Text>", 45-49 - "<Text strong>PASS</Text>", 40-44 - "<Text strong>FAIR</Text>", 35- - "<Text strong>POOR</Text>"
        </Text>
      </div>

      {/* --- AFFECTIVE AND PSYCHOMOTOR DOMAINS --- */}
      <div className="grid grid-cols-2 text-[10px] border-x-2 border-b-2 border-black">
        {/* Affective Domain */}
        <div className="border-r-2 border-black">
          <div className={`font-bold grid grid-cols-5 text-center p-[2px] ${PURPLE_HEADER} text-white`}>
            <div className="col-span-3 border-r border-white">AFFECTIVE DOMAIN</div>
            <div className="col-span-1 border-r border-white">RATING</div>
            <div className="col-span-1">GRADE</div>
          </div>
          {affectiveData.map((item, index) => (
            <div key={index} className={`grid grid-cols-5 text-center border-b border-gray-300`}>
              <div className="col-span-3 text-left pl-1 py-[1px] border-r border-black">{item.domain}</div>
              <div className="col-span-1 py-[1px] border-r border-black">{item.rating}</div>
              <div className="col-span-1 py-[1px]">{item.grade}</div>
            </div>
          ))}
        </div>

        {/* Psychomotor Domain */}
        <div>
          <div className={`font-bold grid grid-cols-5 text-center p-[2px] ${PURPLE_HEADER} text-white`}>
            <div className="col-span-3 border-r border-white">PSYCHOMOTOR DOMAIN</div>
            <div className="col-span-1 border-r border-white">RATING</div>
            <div className="col-span-1">GRADE</div>
          </div>
          {psychomotorData.map((item, index) => (
            <div key={index} className={`grid grid-cols-5 text-center border-b border-gray-300`}>
              <div className="col-span-3 text-left pl-1 py-[1px] border-r border-black">{item.domain}</div>
              <div className="col-span-1 py-[1px] border-r border-black">{item.rating}</div>
              <div className="col-span-1 py-[1px]">{item.grade}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RATING KEY */}
      <div className="border-x-2 border-b-2 border-black p-1 text-center text-[9px] font-semibold bg-gray-100">
        <Text>
          5-A+ (EXCELLENT). 4-A (BRILLIANT). 3-B (V. GOOD). 2-C (GOOD). 1-D (FAIR). 0-E (POOR)
        </Text>
      </div>

      {/* FOOTER SIGNATURES */}
      <div className="grid grid-cols-2 text-[10px] border-x-2 border-b-2 border-black">
        {/* Left Half (Form Teacher & Principal Signatures) */}
        <div className="border-r-2 border-black grid grid-rows-3">
          <div className="p-1 border-b border-gray-400">
            <Text strong>FORM TEACHER'S COMMENTS:</Text>
          </div>
          <div className="p-1 border-b border-gray-400 flex justify-between items-end">
            <Text strong>FORM TEACHER'S NAME:</Text>
            <Text strong>DATE:</Text>
          </div>
          <div className="p-1 flex justify-between items-end">
            <Text strong>PRINCIPAL'S SIGNATURI:</Text>
            <Text strong>DATE:</Text>
          </div>
        </div>
        {/* Right Half (Principal Comments) */}
        <div className="grid grid-rows-3">
          <div className="p-1 border-b border-gray-400">
            <Text strong>PRINCIPAL'S COMMENTS:</Text>
          </div>
          <div className="p-1 border-b border-gray-400"></div>
          <div className="p-1"></div>
        </div>
      </div>
    </div>
  );
};

export default ParentResult;
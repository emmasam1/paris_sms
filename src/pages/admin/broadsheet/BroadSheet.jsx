import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useApp } from "../../../context/AppContext";
import {
  Button,
  Select,
  message,
  Table,
  Typography,
  Card,
  Divider,
} from "antd";
import XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";

const { Option } = Select;
const { Title } = Typography;

const BroadSheet = () => {
  const { API_BASE_URL, token, loading, setLoading } = useApp();
  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();

  const getClass = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setClasses(res.data.data);
    } catch {
      messageApi.error("Failed to fetch classes");
    }
  };

  useEffect(() => {
    if (token) getClass();
  }, [token]);

  const getBroadSheet = async () => {
    if (!selectedClass || !selectedSession || !selectedTerm) {
      messageApi.warning("Please select class, session and term");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/broadsheet?className=${selectedClass}&session=${selectedSession}&term=${selectedTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // console.log(res)
      setData(res.data);
    } catch (err) {
      messageApi.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const subjects = data?.metadata?.columns || [];
  // const students = data?.data || [];

   const students = useMemo(() => {
      const rawData = data?.data || [];
      return [...rawData].sort((a, b) => {
        const armA = a.student?.arm?.toUpperCase() || "";
        const armB = b.student?.arm?.toUpperCase() || "";
        return armA.localeCompare(armB);
      });
    }, [data]);

  const getRemark = (avg) => {
    if (avg == null) return "-";
    if (avg >= 70) return "Excellent";
    if (avg >= 60) return "Very Good";
    if (avg >= 50) return "Good";
    if (avg >= 40) return "Fair";
    return "Poor";
  };

  // Summary Calculations
 
   const summaryCounts = useMemo(
     () => ({
       above70: students.filter((s) => s.summary?.termAverage >= 70).length,
       between60_69: students.filter((s) => s.summary?.termAverage >= 60 && s.summary?.termAverage < 70).length,
       between50_59: students.filter((s) => s.summary?.termAverage >= 50 && s.summary?.termAverage < 60).length,
       between40_49: students.filter((s) => s.summary?.termAverage >= 40 && s.summary?.termAverage < 50).length,
       below40: students.filter((s) => s.summary?.termAverage < 40).length,
     }),
     [students]
   );

  const classSummaryData = useMemo(() => {
    return classes
      .filter((c) => c.level === selectedClass)
      .map((c) => ({
        key: c._id,
        arm: c.arm,
        teacher: `${c.classTeacher?.firstName || ""} ${c.classTeacher?.lastName || ""}`,
        numStudents: students.filter((s) => s.student?.arm === c.arm).length,
      }));
  }, [classes, selectedClass, students]);

  // UI Table Columns
  const columns = [
    { title: "S/N", dataIndex: "index", key: "index", width: 60, fixed: "left", align: "center" },
    { title: "Student Name", dataIndex: "name", key: "name", fixed: "left", width: 200 },
    { title: "Arm", dataIndex: "arm", key: "arm" },

    ...subjects.map((sub) => ({
      title: sub.toUpperCase(),
      align: "center",
      children: [
        { title: "Ass", dataIndex: ["scores", sub, "ass"], key: `${sub}_ass`, width: 60, align: "center", render: (v) => v ?? "-" },
        { title: "1st CA", dataIndex: ["scores", sub, "first_ca"], key: `${sub}_1st`, width: 65, align: "center", render: (v) => v ?? "-" },
        { title: "2nd CA", dataIndex: ["scores", sub, "second_ca"], key: `${sub}_2nd`, width: 65, align: "center", render: (v) => v ?? "-" },
        { title: "Exam", dataIndex: ["scores", sub, "exam"], key: `${sub}_exam`, width: 70, align: "center", render: (v) => v ?? "-" },
        { title: "Total", dataIndex: ["scores", sub, "total"], key: `${sub}_total`, width: 70, align: "center", render: (v) => <b style={{color: '#1890ff'}}>{v ?? "-"}</b> },
      ],
    })),

    { title: "1ST TERM TOTAL", dataIndex: "firstTermTotal", key: "total", width: 90, align: "center", fixed: "right", className: "font-bold" },
    { title: "2ND TERM TOTAL", dataIndex: "total", key: "total", width: 90, align: "center", fixed: "right", className: "font-bold" },
    { title: "3RD TERM TOTAL", dataIndex: "thirdTermTotal", key: "total", width: 90, align: "center", fixed: "right", className: "font-bold" },
    { title: "GRAND TOTAL", dataIndex: "grandTotal", key: "total", width: 90, align: "center", fixed: "right", className: "font-bold" },
    { title: "AVG", dataIndex: "average", key: "average", width: 80, align: "center", fixed: "right" },
    { title: "POSITION", dataIndex: "position", key: "position", width: 70, align: "center", fixed: "right" },
    { title: "REMARK", dataIndex: "remark", key: "remark", width: 110, align: "center", fixed: "right" },
  ];

  const tableData = students.map((item, index) => ({
    key: item.student?._id || index,
    index: index + 1,
    name: item.student?.name,
    arm: item.student?.arm,
    scores: item.scores,
    total: item.summary?.termTotal,
    firstTermTotal: item.summary?.firstTermTotal,
    thirdTermTotal: item.summary?.thirdTermTotal,
    grandTotal: item.summary?.grandTotal,
    average: item.summary?.termAverage?.toFixed(1),
    position: item.summary?.termPosition,
    remark: getRemark(item.summary?.termAverage),
  }));

  // EXCEL EXPORT LOGIC
  // const exportToExcel = () => {
  //   try {
  //     if (!students.length) return messageApi.error("No data available");

  //     const schoolName = data?.metadata?.school || "PARIS AFRICANA INTERNATIONAL SCHOOL";
  //     const currentSession = data?.metadata?.session || selectedSession;
  //     const termLabel = selectedTerm === 1 ? "FIRST" : selectedTerm === 2 ? "SECOND" : "THIRD";
      
  //     // Calculate total columns: S/N (1) + Name (1) + (Subjects * 5 cols each) + Stats (4)
  //     const totalColsCount = 2 + (subjects.length * 5) + 4;
      
  //     const workbook = XLSX.utils.book_new();
  //     const worksheetData = [];

  //     const styles = {
  //       header: { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" } },
  //       tableHead: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4F81BD" } }, alignment: { horizontal: "center" }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } },
  //       cell: { border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }, alignment: { horizontal: "center" } },
  //       summaryHead: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "375623" } }, alignment: { horizontal: "center" }, border: { style: "thin" } }
  //     };

  //     // Header Rows
  //     worksheetData.push([{ v: schoolName.toUpperCase(), s: { ...styles.header, font: { bold: true, sz: 18 } } }]);
  //     worksheetData.push([{ v: "ACADEMIC EVALUATION UNIT", s: styles.header }]);
  //     worksheetData.push([{ v: `${termLabel} TERM BROADSHEET REPORT`, s: styles.header }]);
  //     worksheetData.push([{ v: `SESSION: ${currentSession} | CLASS: ${selectedClass}`, s: styles.header }]);
  //     worksheetData.push([]);

  //     // Table Headers (Row 1: Subject Names)
  //     const row1 = ["S/N", "STUDENT NAME"];
  //     subjects.forEach(sub => {
  //       row1.push(sub.toUpperCase(), "", "", "", ""); // 5 slots per subject
  //     });
  //     row1.push("TOTAL", "AVERAGE", "POS", "REMARK");
  //     worksheetData.push(row1.map(h => ({ v: h, s: styles.tableHead })));

  //     // Table Headers (Row 2: Ass, 1st, 2nd, Exam, Total)
  //     const row2 = ["", ""];
  //     subjects.forEach(() => row2.push("Ass", "1st", "2nd", "Exam", "Total"));
  //     row2.push("", "", "", "");
  //     worksheetData.push(row2.map(h => ({ v: h, s: styles.tableHead })));

  //     // Student Data Rows
  //     students.forEach((item, index) => {
  //       const studentRow = [
  //         { v: index + 1, s: styles.cell },
  //         { v: item.student?.name?.toUpperCase() || "N/A", s: { ...styles.cell, alignment: { horizontal: "left" } } },
  //         { v: item.student?.arm?.toUpperCase() || "N/A", s: { ...styles.cell, alignment: { horizontal: "left" } } },
  //       ];

  //       subjects.forEach(sub => {
  //         const s = item.scores?.[sub] || {};
  //         studentRow.push({ v: s.ass ?? "-", s: styles.cell });
  //         studentRow.push({ v: s.first_ca ?? "-", s: styles.cell });
  //         studentRow.push({ v: s.second_ca ?? "-", s: styles.cell });
  //         studentRow.push({ v: s.exam ?? "-", s: styles.cell });
  //         studentRow.push({ v: s.total ?? "-", s: { ...styles.cell, font: { bold: true } } });
  //       });

  //       studentRow.push(
  //         { v: item.summary?.termTotal || 0, s: styles.cell },
  //         { v: item.summary?.termAverage?.toFixed(1) || 0, s: styles.cell },
  //         { v: item.summary?.termPosition || "-", s: styles.cell },
  //         { v: getRemark(item.summary?.termAverage).toUpperCase(), s: styles.cell }
  //       );
  //       worksheetData.push(studentRow);
  //     });

  //     // Summary Section
  //     worksheetData.push([]);
  //     worksheetData.push([]);
  //     const perfData = [
  //       ["TOTAL ABOVE 70%", summaryCounts.above70],
  //       ["TOTAL 60%-69%", summaryCounts.between60_69],
  //       ["TOTAL 50%-59%", summaryCounts.between50_59],
  //       ["TOTAL 40%-49%", summaryCounts.between40_49],
  //       ["TOTAL BELOW 40%", summaryCounts.below40],
  //       ["TOTAL ENROLLMENT", students.length],
  //     ];

  //     perfData.forEach((p, i) => {
  //       const sRow = Array(totalColsCount).fill("");
  //       sRow[1] = { v: p[0], s: { ...styles.cell, alignment: { horizontal: "left" } } };
  //       sRow[2] = { v: p[1], s: styles.cell };
        
  //       // Add Class Distribution next to it if available
  //       if (classSummaryData[i]) {
  //         sRow[4] = { v: classSummaryData[i].arm, s: styles.cell };
  //         sRow[5] = { v: classSummaryData[i].teacher, s: styles.cell };
  //         sRow[6] = { v: classSummaryData[i].numStudents, s: styles.cell };
  //       }
  //       worksheetData.push(sRow);
  //     });

  //     const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  //     // Merges
  //     const merges = [
  //       { s: { r: 0, c: 0 }, e: { r: 0, c: totalColsCount - 1 } },
  //       { s: { r: 1, c: 0 }, e: { r: 1, c: totalColsCount - 1 } },
  //       { s: { r: 2, c: 0 }, e: { r: 2, c: totalColsCount - 1 } },
  //       { s: { r: 3, c: 0 }, e: { r: 3, c: totalColsCount - 1 } },
  //       { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } }, // S/N
  //       { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } }, // Name
  //     ];

  //     // Merge Subject titles
  //     let cIdx = 2;
  //     subjects.forEach(() => {
  //       merges.push({ s: { r: 5, c: cIdx }, e: { r: 5, c: cIdx + 4 } });
  //       cIdx += 5;
  //     });

  //     worksheet["!merges"] = merges;
  //     worksheet["!cols"] = [{ wch: 5 }, { wch: 30 }, ...Array(totalColsCount).fill({ wch: 8 })];

  //     XLSX.utils.book_append_sheet(workbook, worksheet, "BroadSheet");
  //     const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  //     saveAs(new Blob([buffer]), `Broadsheet_${selectedClass}.xlsx`);
  //     messageApi.success("Export successful");
  //   } catch (e) {
  //     messageApi.error("Export failed: " + e.message);
  //   }
  // };

      const exportToExcel = () => {
        try {
          if (!students.length) return messageApi.error("No data available");
    
          const schoolName = data?.metadata?.school || "PARIS AFRICANA INTERNATIONAL SCHOOL";
          const termLabel = selectedTerm === 1 ? "FIRST" : selectedTerm === 2 ? "SECOND" : "THIRD";
          const totalColsCount = 3 + subjects.length * 5 + 4; // S/N, Name, Arm + Subs + 4 Stats
    
          const workbook = XLSX.utils.book_new();
          const worksheetData = [];
    
          const borderStyle = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
    
          const styles = {
            header: { font: { bold: true, sz: 14 } },
            tableHead: { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4F81BD" } }, alignment: { horizontal: "center", vertical: "center" }, border: borderStyle },
            cell: { border: borderStyle, alignment: { horizontal: "center", vertical: "center" } },
            summaryHeader: { font: { bold: true }, fill: { fgColor: { rgb: "E7E6E6" } }, border: borderStyle },
          };
    
          // 1. HEADER ROWS
          worksheetData.push([{ v: schoolName.toUpperCase(), s: { ...styles.header, font: { bold: true, sz: 18 } } }]);
          worksheetData.push([{ v: "ACADEMIC EVALUATION UNIT", s: styles.header }]);
          worksheetData.push([{ v: `${termLabel} TERM BROADSHEET REPORT`, s: styles.header }]);
          worksheetData.push([{ v: `SESSION: ${selectedSession} | CLASS: ${selectedClass}`, s: styles.header }]);
          worksheetData.push([]); // Spacer
    
          // 2. TABLE HEADERS
          const row1 = ["S/N", "STUDENT NAME", "ARM"];
          subjects.forEach((sub) => {
            row1.push(sub.toUpperCase(), "", "", "", "");
          });
          row1.push("TOTAL", "AVERAGE", "POS", "REMARK");
          worksheetData.push(row1.map((h) => ({ v: h, s: styles.tableHead })));
    
          const row2 = ["", "", ""];
          subjects.forEach(() => row2.push("Ass", "1st", "2nd", "Exam", "Total"));
          row2.push("", "", "", "");
          worksheetData.push(row2.map((h) => ({ v: h, s: styles.tableHead })));
    
          // 3. STUDENT DATA
          students.forEach((item, index) => {
            const studentRow = [
              { v: index + 1, s: styles.cell },
              { v: item.student?.name?.toUpperCase() || "N/A", s: { ...styles.cell, alignment: { horizontal: "left" } } },
              { v: item.student?.arm?.toUpperCase() || "N/A", s: styles.cell },
            ];
    
            subjects.forEach((sub) => {
              const s = item.scores?.[sub] || {};
              studentRow.push({ v: s.ass ?? "-", s: styles.cell });
              studentRow.push({ v: s.first_ca ?? "-", s: styles.cell });
              studentRow.push({ v: s.second_ca ?? "-", s: styles.cell });
              studentRow.push({ v: s.exam ?? "-", s: styles.cell });
              studentRow.push({ v: s.total ?? "-", s: { ...styles.cell, font: { bold: true } } });
            });
    
            studentRow.push(
              { v: item.summary?.termTotal || 0, s: styles.cell },
              { v: item.summary?.termAverage?.toFixed(1) || 0, s: styles.cell },
              { v: item.summary?.termPosition || "-", s: styles.cell },
              { v: getRemark(item.summary?.termAverage).toUpperCase(), s: styles.cell }
            );
            worksheetData.push(studentRow);
          });
    
          // 4. SUMMARY SECTION (placed 2 rows below table)
          worksheetData.push([]);
          worksheetData.push([]);
          const startSummaryRow = worksheetData.length;
          
          worksheetData.push([{ v: "SUMMARY OF RESULTS", s: { ...styles.header, alignment: { horizontal: "left" } } }]);
          
          const perfMetrics = [
            ["DESCRIPTION", "COUNT", "", "ARM", "CLASS TEACHER", "ENROLLMENT"],
            ["TOTAL ABOVE 70%", summaryCounts.above70, "", classSummaryData[0]?.arm || "-", classSummaryData[0]?.teacher || "-", classSummaryData[0]?.numStudents || 0],
            ["TOTAL 60% - 69%", summaryCounts.between60_69, "", classSummaryData[1]?.arm || "", classSummaryData[1]?.teacher || "", classSummaryData[1]?.numStudents || ""],
            ["TOTAL 50% - 59%", summaryCounts.between50_59, "", "", "", ""],
            ["TOTAL 40% - 49%", summaryCounts.between40_49, "", "", "", ""],
            ["TOTAL BELOW 40%", summaryCounts.below40, "", "", "", ""],
            ["TOTAL ENROLLMENT", students.length, "", "", "", ""],
          ];
    
          perfMetrics.forEach((m, idx) => {
            const style = idx === 0 ? styles.tableHead : styles.cell;
            worksheetData.push([
              { v: "" }, // Col A
              { v: m[0], s: { ...style, alignment: { horizontal: "left" } } },
              { v: m[1], s: style },
              { v: "" }, // Spacer Col D
              { v: m[3], s: style },
              { v: m[4], s: { ...style, alignment: { horizontal: "left" } } },
              { v: m[5], s: style },
            ]);
          });
    
          const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
          
          // Merges
          const merges = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: totalColsCount - 1 } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: totalColsCount - 1 } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: totalColsCount - 1 } },
            { s: { r: 3, c: 0 }, e: { r: 3, c: totalColsCount - 1 } },
            { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } }, // S/N
            { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } }, // Name
            { s: { r: 5, c: 2 }, e: { r: 6, c: 2 } }, // Arm
          ];
    
          // Merge Subject titles
          let cIdx = 3;
          subjects.forEach(() => {
            merges.push({ s: { r: 5, c: cIdx }, e: { r: 5, c: cIdx + 4 } });
            cIdx += 5;
          });
    
          worksheet["!merges"] = merges;
          worksheet["!pageSetup"] = { orientation: "landscape", paperSize: 9 };
          worksheet["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 8 }, ...Array(totalColsCount).fill({ wch: 7 })];
    
          XLSX.utils.book_append_sheet(workbook, worksheet, "BroadSheet");
          const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
          saveAs(new Blob([buffer]), `Broadsheet_${selectedClass}.xlsx`);
          messageApi.success("Export successful");
        } catch (e) {
          messageApi.error("Export failed: " + e.message);
        }
      };

  return (
    <div className="p-4">
      {contextHolder}
      <Card className="mb-6 shadow-sm">
        <Title level={4}>Broadsheet Management</Title>
        <div className="flex gap-4 items-center flex-wrap">
          <Select className="w-60" placeholder="Select Class" onChange={setSelectedClass}>
            {Array.from(new Set(classes.map((c) => c.level))).map((l) => (
              <Option key={l} value={l}>{l}</Option>
            ))}
          </Select>
          <Select className="w-48" placeholder="Session" onChange={setSelectedSession}>
            {["2025/2026", "2024/2025"].map((s) => <Option key={s} value={s}>{s}</Option>)}
          </Select>
          <Select className="w-48" placeholder="Term" onChange={setSelectedTerm}>
            <Option value={1}>First Term</Option>
            <Option value={2}>Second Term</Option>
            <Option value={3}>Third Term</Option>
          </Select>
          <Button type="primary" loading={loading} onClick={getBroadSheet}>Generate Sheet</Button>
          {students.length > 0 && <Button onClick={exportToExcel}>Download Excel</Button>}
        </div>
      </Card>

      {students.length > 0 && (
        <div className="bg-white p-4 rounded shadow-sm mt-5">
          <Table
            columns={columns}
            dataSource={tableData}
            size="small"
            scroll={{ x: "max-content", y: 600 }}
            bordered
            pagination={false}
          />
          <Divider orientation="left">Summaries</Divider>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              {/* Performance Summary */}
              <div>
                <Title level={5}>Term Performance Summary</Title>
                <Table
                  size="small"
                  pagination={false}
                  bordered
                  dataSource={[
                    {
                      label: "TOTAL NUMBER ABOVE 70%",
                      value: summaryCounts.above70,
                    },
                    {
                      label: "TOTAL NUMBER 60%-69%",
                      value: summaryCounts.between60_69,
                    },
                    {
                      label: "TOTAL NUMBER 50%-59%",
                      value: summaryCounts.between50_59,
                    },
                    {
                      label: "TOTAL NUMBER 40%-49%",
                      value: summaryCounts.between40_49,
                    },
                    {
                      label: "TOTAL NUMBER BELOW 40%",
                      value: summaryCounts.below40,
                    },
                    { label: "TOTAL ENROLLMENT", value: students.length },
                  ]}
                  columns={[
                    { title: "Description", dataIndex: "label", key: "label" },
                    {
                      title: "Count",
                      dataIndex: "value",
                      key: "value",
                      align: "center",
                    },
                  ]}
                />
              </div>

              {/* Class Arms Summary */}
              {classSummaryData.length > 0 && (
                <div>
                  <Title level={5}>Class Arms Distribution</Title>
                  <Table
                    dataSource={classSummaryData}
                    columns={[
                      { title: "Arm", dataIndex: "arm", key: "arm" },
                      {
                        title: "Class Teacher",
                        dataIndex: "teacher",
                        key: "teacher",
                      },
                      {
                        title: "Students",
                        dataIndex: "numStudents",
                        key: "numStudents",
                        align: "center",
                      },
                    ]}
                    size="small"
                    bordered
                    pagination={false}
                  />
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
};

export default BroadSheet;
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useApp } from "../../../context/AppContext";
import { Button, Select, message, Table, Typography, Card, Divider } from "antd";
import XLSX from "xlsx-js-style"
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
      const res = await axios.get(`${API_BASE_URL}/api/class-management/classes?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
     
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
       console.log(res)
      setData(res.data);
    } catch (err) {
      messageApi.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const subjects = data?.metadata?.columns || [];
  const students = data?.data || [];

  const getRemark = (avg) => {
    if (avg == null) return "-";
    if (avg >= 70) return "Excellent";
    if (avg >= 60) return "Very Good";
    if (avg >= 50) return "Good";
    if (avg >= 40) return "Fair";
    return "Poor";
  };

  // Memoized Summary Calculations
  const summaryCounts = useMemo(() => ({
    above70: students.filter((s) => s.summary?.termAverage >= 70).length,
    between60_69: students.filter((s) => s.summary?.termAverage >= 60 && s.summary?.termAverage < 70).length,
    between50_59: students.filter((s) => s.summary?.termAverage >= 50 && s.summary?.termAverage < 60).length,
    between40_49: students.filter((s) => s.summary?.termAverage >= 40 && s.summary?.termAverage < 50).length,
    below40: students.filter((s) => s.summary?.termAverage < 40).length,
  }), [students]);

  // Table Columns Setup
  const columns = [
    { title: "S/N", dataIndex: "index", key: "index", width: 60, fixed: "left", align: "center" },
    { title: "Student Name", dataIndex: "name", key: "name", fixed: "left", width: 220 },
    ...subjects.map((sub) => ({
      title: sub,
      dataIndex: sub,
      key: sub,
      align: "center",
      width: 100,
    })),
    { title: "Total", dataIndex: "total", key: "total", width: 90, align: "center", className: "font-bold" },
    { title: "Avg", dataIndex: "average", key: "average", width: 80, align: "center" },
    { title: "Pos", dataIndex: "position", key: "position", width: 70, align: "center" },
    { title: "Remark", dataIndex: "remark", key: "remark", width: 110, align: "center" },
  ];

  const tableData = students.map((item, index) => {
    const row = {
      key: item.student?._id || index,
      index: index + 1,
      name: item.student?.name,
      total: item.summary?.termTotal,
      average: item.summary?.termAverage?.toFixed(1),
      position: item.summary?.termPosition,
      remark: getRemark(item.summary?.termAverage),
    };
    subjects.forEach((sub) => (row[sub] = item.scores?.[sub]?.total ?? "-"));
    return row;
  });

  const classSummaryData = classes
    .filter((c) => c.level === selectedClass)
    .map((c) => ({
      key: c._id,
      arm: c.arm,
      teacher: `${c.classTeacher?.firstName || ""} ${c.classTeacher?.lastName || ""}`,
      numStudents: students.filter((s) => s.student?.arm === c.arm).length,
    }));

  // Excel Export Logic (Simplified for brevity, matches your previous logic)
const exportToExcel = () => {
  try {
    if (!students.length) {
      messageApi.error("No data available to export");
      return;
    }

    // 1. DATA & METADATA
    const schoolName = data?.metadata?.school || "PARIS AFRICANA INTERNATIONAL SCHOOL";
    const currentSession = data?.metadata?.session || selectedSession;
    const termLabel = selectedTerm === 1 ? 'FIRST' : selectedTerm === 2 ? 'SECOND' : 'THIRD';
    const workbook = XLSX.utils.book_new();
    const worksheetData = [];

    // 2. DEFINE REUSABLE STYLES
    const styles = {
      schoolHeader: {
        font: { bold: true, sz: 18, name: "Arial" },
        alignment: { horizontal: "center" }
      },
      subHeader: {
        font: { bold: true, sz: 12 },
        alignment: { horizontal: "center" }
      },
      tableHeader: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F81BD" } },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" }, bottom: { style: "thin" },
          left: { style: "thin" }, right: { style: "thin" }
        }
      },
      cellBody: {
        border: {
          top: { style: "thin" }, bottom: { style: "thin" },
          left: { style: "thin" }, right: { style: "thin" }
        },
        alignment: { horizontal: "center" }
      },
      summaryTitle: {
        font: { bold: true, sz: 12, underline: true },
        alignment: { horizontal: "left" }
      },
      summaryHeader: {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "375623" } }, // Dark Green
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin" }, bottom: { style: "thin" },
          left: { style: "thin" }, right: { style: "thin" }
        }
      }
    };

    // 3. BUILD HEADER ROWS
    const studentHeaders = ["S/N", "STUDENT NAME", ...subjects.map(s => s.toUpperCase()), "TOTAL", "AVERAGE", "POSITION", "REMARK"];
    const totalColsCount = studentHeaders.length;

    worksheetData.push([{ v: schoolName.toUpperCase(), s: styles.schoolHeader }]);
    worksheetData.push([{ v: "ACADEMIC EVALUATION UNIT", s: styles.subHeader }]);
    worksheetData.push([{ v: `${termLabel} TERM BROADSHEET REPORT`, s: styles.subHeader }]);
    worksheetData.push([{ v: `SESSION: ${currentSession} | CLASS: ${selectedClass}`, s: styles.subHeader }]);
    worksheetData.push([]); // Spacer

    // 4. MAIN STUDENT TABLE
    worksheetData.push(studentHeaders.map(h => ({ v: h, s: styles.tableHeader })));

    students.forEach((item, index) => {
      worksheetData.push([
        { v: index + 1, s: styles.cellBody },
        { v: item.student?.name?.toUpperCase() || "N/A", s: { ...styles.cellBody, alignment: { horizontal: "left" } } },
        ...subjects.map((sub) => ({ v: item.scores?.[sub]?.total ?? "-", s: styles.cellBody })),
        { v: item.summary?.termTotal || 0, s: styles.cellBody },
        { v: item.summary?.termAverage ? Number(item.summary.termAverage).toFixed(1) : 0, s: styles.cellBody },
        { v: item.summary?.termPosition || "-", s: styles.cellBody },
        { v: getRemark(item.summary?.termAverage).toUpperCase(), s: styles.cellBody },
      ]);
    });

    // 5. SPACERS BEFORE SUMMARY
    worksheetData.push([]);
    worksheetData.push([]);

    // 6. STYLED SUMMARY SECTION
    const summaryStartRow = worksheetData.length;

    // Summary Titles
    // We start Performance Summary at Col 1 (B) and Class Distribution at Col 5 (F)
    const titleRow = Array(6).fill("");
    titleRow[1] = { v: "PERFORMANCE SUMMARY", s: styles.summaryTitle };
    titleRow[4] = { v: "CLASS ARMS DISTRIBUTION", s: styles.summaryTitle };
    worksheetData.push(titleRow);

    // Summary Headers
    const headerRow = Array(7).fill("");
    headerRow[1] = { v: "DESCRIPTION", s: styles.summaryHeader };
    headerRow[2] = { v: "COUNT", s: styles.summaryHeader };
    headerRow[4] = { v: "ARM", s: styles.summaryHeader };
    headerRow[5] = { v: "TEACHER", s: styles.summaryHeader };
    headerRow[6] = { v: "STUDENTS", s: styles.summaryHeader };
    worksheetData.push(headerRow);

    const performanceRows = [
      ["TOTAL NUMBER ABOVE 70%", summaryCounts.above70],
      ["TOTAL NUMBER 60%-69%", summaryCounts.between60_69],
      ["TOTAL NUMBER 50%-59%", summaryCounts.between50_59],
      ["TOTAL NUMBER 40%-49%", summaryCounts.between40_49],
      ["TOTAL NUMBER BELOW 40%", summaryCounts.below40],
      ["TOTAL ENROLLMENT", students.length],
    ];

    const maxSummaryRows = Math.max(performanceRows.length, classSummaryData.length);

    for (let i = 0; i < maxSummaryRows; i++) {
      const pRow = performanceRows[i] || ["", ""];
      const cRow = classSummaryData[i] ? [classSummaryData[i].arm, classSummaryData[i].teacher, classSummaryData[i].numStudents] : ["", "", ""];
      
      const dataRow = Array(7).fill("");
      // Left Table (Performance)
      dataRow[1] = { v: pRow[0], s: { ...styles.cellBody, alignment: { horizontal: "left", wrapText: true } } };
      dataRow[2] = { v: pRow[1], s: styles.cellBody };
      // Right Table (Arms)
      dataRow[4] = { v: cRow[0], s: styles.cellBody };
      dataRow[5] = { v: cRow[1], s: styles.cellBody };
      dataRow[6] = { v: cRow[2], s: styles.cellBody };
      
      worksheetData.push(dataRow);
    }

    // 7. CREATE WORKSHEET & APPLY MERGES
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalColsCount - 1 } }, // School name
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalColsCount - 1 } }, // Unit
      { s: { r: 2, c: 0 }, e: { r: 2, c: totalColsCount - 1 } }, // Term
      { s: { r: 3, c: 0 }, e: { r: 3, c: totalColsCount - 1 } }, // Session
      
      // Merge Performance Title
      { s: { r: summaryStartRow, c: 1 }, e: { r: summaryStartRow, c: 2 } },
      // Merge Arms Title
      { s: { r: summaryStartRow, c: 4 }, e: { r: summaryStartRow, c: 6 } },
    ];

    worksheet['!merges'] = merges;

    // 8. COLUMN WIDTHS
    const wscols = [
      { wch: 6 },   // S/N (Col A)
      { wch: 35 },  // Student Name / Description (Col B)
      { wch: 12 },  // Count (Col C)
      { wch: 5 },   // Gap (Col D)
      { wch: 12 },  // Arm (Col E)
      { wch: 25 },  // Teacher (Col F)
      { wch: 12 },  // Students Count (Col G)
      ...subjects.slice(5).map(() => ({ wch: 10 })), // Remaining subject cols
    ];
    worksheet['!cols'] = wscols;

    // 9. FINAL EXPORT
    XLSX.utils.book_append_sheet(workbook, worksheet, "BroadSheet");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
    const fileName = `${schoolName.split(' ')[0]}_${selectedClass}_Broadsheet.xlsx`;
    saveAs(dataBlob, fileName);
    messageApi.success("Excel Broadsheet Generated Successfully!");

  } catch (error) {
    console.error("Export Error:", error);
    messageApi.error("Export failed: " + error.message);
  }
};

  return (
    <div className="p-4">
      {contextHolder}
      
      <Card className="mb-6 shadow-sm">
        <Title level={4}>Broadsheet Management</Title>
        <div className="flex gap-4 items-center flex-wrap">
          <Select className="w-60" placeholder="Select Class" onChange={setSelectedClass}>
            {Array.from(new Set(classes.map(c => c.level))).map(level => (
              <Option key={level} value={level}>{level}</Option>
            ))}
          </Select>

          <Select className="w-48" placeholder="Session" onChange={setSelectedSession}>
            {["2025/2026", "2024/2025"].map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>

          <Select className="w-48" placeholder="Term" onChange={setSelectedTerm}>
            <Option value={1}>First Term</Option>
            <Option value={2}>Second Term</Option>
            <Option value={3}>Third Term</Option>
          </Select>

          <Button type="primary" loading={loading} onClick={getBroadSheet}>
            Generate Sheet
          </Button>

          {students.length > 0 && <Button onClick={exportToExcel}>Download Excel</Button>}
        </div>
      </Card>

      {students.length > 0 && (
        <>
          <div className="bg-white p-4 rounded shadow-sm overflow-hidden">
            <Title level={5} className="text-center mb-4">
               {selectedClass} Broadsheet - {selectedSession} ({selectedTerm === 1 ? '1st' : selectedTerm === 2 ? '2nd' : '3rd'} Term)
            </Title>
            <Table
              columns={columns}
              dataSource={tableData}
              size="small"
              scroll={{ x: "max-content", y: 500 }}
              bordered
              pagination={false}
              className="mb-8"
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
                    { label: "TOTAL NUMBER ABOVE 70%", value: summaryCounts.above70 },
                    { label: "TOTAL NUMBER 60%-69%", value: summaryCounts.between60_69 },
                    { label: "TOTAL NUMBER 50%-59%", value: summaryCounts.between50_59 },
                    { label: "TOTAL NUMBER 40%-49%", value: summaryCounts.between40_49 },
                    { label: "TOTAL NUMBER BELOW 40%", value: summaryCounts.below40 },
                    { label: "TOTAL ENROLLMENT", value: students.length },
                  ]}
                  columns={[
                    { title: "Description", dataIndex: "label", key: "label" },
                    { title: "Count", dataIndex: "value", key: "value", align: "center" },
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
                        { title: "Class Teacher", dataIndex: "teacher", key: "teacher" },
                        { title: "Students", dataIndex: "numStudents", key: "numStudents", align: "center" },
                    ]}
                    size="small"
                    bordered
                    pagination={false}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BroadSheet;
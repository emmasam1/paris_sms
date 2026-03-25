import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useApp } from "../../../context/AppContext";
import { Button, Select, message, Table, Typography, Card, Divider } from "antd";
import * as XLSX from "xlsx";
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

    // Get metadata from state or fallbacks
    const schoolName = data?.metadata?.school;
    const currentSession = data?.metadata?.session || selectedSession;
    const termLabel = selectedTerm === 1 ? 'FIRST' : selectedTerm === 2 ? 'SECOND' : 'THIRD';

    const workbook = XLSX.utils.book_new();
    const worksheetData = [];

    // 1. DYNAMIC SCHOOL HEADER (Matches the API response)
    worksheetData.push([schoolName]); 
    worksheetData.push([`${termLabel} TERM BROADSHEET REPORT`]); 
    worksheetData.push([`SESSION: ${currentSession}`]); 
    worksheetData.push([`CLASS: ${selectedClass}`]); 
    worksheetData.push([]); // Spacer

    // 2. MAIN TABLE HEADERS
    const studentHeaders = [
      "S/N",
      "STUDENT NAME",
      ...subjects.map(s => s.toUpperCase()),
      "TOTAL",
      "AVERAGE",
      "POSITION",
      "REMARK",
    ];
    worksheetData.push(studentHeaders);

    // 3. STUDENT DATA ROWS
    students.forEach((item, index) => {
      const row = [
        index + 1,
        item.student?.name?.toUpperCase() || "N/A",
        ...subjects.map((sub) => item.scores?.[sub]?.total ?? "-"),
        item.summary?.termTotal || 0,
        item.summary?.termAverage ? Number(item.summary.termAverage).toFixed(1) : 0,
        item.summary?.termPosition || "-",
        getRemark(item.summary?.termAverage).toUpperCase(),
      ];
      worksheetData.push(row);
    });

    worksheetData.push([]);
    worksheetData.push([]);

    // 4. SUMMARIES SECTION (Horizontal Alignment)
    worksheetData.push(["PERFORMANCE SUMMARY", "", "", "CLASS ARMS DISTRIBUTION"]);
    worksheetData.push(["DESCRIPTION", "COUNT", "", "ARM", "TEACHER", "TOTAL STUDENTS"]);

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
      
      worksheetData.push([
        pRow[0], pRow[1], "", 
        cRow[0], cRow[1], cRow[2]
      ]);
    }

    // 5. CREATE SHEET & APPLY STRUCTURE
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Column Widths
    const wscols = [
      { wch: 6 },   // S/N
      { wch: 35 },  // Student Name (Widened for longer names)
      ...subjects.map(() => ({ wch: 12 })), // Subjects
      { wch: 10 },  // Total
      { wch: 10 },  // Average
      { wch: 8 },   // Pos
      { wch: 15 },  // Remark
    ];
    worksheet['!cols'] = wscols;

    // Center Align the Merged Headers
    const totalCols = studentHeaders.length - 1;
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols } }, // School Name
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols } }, // Subtitle
      { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols } }, // Term
      { s: { r: 3, c: 0 }, e: { r: 3, c: totalCols } }, // Session
      { s: { r: 4, c: 0 }, e: { r: 4, c: totalCols } }, // Class
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "BroadSheet");

    // 6. GENERATE FILENAME & DOWNLOAD
    const termFile = selectedTerm === 1 ? "1stTerm" : selectedTerm === 2 ? "2ndTerm" : "3rdTerm";
    const fileName = `${schoolName.split(' ')[0]}_${selectedClass}_${termFile}.xlsx`;
    
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(dataBlob, fileName);
    
    messageApi.success("Professional BroadSheet Downloaded!");
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
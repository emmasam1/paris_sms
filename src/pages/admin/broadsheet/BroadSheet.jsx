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
        },
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
        `${API_BASE_URL}/api/broadsheet/single-term?className=${selectedClass}&session=${selectedSession}&term=${selectedTerm}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setData(res.data);
    } catch (err) {
      messageApi.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const subjects = data?.metadata?.columns || [];

  const students = useMemo(() => {
    const rawData = data?.data || [];
    return [...rawData].sort((a, b) => {
      const armA = a.student?.arm?.toUpperCase() || "";
      const armB = b.student?.arm?.toUpperCase() || "";
      return armA.localeCompare(armB);
    });
  }, [data]);

  // Find the top 3 unique highest total scores achieved for each subject
  const highestSubjectTotals = useMemo(() => {
    const highest = {};
    subjects.forEach((sub) => {
      const scores = students
        .map((item) => item.scores?.[sub]?.total)
        .filter((score) => score !== undefined && score !== null);
      
      // Remove duplicates and sort descending
      const uniqueSorted = Array.from(new Set(scores)).sort((a, b) => b - a);
      
      highest[sub] = {
        first: uniqueSorted[0] ?? null,
        second: uniqueSorted[1] ?? null,
        third: uniqueSorted[2] ?? null,
      };
    });
    return highest;
  }, [students, subjects]);

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
      between60_69: students.filter(
        (s) => s.summary?.termAverage >= 60 && s.summary?.termAverage < 70,
      ).length,
      between50_59: students.filter(
        (s) => s.summary?.termAverage >= 50 && s.summary?.termAverage < 60,
      ).length,
      between40_49: students.filter(
        (s) => s.summary?.termAverage >= 40 && s.summary?.termAverage < 50,
      ).length,
      below40: students.filter((s) => s.summary?.termAverage < 40).length,
    }),
    [students],
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
  const columns = useMemo(() => {
    const termLabel =
      selectedTerm === 1 ? "1ST" : selectedTerm === 2 ? "2ND" : "3RD";

    return [
      {
        title: "S/N",
        dataIndex: "index",
        key: "index",
        width: 60,
        fixed: "left",
        align: "center",
      },
      {
        title: "Student Name",
        dataIndex: "name",
        key: "name",
        fixed: "left",
        width: 200,
        render: (text) => (text ? text.toUpperCase() : "-"),
      },
      { title: "Arm", dataIndex: "arm", key: "arm" },

      ...subjects.map((sub) => ({
        title: sub.toUpperCase(),
        align: "center",
        children: [
          {
            title: "Ass",
            dataIndex: ["scores", sub, "ass"],
            key: `${sub}_ass`,
            width: 60,
            align: "center",
            render: (v) => v ?? "-",
          },
          {
            title: "1st CA",
            dataIndex: ["scores", sub, "first_ca"],
            key: `${sub}_1st`,
            width: 65,
            align: "center",
            render: (v) => v ?? "-",
          },
          {
            title: "2nd CA",
            dataIndex: ["scores", sub, "second_ca"],
            key: `${sub}_2nd`,
            width: 65,
            align: "center",
            render: (v) => v ?? "-",
          },
          {
            title: "Exam",
            dataIndex: ["scores", sub, "exam"],
            key: `${sub}_exam`,
            width: 70,
            align: "center",
            render: (v) => v ?? "-",
          },
          {
            title: "Total",
            dataIndex: ["scores", sub, "total"],
            key: `${sub}_total`,
            width: 70,
            align: "center",
            render: (v) => {
              if (v === undefined || v === null) return "-";

              const tops = highestSubjectTotals[sub] || {};
              let bgColor = "transparent";
              let textColor = "#1890ff";
              let isTop = false;

              if (v === tops.first && tops.first !== null) {
                bgColor = "#004225"; // 1st Highest (Gold Accent)
                textColor = "#ffffff";
                isTop = true;
              } else if (v === tops.second && tops.second !== null) {
                bgColor = "#003262"; // 2nd Highest (Silver Accent)
                textColor = "#ffffff";
                isTop = true;
              } else if (v === tops.third && tops.third !== null) {
                bgColor = "#3D0C02"; // 3rd Highest (Bronze Accent)
                textColor = "#ffffff";
                isTop = true;
              }

              return (
                <div
                  style={{
                    backgroundColor: bgColor,
                    fontWeight: isTop ? "bold" : "normal",
                    borderRadius: "4px",
                    padding: "2px 4px",
                  }}
                >
                  <b style={{ color: textColor }}>
                    {v}
                  </b>
                </div>
              );
            },
          },
        ],
      })),

      {
        title: `${termLabel} TERM TOTAL`,
        dataIndex: "termTotal",
        key: "termTotal",
        width: 110,
        align: "center",
        fixed: "right",
        render: (v) => <b className="font-bold">{v ?? "-"}</b>,
      },
      {
        title: "AVG",
        dataIndex: "average",
        key: "average",
        width: 80,
        align: "center",
        fixed: "right",
      },
      {
        title: "POSITION",
        dataIndex: "position",
        key: "position",
        width: 70,
        align: "center",
        fixed: "right",
      },
      {
        title: "REMARK",
        dataIndex: "remark",
        key: "remark",
        width: 110,
        align: "center",
        fixed: "right",
      },
    ];
  }, [subjects, selectedTerm, highestSubjectTotals]);

  const tableData = useMemo(() => {
    return students.map((item, index) => ({
      key: item.student?._id || index,
      index: index + 1,
      name: item.student?.name,
      arm: item.student?.arm,
      scores: item.scores,
      termTotal: item.summary?.termTotal,
      average: item.summary?.termAverage?.toFixed(1),
      position: item.summary?.termPosition,
      remark: getRemark(item.summary?.termAverage),
    }));
  }, [students]);

  const exportToExcel = () => {
    try {
      if (!students.length) return messageApi.error("No data available");

      const schoolName =
        data?.metadata?.school || "PARIS AFRICANA INTERNATIONAL SCHOOL";
      const termLabel =
        selectedTerm === 1 ? "FIRST" : selectedTerm === 2 ? "SECOND" : "THIRD";
      const totalColsCount = 3 + subjects.length * 5 + 4;

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
        tableHead: {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F81BD" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: borderStyle,
        },
        cell: {
          border: borderStyle,
          alignment: { horizontal: "center", vertical: "center" },
        },
        highlight1st: {
          border: borderStyle,
          fill: { fgColor: { rgb: "FFE58F" } },
          font: { bold: true, color: { rgb: "D46B08" } },
          alignment: { horizontal: "center", vertical: "center" },
        },
        highlight2nd: {
          border: borderStyle,
          fill: { fgColor: { rgb: "E6F7FF" } },
          font: { bold: true, color: { rgb: "096DD9" } },
          alignment: { horizontal: "center", vertical: "center" },
        },
        highlight3rd: {
          border: borderStyle,
          fill: { fgColor: { rgb: "F6FFED" } },
          font: { bold: true, color: { rgb: "389E0D" } },
          alignment: { horizontal: "center", vertical: "center" },
        },
      };

      worksheetData.push([
        {
          v: schoolName.toUpperCase(),
          s: { ...styles.header, font: { bold: true, sz: 18 } },
        },
      ]);
      worksheetData.push([{ v: "ACADEMIC EVALUATION UNIT", s: styles.header }]);
      worksheetData.push([
        { v: `${termLabel} TERM BROADSHEET REPORT`, s: styles.header },
      ]);
      worksheetData.push([
        {
          v: `SESSION: ${selectedSession} | CLASS: ${selectedClass}`,
          s: styles.header,
        },
      ]);
      worksheetData.push([]);

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

      students.forEach((item, index) => {
        const studentRow = [
          { v: index + 1, s: styles.cell },
          {
            v: item.student?.name?.toUpperCase() || "N/A",
            s: { ...styles.cell, alignment: { horizontal: "left" } },
          },
          { v: item.student?.arm?.toUpperCase() || "N/A", s: styles.cell },
        ];

        subjects.forEach((sub) => {
          const s = item.scores?.[sub] || {};
          studentRow.push({ v: s.ass ?? "-", s: styles.cell });
          studentRow.push({ v: s.first_ca ?? "-", s: styles.cell });
          studentRow.push({ v: s.second_ca ?? "-", s: styles.cell });
          studentRow.push({ v: s.exam ?? "-", s: styles.cell });

          const tops = highestSubjectTotals[sub] || {};
          let targetStyle = { ...styles.cell, font: { bold: true } };

          if (s.total !== undefined && s.total !== null) {
            if (s.total === tops.first && tops.first !== null) {
              targetStyle = styles.highlight1st;
            } else if (s.total === tops.second && tops.second !== null) {
              targetStyle = styles.highlight2nd;
            } else if (s.total === tops.third && tops.third !== null) {
              targetStyle = styles.highlight3rd;
            }
          }

          studentRow.push({
            v: s.total ?? "-",
            s: targetStyle,
          });
        });

        studentRow.push(
          { v: item.summary?.termTotal || 0, s: styles.cell },
          { v: item.summary?.termAverage?.toFixed(1) || 0, s: styles.cell },
          { v: item.summary?.termPosition || "-", s: styles.cell },
          {
            v: getRemark(item.summary?.termAverage).toUpperCase(),
            s: styles.cell,
          },
        );
        worksheetData.push(studentRow);
      });

      worksheetData.push([]);
      worksheetData.push([]);

      worksheetData.push([
        {
          v: "SUMMARY OF RESULTS",
          s: { ...styles.header, alignment: { horizontal: "left" } },
        },
      ]);

      const perfMetrics = [
        ["DESCRIPTION", "COUNT", "", "ARM", "CLASS TEACHER", "ENROLLMENT"],
        [
          "TOTAL ABOVE 70%",
          summaryCounts.above70,
          "",
          classSummaryData[0]?.arm || "-",
          classSummaryData[0]?.teacher || "-",
          classSummaryData[0]?.numStudents || 0,
        ],
        [
          "TOTAL 60% - 69%",
          summaryCounts.between60_69,
          "",
          classSummaryData[1]?.arm || "",
          classSummaryData[1]?.teacher || "",
          classSummaryData[1]?.numStudents || "",
        ],
        ["TOTAL 50% - 59%", summaryCounts.between50_59, "", "", "", ""],
        ["TOTAL 40% - 49%", summaryCounts.between40_49, "", "", "", ""],
        ["TOTAL BELOW 40%", summaryCounts.below40, "", "", "", ""],
        ["TOTAL ENROLLMENT", students.length, "", "", "", ""],
      ];

      perfMetrics.forEach((m, idx) => {
        const style = idx === 0 ? styles.tableHead : styles.cell;
        worksheetData.push([
          { v: "" },
          { v: m[0], s: { ...style, alignment: { horizontal: "left" } } },
          { v: m[1], s: style },
          { v: "" },
          { v: m[3], s: style },
          { v: m[4], s: { ...style, alignment: { horizontal: "left" } } },
          { v: m[5], s: style },
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      const merges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalColsCount - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: totalColsCount - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: totalColsCount - 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: totalColsCount - 1 } },
        { s: { r: 5, c: 0 }, e: { r: 6, c: 0 } },
        { s: { r: 5, c: 1 }, e: { r: 6, c: 1 } },
        { s: { r: 5, c: 2 }, e: { r: 6, c: 2 } },
      ];

      let cIdx = 3;
      subjects.forEach(() => {
        merges.push({ s: { r: 5, c: cIdx }, e: { r: 5, c: cIdx + 4 } });
        cIdx += 5;
      });

      worksheet["!merges"] = merges;
      worksheet["!pageSetup"] = { orientation: "landscape", paperSize: 9 };
      worksheet["!cols"] = [
        { wch: 5 },
        { wch: 25 },
        { wch: 8 },
        ...Array(totalColsCount).fill({ wch: 7 }),
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "BroadSheet");
      const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([buffer]), `Broadsheet_${selectedClass}.xlsx`);
      messageApi.success("Export successful");
    } catch (e) {
      messageApi.error("Export failed: " + e.message);
    }
  };

   const getFullBroadSheet = async () => {
  // 1. Check for token first! Don't let it run without it.
  if (!token) return;

  // 2. If you want this to run automatically on load with your hardcoded 
  // JSS1 query, remove or comment out the state validation check here:
  // if (!selectedClass || !selectedSession || !selectedTerm) { ... }

  try {
    console.log("start fetching full broadsheet...");
    const res = await axios.get(
      `${API_BASE_URL}/api/broadsheet?className=JSS1&session=2025/2026&term=2`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    console.log("this is for all:", res);
  } catch (err) {
    console.error("Error fetching full broadsheet:", err);
    messageApi.error(err.response?.data?.message || err.message);
  } finally {
    console.log("end fetching full broadsheet");
  }
};

// Listen for when the token becomes available
useEffect(() => {
  if (token) {
    getFullBroadSheet();
  }
}, [token]); // <--- Added token dependency here

  return (
    <div className="p-4">
      {contextHolder}
      <Card className="mb-6 shadow-sm">
        <Title level={4}>Broadsheet Management</Title>
        <div className="flex gap-4 items-center flex-wrap">
          <Select
            className="w-60"
            placeholder="Select Class"
            onChange={setSelectedClass}
          >
            {Array.from(new Set(classes.map((c) => c.level))).map((l) => (
              <Option key={l} value={l}>
                {l}
              </Option>
            ))}
          </Select>
          <Select
            className="w-48"
            placeholder="Session"
            onChange={setSelectedSession}
          >
            {["2025/2026", "2024/2025"].map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select>
          <Select
            className="w-48"
            placeholder="Term"
            onChange={setSelectedTerm}
          >
            <Option value={1}>First Term</Option>
            <Option value={2}>Second Term</Option>
            <Option value={3}>Third Term</Option>
          </Select>
          <Button type="primary" loading={loading} onClick={getBroadSheet}>
            Generate Sheet
          </Button>
          {students.length > 0 && (
            <Button onClick={exportToExcel}>Download Excel</Button>
          )}
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
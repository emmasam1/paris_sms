import React, { useState, useEffect } from "react";
import {
  Select,
  Button,
  Table,
  message,
  Card,
  Skeleton,
  Dropdown,
  Modal,
  Menu,
  Input,
  Space,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import axios from "axios";
import { useApp } from "../../../context/AppContext";

const { Option } = Select;

const StudentProgress = () => {
  const { API_BASE_URL, token } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingSubjects, setEditingSubjects] = useState([]);
  const [originalSubjects, setOriginalSubjects] = useState([]);
  const [editingKeys, setEditingKeys] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const [classes, setClasses] = useState([]);
  const [selectedClassArm, setSelectedClassArm] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingRows, setLoadingRows] = useState([]);

  // 🔹 Dynamic max values based on class
  const getMaxValues = (className) => {
    if (className?.toLowerCase().includes("jss")) {
      return {
        firstCA: 20,
        secondCA: 20,
        firstAssignment: 10,
        secondAssignment: 10,
        exam: 40,
      };
    } else {
      return {
        firstCA: 10,
        secondCA: 10,
        firstAssignment: 5,
        secondAssignment: 5,
        exam: 70,
      };
    }
  };

  const showModal = (record) => {
    const subjectsWithKey = record.subjects.map((sub, index) => ({
      key: index, // Table key
      recordId: sub.recordId, // ✅ Each subject's own recordId
      ...sub,
    }));
    setSelectedStudent(record);
    setEditingSubjects(subjectsWithKey);
    setOriginalSubjects(subjectsWithKey); // store original values
    setEditingKeys([]);
    setIsModalOpen(true);
    console.log("Selected student:", record);
  };

  const handleCancel = () => setIsModalOpen(false);

  const handleChange = (value, key, field) => {
    setEditingSubjects((prev) =>
      prev.map((sub) =>
        sub.key === key
          ? { ...sub, [field]: value === "" ? "" : Number(value) }
          : sub
      )
    );
  };

  const handleRowEdit = (key) => setEditingKeys((prev) => [...prev, key]);

  // 🔹 Restore original values on cancel
  const handleRowCancel = (key) => {
    setEditingSubjects((prev) =>
      prev.map((sub) => {
        const original = originalSubjects.find((o) => o.key === key);
        return sub.key === key && original ? { ...original } : sub;
      })
    );
    setEditingKeys((prev) => prev.filter((k) => k !== key));
  };

  // 🔹 Row validation using dynamic max
  const isRowValid = (record) => {
    const max = getMaxValues(selectedStudent?.className || "");
    return (
      // record.recordId
      record.firstCA <= max.firstCA &&
      record.secondCA <= max.secondCA &&
      record.firstAssignment <= max.firstAssignment &&
      record.secondAssignment <= max.secondAssignment &&
      record.exam <= max.exam
    );
  };
  // console.log(token)
  // const handleRowUpdate = async (record) => {
  //   if (!isRowValid(record)) return;
  //   console.log(record);

  //   try {
  //     await axios.put(
  //       `${API_BASE_URL}/api/records/admin/update-score`,
  //       {
  //         recordId: record?.recordId,
  //         firstAssignment: record.firstAssignment,
  //         secondAssignment: record.secondAssignment,
  //         firstCA: record.firstCA,
  //         secondCA: record.secondCA,
  //         exam: record.exam,
  //       },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     messageApi.success(`${record.subjectName} updated successfully!`);
  //     setEditingKeys((prev) => prev.filter((k) => k !== record.key));
  //     setEditingSubjects((prev) =>
  //       prev.map((sub) => (sub.key === record.key ? { ...record } : sub))
  //     );

  //     // Update originalSubjects so future cancels don't overwrite updated values
  //     setOriginalSubjects((prev) =>
  //       prev.map((sub) => (sub.key === record.key ? { ...record } : sub))
  //     );
  //   } catch (err) {
  //     console.error(err);
  //     messageApi.error("Failed to update subject");
  //   }
  // };

  const handleRowUpdate = async (record) => {
  if (!isRowValid(record)) return;
  setLoadingRows((prev) => [...prev, record.key]);

  try {
    const res = await axios.put(
      `${API_BASE_URL}/api/records/admin/update-score`,
      {
        recordId: record.recordId,
        firstAssignment: record.firstAssignment,
        secondAssignment: record.secondAssignment,
        firstCA: record.firstCA,
        secondCA: record.secondCA,
        exam: record.exam,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ✅ Use the updated row from DB response
    const updatedRecord = res.data.data; 
    // Ensure backend returns { total, grade, remark, ... }

    setEditingSubjects((prev) =>
      prev.map((sub) =>
        sub.key === record.key ? { ...sub, ...updatedRecord } : sub
      )
    );
    setOriginalSubjects((prev) =>
      prev.map((sub) =>
        sub.key === record.key ? { ...sub, ...updatedRecord } : sub
      )
    );

    messageApi.success(`${record.subjectName} updated successfully!`);
    setEditingKeys((prev) => prev.filter((k) => k !== record.key));
  } catch (err) {
    console.error(err);
    messageApi.error("Failed to update subject");
  } finally {
    setLoadingRows((prev) => prev.filter((k) => k !== record.key));
  }
};


  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes?limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(res.data.data || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch classes.");
    } finally {
      setLoadingClasses(false);
    }
  };

  // console.log(token, API_BASE_URL)

  // const getRecord = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${API_BASE_URL}/api/records/admin/records?limit=1000&session=2025/2026&term=1`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     // console.log("new api", res);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const fetchProgress = async () => {
    if (!selectedSession) return messageApi.warning("Please select a session.");
    if (!selectedTerm) return messageApi.warning("Please select a term.");

    setLoadingProgress(true);
    try {
      const url = `${API_BASE_URL}/api/records/admin/records?session=${selectedSession}&term=${selectedTerm}&limit=1000`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("the full res", res);
      const cleanedData = (res.data.data || []).map((item) => ({
        studentId: item.student?.id, // student ID
        admissionNumber: item.student?.admissionNumber || "-",
        studentName: item.student?.fullName || "-",
        className: item.student?.class || "-",
        level: item.student?.level || "-",
        subjects: (item.records || []).map((rec) => ({
          recordId: rec._id, // ✅ use record _id here
          subjectName: rec.subject?.name || "-",
          subjectCode: rec.subject?.code || "-",
          firstAssignment: rec.firstAssignment ?? 0,
          secondAssignment: rec.secondAssignment ?? 0,
          firstCA: rec.firstCA ?? 0,
          secondCA: rec.secondCA ?? 0,
          exam: rec.exam ?? 0,
          total: rec.total ?? 0,
          grade: rec.grade || "-",
          remark: rec.teacherRemark || "-",
        })),
        classAverage: "-", // optional, can calculate from subjects if needed
        finalAverage: "-",
        noInClass: "-",
        overallGrade: "-",
        totalScoreObtainable: "-",
        totalScoreObtained: "-",
        totalSubjects: item.records?.length || 0,
      }));

      // const cleanedData = (res.data.data || []).map((item) => ({
      //   recordId: item.records?._id,
      //   admissionNumber: item.student?.admissionNumber || "-",
      //   studentName: item.student?.fullName || "-",
      //   className: item.student?.class || "-",
      //   level: item.student?.level || "-",
      //   subjects: (item.records || []).map((rec) => ({
      //     recordId: rec._id,
      //     subjectName: rec.subject?.name || "-",
      //     subjectCode: rec.subject?.code || "-",
      //     firstAssignment: rec.firstAssignment ?? 0,
      //     secondAssignment: rec.secondAssignment ?? 0,
      //     firstCA: rec.firstCA ?? 0,
      //     secondCA: rec.secondCA ?? 0,
      //     exam: rec.exam ?? 0,
      //     total: rec.total ?? 0,
      //     grade: rec.grade || "-",
      //     remark: rec.teacherRemark || "-",
      //   })),
      //   classAverage: "-",
      //   finalAverage: "-",
      //   noInClass: "-",
      //   overallGrade: "-",
      //   totalScoreObtainable: "-",
      //   totalScoreObtained: "-",
      //   totalSubjects: item.records?.length || 0,
      // }));

      setProgressData(cleanedData);
      // console.log(cleanedData);
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to load results"
      );
    } finally {
      setLoadingProgress(false);
    }
  };

  //   const fetchProgress = async () => {
  //   if (!selectedClassArm)
  //     return messageApi.warning("Please select a class and arm.");
  //   if (!selectedSession) return messageApi.warning("Please select a session.");
  //   if (!selectedTerm) return messageApi.warning("Please select a term."); // include term

  //   setLoadingProgress(true);
  //   try {
  //     // Correct URL with session AND term
  //     const url = `${API_BASE_URL}/api/admin/students/records?session=${selectedSession}&term=${selectedTerm}&limit=50`;
  //     console.log(url)

  //     const res = await axios.get(url, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });

  //     console.log("API response:", res);

  //     messageApi.success("Results loaded successfully.");

  //     const cleanedData = (res.data.data || []).map((item) => ({
  //       recordId: item?._id,
  //       admissionNumber: item.studentSnapshot?.admissionNumber || "-",
  //       studentName: item.studentSnapshot?.fullName || "-",
  //       className: item.studentSnapshot?.className || "-",
  //       classArm: item.studentSnapshot?.classArm || "-",
  //       classAverage: item.summary?.classAverage || "-",
  //       finalAverage: item.summary?.finalAverage || "-",
  //       noInClass: item.summary?.noInClass || "-",
  //       overallGrade: item.summary?.overallGrade || "-",
  //       totalScoreObtainable: item.summary?.totalScoreObtainable || "-",
  //       totalScoreObtained: item.summary?.totalScoreObtained || "-",
  //       totalSubjects: item.summary?.totalSubjects || "-",
  //       subjects: item.subjects || [],
  //     }));

  //     setProgressData(cleanedData);
  //     console.log(cleanedData);
  //   } catch (error) {
  //     console.error(error);
  //     messageApi.error(
  //       error?.response?.data?.message || "Failed to load results"
  //     );
  //   } finally {
  //     setLoadingProgress(false);
  //   }
  // };

  useEffect(() => {
    fetchClasses();
    // getRecord();
  }, []);

  const columns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1, width: 70 },
    { title: "Student Name", dataIndex: "studentName", key: "studentName" },
    {
      title: "Admission No",
      dataIndex: "admissionNumber",
      key: "admissionNumber",
    },
    { title: "Class", dataIndex: "className", key: "className" },
    { title: "Arm", dataIndex: "classArm", key: "classArm" },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => {
        const menu = (
          <Menu
            items={[
              {
                key: "1",
                label: "View Result",
                onClick: () => showModal(record),
              },
            ]}
          />
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const modalColumns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
    { title: "Subject", dataIndex: "subjectName", key: "subjectName" },
    ...[
      "firstAssignment",
      "secondAssignment",
      "firstCA",
      "secondCA",
      "exam",
    ].map((field) => ({
      title:
        field === "firstCA"
          ? "1st CA"
          : field === "secondCA"
          ? "2nd CA"
          : field === "firstAssignment"
          ? "1st ASS"
          : field === "secondAssignment"
          ? "2nd ASS"
          : "Exam",
      dataIndex: field,
      key: field,
      render: (text, record) => {
        const max = getMaxValues(selectedStudent?.className || "");
        const value = record[field] ?? 0;
        // console.log(record)
        return editingKeys.includes(record.key) ? (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value, record.key, field)}
            style={{ borderColor: value > max[field] ? "red" : undefined }}
          />
        ) : (
          text
        );
      },
    })),
    {
      title: "Action",
      key: "action",
      render: (_, record) =>
        editingKeys.includes(record.key) ? (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => handleRowUpdate(record)}
              disabled={!isRowValid(record)}
              loading={loadingRows.includes(record.key)} // ✅ show loading
            >
              Update
            </Button>
            <Button size="small" onClick={() => handleRowCancel(record.key)}>
              Cancel
            </Button>
          </Space>
        ) : (
          <Button size="small" onClick={() => handleRowEdit(record.key)}>
            Edit
          </Button>
        ),
    },
    { title: "Total", dataIndex: "total", key: "total" },
    { title: "Grade", dataIndex: "grade", key: "grade" },
    { title: "Remark", dataIndex: "remark", key: "remark" },
  ];

  return (
    <>
      {contextHolder}
      <Card title="Student Progress" className="w-full">
        <div className="flex gap-4 mb-4 flex-wrap">
          {/* {loadingClasses ? (
            <Skeleton.Input style={{ width: 300, height: 40 }} active />
          ) : (
            <Select
              placeholder="Select Class - Arm"
              style={{ width: 300 }}
              value={selectedClassArm}
              onChange={setSelectedClassArm}
            >
              {classes.map((cls) => (
                <Option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.arm}
                </Option>
              ))}
            </Select>
          )} */}
          {loadingClasses ? (
            <Skeleton.Input style={{ width: 200, height: 40 }} active />
          ) : (
            <Select
              placeholder="Select Session"
              style={{ width: 200 }}
              value={selectedSession}
              onChange={setSelectedSession}
            >
              <Option value="2024/2025">2024/2025</Option>
              <Option value="2025/2026">2025/2026</Option>
              <Option value="2026/2027">2026/2027</Option>
            </Select>
          )}
          {loadingClasses ? (
            <Skeleton.Input style={{ width: 150, height: 40 }} active />
          ) : (
            <Select
              placeholder="Select Term"
              style={{ width: 150 }}
              value={selectedTerm}
              onChange={setSelectedTerm}
            >
              <Option value="1">1st Term</Option>
              <Option value="2">2nd Term</Option>
              <Option value="3">3rd Term</Option>
            </Select>
          )}
          <Button
            type="primary"
            onClick={fetchProgress}
            loading={loadingProgress}
          >
            Fetch Progress
          </Button>
        </div>

        {loadingProgress ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={progressData.map((item, index) => ({
              ...item,
              key: index,
            }))}
            loading={loadingProgress}
            size="small"
            pagination={{
              position: ["bottomCenter"],
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50"],
              className: "custom-pagination",
            }}
            bordered
            scroll={{ x: "max-content" }}
          />
        )}

        <Modal
          title={`${selectedStudent?.studentName} - Subjects`}
          open={isModalOpen}
          onCancel={handleCancel}
          width={900}
          footer={[
            <Button key="close" onClick={handleCancel}>
              Close
            </Button>,
          ]}
        >
          {editingSubjects.length ? (
            <Table
              dataSource={editingSubjects}
              columns={modalColumns}
              pagination={false}
              size="small"
              bordered
            />
          ) : (
            <p>No subject data available</p>
          )}
        </Modal>
      </Card>
    </>
  );
};

export default StudentProgress;

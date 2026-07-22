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

  const [selectedClassArm, setSelectedClassArm] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingRows, setLoadingRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [classes, setClasses] = useState([]);

  // ------------------------------------------------------
  // Helper to determine if student/class is SS (Senior Secondary)
  // Prevents JSS classes from falsely being flagged as senior
  // ------------------------------------------------------
  const checkIsSenior = (student) => {
    if (!student) return false;
    const name = (typeof student === "string" ? student : student?.className || "").toUpperCase();
    const level = (student?.level || "").toUpperCase();

    const isSeniorName = (name.includes("SS") || name.includes("SENIOR")) && !name.includes("JSS");
    const isSeniorLevel = (level.includes("SS") || level.includes("SENIOR")) && !level.includes("JSS");

    return isSeniorName || isSeniorLevel;
  };

  // ------------------------------------------------------
  // Dynamic Max Limits Based on Class Level
  // ------------------------------------------------------
  const getMaxValues = (student) => {
    const isSenior = checkIsSenior(student);
    if (isSenior) {
      return {
        attendance: 5,
        note: 5,
        firstCA: 10,
        secondCA: 20,
        exam: 60,
      };
    }
    return {
      attendance: 5,
      note: 5,
      assignment: 10,
      firstCA: 20,
      secondCA: 20,
      exam: 40,
    };
  };

  const showModal = (record) => {
    const subjectsWithKey = record.subjects.map((sub, index) => ({
      key: index,
      recordId: sub.recordId,
      ...sub,
    }));
    setSelectedStudent(record);
    setEditingSubjects(subjectsWithKey);
    setOriginalSubjects(subjectsWithKey);
    setEditingKeys([]);
    setIsModalOpen(true);
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

  const handleRowCancel = (key) => {
    setEditingSubjects((prev) =>
      prev.map((sub) => {
        const original = originalSubjects.find((o) => o.key === key);
        return sub.key === key && original ? { ...original } : sub;
      })
    );
    setEditingKeys((prev) => prev.filter((k) => k !== key));
  };

  const isRowValid = (record) => {
    const isSenior = checkIsSenior(selectedStudent);
    const max = getMaxValues(selectedStudent);

    const validBase =
      (record.attendance ?? 0) <= max.attendance &&
      (record.note ?? 0) <= max.note &&
      (record.firstCA ?? 0) <= max.firstCA &&
      (record.secondCA ?? 0) <= max.secondCA &&
      (record.exam ?? 0) <= max.exam;

    if (isSenior) return validBase;

    return validBase && (record.assignment ?? 0) <= max.assignment;
  };

  const handleRowUpdate = async (record) => {
    if (!isRowValid(record)) return;
    setLoadingRows((prev) => [...prev, record.key]);

    const isSenior = checkIsSenior(selectedStudent);

    const payload = {
      recordId: record.recordId,
      attendance: record.attendance ?? 0,
      note: record.note ?? 0,
      firstCA: record.firstCA ?? 0,
      secondCA: record.secondCA ?? 0,
      exam: record.exam ?? 0,
      ...(!isSenior && { assignment: record.assignment ?? 0 }),
    };

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/records/admin/update-score`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedRecord = res.data.data;

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

  const getClass = async () => {
    if (!token) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes?limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res?.data?.data || [];

      const mapped = data.map((cls) => ({
        id: cls._id,
        name: cls.name,
        arm: cls.arm,
        label: `${cls.name} - ${cls.arm}`,
        value: cls._id,
      }));

      setClasses(mapped);
      messageApi.success(res?.data?.message || "Classes fetched successfully");
    } catch (error) {
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch classes"
      );
    }
  };

  const fetchProgress = async () => {
    if (!selectedClassArm) return messageApi.warning("Please select class arm.");
    if (!selectedSession) return messageApi.warning("Please select a session.");
    if (!selectedTerm) return messageApi.warning("Please select a term.");

    setLoadingProgress(true);

    try {
      const url = `${API_BASE_URL}/api/records/admin/records?classId=${selectedClassArm}&session=${selectedSession}&term=${selectedTerm}&limit=1000`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cleanedData = (res.data.data || []).map((item) => ({
        studentId: item.student?.id,
        admissionNumber: item.student?.admissionNumber || "-",
        studentName: item.student?.fullName || "--",
        className: item.student?.class || "-",
        level: item.student?.level || "-",
        subjects: (item.records || []).map((rec) => ({
          recordId: rec._id,
          subjectName: rec.subject?.name || "-",
          subjectCode: rec.subject?.code || "-",
          attendance: rec.attendance ?? 0,
          note: rec.note ?? 0,
          assignment: rec.assignment ?? 0,
          firstCA: rec.firstCA ?? 0,
          secondCA: rec.secondCA ?? 0,
          exam: rec.exam ?? 0,
          total: rec.total ?? 0,
          grade: rec.grade || "-",
          remark: rec.teacherRemark || "-",
        })),
        totalSubjects: item.records?.length || 0,
      }));

      setProgressData(cleanedData);
      setFilteredData(cleanedData);
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to load results"
      );
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = progressData.filter((item) =>
      item.studentName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    getClass();
  }, []);

  const columns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
    { title: "Student Name", dataIndex: "studentName", key: "studentName" },
    { title: "Admission No", dataIndex: "admissionNumber", key: "admissionNumber" },
    { title: "Class", dataIndex: "className", key: "className" },
    {
      title: "Action",
      key: "action",
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

  const isSenior = checkIsSenior(selectedStudent);

  const fields = [
    { field: "attendance", label: "Att. (5)" },
    { field: "note", label: "Note (5)" },
    ...(!isSenior ? [{ field: "assignment", label: "1st ASS (10)" }] : []),
    { field: "firstCA", label: `1st CA (${isSenior ? 10 : 20})` },
    { field: "secondCA", label: "2nd CA (20)" },
    { field: "exam", label: `Exam (${isSenior ? 60 : 40})` },
  ];

  const modalColumns = [
    { title: "S/N", key: "sn", width: 50, render: (_, __, index) => index + 1 },
    { title: "Subject", dataIndex: "subjectName", key: "subjectName", width: 160 },
    ...fields.map(({ field, label }) => ({
      title: label,
      dataIndex: field,
      key: field,
      align: "center",
      render: (text, record) => {
        const max = getMaxValues(selectedStudent);
        const value = record[field] ?? 0;
        const isEditing = editingKeys.includes(record.key);

        return isEditing ? (
          <Input
            type="number"
            min={0}
            max={max[field] || 0}
            value={value}
            onChange={(e) => handleChange(e.target.value, record.key, field)}
            style={{
              width: 65,
              textAlign: "center",
              borderColor: value > (max[field] || 0) ? "#ff4d4f" : undefined,
            }}
          />
        ) : (
          text
        );
      },
    })),
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 130,
      render: (_, record) =>
        editingKeys.includes(record.key) ? (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => handleRowUpdate(record)}
              disabled={!isRowValid(record)}
              loading={loadingRows.includes(record.key)}
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
    { title: "Total", dataIndex: "total", key: "total", align: "center", width: 60 },
    { title: "Grade", dataIndex: "grade", key: "grade", align: "center", width: 60 },
    { title: "Remark", dataIndex: "remark", key: "remark", align: "center", width: 100 },
  ];

  return (
    <>
      {contextHolder}
      <Card title="Student Progress" className="w-full">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 mb-4 flex-wrap">
            <Select
              placeholder="Select class arm"
              style={{ width: 200 }}
              value={selectedClassArm}
              onChange={(value) => setSelectedClassArm(value)}
            >
              {classes?.map((cls) => (
                <Select.Option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.arm}
                </Select.Option>
              ))}
            </Select>

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
            <Button
              type="primary"
              onClick={fetchProgress}
              loading={loadingProgress}
            >
              Fetch Progress
            </Button>
          </div>

          <Input
            placeholder="Search Student"
            className="!-mt-4"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 200 }}
          />
        </div>

        {loadingProgress ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredData.map((item, index) => ({
              ...item,
              key: index,
            }))}
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
          title={`${selectedStudent?.studentName || "Student"} - Subjects`}
          open={isModalOpen}
          onCancel={handleCancel}
          width={1100}
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
              scroll={{ x: "max-content" }}
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
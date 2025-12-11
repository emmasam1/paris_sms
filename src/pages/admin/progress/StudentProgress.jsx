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
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingRows, setLoadingRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [classes, setClasses] = useState([]);

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
      }));
      // console.log(res);

      setClasses(mapped);

      // console.log(mapped);

      messageApi.success(res?.data?.message || "Classes fetched successfully");
    } catch (error) {
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch classes"
      );
    }
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
    const max = getMaxValues(selectedStudent?.className || "");
    return (
      record.firstCA <= max.firstCA &&
      record.secondCA <= max.secondCA &&
      record.firstAssignment <= max.firstAssignment &&
      record.secondAssignment <= max.secondAssignment &&
      record.exam <= max.exam
    );
  };

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

  const fetchProgress = async () => {
    if (!selectedClassArm) return messageApi.warning("Please select arm.");
    if (!selectedSession) return messageApi.warning("Please select a session.");
    if (!selectedTerm) return messageApi.warning("Please select a term.");

    setLoadingProgress(true);

    try {
      const url = `${API_BASE_URL}/api/records/admin/records?classId=${selectedClassArm}&session=${selectedSession}&term=${selectedTerm}&limit=1000`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log(res);

      const cleanedData = (res.data.data || []).map((item) => ({
        studentId: item.student?.id,
        admissionNumber: item.student?.admissionNumber || "-",
        studentName: item.student?.fullName || "-",
        className: item.student?.class || "-",
        level: item.student?.level || "-",
        subjects: (item.records || []).map((rec) => ({
          recordId: rec._id,
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
        classAverage: "-",
        finalAverage: "-",
        noInClass: "-",
        overallGrade: "-",
        totalScoreObtainable: "-",
        totalScoreObtained: "-",
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
    fetchClasses();
    getClass();
  }, []);

  const columns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      // width: 200,
    },
    {
      title: "Admission No",
      dataIndex: "admissionNumber",
      key: "admissionNumber",
      // width: 160,
    },
    { title: "Class", dataIndex: "className", key: "className" },
    // { title: "Arm", dataIndex: "classArm", key: "classArm" },
    {
      title: "Action",
      key: "action",
      // width: 100,
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
    { title: "Total", dataIndex: "total", key: "total" },
    { title: "Grade", dataIndex: "grade", key: "grade" },
    { title: "Remark", dataIndex: "remark", key: "remark" },
  ];

  return (
    <>
      {contextHolder}
      <Card title="Student Progress" className="w-full">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 mb-4 flex-wrap">
            <Select
              placeholder="Select arm" // Shows initially
              style={{ width: 200 }}
              // value={selectedClassArm}
              onChange={setSelectedClassArm}
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

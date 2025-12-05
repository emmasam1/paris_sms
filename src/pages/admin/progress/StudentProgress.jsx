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
  const [isEditing, setIsEditing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [classes, setClasses] = useState([]);
  const [selectedClassArm, setSelectedClassArm] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Show modal and reset edit mode
  const showModal = (record) => {
    setSelectedStudent(record);
    setEditingSubjects(
      record.subjects.map((sub, index) => ({
        key: index,
        recordId: sub._id, // ensure each subject has recordId
        ...sub,
      }))
    );
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleCancel = () => setIsModalOpen(false);

  // Toggle edit mode
  const handleEditClick = () => setIsEditing(true);

  // Handle field change for editable subjects
  const handleChange = (value, key, field) => {
    setEditingSubjects((prev) =>
      prev.map((sub) =>
        sub.key === key ? { ...sub, [field]: value } : sub
      )
    );
  };

  // Save all subjects
  const handleUpdateAll = async () => {
    try {
      for (const record of editingSubjects) {
        await axios.patch(
          `${API_BASE_URL}/api/records/update-score`,
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
      }
      message.success("All subjects updated successfully!");
      setSelectedStudent((prev) => ({ ...prev, subjects: editingSubjects }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      message.error("Failed to update subjects");
    }
  };

  // Fetch classes
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

  // Fetch student progress
  const fetchProgress = async () => {
    if (!selectedClassArm)
      return messageApi.warning("Please select a class and arm.");
    if (!selectedSession) return messageApi.warning("Please select a session.");
    if (!selectedTerm) return messageApi.warning("Please select a term.");

    setLoadingProgress(true);

    try {
      const url = `${API_BASE_URL}/api/results/admin?classId=${selectedClassArm}&term=${selectedTerm}&session=${selectedSession}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      messageApi.success("Results loaded successfully.");

      const cleanedData = (res.data.data || []).map((item) => ({
        admissionNumber: item.studentSnapshot?.admissionNumber || "-",
        studentName: item.studentSnapshot?.fullName || "-",
        className: item.studentSnapshot?.className || "-",
        classArm: item.studentSnapshot?.classArm || "-",
        classAverage: item.summary?.classAverage || "-",
        finalAverage: item.summary?.finalAverage || "-",
        noInClass: item.summary?.noInClass || "-",
        overallGrade: item.summary?.overallGrade || "-",
        totalScoreObtainable: item.summary?.totalScoreObtainable || "-",
        totalScoreObtained: item.summary?.totalScoreObtained || "-",
        totalSubjects: item.summary?.totalSubjects || "-",
        subjects: item.subjects || [],
      }));

      setProgressData(cleanedData);
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to load results"
      );
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const columns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1, width: 70 },
    { title: "Student Name", dataIndex: "studentName", key: "studentName" },
    { title: "Admission No", dataIndex: "admissionNumber", key: "admissionNumber" },
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

  return (
    <>
      {contextHolder}
      <Card title="Student Progress" className="w-full">
        {/* Filters */}
        <div className="flex gap-4 mb-4 flex-wrap">
          {loadingClasses ? (
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
          )}

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

        {/* Progress Table */}
        {loadingProgress ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={progressData.map((item, index) => ({ ...item, key: index }))}
            loading={loadingProgress}
            size="small"
            pagination={{
              position: ["bottomCenter"],
              className: "custom-pagination",
            }}
            bordered
            scroll={{ x: "max-content" }}
          />
        )}

        {/* Modal */}
        <Modal
          title={`${selectedStudent?.studentName} - Subjects`}
          open={isModalOpen}
          onCancel={handleCancel}
          width={900}
          footer={[
            isEditing ? (
              <Button key="update" type="primary" onClick={handleUpdateAll}>
                Update
              </Button>
            ) : (
              <Button key="edit" type="default" onClick={handleEditClick}>
                Edit
              </Button>
            ),
            <Button key="close" onClick={handleCancel}>
              Close
            </Button>,
          ]}
        >
          {editingSubjects.length ? (
            <Table
              dataSource={editingSubjects}
              columns={[
                { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
                { title: "Subject", dataIndex: "subjectName", key: "subjectName" },
                {
                  title: "1st CA",
                  dataIndex: "firstCA",
                  key: "firstCA",
                  render: (text, record) =>
                    isEditing ? (
                      <Input
                        value={text}
                        onChange={(e) => handleChange(e.target.value, record.key, "firstCA")}
                      />
                    ) : (
                      text
                    ),
                },
                {
                  title: "2nd CA",
                  dataIndex: "secondCA",
                  key: "secondCA",
                  render: (text, record) =>
                    isEditing ? (
                      <Input
                        value={text}
                        onChange={(e) => handleChange(e.target.value, record.key, "secondCA")}
                      />
                    ) : (
                      text
                    ),
                },
                {
                  title: "1st ASS",
                  dataIndex: "firstAssignment",
                  key: "firstAssignment",
                  render: (text, record) =>
                    isEditing ? (
                      <Input
                        value={text}
                        onChange={(e) =>
                          handleChange(e.target.value, record.key, "firstAssignment")
                        }
                      />
                    ) : (
                      text
                    ),
                },
                {
                  title: "2nd ASS",
                  dataIndex: "secondAssignment",
                  key: "secondAssignment",
                  render: (text, record) =>
                    isEditing ? (
                      <Input
                        value={text}
                        onChange={(e) =>
                          handleChange(e.target.value, record.key, "secondAssignment")
                        }
                      />
                    ) : (
                      text
                    ),
                },
                {
                  title: "Exam",
                  dataIndex: "exam",
                  key: "exam",
                  render: (text, record) =>
                    isEditing ? (
                      <Input
                        value={text}
                        onChange={(e) => handleChange(e.target.value, record.key, "exam")}
                      />
                    ) : (
                      text
                    ),
                },
                { title: "Total", dataIndex: "total", key: "total" },
                { title: "Grade", dataIndex: "grade", key: "grade" },
                { title: "Remark", dataIndex: "remark", key: "remark" },
              ]}
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

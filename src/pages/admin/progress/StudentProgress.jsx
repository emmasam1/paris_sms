import React, { useState, useEffect } from "react";
import { Select, Button, Table, message, Card, Skeleton } from "antd";
import axios from "axios";
import { useApp } from "../../../context/AppContext";

const { Option } = Select;

const StudentProgress = () => {
  const { API_BASE_URL, token } = useApp();

  const [classes, setClasses] = useState([]);
  const [selectedClassArm, setSelectedClassArm] = useState(null); // this will store the arm _id
  const [progressData, setProgressData] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Fetch classes with arms
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
      return message.warning("Please select a class and arm.");

    setLoadingProgress(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/progress?armId=${selectedClassArm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProgressData(res.data.data || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch student progress.");
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const columns = [
    { title: "Student Name", dataIndex: "studentName", key: "studentName" },
    { title: "Class", dataIndex: "className", key: "className" },
    { title: "Arm", dataIndex: "armName", key: "armName" },
    { title: "Subject", dataIndex: "subjectName", key: "subjectName" },
    { title: "Score", dataIndex: "score", key: "score" },
    { title: "Grade", dataIndex: "grade", key: "grade" },
  ];

  return (
    <Card title="Student Progress" className="w-full">
      <div className="flex gap-4 mb-4">
        {loadingClasses ? (
          <Skeleton.Input style={{ width: 300 }} active />
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

        <Button
          type="primary"
          onClick={fetchProgress}
          loading={loadingProgress}
        >
          Fetch Progress
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={progressData.map((item, index) => ({
          ...item,
          key: index,
        }))}
        loading={loadingProgress}
        pagination={{ pageSize: 10 }}
        bordered
      />
    </Card>
  );
};

export default StudentProgress;

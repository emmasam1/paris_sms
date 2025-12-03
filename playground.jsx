import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Space,
  Tabs,
  Skeleton,
  message,
  Select,
} from "antd";
import {
  EditOutlined,
  BarChartOutlined,
  UserOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  FormOutlined,
} from "@ant-design/icons";
import EnterResult from "../../../components/result/EnterResult";
import ProgressChart from "../../../components/progress/ProgressChart";
import ResultSheet from "../../../components/resultSheet/ResultSheet";
import axios from "axios";
import { useApp } from "../../../context/AppContext";

const { TabPane } = Tabs;
const { Option } = Select;

const MyClasses = () => {
  const { token, API_BASE_URL } = useApp();

  // UI state
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isViewResultModalOpen, setIsViewResultModalOpen] = useState(false);

  // active row / subject
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeSubjects, setActiveSubjects] = useState(null);
  const [subject, setSubject] = useState(null); // teacherSubject from API
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  // teacher data structure: levels -> classes -> students
  const [teacherData, setTeacherData] = useState([]); // full payload: data[]
  const [levels, setLevels] = useState([]); // ["JSS1","JSS3"...]
  const [arms, setArms] = useState([]); // arms for selected level (array of arm strings)

  // selects
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedArm, setSelectedArm] = useState(null);

  // students shown in the table
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // loading & messages
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // pagination for students table
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!selectedLevel || !selectedArm) {
      setFilteredSubjects([]);
      setSelectedSubject(null);
      return;
    }

    // Find the level object
    const levelObj = teacherData.find((l) => l.level === selectedLevel);
    if (!levelObj) return;

    // Find the selected arm class
    const classObj = levelObj.classes?.find(
      (c) => c.class?.arm === selectedArm || c.class?.name === selectedArm
    );

    if (!classObj) return;

    // Get subject(s) for that class
    if (classObj?.subject?.length) {
      setFilteredSubjects(classObj.subject);
      // auto-select first subject if none selected
      setSelectedSubject(classObj.subject[0]._id);
    } else if (classObj?.subject) {
      setFilteredSubjects([classObj.subject]);
      setSelectedSubject(classObj.subject._id);
    } else {
      setFilteredSubjects([]);
      setSelectedSubject(null);
    }

    // Fetch students for that class
    fetchStudentsForClass(1, limit);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel, selectedArm]);

  // ---------------------------
  // Fetch teacher-levels/classes (structure)
  // ---------------------------
  const getTeacherClassDetails = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // 1️⃣ Fetch teacher classes + students
      const res = await axios.get(`${API_BASE_URL}/api/teacher/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      //get all subjects
      const sub = await axios.get(
        `${API_BASE_URL}/api/subject-management/subjects?limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Save to state
      setSubjects(sub?.data?.data || []);

      console.log("all subjects", sub);

      messageApi.success(res.data.message);

      const allLevels = res?.data?.data || [];
      setTeacherData(allLevels);

      // Extract subject (same behavior you had before)
      const responseSubject =
        res?.data?.data?.[0]?.subject || res?.data?.subject;
      if (responseSubject) setSubject(responseSubject);

      // Extract levels and remove duplicates
      const levelList = [...new Set(allLevels.map((item) => item.level))];
      setLevels(levelList);

      // Auto-select first level if none selected
      if (!selectedLevel && levelList.length > 0) {
        setSelectedLevel(levelList[0]);
      }

      // 2️⃣ Get classId + subjectId for STATUS fetch
      const classId = allLevels?.[0]?.classes?.[0]?.class?._id;
      const subjectId = responseSubject?._id;

      if (classId && subjectId) {
        // 3️⃣ Fetch score status
        const resultRes = await axios.get(
          `${API_BASE_URL}/api/records/teacher/scores/dashboard?classId=${classId}&subjectId=${subjectId}&session=2025/2026&term=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("the result", resultRes);

        // 4️⃣ Merge status into students
        const studentsWithStatus = allLevels.map((item) => {
          const studentList = item.students || [];

          const updatedStudents = studentList.map((student) => {
            const found = resultRes.data.students.find(
              (s) => s.studentId === student._id
            );

            return {
              ...student,
              hasRecord: found?.status === "recorded",
            };
          });

          return {
            ...item,
            students: updatedStudents,
          };
        });

        // console.log("result", resultRes);
        // console.log("responce from class", res);
        // console.log("has r", hasRecord);

        setTeacherData(studentsWithStatus);
      }
    } catch (err) {
      console.error("getTeacherClassDetails error:", err);
      // messageApi.error("Unable to fetch teacher class details.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // When selectedLevel changes, update arms list and reset arm/students
  // ---------------------------
  useEffect(() => {
    if (!selectedLevel) {
      setArms([]);
      setSelectedArm(null);
      setStudents([]);
      setTotal(0);
      return;
    }

    // find the matching level object in teacherData
    const found = teacherData.find((item) => item.level === selectedLevel);
    const classArms = (found?.classes || []).map(
      (c) => c.class?.arm || c.class?.name
    );
    setArms(classArms);
    setSelectedArm(null); // reset arm when level changes
    setStudents([]);
    setTotal(0);
    setPage(1);
  }, [selectedLevel, teacherData]);

  // ---------------------------
  // Fetch students for selected level+arm with pagination
  // ---------------------------
  const fetchStudentsForClass = async (pageParam = 1, limitParam = limit) => {
    if (!token || !selectedLevel || !selectedArm) return;

    try {
      setLoading(true);

      // 1️⃣ Fetch students
      const url = new URL(`${API_BASE_URL}/api/teacher/students`);
      url.searchParams.append("level", selectedLevel);
      url.searchParams.append("arm", selectedArm);
      url.searchParams.append("page", pageParam);
      url.searchParams.append("limit", limitParam);

      const res = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("fetchStudentsForClass", res);

      const data = res?.data;
      let classStudents = [];

      if (data?.data?.length) {
        const levelObj = data.data[0];

        const matchedClass = levelObj.classes?.find(
          (c) => (c.class?.arm || c.class?.name) === selectedArm
        );

        classStudents = matchedClass?.students || [];
      } else if (data?.students) {
        classStudents = data.students;
      }

      // 2️⃣ Extract classId and subjectId for status fetch
      const classId = data?.data?.[0]?.classes?.find(
        (c) => (c.class?.arm || c.class?.name) === selectedArm
      )?.class?._id;

      if (!selectedSubject) {
        setStudents(classStudents);
        return;
      }

      const realSubjectId = selectedSubject;

      if (!classId || !realSubjectId) {
        console.warn("Missing classId or subjectId. Cannot fetch status.");
        setStudents(classStudents);
        return;
      }

      // 3️⃣ Fetch result statuses
      const scoreRes = await axios.get(
        `${API_BASE_URL}/api/records/teacher/scores/dashboard?classId=${classId}&subjectId=${realSubjectId}&session=2025/2026&term=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const statusList = scoreRes.data.students || [];

      // 4️⃣ Merge status into fetched students
      const mergedStudents = classStudents.map((stu) => {
        const found = statusList.find((s) => s.studentId === stu._id);
        return {
          ...stu,
          hasRecord: found?.status === "recorded",
        };
      });

      // 5️⃣ Save final merged list
      setStudents(mergedStudents);

      // pagination
      const pagination = data?.pagination;
      if (pagination) {
        setPage(pagination.page);
        setLimit(pagination.limit);
        setTotal(pagination.total);
      } else {
        setTotal(mergedStudents.length);
      }
    } catch (err) {
      console.error("fetchStudentsForClass ERROR:", err);
      // messageApi.error("Unable to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  // call fetchStudents when selectedArm or page changes
  useEffect(() => {
    // whenever arm changes, fetch page 1
    if (selectedArm) {
      fetchStudentsForClass(1, limit);
    } else {
      setStudents([]);
      setTotal(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArm, selectedLevel]);

  // handling pagination change triggered by table
  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    if (newPageSize && newPageSize !== limit) setLimit(newPageSize);
    fetchStudentsForClass(newPage, newPageSize || limit);
  };

  // ---------------------------
  // Initialize on mount
  // ---------------------------
  useEffect(() => {
    getTeacherClassDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // Form submit callback (from EnterResult)
  // ---------------------------
  const handleSubmit = (response) => {
    if (response?.success) {
      // update specific student row to show Entered
      setStudents((prev) =>
        prev.map((student) =>
          student._id === activeStudent?._id
            ? { ...student, hasRecord: true }
            : student
        )
      );
    }
  };

  // ---------------------------
  // Columns
  // ---------------------------
  const studentColumns = [
    { title: "Reg No", dataIndex: "admissionNumber", key: "admissionNumber" },
    { title: "Name", dataIndex: "fullName", key: "fullName" },
    {
      title: "Class",
      key: "class",
      render: (_, record) => {
        // the API student.class might be id string or object; try to show selectedLevel and arm
        const className = selectedLevel || record.class?.name || "Not Assigned";
        const armName = selectedArm || record.class?.arm || "";
        return `${className}${armName ? ` - ${armName}` : ""}`;
      },
    },
  ];

  const resultsColumns = [
    { title: "Reg No", dataIndex: "admissionNumber", key: "admissionNumber" },
    { title: "Name", dataIndex: "fullName", key: "fullName" },
    {
      title: "Status",
      width: 120,
      render: (_, record) =>
        record.hasRecord ? (
          <span style={{ color: "green", fontWeight: 600 }}>
            <CheckCircleOutlined /> Entered
          </span>
        ) : (
          <span style={{ color: "red", fontWeight: 600 }}>Not Entered</span>
        ),
    },
    {
      title: "Actions",
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            style={{ backgroundColor: "#52c41a" }}
            onClick={() => {
              setActiveStudent(record);
              setActiveSubjects(record.subjects || []);
              setIsResultModalOpen(true);
            }}
          >
            Enter
          </Button>

          <Button
            type="primary"
            size="small"
            icon={<FormOutlined />}
            onClick={() => {
              setActiveStudent(record);
              setIsResultModalOpen(true);
            }}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const progressColumns = [
    { title: "Reg No", dataIndex: "admissionNumber", key: "admissionNumber" },
    { title: "Name", dataIndex: "fullName", key: "fullName" },
    {
      title: "Actions",
      width: 200,
      render: (_, record) => (
        <Button
          type="default"
          size="small"
          icon={<BarChartOutlined />}
          onClick={() => {
            setActiveStudent(record);
            setIsProgressModalOpen(true);
          }}
        >
          View Progress
        </Button>
      ),
    },
  ];

  return (
    <div className="flex gap-6">
      {contextHolder}
      <div className="flex-1">
        <Card className="shadow-md rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Select
              placeholder="Select Level"
              style={{ width: 220 }}
              value={selectedLevel}
              onChange={(value) => setSelectedLevel(value)}
              loading={loading && !levels.length}
              allowClear
            >
              {levels.map((lvl) => (
                <Option key={lvl} value={lvl}>
                  {lvl}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="Select Subject"
              style={{ width: 220 }}
              value={selectedSubject}
              onChange={(value) => setSelectedSubject(value)}
              loading={loading && !filteredSubjects.length}
              allowClear
            >
              {filteredSubjects.map((subject) => (
                <Select.Option key={subject._id} value={subject._id}>
                  {subject.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Select Arm"
              style={{ width: 260 }}
              value={selectedArm}
              onChange={(value) => setSelectedArm(value)}
              loading={loading && !!selectedLevel}
              disabled={!arms.length}
              allowClear
            >
              {arms.map((arm) => (
                <Option key={arm} value={arm}>
                  {arm}
                </Option>
              ))}
            </Select>
          </div>

          <Tabs defaultActiveKey="1">
            {/* STUDENT TAB */}
            <TabPane
              tab={
                <span>
                  <UserOutlined /> My Students
                </span>
              }
              key="1"
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 7 }} />
              ) : (
                <Table
                  dataSource={students}
                  columns={studentColumns}
                  rowKey="_id"
                  bordered
                  size="small"
                  pagination={{
                    current: page,
                    total: total,
                    pageSize: limit,
                    onChange: handlePageChange,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    position: ["bottomCenter"],
                    className: "custom-pagination",
                  }}
                  scroll={{ x: "max-content" }}
                />
              )}
            </TabPane>

            {/* RESULTS TAB */}
            <TabPane
              tab={
                <span>
                  <EditOutlined /> Results
                </span>
              }
              key="2"
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 7 }} />
              ) : (
                <Table
                  dataSource={students}
                  rowKey="_id"
                  bordered
                  size="small"
                  pagination={{
                    current: page,
                    total: total,
                    pageSize: limit,
                    onChange: handlePageChange,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    position: ["bottomCenter"],
                    className: "custom-pagination",
                  }}
                  scroll={{ x: "max-content" }}
                  columns={resultsColumns}
                />
              )}

              <EnterResult
                open={isResultModalOpen}
                onClose={() => setIsResultModalOpen(false)}
                student={activeStudent}
                subjects={activeSubjects}
                teacherSubject={subject}
                onClick={handleSubmit}
                selectedLevel={selectedLevel}
              />

              <Modal
                title={`Result Sheet - ${activeStudent?.fullName}`}
                open={isViewResultModalOpen}
                onCancel={() => setIsViewResultModalOpen(false)}
                footer={null}
                width={800}
              >
                <ResultSheet student={activeStudent} />
              </Modal>
            </TabPane>

            {/* PROGRESS TAB */}
            <TabPane
              tab={
                <span>
                  <BarChartOutlined /> Progress
                </span>
              }
              key="3"
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 7 }} />
              ) : (
                <Table
                  dataSource={students}
                  columns={progressColumns}
                  rowKey="_id"
                  bordered
                  size="small"
                  pagination={{
                    current: page,
                    total: total,
                    pageSize: limit,
                    onChange: handlePageChange,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "50"],
                    position: ["bottomCenter"],
                    className: "custom-pagination",
                  }}
                  scroll={{ x: "max-content" }}
                />
              )}

              <Modal
                title={`Progress - ${activeStudent?.fullName}`}
                open={isProgressModalOpen}
                onCancel={() => setIsProgressModalOpen(false)}
                footer={null}
                width={600}
              >
                <ProgressChart studentName={activeStudent?.fullName} />
              </Modal>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default MyClasses;

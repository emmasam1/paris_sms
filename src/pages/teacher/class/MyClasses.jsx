// MyClasses.jsx (cleaned version)
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
  Form,
  Input,
  Row,
  Col,
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
// import ProgressChart from "../../../components/progress/ProgressChart";
import ResultSheet from "../../../components/resultSheet/ResultSheet";
import axios from "axios";
import { useApp } from "../../../context/AppContext";

const { TabPane } = Tabs;
const { Option } = Select;

const MyClasses = () => {
  const { token, API_BASE_URL } = useApp();
  const [form] = Form.useForm();

  // UI state
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  // const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isViewResultModalOpen, setIsViewResultModalOpen] = useState(false);

  // active row / subject
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeSubjects, setActiveSubjects] = useState(null);
  const [subject, setSubject] = useState(null); // teacherSubject from API (raw)
  // IMPORTANT: selectedSubject is the subject ID (string). This avoids confusion when API returns object sometimes.
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [studentsRecord, setStudentsRecord] = useState([]);

  // teacher data structure: levels -> classes -> students
  // teacherData holds the API payload as-is (array of entries: { level, subject, classes, totalStudents })
  const [teacherData, setTeacherData] = useState([]);
  const [levels, setLevels] = useState([]); // unique level strings
  const [arms, setArms] = useState([]); // arms for selected level

  // selects
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedArm, setSelectedArm] = useState(null);

  // students shown in the table
  const [students, setStudents] = useState([]);
  // subjects shown in Subject dropdown (for user to pick). Each item: {_id, name}
  const [subjects, setSubjects] = useState([]);

  // loading & messages
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);
  const [editStudentRecord, setEditStudentRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  // safe guard: editStudentRecord may be null
  const isJSS = !!editStudentRecord?.class?.name
    ?.toLowerCase?.()
    .includes?.("jss");

  const maxScores = isJSS
    ? {
        firstAssignment: 10,
        secondAssignment: 10,
        firstCA: 20,
        secondCA: 20,
        exam: 40,
      }
    : {
        firstAssignment: 5,
        secondAssignment: 5,
        firstCA: 10,
        secondCA: 10,
        exam: 70,
      };

  // LIVE VALIDATION for edit modal
  const validateScore = (changedValues, allValues) => {
    const newErrors = {};
    Object.keys(maxScores).forEach((key) => {
      if (Number(allValues[key]) > maxScores[key]) {
        newErrors[key] = true;
      }
    });
    setErrors(newErrors);
  };

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  // ---------------------------
  // GET teacher class details (levels, classes, subjects, students)
  // ---------------------------
  const getTeacherClassDetails = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/teacher/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      messageApi.success(res.data.message);

      const allLevels = res?.data?.data || [];
      // keep full raw payload (we'll search it later)
      setTeacherData(allLevels);

      // Save top-level subject if present (legacy)
      const responseSubject =
        res?.data?.data?.[0]?.subject || res?.data?.subject;
      if (responseSubject) setSubject(responseSubject);

      // build unique level list:
      const levelList = [...new Set(allLevels.map((item) => item.level))];
      setLevels(levelList);

      // IMPORTANT: do NOT auto-select level/arm/subject so user picks them explicitly.
      // This prevents unexpected data loading when teacher has multiple subjects for same level/class.
      setSelectedLevel(null);
      setSelectedArm(null);
      setSelectedSubject(null);

      // Pre-populate `subjects` dropdown with distinct subjects available for the teacher
      const subjMap = new Map();
      allLevels.forEach((entry) => {
        if (entry.subject && entry.subject._id) {
          subjMap.set(entry.subject._id, {
            _id: entry.subject._id,
            name: entry.subject.name,
          });
        }
      });
      setSubjects(Array.from(subjMap.values()));
    } catch (error) {
      console.error("getTeacherClassDetails error:", error);
      messageApi.error(
        error?.response?.data?.message ||
          "Unable to fetch teacher class details."
      );
    } finally {
      setLoading(false);
    }
  };

  // Init
  useEffect(() => {
    getTeacherClassDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // when selectedLevel changes -> compute arms for that level, reset downstream selects
  // ---------------------------
  useEffect(() => {
    if (!selectedLevel) {
      setArms([]);
      setSelectedArm(null);
      setStudents([]);
      setTotal(0);
      return;
    }

    // find entries matching this level (teacherData may contain multiple entries per level if teacher teaches multiple subjects)
    const entriesForLevel = teacherData.filter(
      (e) => e.level === selectedLevel
    );

    // gather unique arms present across classes for this level (merge across subjects)
    const armsSet = new Set();
    entriesForLevel.forEach((entry) => {
      (entry.classes || []).forEach((c) => {
        const arm = c.class?.arm || c.class?.name;
        if (arm) armsSet.add(arm);
      });
    });

    setArms(Array.from(armsSet));
    // reset arm & subject selection so user must explicitly choose
    setSelectedArm(null);
    setSelectedSubject(null);
    setStudents([]);
    setTotal(0);
    setPage(1);
  }, [selectedLevel, teacherData]);

  // ---------------------------
  // When selectedLevel or selectedArm or selectedSubject changes:
  // Only fetch students AFTER user has selected level + arm + subject (explicit requirement).
  // ---------------------------
  useEffect(() => {
    if (selectedLevel && selectedArm && selectedSubject) {
      // fetch page 1
      fetchStudentsForClass(1, limit);
      // also fetch records (view/edit) if needed
      getRecord();
    } else {
      setStudents([]);
      setStudentsRecord([]);
      setTotal(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel, selectedArm, selectedSubject]);

  // ---------------------------
  // Helper: find the teacherData entry that matches level+arm+subjectId
  // (teacherData entries are per-level-per-subject typically)
  // ---------------------------
  const findEntryForSelection = (level, arm, subjectId) => {
    if (!level || !arm || !subjectId) return null;

    // First try to find an entry where level matches and subject._id matches
    const bySubject = teacherData.find(
      (e) =>
        e.level === level &&
        (e.subject?._id === subjectId || e.subject === subjectId)
    );
    if (bySubject) return bySubject;

    // Fallback: find any entry with same level and class arm (useful if backend structure differs)
    return teacherData.find(
      (e) =>
        e.level === level &&
        (e.classes || []).some((c) => (c.class?.arm || c.class?.name) === arm)
    );
  };

  // ---------------------------
  // Fetch students for selected level+arm+subject with pagination
  // ---------------------------
  const fetchStudentsForClass = async (pageParam = 1, limitParam = limit) => {
    if (!token || !selectedLevel || !selectedArm || !selectedSubject) return;

    try {
      setLoading(true);

      // API in your app supports query params; pass selectedLevel/Arm/Subject
      const url = new URL(`${API_BASE_URL}/api/teacher/students`);
      url.searchParams.append("level", selectedLevel);
      url.searchParams.append("arm", selectedArm);
      url.searchParams.append("subject", selectedSubject);
      url.searchParams.append("page", pageParam);
      url.searchParams.append("limit", limitParam);

      const res = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      // fetch all subjects for subjects dropdown (keep it small)
      const subRes = await axios.get(
        `${API_BASE_URL}/api/subject-management/subjects?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const allSubjectsList =
        subRes?.data?.data?.map((s) => ({ _id: s._id, name: s.name })) || [];
      setSubjects(allSubjectsList);

      const data = res?.data;
      let classStudents = [];

      // Backend returns different shapes: data.data (levels array) OR data.students (direct)
      if (data?.data?.length) {
        // Find the specific entry matching level + subject
        const entry = findEntryForSelection(
          selectedLevel,
          selectedArm,
          selectedSubject
        );

        if (entry) {
          // find matched class inside the entry
          const matchedClass = (entry.classes || []).find(
            (c) =>
              (c.class?.arm || c.class?.name || "").toLowerCase() ===
              selectedArm.toLowerCase()
          );
          classStudents = matchedClass?.students || [];
        } else {
          // As fallback, use first-level object's classes that match arm
          const fallback = data.data[0];
          const matchedClass = (fallback.classes || []).find(
            (c) => (c.class?.arm || c.class?.name) === selectedArm
          );
          classStudents = matchedClass?.students || [];
        }
      } else if (data?.students) {
        classStudents = data.students;
      }

      // If no students found, set empty and return after warning
      if (!classStudents || classStudents.length === 0) {
        setStudents([]);
        setTotal(0);
        // still attempt to fetch status (dashboard) if we have classId & subjectId below, otherwise return
      }

      // Extract classId robustly
      const classId =
        data?.data?.[0]?.classes?.find(
          (c) => (c.class?.arm || c.class?.name) === selectedArm
        )?.class?._id || // from response
        // fallback: find entry and class there
        (() => {
          const entry = findEntryForSelection(
            selectedLevel,
            selectedArm,
            selectedSubject
          );
          const matched = entry?.classes?.find(
            (c) => (c.class?.arm || c.class?.name) === selectedArm
          );
          return matched?.class?._id;
        })();

      const subjectId = selectedSubject; // we keep selectedSubject as id

      if (!classId || !subjectId) {
        // no class or subject id — skip status fetch but populate students
        setStudents(classStudents);
        setTotal(classStudents.length);
        return;
      }

      // Fetch result statuses for this class+subject
      const dashboardURL = `${API_BASE_URL}/api/records/teacher/scores/dashboard?classId=${classId}&subjectId=${subjectId}&session=2025/2026&term=1`;
      const scoreRes = await axios.get(dashboardURL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusList = scoreRes?.data?.students || [];

      // Merge status into fetched students
      const mergedStudents = (classStudents || []).map((stu) => {
        const studentId = stu._id || stu.id;
        const found = statusList.find((s) => s.studentId === studentId);
        return { ...stu, hasRecord: found?.status === "recorded" };
      });

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
    } catch (error) {
      console.error("fetchStudentsForClass ERROR:", error);
      messageApi.error(
        error?.response?.data?.message ||
          "No students in this class offer this subject"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Get all subjects (simple listing) - kept but not used as primary source (we also populate from teacherData)
  // ---------------------------
  const getSubjects = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/subject-management/subjects?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const cleaned =
        res.data?.data?.map((s) => ({ _id: s._id, name: s.name })) || [];
      setSubjects(cleaned);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // Get existing records (used in View & Edit tab)
  // ---------------------------
  const getRecord = async (subjectIdParam) => {
    const subjectId = subjectIdParam || selectedSubject;
    if (!subjectId) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/teacher/records?subjectId=${subjectId}&session=2025/2026&term=1&limit=2000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const results = res.data?.data?.results;
      if (!Array.isArray(results) || results.length === 0) {
        // clear existing records
        setStudentsRecord([]);
        return;
      }

      const mappedStudents = results.map((item) => ({
        key: item._id,
        recordId: item._id,
        studentId: item.student._id, // <-- FIXED
        fullName: `${item.student.firstName} ${item.student.lastName}`,
        admissionNumber: item.student.admissionNumber || "-",
        gender: item.gender || "-",
        class: item.student.class,
        record: {
          firstAssignment: item.firstAssignment,
          secondAssignment: item.secondAssignment,
          firstCA: item.firstCA,
          secondCA: item.secondCA,
          exam: item.exam,
          total: item.total,
          grade: item.grade,
          teacherRemark: item.teacherRemark,
        },
        subject: item.subject?.name || subjectId,
        status: item.status || "-",
      }));

      setStudentsRecord(mappedStudents);
      console.log(mappedStudents)
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Pagination handler for students table
  // ---------------------------
  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    if (newPageSize && newPageSize !== limit) setLimit(newPageSize);
    fetchStudentsForClass(newPage, newPageSize || limit);
  };

  // ---------------------------
  // After entering result -> update UI
  // ---------------------------
  const handleSubmit = (response) => {
    if (response?.success) {
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
        const className = record.class?.name || selectedLevel || "Not Assigned";
        const armName = record.class?.arm || selectedArm || "";
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
      width: 50,
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
        </Space>
      ),
    },
  ];

  // const progressColumns = [
  //   { title: "Reg No", dataIndex: "admissionNumber", key: "admissionNumber" },
  //   { title: "Name", dataIndex: "fullName", key: "fullName" },
  //   {
  //     title: "Actions",
  //     width: 200,
  //     render: (_, record) => (
  //       <Button
  //         type="default"
  //         size="small"
  //         icon={<BarChartOutlined />}
  //         onClick={() => {
  //           setActiveStudent(record);
  //           setIsProgressModalOpen(true);
  //         }}
  //       >
  //         View Progress
  //       </Button>
  //     ),
  //   },
  // ];

  const columns = [
    {
      title: "S/N",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
    },
    {
      title: "Class",
      render: (record) => {
        const name = record.class?.name;
        const arm = record.class?.arm;
        if (name && arm) return `${name} - ${arm}`;
        if (name) return name;
        if (arm) return arm;
        return "-";
      },
    },
    {
      title: "Subject",
      dataIndex: "subject",
    },
    {
      title: "1st ASS",
      render: (record) => record.record?.firstAssignment ?? 0,
    },
    {
      title: "2nd ASS",
      render: (record) => record.record?.secondAssignment ?? 0,
    },
    {
      title: "1st CA",
      render: (record) => record.record?.firstCA ?? 0,
    },
    {
      title: "2nd CA",
      render: (record) => record.record?.secondCA ?? 0,
    },
    {
      title: "Exam",
      render: (record) => record.record?.exam ?? 0,
    },
    {
      title: "Total",
      render: (record) => record.record?.total ?? 0,
    },
    {
      title: "Grade",
      render: (record) => record.record?.grade ?? "-",
    },
    {
      title: "Actions",
      width: 50,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<FormOutlined />}
            onClick={() => {
              setEditStudentRecord(record);
              setIsEditRecordModalOpen(true);
            }}
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="flex gap-6">
      {contextHolder}
      <div className="flex-1">
        <Card className="shadow-md rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            {/* LEVEL SELECT */}
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

            {/* SUBJECT SELECT */}
            <Select
              placeholder="Select Subject"
              style={{ width: 260 }}
              value={selectedSubject}
              onChange={(value) => {
                // value is subject id
                setSelectedSubject(value);
                // when a new subject is selected, clear students so they reload via effect
                setStudents([]);
                setStudentsRecord([]);
              }}
              disabled={!selectedLevel}
              allowClear
            >
              {subjects?.map((sub) => (
                <Select.Option key={sub._id} value={sub._id}>
                  {sub.name}
                </Select.Option>
              ))}
            </Select>

            {/* ARM SELECT */}
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

            <Button
              onClick={() => {
                if (!selectedLevel || !selectedArm || !selectedSubject) {
                  message.error("Select Level, Subject and Arm first");
                  return;
                }
                // manual trigger (optional) — fetches records & students
                fetchStudentsForClass(1, limit);
                getRecord();
              }}
            >
              Get Record
            </Button>
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
                  rowKey={(r) => r._id || r.id}
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
                  rowKey={(r) => r._id || r.id}
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
                teacherSubject={
                  subjects?.find((s) => s._id === selectedSubject)?.name
                }
                onClick={handleSubmit}
                selectedLevel={selectedLevel}
                selectedSubject={selectedSubject}
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

            {/* VIEW & EDIT RECORD */}
            <TabPane
              tab={
                <span>
                  <BarChartOutlined /> View and Edit Record
                </span>
              }
              key="3"
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 7 }} />
              ) : (
                <Table
                  columns={columns}
                  size="small"
                  bordered
                  dataSource={studentsRecord}
                  rowKey={(item) => item.studentId || item._id}
                  loading={loading}
                  pagination={{
                    position: ["bottomCenter"],
                    className: "custom-pagination",
                  }}
                  scroll={{ x: "max-content" }}
                />
              )}
            </TabPane>

            {/* PROGRESS */}
            {/* <TabPane
              tab={
                <span>
                  <BarChartOutlined /> Progress
                </span>
              }
              key="4"
            >
              {loading ? (
                <Skeleton active paragraph={{ rows: 7 }} />
              ) : (
                <Table
                  dataSource={students}
                  columns={progressColumns}
                  rowKey={(r) => r._id || r.id}
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
            </TabPane> */}
          </Tabs>
        </Card>
      </div>

      {/* EDIT RECORD MODAL */}
      <Modal
        title={`Edit Record - ${editStudentRecord?.fullName}`}
        open={isEditRecordModalOpen}
        onCancel={() => setIsEditRecordModalOpen(false)}
        footer={null}
        width={550}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            firstAssignment: editStudentRecord?.record?.firstAssignment,
            secondAssignment: editStudentRecord?.record?.secondAssignment,
            firstCA: editStudentRecord?.record?.firstCA,
            secondCA: editStudentRecord?.record?.secondCA,
            exam: editStudentRecord?.record?.exam,
            grade: editStudentRecord?.record?.grade,
            teacherRemark: editStudentRecord?.record?.teacherRemark,
          }}
          onValuesChange={validateScore}
          onFinish={async (values) => {
            const id = editStudentRecord.recordId;
            try {
              setIsSubmitting(true);

              const payload = {
                recordId: id,
                firstAssignment: values.firstAssignment,
                secondAssignment: values.secondAssignment,
                firstCA: values.firstCA,
                secondCA: values.secondCA,
                exam: values.exam,
              };

              await axios.patch(
                `${API_BASE_URL}/api/records/update-score`,
                payload,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              // UPDATE LOCAL UI
              setStudentsRecord((prev) =>
                prev.map((stu) =>
                  stu.recordId === editStudentRecord.recordId
                    ? { ...stu, record: { ...stu.record, ...values } }
                    : stu
                )
              );

              messageApi.success("Record updated successfully!");
              setIsEditRecordModalOpen(false);
            } catch (error) {
              console.log("❌ API Error:", error);
              messageApi.error("Failed to update record");
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <Row gutter={8}>
            <Col>
              <Form.Item label="1st ASS" name="firstAssignment">
                <Input
                  type="number"
                  style={{
                    width: 70,
                    borderColor: errors.firstAssignment ? "red" : undefined,
                    background: errors.firstAssignment ? "#ffe5e5" : undefined,
                  }}
                  max={maxScores.firstAssignment}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="2nd ASS" name="secondAssignment">
                <Input
                  type="number"
                  style={{
                    width: 70,
                    borderColor: errors.secondAssignment ? "red" : undefined,
                    background: errors.secondAssignment ? "#ffe5e5" : undefined,
                  }}
                  max={maxScores.secondAssignment}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="1st CA" name="firstCA">
                <Input
                  type="number"
                  style={{
                    width: 70,
                    borderColor: errors.firstCA ? "red" : undefined,
                    background: errors.firstCA ? "#ffe5e5" : undefined,
                  }}
                  max={maxScores.firstCA}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="2nd CA" name="secondCA">
                <Input
                  type="number"
                  style={{
                    width: 70,
                    borderColor: errors.secondCA ? "red" : undefined,
                    background: errors.secondCA ? "#ffe5e5" : undefined,
                  }}
                  max={maxScores.secondCA}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="Exam" name="exam">
                <Input
                  type="number"
                  style={{
                    width: 70,
                    borderColor: errors.exam ? "red" : undefined,
                    background: errors.exam ? "#ffe5e5" : undefined,
                  }}
                  max={maxScores.exam}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="Grade" name="grade">
                <Input
                  style={{
                    width: 70,
                    borderColor: errors.grade ? "red" : undefined,
                    background: errors.grade ? "#ffe5e5" : undefined,
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={isSubmitting}
              disabled={Object.keys(errors).length > 0}
            >
              Update Record
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MyClasses;

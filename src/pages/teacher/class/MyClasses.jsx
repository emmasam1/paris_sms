// MyClasses.jsx
import React, { useEffect, useState, useMemo } from "react";
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
  Spin,
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
  const [isViewResultModalOpen, setIsViewResultModalOpen] = useState(false);

  // active row / subject
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeSubjects, setActiveSubjects] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [studentsRecord, setStudentsRecord] = useState([]);

  const [teacherData, setTeacherData] = useState([]);
  const [levels, setLevels] = useState([]); // unique level strings
  const [arms, setArms] = useState([]); // arms for selected level

  // selects
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedArm, setSelectedArm] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState(null);

  // students shown in the table
  const [students, setStudents] = useState([]);

  const [subjects, setSubjects] = useState([]);

  // loading & messages
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);
  const [editStudentRecord, setEditStudentRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  const [academicSessions, setAcademicSessions] = useState([]);
  const [selectedAcademicSession, setSelectedAcademicSession] = useState(null);

  const generateSessions = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startYear = month >= 8 ? year : year - 1;

    return [`${startYear}/${startYear + 1}`];
  };

  const sessions = useMemo(() => generateSessions(), []);

  useEffect(() => {
    setAcademicSessions(sessions);
  }, [sessions]);

  // Robust check for JSS vs SS level
  const classNameStr = (
    editStudentRecord?.class?.name ||
    selectedLevel ||
    ""
  ).toLowerCase();

  const isJSS = classNameStr.includes("jss") || !classNameStr.includes("ss");

  const maxScores = isJSS
    ? {
        attendance: 5,
        note: 5,
        firstAssignment: 10,
        firstCA: 20,
        secondCA: 20,
        exam: 40,
      }
    : {
        attendance: 5,
        note: 5,
        firstCA: 10,
        secondCA: 20,
        exam: 60,
      };

  // LIVE VALIDATION for edit modal
  const validateScore = (changedValues, allValues) => {
    const newErrors = {};
    Object.keys(maxScores).forEach((key) => {
      if (
        allValues[key] !== undefined &&
        Number(allValues[key]) > maxScores[key]
      ) {
        newErrors[key] = true;
      }
    });
    setErrors(newErrors);
  };

  // Reset modal form whenever editStudentRecord changes
  useEffect(() => {
    if (editStudentRecord) {
      form.setFieldsValue({
        attendance: editStudentRecord?.record?.attendance ?? 0,
        note: editStudentRecord?.record?.note ?? 0,
        firstAssignment: editStudentRecord?.record?.firstAssignment ?? 0,
        firstCA: editStudentRecord?.record?.firstCA ?? 0,
        secondCA: editStudentRecord?.record?.secondCA ?? 0,
        exam: editStudentRecord?.record?.exam ?? 0,
        grade: editStudentRecord?.record?.grade ?? "",
        teacherRemark: editStudentRecord?.record?.teacherRemark ?? "",
      });
      setErrors({});
    }
  }, [editStudentRecord, form]);

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  // ---------------------------
  // GET teacher class details
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

      setTeacherData(allLevels);

      const levelList = [...new Set(allLevels.map((item) => item.level))];
      setLevels(levelList);

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

      setSelectedAcademicSession(null);
      setSelectedLevel(null);
      setSelectedArm(null);
      setSelectedSubject(null);
    } catch (error) {
      console.error("getTeacherClassDetails error:", error);
      messageApi.error(
        error?.response?.data?.message ||
          "Unable to fetch teacher class details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeacherClassDetails();
  }, []);

  useEffect(() => {
    if (!selectedAcademicSession) return;

    const filtered = teacherData.filter(
      (item) =>
        (item.academicSession || item.session) === selectedAcademicSession,
    );

    setLevels([...new Set(filtered.map((i) => i.level))]);
  }, [selectedAcademicSession, teacherData]);

  useEffect(() => {
    if (!selectedLevel) {
      setArms([]);
      setSelectedArm(null);
      setStudents([]);
      setTotal(0);
      return;
    }

    const entriesForLevel = teacherData.filter(
      (e) => e.level === selectedLevel,
    );

    const armsSet = new Set();
    entriesForLevel.forEach((entry) => {
      (entry.classes || []).forEach((c) => {
        const arm = c.class?.arm || c.class?.name;
        if (arm) armsSet.add(arm);
      });
    });

    setArms([...armsSet]);
    setSelectedArm(null);
    setStudents([]);
    setTotal(0);
    setPage(1);
  }, [selectedLevel, teacherData]);

  useEffect(() => {
    setStudents([]);
    setStudentsRecord([]);
    setTotal(0);
  }, [
    selectedAcademicSession,
    selectedLevel,
    selectedArm,
    selectedSubject,
    selectedTerm,
  ]);

  const fetchStudentsForClass = async (pageParam = 1, limitParam = limit) => {
    if (
      !token ||
      !selectedLevel ||
      !selectedArm ||
      !selectedSubject ||
      !selectedTerm ||
      !selectedAcademicSession
    ) {
      messageApi.error("Please select all fields");
      return;
    }

    try {
      setTableLoading(true);

      const url = new URL(`${API_BASE_URL}/api/teacher/students`);
      url.searchParams.append("level", selectedLevel);
      url.searchParams.append("arm", selectedArm);
      url.searchParams.append("subject", selectedSubject);
      url.searchParams.append("session", selectedAcademicSession);
      url.searchParams.append("term", selectedTerm);
      url.searchParams.append("limit", 30);

      const res = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res?.data;

      let filteredEntries = [];
      if (Array.isArray(data?.data)) {
        filteredEntries = data.data.filter(
          (entry) =>
            entry.subject?._id === selectedSubject ||
            entry.subject === selectedSubject,
        );
      }

      let classStudents = [];
      let classId = null;

      for (const entry of filteredEntries) {
        const matchedClass = (entry.classes || []).find(
          (c) =>
            (c.class?.arm || c.class?.name || "").toLowerCase() ===
            selectedArm.toLowerCase(),
        );

        if (matchedClass) {
          classStudents = matchedClass.students || [];
          classId = matchedClass.class?._id;
          break;
        }
      }

      if (!classStudents.length && Array.isArray(data?.data)) {
        for (const entry of data.data) {
          const matchedClass = (entry.classes || []).find(
            (c) =>
              (c.class?.arm || c.class?.name || "").toLowerCase() ===
              selectedArm.toLowerCase(),
          );

          if (matchedClass) {
            classStudents = matchedClass.students || [];
            classId = matchedClass.class?._id;
            break;
          }
        }
      }

      if (!classStudents.length) {
        setStudents([]);
        setTotal(0);
        setTableLoading(false);
        return;
      }

      let mergedStudents = classStudents;

      if (classId && selectedSubject) {
        try {
          const dashboardURL =
            `${API_BASE_URL}/api/records/teacher/scores/dashboard` +
            `?classId=${classId}` +
            `&subjectId=${selectedSubject}` +
            `&session=${selectedAcademicSession}` +
            `&term=${selectedTerm}`;

          const scoreRes = await axios.get(dashboardURL, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const statusList = scoreRes?.data?.students || [];

          mergedStudents = classStudents.map((stu) => {
            const found = statusList.find(
              (s) => s.studentId === (stu._id || stu.id),
            );

            return {
              ...stu,
              hasRecord: found?.status === "recorded",
            };
          });
        } catch (err) {
          console.warn("Dashboard fetch failed");
        }
      }

      setTimeout(() => {
        setStudents(mergedStudents);
        setTotal(mergedStudents.length);
        setPage(pageParam);
        setLimit(30);

        setTableLoading(false);
      }, 500);
    } catch (error) {
      console.error("ERROR:", error);
      messageApi.error(
        error?.response?.data?.message || "No students found for this subject",
      );
      setTableLoading(false);
    }
  };

  const getSubjects = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/subject-management/subjects?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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
  }, []);

  const getRecord = async (subjectIdParam) => {
    const subjectId = subjectIdParam || selectedSubject;
    if (!subjectId) return;

    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/teacher/records` +
          `?subjectId=${subjectId}` +
          `&session=${selectedAcademicSession}` +
          `&term=${selectedTerm}` +
          `&limit=2000`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const results = res.data?.data?.results;
      if (!Array.isArray(results) || results.length === 0) {
        setStudentsRecord([]);
        return;
      }

      const mappedStudents = results.map((item) => ({
        key: item._id,
        recordId: item._id,
        studentId: item.student._id,
        fullName: `${item.student.firstName} ${item.student.lastName}`,
        admissionNumber: item.student.admissionNumber || "-",
        gender: item.gender || "-",
        class: item.student.class,
        record: {
          attendance: item.attendance ?? 0,
          note: item.note ?? 0,
          firstAssignment: item.assignment ?? item.firstAssignment ?? 0,
          firstCA: item.firstCA ?? 0,
          secondCA: item.secondCA ?? 0,
          exam: item.exam ?? 0,
          total: item.total ?? 0,
          grade: item.grade || "-",
          teacherRemark: item.teacherRemark || "-",
        },
        subject: item.subject?.name || subjectId,
        status: item.status || "-",
      }));

      setStudentsRecord(mappedStudents);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    if (newPageSize && newPageSize !== limit) setLimit(newPageSize);
    fetchStudentsForClass(newPage, newPageSize || limit);
  };

  const handleSubmit = (response) => {
    if (response?.success) {
      setStudents((prev) =>
        prev.map((student) =>
          student._id === activeStudent?._id
            ? { ...student, hasRecord: true }
            : student,
        ),
      );
    }
  };

  // ---------------------------
  // Dynamic Table Columns
  // ---------------------------
  const studentColumns = [
    {
      title: "S/N",
      key: "sn",
      render: (_, __, index) => index + 1,
    },
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
    {
      title: "S/N",
      key: "sn",
      render: (_, __, index) => index + 1,
    },
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
      title: "Att.",
      render: (record) => record.record?.attendance ?? 0,
    },
    {
      title: "Note",
      render: (record) => record.record?.note ?? 0,
    },
    ...(isJSS
      ? [
          {
            title: "1st ASS",
            render: (record) => record.record?.firstAssignment ?? 0,
          },
        ]
      : []),
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

  return (
    <div className="flex gap-6">
      {contextHolder}
      <div className="flex-1">
        <div className="flex flex-wrap gap-2 mb-4">
          {/* LEVEL */}
          <Select
            placeholder="Select Level"
            className="w-full sm:w-[120px]"
            value={selectedLevel}
            onChange={setSelectedLevel}
            loading={loading && !levels.length}
            allowClear
          >
            {levels.map((lvl) => (
              <Option key={lvl} value={lvl}>
                {lvl}
              </Option>
            ))}
          </Select>

          {/* SUBJECT */}
          <Select
            placeholder="Select Subject"
            className="w-full sm:w-[220px]"
            value={selectedSubject}
            onChange={(value) => {
              setSelectedSubject(value);
              setStudents([]);
              setStudentsRecord([]);
            }}
            disabled={!selectedLevel}
            allowClear
          >
            {subjects?.map((sub) => (
              <Option key={sub._id} value={sub._id}>
                {sub.name}
              </Option>
            ))}
          </Select>

          {/* ARM */}
          <Select
            placeholder="Select Arm"
            className="w-full sm:w-[180px]"
            value={selectedArm}
            onChange={setSelectedArm}
            disabled={!arms.length}
            allowClear
          >
            {arms.map((arm) => (
              <Option key={arm} value={arm}>
                {arm}
              </Option>
            ))}
          </Select>

          {/* SESSION */}
          <Select
            placeholder="Session"
            className="w-full sm:w-[150px]"
            value={selectedAcademicSession}
            onChange={setSelectedAcademicSession}
            allowClear
          >
            {academicSessions.map((sess) => (
              <Option key={sess} value={sess}>
                {sess}
              </Option>
            ))}
          </Select>

          {/* TERM */}
          <Select
            placeholder="Term"
            className="w-full sm:w-[140px]"
            value={selectedTerm}
            onChange={setSelectedTerm}
            allowClear
          >
            <Option value="1">1st Term</Option>
            <Option value="2">2nd Term</Option>
            <Option value="3">3rd Term</Option>
          </Select>

          {/* BUTTON */}
          <Button
            type="primary"
            className="w-full sm:w-auto"
            disabled={
              !selectedAcademicSession ||
              !selectedLevel ||
              !selectedArm ||
              !selectedSubject ||
              !selectedTerm
            }
            onClick={() => {
              fetchStudentsForClass(1, limit);
              getRecord();
            }}
            loading={loading}
          >
            {loading ? "Loading..." : "Get Record"}
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
            <Table
              dataSource={students}
              columns={studentColumns}
              rowKey={(r) => r._id || r.id}
              loading={{
                spinning: tableLoading,
                indicator: <Spin size="large" />,
              }}
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
            <Table
              dataSource={students}
              rowKey={(r) => r._id || r.id}
              bordered
              size="small"
              loading={{
                spinning: tableLoading,
                indicator: <Spin size="large" />,
              }}
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

            <EnterResult
              open={isResultModalOpen}
              onClose={() => setIsResultModalOpen(false)}
              student={activeStudent}
              teacherSubject={
                subjects?.find((s) => s._id === selectedSubject)?.name
              }
              onClick={handleSubmit}
              subjectId={selectedSubject}
              selectedLevel={selectedLevel}
              selectedSubject={selectedSubject}
              selectedSession={selectedAcademicSession}
              selectedTerm={selectedTerm}
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
            <div className="w-full overflow-x-auto">
              <Table
                columns={columns}
                size="small"
                bordered
                loading={{
                  spinning: tableLoading,
                  indicator: <Spin size="large" />,
                }}
                dataSource={studentsRecord}
                rowKey={(item) => item.studentId || item._id}
                pagination={{
                  position: ["bottomCenter"],
                  className: "custom-pagination",
                }}
                scroll={{ x: "max-content" }}
              />
            </div>
          </TabPane>
        </Tabs>
      </div>

      {/* EDIT RECORD MODAL */}
      <Modal
        title={`Edit Record - ${editStudentRecord?.fullName}`}
        open={isEditRecordModalOpen}
        onCancel={() => setIsEditRecordModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={validateScore}
          onFinish={async (values) => {
            const id = editStudentRecord.recordId;
            try {
              setIsSubmitting(true);

              const payload = {
                recordId: id,
                attendance: values.attendance,
                note: values.note,
                ...(isJSS && { assignment: values.firstAssignment }),
                firstCA: values.firstCA,
                secondCA: values.secondCA,
                exam: values.exam,
              };

              await axios.patch(
                `${API_BASE_URL}/api/records/update-score`,
                payload,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );

              setStudentsRecord((prev) =>
                prev.map((stu) =>
                  stu.recordId === editStudentRecord.recordId
                    ? { ...stu, record: { ...stu.record, ...values } }
                    : stu,
                ),
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
            <Col span={4}>
              <Form.Item label="Att." name="attendance">
                <Input
                  type="number"
                  style={{
                    borderColor: errors.attendance ? "red" : undefined,
                    background: errors.attendance ? "#ffe5e5" : undefined,
                  }}
                  max={maxScores.attendance}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Note" name="note">
                <Input
                  type="number"
                  style={{
                    borderColor: errors.note ? "red" : undefined,
                    background: errors.note ? "#ffe5e5" : undefined,
                  }}
                  max={maxScores.note}
                />
              </Form.Item>
            </Col>
            {isJSS && (
              <Col span={4}>
                <Form.Item label="1st ASS" name="firstAssignment">
                  <Input
                    type="number"
                    style={{
                      borderColor: errors.firstAssignment ? "red" : undefined,
                      background: errors.firstAssignment
                        ? "#ffe5e5"
                        : undefined,
                    }}
                    max={maxScores.firstAssignment}
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={4}>
              <Form.Item label="1st CA" name="firstCA">
                <Input
                  type="number"
                  style={{
                    borderColor: errors.firstCA ? "red" : undefined,
                    background: errors.firstCA ? "#ffe5e5" : undefined,
                  }}
                  max={maxScores.firstCA}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="2nd CA" name="secondCA">
                <Input
                  type="number"
                  style={{
                    borderColor: errors.secondCA ? "red" : undefined,
                    background: errors.secondCA ? "#ffe5e5" : undefined,
                  }}
                  max={maxScores.secondCA}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item label="Exam" name="exam">
                <Input
                  type="number"
                  style={{
                    borderColor: errors.exam ? "red" : undefined,
                    background: errors.exam ? "#ffe5e5" : undefined,
                  }}
                  max={maxScores.exam}
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

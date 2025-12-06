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
import ProgressChart from "../../../components/progress/ProgressChart";
import ResultSheet from "../../../components/resultSheet/ResultSheet";
import axios from "axios";
import { useApp } from "../../../context/AppContext";

const { TabPane } = Tabs;
const { Option } = Select;

const MyClasses = () => {
  const { token, API_BASE_URL } = useApp();
  const [form] = Form.useForm();

  // console.log(token, API_BASE_URL)

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
  const [studentsRecord, setStudentsRecord] = useState([]);

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

  const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);
  const [editStudentRecord, setEditStudentRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({});

  const isJSS = editStudentRecord?.class?.name?.toLowerCase().includes("jss");

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

  // LIVE VALIDATION
  const validateScore = (changedValues, allValues) => {
    const newErrors = {};
    Object.keys(maxScores).forEach((key) => {
      if (Number(allValues[key]) > maxScores[key]) {
        newErrors[key] = true;
      }
    });
    setErrors(newErrors);
  };

  // pagination for students table
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  // useEffect(() => {
  //   if (!selectedLevel || !selectedArm) {
  //     setFilteredSubjects([]);
  //     setSelectedSubject(null);
  //     return;
  //   }

  //   // Find the level object
  //   const levelObj = teacherData.find((l) => l.level === selectedLevel);
  //   if (!levelObj) return;

  //   // Find the selected arm class
  //   const classObj = levelObj.classes?.find(
  //     (c) => c.class?.arm === selectedArm || c.class?.name === selectedArm
  //   );

  //   if (!classObj) return;

  //   // Get subject(s) for that class
  //   const classSubject = classObj.subject || levelObj.subject || null;

  //   if (classSubject) {
  //     setFilteredSubjects([classSubject]);
  //     // setSelectedSubject(classSubject._id);
  //   } else {
  //     setFilteredSubjects([]);
  //     setSelectedSubject(null);
  //   }

  //   // Fetch students for that class
  //   fetchStudentsForClass(1, limit);

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedLevel, selectedArm]);

  useEffect(() => {
    if (selectedLevel && selectedArm) {
      fetchStudentsForClass(1, limit); // fetch page 1 of students
    } else {
      setStudents([]);
      setTotal(0);
    }
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

      // console.log(res)

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

        // console.log("the result", resultRes);

        // 4️⃣ Merge status into students
        const studentsWithStatus = allLevels.map((item) => {
          const studentList = item.students || [];

          const updatedStudents = studentList.map((student) => {
            const found = resultRes.data.students.find(
              (s) => s.studentId === student._id
            );

            console.log(found);

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

        setTeacherData(studentsWithStatus);
      }
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

      // Fetch students
      const url = new URL(`${API_BASE_URL}/api/teacher/students`);
      url.searchParams.append("level", selectedLevel);
      url.searchParams.append("arm", selectedArm);
      url.searchParams.append("subject", selectedSubject);
      url.searchParams.append("page", pageParam);
      url.searchParams.append("limit", limitParam);

      const res = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      // console.log("fetchStudentsForClass", res);

      // Get all subjects (teacherSubject)
      const sub = (
        await axios.get(
          `${API_BASE_URL}/api/subject-management/subjects?limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      ).data;

      const subjects =
        sub?.data?.map((e) => ({
          _id: e._id,
          name: e.name,
        })) || [];

      setSubjects(subjects);

      const data = res?.data;
      let classStudents = [];

      if (data?.data?.length) {
        const levelObj = data.data[0];

        const matchedClass = levelObj.classes.find((c) => {
          const name = c.class?.name?.toLowerCase();
          const arm = c.class?.arm?.toLowerCase();
          return (
            name === selectedLevel?.toLowerCase() &&
            arm === selectedArm?.toLowerCase()
          );
        });

        // Set subject coming from API
        setSelectedSubject(levelObj?.subject?._id || levelObj?.subject);

        classStudents = matchedClass?.students || [];
      } else if (data?.students) {
        classStudents = data.students;
      }

      // Extract classId
      const classId = data?.data?.[0]?.classes.find(
        (c) => (c.class?.arm || c.class?.name) === selectedArm
      )?.class?._id;

      // Extract subjectId
      const subjectId =
        data?.data?.[0]?.subject?._id ||
        data?.data?.[0]?.subject ||
        selectedSubject;

      if (!classId || !subjectId) {
        console.warn("Missing classId or subjectId. Cannot fetch status.");
        setStudents(classStudents);
        return;
      }

      // Fetch result statuses
      const dashboardURL = `${API_BASE_URL}/api/records/teacher/scores/dashboard?classId=${classId}&subjectId=${subject?._id}&session=2025/2026&term=1`;
      // console.log("class id", classId);
      // console.log("subject", subject?._id);

      const scoreRes = await axios.get(dashboardURL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(scoreRes);
      const statusList = scoreRes.data.students || [];

      // console.log("Status list:", statusList);

      // Merge status into fetched students
      const mergedStudents = classStudents.map((stu) => {
        const found = statusList.find((s) => s.studentId === stu._id);
        return {
          ...stu,
          hasRecord: found?.status === "recorded",
        };
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

  // Assuming your component has a state setter: const [students, setStudents] = useState([]);

  // const getRecord = async (subjectIdParam) => {
  //   const subjectId = subjectIdParam || selectedSubject;
  //   if (!subjectId) return;

  //   try {
  //     setLoading(true);

  //     const res = await axios.get(
  //       `${API_BASE_URL}/api/teacher/records?subjectId=${selectedSubject}&session=2025/2026&term=1`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     const results = res.data?.data?.results;

  //     if (!Array.isArray(results) || results.length === 0) {
  //       console.warn("No results found!", results);
  //       setStudents([]);
  //       return;
  //     }

  //     console.log(results)
      
  //     const mappedStudents = results.map((item) => ({
  //       key: item._id, // row key
  //       recordId: item._id, // <-- ADD THIS (this is your record ID)
  //       studentId: item.student.id,
  //       fullName: `${item.student.firstName} ${item.student.lastName}`,
  //       admissionNumber: item.student.admissionNumber || "-",
  //       gender: item.gender || "-",
  //       class: item.student.class,
  //       record: {
  //         firstAssignment: item.firstAssignment,
  //         secondAssignment: item.secondAssignment,
  //         firstCA: item.firstCA,
  //         secondCA: item.secondCA,
  //         exam: item.exam,
  //         total: item.total,
  //         grade: item.grade,
  //         teacherRemark: item.teacherRemark,
  //       },
  //       status: item.status || "-",
  //     }));

  //     // console.log("Mapped students:", mappedStudents);
  //     setStudentsRecord(mappedStudents);
  //   } catch (error) {
  //     console.error(error);
  //     message.error("Failed to fetch records");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getRecord = async (subjectIdParam) => {
  const subjectId = subjectIdParam || selectedSubject;
  if (!subjectId) return;

  try {
    setLoading(true);

    const res = await axios.get(
      `${API_BASE_URL}/api/teacher/records?subjectId=${subjectId}&session=2025/2026&term=1&limit=500`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const results = res.data?.data?.results;

    if (!Array.isArray(results) || results.length === 0) {
      console.warn("No results found!", results);
      setStudents([]);
      return;
    }

    const mappedStudents = results.map((item) => ({
      key: item._id,
      recordId: item._id,
      studentId: item.student.id,
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


  // console.log(token, API_BASE_URL)

  useEffect(() => {
    if (selectedSubject) {
      getRecord();
    }
  }, [selectedSubject]);

  // You must remove the previous manual HTML row generation and setStudentsRows(rows) call!
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

  const columns = [
    {
      title: "S/N",
      render: (_, __, index) => index + 1,
      width: 70, // Added width for better layout
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      width: 180,
    },
    // {
    //   title: "Admission No",
    //   dataIndex: "admissionNumber",
    //   width: 150,
    // },
    {
      title: "Class",
      width: 150,
      render: (record) => {
        // More robust rendering: get name and arm, use '-' if class is missing.
        const name = record.class?.name;
        const arm = record.class?.arm;

        if (name && arm) return `${name} - ${arm}`;
        if (name) return name;
        if (arm) return arm;
        return "-";
      },
    },
    {
      title: "1st ASS",
      // Safely access nested record.exam, default to 0
      render: (record) => record.record?.firstAssignment ?? 0,
      width: 80,
    },
    {
      title: "2nd ASS",
      // Safely access nested record.exam, default to 0
      render: (record) => record.record?.secondAssignment ?? 0,
      width: 80,
    },
    {
      title: "1st CA",
      // Safely access nested record.exam, default to 0
      render: (record) => record.record?.firstCA ?? 0,
      width: 80,
    },
    {
      title: "2nd CA",
      // Safely access nested record.exam, default to 0
      render: (record) => record.record?.secondCA ?? 0,
      width: 80,
    },
    {
      title: "Exam",
      // Safely access nested record.exam, default to 0
      render: (record) => record.record?.exam ?? 0,
      width: 80,
    },
    {
      title: "Total",
      // Safely access nested record.total, default to 0
      render: (record) => record.record?.total ?? 0,
      width: 80,
    },
    {
      title: "Grade",
      // Safely access nested record.grade, default to '-'
      render: (record) => record.record?.grade ?? "-",
      width: 80,
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
              setEditStudentRecord(record); // set selected record
              setIsEditRecordModalOpen(true); // open modal
              // console.log(record);
            }}
          >
            Edit
          </Button>
        </Space>
      ),
    },

    // Add an Action column here if needed, or remove this comment

    ,
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
            {/* <Select
              placeholder="Select Subject"
              value={selectedSubject}
              onChange={(value) => setSelectedSubject(value)}
              style={{ width: "100%" }}
            >
              {subjects?.map((sub) => (
                <Select.Option key={sub._id} value={sub._id}>
                  {sub.name}
                </Select.Option>
              ))}
            </Select> */}

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
                teacherSubject={subjects?.name}
                onClick={handleSubmit}
                selectedLevel={selectedLevel}
                selectedSubject={selectedSubject} // ✅ pass it here
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

            {/* VIEW RESULT */}
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
                  // This points to the state variable, which getRecord must set correctly
                  dataSource={studentsRecord}
                  // This ensures a unique key for each row based on the fetched data
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
            {/* PROGRESS TAB */}
            <TabPane
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

      <Modal
        title={`Edit Record - ${editStudentRecord?.fullName}`}
        open={isEditRecordModalOpen}
        onCancel={() => setIsEditRecordModalOpen(false)}
        footer={null} // remove default footer
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
                  stu.studentId === editStudentRecord.studentId
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

          {/* Centered submit button */}
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

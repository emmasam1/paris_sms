import React, { useState, useEffect } from "react";
import {
  Table,
  Select,
  Button,
  Card,
  Radio,
  Row,
  Col,
  Statistic,
  Collapse,
  Tag,
  message,
  Tabs,
  Skeleton,
  Modal,
  Form,
  Input,
  InputNumber,
  Typography,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { useApp } from "../../../context/AppContext";

const { Option } = Select;
const { Panel } = Collapse;

const Attendance = ({ className }) => {
  const today = dayjs().format("YYYY-MM-DD");
  const { token, API_BASE_URL, loading, setLoading } = useApp();

  const [selectedDate, setSelectedDate] = useState(today);
  const [attendance, setAttendance] = useState({});
  const [viewRecords, setViewRecords] = useState({});
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsList, setStudentsList] = useState([]);

  const [bulkData, setBulkData] = useState({});
  const [bulkSession, setBulkSession] = useState(null);
  const [bulkTerm, setBulkTerm] = useState(null);

  // Modal states
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedStudentStats, setSelectedStudentStats] = useState(null);

  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [selectedDomainStudent, setSelectedDomainStudent] = useState(null);
  const [stdDetails, setStdDetails] = useState([]);
  const [stdClass, setStdClass] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [stdResultId, setStdResultId] = useState(null);
  const [domainLoading, setDomainLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const [editAttendanceModalOpen, setEditAttendanceModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // === FETCH STUDENTS ===
  const getMyClassStudents = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/teacher/form-class?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setStdClass(res?.data?.data?.class?._id);

      // console.log("first", res);

      const classData = res?.data?.data;
      const studentsArray = classData?.students || [];

      setStudents(studentsArray);
      setStudentsList(studentsArray);

      // console.log("hi", res);

      messageApi.success("Students loaded");
    } catch (error) {
      console.error("Error fetching students:", error);
      messageApi.error("Unable to load students!");
    } finally {
      setLoading(false);
    }
  };

  const getAttendance = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/attendance/attendance-summary?limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // console.log("Attendance API Response:", res.data); // debug log

      // Correct path to students array
      const studentsArray = res.data?.students || [];

      // Optional: map to table-friendly format
      const tableData = studentsArray.map((s) => ({
        _id: s.studentId,
        fullName: s.fullName,
        admissionNumber: s.admissionNumber,
        class: s.class,
        status: s.status,
        attendance: s.attendance,
      }));

      // console.log("Attendance Table Data:", tableData);

      setAttendanceData(tableData);

      // console.log("Attendance API Response", attendanceData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      messageApi.error("Failed to fetch attendance");
    }
  };

  useEffect(() => {
    getMyClassStudents();
    getAttendance();
  }, []);

  const updateBulk = (id, field, value) => {
    setBulkData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const openEditAttendanceModal = (record) => {
// console.log(record)
  setSelectedAttendance(record);
  form.setFieldsValue({
    opened: record.attendance.no_of_times_opened,
    present: record.attendance.no_of_times_present,
    absent: record.attendance.no_of_times_absent,
    session: record.attendance.session,
    term: record.attendance.term,
  });
  setEditAttendanceModalOpen(true);
};


const handleEditAttendanceSubmit = async (values) => {
  const attendanceId = selectedAttendance?.attendance._id
  if (!selectedAttendance?.attendance._id) return;

  // console.log(selectedAttendance?.attendance._id)
  try {
    setLoading(true);
    const res = await axios.put(
      `${API_BASE_URL}/api/attendance/${attendanceId}`,
      {
        session: values.session,
        term: values.term,
        no_of_times_opened: values.opened,
        no_of_times_present: values.present,
        no_of_times_absent: values.absent,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    messageApi.success(res.data.message || "Attendance updated successfully!");
    setEditAttendanceModalOpen(false);
    getAttendance(); // Refresh table
  } catch (error) {
    console.error(error);
    messageApi.error("Failed to update attendance");
  } finally {
    setLoading(false);
  }
};

  const GradeSelect = ({ value, onChange }) => (
    <Select
      placeholder="Grade"
      value={value}
      onChange={onChange}
      className="w-full"
    >
      {["A+", "A", "B+", "C", "D", "E"].map((g) => (
        <Option key={g} value={g}>
          {g}
        </Option>
      ))}
    </Select>
  );

  const submitBulkAttendance = async () => {
    if (!bulkSession || !bulkTerm)
      return message.error("Please select session & term!");

    const records = students.map((s) => ({
      studentId: s._id,
      no_of_times_opened: bulkData[s._id]?.opened || 0,
      no_of_times_present: bulkData[s._id]?.present || 0,
      no_of_times_absent: bulkData[s._id]?.absent || 0,
    }));

    const payload = {
      session: bulkSession,
      term: bulkTerm,
      records,
    };

    // console.log(payload);

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/attendance/bulk`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      messageApi.success(res.data.message || "Bulk attendance submitted!");
      setBulkData({});
      setBulkSession(null);
      setBulkTerm(null);
    } catch (error) {
      console.log(error);
      messageApi.error("Failed to submit bulk attendance");
    } finally {
      setLoading(false);
    }
  };

  //Get student result
  const getResult = async (id) => {
    try {
      const stdresult = await axios.get(
        `${API_BASE_URL}/api/results?studentId=${id}&session=2025/2026&term=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const resultId = stdresult?.data?.data?._id;
      setStdResultId(resultId);
      return resultId; // ⭐ return result ID
    } catch (error) {
      console.log(error);
      return null;  
    }
  };

  const saveDomain = async (values) => {
    try {
      setDomainLoading(true);
      const res = await axios.patch(
        `${API_BASE_URL}/api/results/${stdResultId}/domain`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      messageApi.success(res.data.message || "Domain Entered Successfully");
      setDomainModalOpen(false);
    } catch (error) {
      console.error("Domain Save Error:", error?.response || error);
      messageApi.error(
        error?.response?.data?.message || "Failed to save domain"
      );
    } finally {
      setDomainLoading(false);
    }
  };

  // === MARK ATTENDANCE ===
  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  // === SUBMIT ATTENDANCE ===
  const handleSubmit = () => {
    if (studentsList.length === 0)
      return message.warning("No students in class.");
    if (Object.keys(attendance).length === 0)
      return message.warning("Mark at least one student.");
    if (viewRecords[selectedDate])
      return message.error(
        `Attendance for ${selectedDate} is already recorded.`
      );

    const formatted = studentsList.map((stu) => ({
      id: stu._id,
      regNo: stu.admissionNumber,
      name: stu.fullName,
      status: attendance[stu._id] || "Absent",
      date: selectedDate,
      className,
    }));

    setViewRecords((prev) => ({ ...prev, [selectedDate]: formatted }));

    const summaryCount = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
    formatted.forEach((r) => summaryCount[r.status]++);
    setSummary(summaryCount);

    message.success(`Attendance submitted for ${selectedDate}`);
  };

  const handleManualSubmit = async (values) => {
    if (!selectedStudentStats) return;

    const payload = {
      studentId: selectedStudentStats.id,
      session: values.session,
      term: values.term,
      no_of_times_opened: values.opened,
      no_of_times_present: values.present,
      no_of_times_absent: values.absent,
    };

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/attendance/single`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log(res);
      messageApi.success(res.data.message);
    } catch (error) {
      console.log("ERROR:", error);
    } finally {
      setLoading(false);
    }

    message.success("Manual attendance logged!");
    setAttendanceModalOpen(false);
  };

  // === OPEN MODAL WITH MANUAL ATTENDANCE ===
  const openAttendanceModal = (record) => {
    console.log(record);
    form.resetFields();
    setAttendanceModalOpen(true);
    setSelectedStudentStats(record);
  };

  // === TABLE COLUMNS ===
  const markColumns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
    { title: "Reg No", dataIndex: "regNo", key: "regNo" },
    { title: "Student Name", dataIndex: "name", key: "name" },
    {
      title: "Attendance",
      key: "attendance",
      render: (_, record) => (
        <Radio.Group
          onChange={(e) => handleAttendanceChange(record.id, e.target.value)}
          value={attendance[record.id] || ""}
        >
          <Radio value="Present">
            <Tag color="green">Present</Tag>
          </Radio>
          <Radio value="Absent">
            <Tag color="red">Absent</Tag>
          </Radio>
          <Radio value="Late">
            <Tag color="orange">Late</Tag>
          </Radio>
          <Radio value="Excused">
            <Tag color="blue">Excused</Tag>
          </Radio>
        </Radio.Group>
      ),
    },

    {
      title: "Take Manual Attendance",
      key: "manual",
      render: (_, record) => (
        <Button type="link" onClick={() => openAttendanceModal(record)}>
          Take Manual Attendance
        </Button>
      ),
    },
  ];

const columns = [
  { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
  { title: "Full Name", dataIndex: "fullName", key: "fullName" },
  {
    title: "Attendance Status",
    key: "status",
    render: (_, record) => (
      <Tag color={record.status === "has-attendance" ? "green" : "red"}>
        {record.status === "has-attendance" ? "Taken" : "Not Taken"}
      </Tag>
    ),
  },
  {
    title: "Times Opened",
    dataIndex: ["attendance", "no_of_times_opened"],
    key: "no_of_times_opened",
  },
  {
    title: "Times Present",
    dataIndex: ["attendance", "no_of_times_present"],
    key: "no_of_times_present",
  },
  {
    title: "Times Absent",
    dataIndex: ["attendance", "no_of_times_absent"],
    key: "no_of_times_absent",
  },
  {
    title: "Session",
    dataIndex: ["attendance", "session"],
    key: "session",
  },
  {
    title: "Term",
    dataIndex: ["attendance", "term"],
    key: "term",
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Button
        type="link"
        onClick={() => openEditAttendanceModal(record)}
      >
        Edit
      </Button>
    ),
  },
];

  const viewColumns = [
    { title: "Reg No", dataIndex: "regNo" },
    { title: "Name", dataIndex: "name" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        const map = {
          Present: "green",
          Absent: "red",
          Late: "orange",
          Excused: "blue",
        };
        return <Tag color={map[status]}>{status}</Tag>;
      },
    },
  ];

  return (
    <Card className="shadow-md rounded-xl p-4 bg-white">
      {contextHolder}

      {/* HEADER */}
      <div className="mb-4">
        <Typography.Title level={4} className="!mb-1">
          Attendance Management
        </Typography.Title>
        <Typography.Text type="secondary">
          Select a date, mark attendance, or view records.
        </Typography.Text>
      </div>

      <Modal
        title={
          <span className="text-[16px] font-semibold">
            Enter Domain for {selectedDomainStudent?.name || ""}
          </span>
        }
        open={domainModalOpen}
        onCancel={() => setDomainModalOpen(false)}
        onOk={() => form.submit()}
        okText="Save"
        confirmLoading={domainLoading} // <<< ⭐ IMPORTANT
        width={650}
        bodyStyle={{ padding: "12px 20px" }}
      >
        <Form layout="vertical" form={form} onFinish={saveDomain} size="small">
          {/* AFFECTIVE DOMAIN */}
          <h3 className="text-[14px] font-medium mt-2 mb-2">
            Affective Domain
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Attentiveness", name: "attentiveness" },
              { label: "Honesty", name: "honesty" },
              { label: "Neatness", name: "neatness" },
              { label: "Punctuality", name: "punctuality" },
              {
                label: "Relationship With Others",
                name: "relationshipWithOthers",
              },
              { label: "Leadership Traits", name: "leadershipTraits" },
            ].map((item) => (
              <Form.Item
                key={item.name}
                label={<span className="text-[12px]">{item.label}</span>}
                name={item.name}
                rules={[{ required: true }]}
                className="!mb-0"
              >
                <GradeSelect />
              </Form.Item>
            ))}
          </div>

          {/* PSYCHOMOTOR DOMAIN */}
          <h3 className="text-[14px] font-medium mt-4 mb-2">
            Psychomotor Domain
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Club Interests & Sports",
                name: "clubInterestsAndSports",
              },
              { label: "Handwriting", name: "handWriting" },
              { label: "Agility", name: "agility" },
              { label: "Oratory Skills", name: "oratorySkills" },
              { label: "Self Care", name: "selfCare" },
              { label: "Organisational Skills", name: "organisationalSkills" },
            ].map((item) => (
              <Form.Item
                key={item.name}
                label={<span className="text-[12px]">{item.label}</span>}
                name={item.name}
                rules={[{ required: true }]}
              >
                <GradeSelect />
              </Form.Item>
            ))}
          </div>
        </Form>
      </Modal>

      {/* DATE SELECT */}
      <div className="mb-4 flex items-center gap-3">
        <Typography.Text strong>Select Date:</Typography.Text>
        <Select
          value={selectedDate}
          className="min-w-[160px]"
          onChange={setSelectedDate}
        >
          {[...Array(7)].map((_, i) => {
            const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
            return (
              <Option key={date} value={date}>
                {date}
              </Option>
            );
          })}
        </Select>
      </div>

      <Tabs defaultActiveKey="1" className="mt-3">
        {/* ======================= MARK ATTENDANCE ======================= */}
        <Tabs.TabPane tab="Mark Attendance" key="1">
          {loading ? (
            <>
              <Skeleton active />
              <Skeleton active />
            </>
          ) : studentsList.length === 0 ? (
            <p className="text-gray-400 text-center mt-6">
              No students in this class.
            </p>
          ) : (
            <>
              <Table
                dataSource={students.map((s) => ({
                  id: s._id,
                  regNo: s.admissionNumber,
                  name: s.fullName,
                }))}
                columns={markColumns}
                rowKey="id"
                bordered
                className="rounded-lg overflow-hidden"
                pagination={{
                  position: ["bottomCenter"],
                  className: "custom-pagination",
                }}
                size="small"
                scroll={{ x: "max-content" }}
              />

              {summary && (
                <Card className="mt-4 bg-gray-50 shadow-sm rounded-xl">
                  <Typography.Title level={5} className="mb-3">
                    Attendance Summary
                  </Typography.Title>

                  <Row gutter={16}>
                    {Object.entries(summary).map(([key, val]) => (
                      <Col span={6} key={key}>
                        <Statistic title={key} value={val} />
                      </Col>
                    ))}
                  </Row>
                </Card>
              )}
            </>
          )}
        </Tabs.TabPane>

        {/* ======================= STUDENT DOMAIN TAB ======================= */}
        <Tabs.TabPane tab="Student Domain" key="2">
          {loading ? (
            <>
              <Skeleton active />
              <Skeleton active />
            </>
          ) : studentsList.length === 0 ? (
            <p className="text-gray-400 text-center mt-6">
              No students in this class.
            </p>
          ) : (
            <>
              <Table
                dataSource={students.map((s, index) => ({
                  sn: index + 1,
                  id: s._id,
                  regNo: s.admissionNumber,
                  name: s.fullName,
                }))}
                columns={[
                  {
                    title: "S/N",
                    dataIndex: "sn",
                    width: 60,
                  },
                  {
                    title: "Reg No",
                    dataIndex: "regNo",
                  },
                  {
                    title: "Student Name",
                    dataIndex: "name",
                  },
                  {
                    title: "Domain",
                    key: "domain",
                    width: 120,
                    render: (_, record) => (
                      <Button
                        type="primary"
                        size="small"
                        onClick={async () => {
                          form.resetFields();
                          setSelectedDomainStudent(record);

                          const resultId = await getResult(record.id);

                          if (!resultId) {
                            return message.error(
                              "Result not found for this student"
                            );
                          }

                          setDomainModalOpen(true);
                        }}
                      >
                        Enter Domain
                      </Button>
                    ),
                  },
                ]}
                rowKey="regNo"
                bordered
                className="rounded-lg overflow-hidden"
                pagination={{
                  position: ["bottomCenter"],
                  className: "custom-pagination",
                }}
                size="small"
                scroll={{ x: "max-content" }}
              />
            </>
          )}
        </Tabs.TabPane>

        {/* ======================= BULK ATTENDANCE ======================= */}
        <Tabs.TabPane tab="Bulk Attendance" key="3">
          <Card className="mb-4 p-4 bg-gray-50 rounded-xl">
            <Typography.Title level={5}>Bulk Attendance Setup</Typography.Title>
            <Typography.Text type="secondary">
              Select session and term before entering student values.
            </Typography.Text>

            <Row gutter={16} className="mt-3">
              <Col span={12}>
                <Form.Item label="Session" required>
                  <Select
                    placeholder="Select session"
                    onChange={setBulkSession}
                  >
                    <Option value="2024/2025">2024/2025</Option>
                    <Option value="2025/2026">2025/2026</Option>
                    <Option value="2026/2027">2026/2027</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Term" required>
                  <Select placeholder="Select term" onChange={setBulkTerm}>
                    <Option value={1}>First Term</Option>
                    <Option value={2}>Second Term</Option>
                    <Option value={3}>Third Term</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Table
            dataSource={studentsList}
            rowKey="_id"
            bordered
            className="rounded-lg overflow-hidden"
            size="small"
            pagination={false}
            columns={[
              {
                title: "Student",
                dataIndex: "fullName",
                className: "font-medium",
              },
              {
                title: "Attendance Stats",
                render: (r) => (
                  <div
                    style={{
                      display: "flex !important",
                      gap: "8px",
                      width: "100%",
                    }}
                  >
                    <InputNumber
                      min={0}
                      placeholder="Opened"
                      // style={{ width: "33%" }}
                      value={bulkData[r._id]?.opened || null}
                      onChange={(v) => updateBulk(r._id, "opened", v)}
                    />

                    <InputNumber
                      min={0}
                      placeholder="Present"
                      // style={{ width: "33%" }}
                      value={bulkData[r._id]?.present || null}
                      onChange={(v) => updateBulk(r._id, "present", v)}
                    />

                    <InputNumber
                      min={0}
                      placeholder="Absent"
                      // style={{ width: "33%" }}
                      value={bulkData[r._id]?.absent || null}
                      onChange={(v) => updateBulk(r._id, "absent", v)}
                    />
                  </div>
                ),
              },
            ]}
          />

          <Button
            type="primary"
            onClick={submitBulkAttendance}
            className="mt-4 rounded-lg py-2"
            block
            loading={loading}
          >
            Submit Bulk Attendance
          </Button>
        </Tabs.TabPane>

        {/* ======================= VIEW ATTENDANCE ======================= */}
        <Tabs.TabPane tab="View Attendance" key="4">
          {/* {console.log("Rendering attendanceData:", attendanceData)} */}
          <Table
            dataSource={attendanceData}
            columns={columns}
            rowKey={(record) => record._id}
            bordered
            size="small"
            pagination={{
              position: ["bottomCenter"],
              className: "custom-pagination",
              showSizeChanger: true, // ✅ show page size dropdown
              pageSizeOptions: ["5", "10", "20", "50"],
            }}
            className="custom-table"
            scroll={{ x: "max-content" }}
          />
        </Tabs.TabPane>
      </Tabs>

      {/* ========== MANUAL ATTENDANCE MODAL ========== */}
      <Modal
        open={attendanceModalOpen}
        onCancel={() => setAttendanceModalOpen(false)}
        footer={null}
        title={
          <Typography.Title level={4}>
            Manual Attendance – {selectedStudentStats?.name}
          </Typography.Title>
        }
      >
        {selectedStudentStats && (
          <Form form={form} layout="vertical" onFinish={handleManualSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Session"
                  name="session"
                  rules={[
                    { required: true, message: "Please select a session" },
                  ]}
                >
                  <Select
                    placeholder="Select session"
                    onChange={(v) => form.setFieldValue("session", v)}
                    options={[
                      { value: "2024/2025", label: "2024/2025" },
                      { value: "2025/2026", label: "2025/2026" },
                      { value: "2026/2027", label: "2026/2027" },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Term"
                  name="term"
                  rules={[{ required: true, message: "Please select a term" }]}
                >
                  <Select
                    placeholder="Select term"
                    onChange={(v) => form.setFieldValue("term", v)}
                    options={[
                      { value: 1, label: "First Term" },
                      { value: 2, label: "Second Term" },
                      { value: 3, label: "Third Term" },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="No. of Times School Opened"
                  name="opened"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    onChange={(v) => form.setFieldValue("opened", v)}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="No. of Times Present"
                  name="present"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    onChange={(v) => form.setFieldValue("present", v)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="No. of Times Absent"
                  name="absent"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    onChange={(v) => form.setFieldValue("absent", v)}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>


      <Modal
  title={`Edit Attendance – ${selectedAttendance?.fullName}`}
  open={editAttendanceModalOpen}
  onCancel={() => setEditAttendanceModalOpen(false)}
  footer={null}
>
  {selectedAttendance && (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleEditAttendanceSubmit}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Session"
            name="session"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "2024/2025", label: "2024/2025" },
                { value: "2025/2026", label: "2025/2026" },
                { value: "2026/2027", label: "2026/2027" },
              ]}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Term" name="term" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 1, label: "First Term" },
                { value: 2, label: "Second Term" },
                { value: 3, label: "Third Term" },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="No. of Times Opened" name="opened">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="No. of Times Present" name="present">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="No. of Times Absent" name="absent">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Button type="primary" htmlType="submit" block loading={loading}>
        Save Changes
      </Button>
    </Form>
  )}
</Modal>

    </Card>
  );
};

export default Attendance;

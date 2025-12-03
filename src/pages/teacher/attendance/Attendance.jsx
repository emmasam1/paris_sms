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

  console.log(token);

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

  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  // === FETCH STUDENTS ===
  const getMyClassStudents = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/teacher/form-class`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const classData = res?.data?.data;
      const studentsArray = classData?.students || [];

      setStudents(studentsArray);
      setStudentsList(studentsArray);

      // console.log(res);

      messageApi.success("Students loaded");
    } catch (error) {
      console.error("Error fetching students:", error);
      messageApi.error("Unable to load students!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyClassStudents();
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

  const GradeSelect = () => (
    <Select placeholder="Grade" className="w-full">
      {["A+", "A", "B+", "B", "C", "D", "E", "F"].map((g) => (
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

    console.log(payload);

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

  const saveDomain = (values) => {
    console.log("Saving Domain For:", selectedDomainStudent);
    console.log("Domain Values:", values);

    // TODO: API CALL HERE

    message.success("Domain saved successfully");
    setDomainModalOpen(false);
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
    // console.log(record);
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
      title: "Status",
      key: "status",
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
        width={650} // slightly wider for 3 columns
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
                        onClick={() => {
                          setSelectedDomainStudent(record);
                          form.resetFields();
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
          {Object.keys(viewRecords).length === 0 ? (
            <p className="text-gray-400 text-center mt-6">
              No attendance records yet.
            </p>
          ) : (
            <Collapse accordion className="rounded-xl overflow-hidden">
              {Object.entries(viewRecords).map(([date, records]) => (
                <Panel
                  header={`${date} (${records.length} students)`}
                  key={date}
                >
                  <Table
                    dataSource={records}
                    columns={viewColumns}
                    rowKey="id"
                    bordered
                    className="rounded-md"
                    pagination={{
                      position: ["bottomCenter"],
                    }}
                    size="small"
                  />
                </Panel>
              ))}
            </Collapse>
          )}
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
          <Form
            form={form}
            layout="vertical"
            className="mt-4"
            onFinish={handleManualSubmit}
          >
            {" "}
            <Row gutter={16}>
              {" "}
              {/* SESSION */}{" "}
              <Col span={12}>
                {" "}
                <Form.Item
                  label="Session"
                  name="session"
                  rules={[
                    { required: true, message: "Please select a session" },
                  ]}
                >
                  {" "}
                  <Select placeholder="Select session">
                    {" "}
                    <Option value="2024/2025">2024/2025</Option>{" "}
                    <Option value="2025/2026">2025/2026</Option>{" "}
                    <Option value="2026/2027">2026/2027</Option>{" "}
                  </Select>{" "}
                </Form.Item>{" "}
              </Col>{" "}
              {/* TERM */}{" "}
              <Col span={12}>
                {" "}
                <Form.Item
                  label="Term"
                  name="term"
                  rules={[{ required: true, message: "Please select a term" }]}
                >
                  {" "}
                  <Select placeholder="Select term">
                    {" "}
                    <Option value={1}>First Term</Option>{" "}
                    <Option value={2}>Second Term</Option>{" "}
                    <Option value={3}>Third Term</Option>{" "}
                  </Select>{" "}
                </Form.Item>{" "}
              </Col>{" "}
            </Row>{" "}
            <Row gutter={16}>
              {" "}
              <Col span={12}>
                {" "}
                <Form.Item
                  label="No. of Times School Opened"
                  name="opened"
                  rules={[
                    { required: true, message: "Please input this value" },
                  ]}
                >
                  {" "}
                  <InputNumber min={0} style={{ width: "100%" }} />{" "}
                </Form.Item>{" "}
              </Col>{" "}
              <Col span={12}>
                {" "}
                <Form.Item
                  label="No. of Times Present"
                  name="present"
                  rules={[
                    { required: true, message: "Please input this value" },
                  ]}
                >
                  {" "}
                  <InputNumber min={0} style={{ width: "100%" }} />{" "}
                </Form.Item>{" "}
              </Col>{" "}
            </Row>{" "}
            <Row gutter={16}>
              {" "}
              <Col span={12}>
                {" "}
                <Form.Item
                  label="No. of Times Absent"
                  name="absent"
                  rules={[
                    { required: true, message: "Please input this value" },
                  ]}
                >
                  {" "}
                  <InputNumber min={0} style={{ width: "100%" }} />{" "}
                </Form.Item>{" "}
              </Col>{" "}
              <Col span={12}>
                {" "}
                <Form.Item label=" ">
                  {" "}
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                  >
                    {" "}
                    Submit{" "}
                  </Button>{" "}
                </Form.Item>{" "}
              </Col>{" "}
            </Row>{" "}
          </Form>
        )}
      </Modal>
    </Card>
  );
};

export default Attendance;

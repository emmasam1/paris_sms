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
  InputNumber,
  Typography,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { useApp } from "../../../context/AppContext";

const { Option } = Select;
const { Panel } = Collapse;
const { Title, Text } = Typography;

const Attendance = ({ className }) => {
  const today = dayjs().format("YYYY-MM-DD");
  const { token, API_BASE_URL } = useApp();

  const [selectedDate, setSelectedDate] = useState(today);
  const [attendance, setAttendance] = useState({});
  const [viewRecords, setViewRecords] = useState({});
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedStudentStats, setSelectedStudentStats] = useState(null);

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

  // === OPEN MODAL WITH MANUAL ATTENDANCE ===
  const openAttendanceModal = (record) => {
    // setSelectedStudentStats({
    //   name: record.fullName,
    //   regNo: record.admissionNumber,
    // });
    console.log(record)
    form.resetFields();
    setAttendanceModalOpen(true);
    setSelectedStudentStats(record)
  };

  const handleManualSubmit = (record) => {
    message.success(
      `Manual attendance submitted for ${selectedStudentStats.name}!`
    );
    setAttendanceModalOpen(false);
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
    <Card>
      {contextHolder}

      {/* DATE SELECT */}
      <Select
        value={selectedDate}
        style={{ marginBottom: 16 }}
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

      <Tabs defaultActiveKey="1">
        {/* MARK ATTENDANCE */}
        <Tabs.TabPane tab="Mark Attendance" key="1">
          {loading ? (
            <>
              <Skeleton active />
              <Skeleton active />
            </>
          ) : studentsList.length === 0 ? (
            <p className="text-gray-400 text-center">
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
                pagination={{
                  position: ["bottomCenter"],
                  className: "custom-pagination",
                }}
                size="small"
                scroll={{ x: "max-content" }}
              />

              {summary && (
                <Card className="mt-4 bg-gray-50">
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

        {/* VIEW ATTENDANCE */}
        <Tabs.TabPane tab="View Attendance" key="2">
          {Object.keys(viewRecords).length === 0 ? (
            <p className="text-gray-400 text-center mt-6">
              No attendance records yet.
            </p>
          ) : (
            <Collapse accordion>
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
                    pagination={{
                      position: ["bottomCenter"],
                      showSizeChanger: false,
                    }}
                    size="small"
                  />
                </Panel>
              ))}
            </Collapse>
          )}
        </Tabs.TabPane>
      </Tabs>

   
      {/* MANUAL ATTENDANCE MODAL */}
      <Modal
        open={attendanceModalOpen}
        onCancel={() => setAttendanceModalOpen(false)}
        footer={null}
        title="Take Manual Attendance"
      >
        {selectedStudentStats && (
          <div>
            <Title level={5}>{selectedStudentStats.fullName}</Title>
            <Text type="secondary">Reg No: {selectedStudentStats.regNo}</Text>

            <Form
              form={form}
              layout="vertical"
              className="mt-4"
              onFinish={handleManualSubmit}
            >
              <Form.Item
                label="No. of Times School Opened"
                name="opened"
                rules={[{ required: true, message: "Please input this value" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="No. of Times Present"
                name="present"
                rules={[{ required: true, message: "Please input this value" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="No. of Times Absent"
                name="absent"
                rules={[{ required: true, message: "Please input this value" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default Attendance;

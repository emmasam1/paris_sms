import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Input,
  Select,
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Modal,
  Form,
  Descriptions,
  Typography,
  Upload,
  Skeleton,
  Avatar,
  Dropdown,
  Menu,
  Card,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  BarChartOutlined,
  UploadOutlined,
  MoreOutlined,
  BookOutlined,
} from "@ant-design/icons";
import std_img from "../../../assets/student.jpg";
import { useApp } from "../../../context/AppContext";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const sessions = ["2023/2024", "2024/2025", "2025/2026"];

const Student = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [detailsStudent, setDetailsStudent] = useState(null);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressStudent, setProgressStudent] = useState(null);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [importing, setImporting] = useState(false);
  const [openSubjectAssignModal, setOpenAssignSubjectsModal] = useState(false);
  const [stdSubject, setStdSunject] = useState([]);

  const [subjects, setSubjects] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const { API_BASE_URL, token, initialized, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20, // use your backend’s default page size
    total: 0,
  });

  // CSV upload + preview state
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvPreviewData, setCsvPreviewData] = useState([]); // array of preview rows (objects)
  const [isCsvModalVisible, setIsCsvModalVisible] = useState(false);

  // editable cell state: store currently editing cell as `${rowIndex}-${dataIndex}`
  const [editingCell, setEditingCell] = useState(null);

  // pagination for CSV preview table (client-side)
  const [csvPagination, setCsvPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const fileInputRef = useRef(null);

  // console.log(token)

  // 🧠 Avatar upload states
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handlePreview = async (file) => {
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  // 🧠 Load existing avatar when editing
  useEffect(() => {
    if (editingStudent) {
      form.setFieldsValue({
        firstName: editingStudent.firstName,
        lastName: editingStudent.lastName,
        rollNumber: editingStudent.rollNumber,
        dob: editingStudent.dob ? editingStudent.dob.split("T")[0] : null, // format date for input[type="date"]
        gender: editingStudent.gender,
        class: editingStudent.class?._id, // ✅ send _id, not name
        status: editingStudent.status || "active",
        session: editingStudent.session,
        house: editingStudent.house,
        parentEmail: editingStudent.parentEmail,
        parentPhone: editingStudent.parentPhone,
        parentAddress: editingStudent.parentAddress,
        avatar: editingStudent.avatar || null,
      });

      // Set file list for avatar preview if editing
      if (editingStudent.avatar) {
        setFileList([
          {
            uid: "-1",
            name: "avatar.png",
            status: "done",
            url: editingStudent.avatar,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [editingStudent, form]);

  const getStudents = async (page = 1, search = "", classId = "") => {
    setLoading(true);
    try {
      // Build query parameters correctly
      const params = new URLSearchParams();
      params.append("page", page);
      if (search) params.append("search", search);
      if (classId) params.append("classId", classId);

      const res = await axios.get(
        `${API_BASE_URL}/api/student-management/student?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // console.log(res)

      const studentsWithFullName = (res?.data?.data || []).map((s) => ({
        ...s,
        key: s._id,
        name: `${s.firstName || ""} ${s.lastName || ""}`.trim(),
      }));

      setStudents(studentsWithFullName);
      setPagination({
        current: res?.data?.pagination?.page || page,
        total: res?.data?.pagination?.total || studentsWithFullName.length,
        pageSize: 20,
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch students"
      );
    } finally {
      setLoading(false);
    }
  };

  const getTeachers = async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/staff-management/staff/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeachers(res?.data?.data || []);
      // console.log("teachers", res);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const getAllSubjects = async () => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/api/subject-management/subjects?limit=100000`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("all subjects", res);

    setSubjects(res?.data?.data || []);
  } catch (error) {
    console.error(error);
    message.error("Failed to fetch subjects");
  }
};



  const openAssignSubjectsModal = (student) => {
  setSelectedStudent(student);

  // FIX: extract only the IDs
  setSelectedSubjects(student?.subjects?.map(s => s._id) || []);

  setOpenAssignSubjectsModal(true);
  getAllSubjects();
  getStdentSubjects(student);
};


  const assignSubject = async () => {
    const id = selectedStudent?._id;
    const payload = {
      subjectIds: selectedSubjects, // ✅ use state directly
    };

    try {
      setLoading(true);
      // Example API call
      const res = await axios.post(
        `${API_BASE_URL}/api/student-management/students/${id}/subjects`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(res)
      setOpenAssignSubjectsModal(false);
      getStudents();
      messageApi.success(
        res?.data?.message || "Subjects assigned successfully!"
      );
    } catch (error) {
      console.error(error);
      messageApi.error(res?.response?.error || "Failed to assign subjects.");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationConfig) => {
    getStudents(paginationConfig.current, searchText);
  };

  // Add this before return
  const handleSearch = () => {
    if (!searchText.trim()) {
      getStudents(); // If empty, show all
    } else {
      getStudents(1, searchText);
    }
  };

  useEffect(() => {
    if (initialized && token) getStudents(pagination.current);
    getTeachers();
    getAllSubjects();
  }, [initialized, token]);

  const openProgressModal = (student) => {
    setProgressStudent({
      ...student,
      results: [
        {
          subject: "Mathematics",
          firstTest: 15,
          secondTest: 18,
          assignment: 10,
          practical: 12,
          exam: 40,
        },
        {
          subject: "English",
          firstTest: 12,
          secondTest: 15,
          assignment: 9,
          practical: 10,
          exam: 35,
        },
      ],
    });
    setIsProgressOpen(true);
  };

  const openAddModal = () => {
    setEditingStudent(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (student) => {
    const matchingClass = classes.find(
      (c) =>
        c._id === student.class ||
        c.name === student.class ||
        c.displayName ===
          `${student.class}${student.arm ? " - " + student.arm : ""}`
    );

    form.setFieldsValue({
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
      gender: student.gender,
      class: matchingClass?._id || student.class || "",
      session: student.session,
      status: student.status || "active",
      house: student.house,
      parentEmail: student.parentEmail || student.parent?.email || "",
      parentPhone: student.parentPhone || student.parent?.phone || "",
      parentAddress: student.parentAddress || student.parent?.address || "",
    });

    if (student.avatar) {
      setFileList([
        {
          uid: "-1",
          name: "avatar.png",
          status: "done",
          url: student.avatar,
        },
      ]);
    } else setFileList([]);

    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const openDetails = (record) => {
    setDetailsStudent(record);
    setIsDetailsOpen(true);
    // console.log(record)
  };

  //Get student subjects
  const getStdentSubjects = async (student) => {
  const id = student?._id;

  try {
    const res = await axios.get(
      `${API_BASE_URL}/api/student-management/students/${id}/subjects`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const subjectsArr = res?.data?.data || [];
    setStdSunject(subjectsArr);

    // FIX: set selected subject IDs
    setSelectedSubjects(subjectsArr.map(sub => sub._id));

  } catch (error) {
    console.log(error || "Error getting subjects");
  }
};


  //Get Class
  const getClass = async () => {
    if (!token) return;
    setIsLoadingClasses(true);
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const classData = res?.data?.data || [];

      // Ensure each class has name and arm displayed together
      const formattedClasses = classData.map((c) => ({
        _id: c._id,
        name: c.name,
        arm: c.arm,
        displayName: `${c.name}${c.arm ? " - " + c.arm : ""}`,
      }));

      setClasses(formattedClasses);
      // console.log(res);
      // messageApi.success(res?.data?.message || "Classes fetched successfully");
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to fetch classes"
      );
    } finally {
      setIsLoadingClasses(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    getClass();
  }, [token]);

  // 🧩 Save student (add/edit)
  const handleSave = async (values) => {
    const formData = new FormData();

    // Append all fields
    Object.keys(values).forEach((key) => {
      if (key !== "avatar") formData.append(key, values[key]);
    });

    // Append avatar if new file uploaded
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("avatar", fileList[0].originFileObj);
    }

    // ==========================================================
    // 💡 START LOGGING THE DATA BEING SENT
    // ==========================================================
    console.log("--- Data being sent (FormData contents) ---");
    
    // Create an object to hold the key-value pairs for easy logging
    const dataToLog = {};
    let fileInfo = "No new file uploaded.";

    // Use formData.forEach() or formData.entries() to iterate
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            // Log file details without logging the entire binary data
            fileInfo = `File Name: ${value.name}, Size: ${(value.size / 1024).toFixed(2)} KB, Type: ${value.type}`;
            dataToLog[key] = fileInfo;
        } else {
            // Log simple fields
            dataToLog[key] = value;
        }
    }
    
    console.log(dataToLog);
    console.log("------------------------------------------");
    // ==========================================================
    // 💡 END LOGGING THE DATA BEING SENT
    // ==========================================================

    setLoading(true);

    try {
      let res;
      if (editingStudent) {
        // PATCH request for edit
        res = await axios.patch(
          `${API_BASE_URL}/api/student-management/student/${editingStudent._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        messageApi.success(res.data.message || "Student updated successfully");
        console.log(res);
        getStudents();
      } else {
        // POST request for create
        res = await axios.post(
          `${API_BASE_URL}/api/student-management/student`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        messageApi.success(res.data.message || "Student added successfully");
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingStudent(null);
      setFileList([]);
    } catch (error) {
      console.error(error);
      messageApi.error(
        error?.response?.data?.message || "Failed to save student"
      );
    } finally {
      setLoading(false);
    }
};

  // 🧩 Render avatar in table
  const renderAvatar = (record) => {
    if (record.avatar) {
      return (
        <img
          src={record.avatar}
          alt="student"
          className="w-10 h-10 rounded-full object-cover"
        />
      );
    }
    const initials = `${record.firstName?.[0] || ""}${
      record.lastName?.[0] || ""
    }`;
    return (
      <Avatar style={{ backgroundColor: "#1677ff", color: "#fff" }}>
        {initials.toUpperCase()}
      </Avatar>
    );
  };

  const handleDelete = async (record) => {
    console.log(record);
    try {
      // Optional: show a loading message
      messageApi.open({
        type: "loading",
        content: "Deleting student...",
        duration: 0,
      });

      const res = await axios.delete(
        `${API_BASE_URL}/api/class-management/classes/${record._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Close the loading message first
      messageApi.destroy();

      messageApi.success(res?.data?.message || "Student deleted successfully");

      // Update local state (remove deleted student)
      setStudents((prev) => prev.filter((s) => s._id !== record._id));

      // Refresh class list if needed
      getClass?.();
    } catch (error) {
      console.error("Error deleting student:", error);
      messageApi.destroy();
      messageApi.error(
        error?.response?.data?.message || "Failed to delete student"
      );
    }
  };

  const columns = [
    { title: "S/N", key: "sn", render: (_, __, index) => index + 1 },
    {
      title: "Image",
      dataIndex: "avatar",
      key: "avatar",
      render: (_, record) => renderAvatar(record),
    },
    {
      title: "Admission No",
      dataIndex: "admissionNumber",
      key: "admissionNumber",
      width: 120,
    },
    {
      title: "Full Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Class",
      dataIndex: "class",
      key: "class",
      render: (text, record) => record?.class?.name || record.class,
    },
    {
      title: "Arm",
      dataIndex: "arm",
      key: "arm",
      render: (text, record) => record?.class?.arm || record.class,
    },
    {
      title: "Session",
      dataIndex: "session",
      key: "session",
    },
    {
      title: "Parent Name",
      dataIndex: "parentName",
      key: "parentName",
      render: (_, record) => record.parent?.name || "-",
    },
    {
      title: "Parent Phone",
      dataIndex: "parentPhone",
      key: "parentPhone",
      // render: (_, record) => record.parent?.phone || "-",
    },
    {
      title: "Actions",
      key: "action",
      // width: 200,
      render: (_, record) => {
        const menu = (
          <Menu
            className="p-2 rounded-lg shadow-md"
            style={{ width: 160 }}
            items={[
              {
                key: "1",
                icon: <EyeOutlined />,
                label: "View Details",
                onClick: () => openDetails(record),
              },
              {
                key: "2",
                icon: <EditOutlined />,
                label: "Edit Student",
                onClick: () => openEditModal(record),
              },
              {
                key: "3",
                icon: <BookOutlined />,
                label: "Assign Subjects",
                onClick: () => openAssignSubjectsModal(record),
              },

              {
                type: "divider",
              },
              {
                key: "4",
                icon: <BarChartOutlined style={{ color: "#52c41a" }} />,
                label: "Progress Report",
                onClick: () => openProgressModal(record),
              },
              {
                type: "divider",
              },
              {
                key: "5",
                icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
                label: (
                  <Popconfirm
                    title="Delete student?"
                    onConfirm={() => handleDelete(record)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <span className="text-red-500">Delete</span>
                  </Popconfirm>
                ),
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

  // -----------------------------------------
  // CSV upload -> preview (opens preview modal)
  // -----------------------------------------
  const handleCsvUpload = async (file) => {
    if (!file) return message.warning("Please select a file first!");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setCsvLoading(true);
      const res = await axios.post(
        `${API_BASE_URL}/api/student-management/student/bulk/preview`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // console.log(res);

      if (res.data?.success) {
        messageApi.success(
          res.data?.message || "Preview generated successfully"
        );
        // store preview array in state
        // ensure it's a deep copy so edits don't mutate original response (safety)
        const previewArray = Array.isArray(res.data.preview)
          ? res.data.preview.map((r) => ({ ...r }))
          : [];
        setCsvPreviewData(previewArray);
        setCsvPagination((p) => ({ ...p, current: 1 })); // reset preview pager
        setIsCsvModalVisible(true);
        console.log(res);
      } else {
        messageApi.error(res.data?.message || "Preview failed");
      }
    } catch (error) {
      messageApi.error(error?.response?.data?.message || "CSV preview failed");
      console.error("CSV preview error:", error);
    } finally {
      setCsvLoading(false);
    }
  };

  const confirmImport = async () => {
    try {
      if (!csvPreviewData || csvPreviewData.length === 0) {
        messageApi.error("No data to import");
        return;
      }

      setImporting(true);

      // Format student data
      const studentsPayload = csvPreviewData.map((row) => ({
        firstName: row.firstName || "",
        lastName: row.lastName || "",
        session: row.session || "",
        gender: row.gender?.toLowerCase() || "",
        dob: row.dob ? new Date(row.dob).toISOString().split("T")[0] : "",
        parentEmail: row.parentEmail || "",
        parentPhone: row.parentPhone || "",
        house: row.house || "",
        status: row.status || "active",
      }));

      const pagination = {
        page: 1,
        total: studentsPayload.length,
        totalPages: 1,
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/student-management/student/bulk/commit`,
        { students: studentsPayload, pagination },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        messageApi.success("Students imported successfully!");
        setIsCsvModalVisible(false);
        setCsvPreviewData([]); // reset CSV preview
        getStudents(); // refresh main list
      } else {
        messageApi.error(response.data.message || "Failed to import students");
      }
    } catch (error) {
      console.error("Import error:", error);
      messageApi.error("Something went wrong while importing students");
    } finally {
      setImporting(false);
    }
  };

  // ----------------------
  // Editable cell handlers
  // ----------------------
  // editingCell format: `${rowIndex}-${dataIndex}`
  const startEditCell = (rowIndex, dataIndex) => {
    setEditingCell(`${rowIndex}-${dataIndex}`);
  };

  const stopEditCell = () => setEditingCell(null);

  // Save a single cell value into csvPreviewData (rowIndex refers to index in csvPreviewData array)
  const handleSaveCell = (rowIndex, dataIndex, newValue) => {
    setCsvPreviewData((prev) => {
      const copy = prev.map((r) => ({ ...r }));
      // defensively create object if missing
      if (!copy[rowIndex]) copy[rowIndex] = {};
      // convert some fields if needed: suggestions/subjects expect arrays? We'll keep strings for edit and later mapping.
      copy[rowIndex][dataIndex] = newValue;
      return copy;
    });
    stopEditCell();
  };

  // Utility to render cell content (display) and editor
  const renderEditableCell = (text, record, rowIndex, dataIndex) => {
    const cellId = `${rowIndex}-${dataIndex}`;
    const isEditing = editingCell === cellId;

    // choose editor based on dataIndex
    const getEditor = () => {
      if (dataIndex === "gender") {
        return (
          <Select
            autoFocus
            defaultValue={text || ""}
            onBlur={(e) => {
              // blur handler may not carry value; use onChange to save
              stopEditCell();
            }}
            onChange={(val) => handleSaveCell(rowIndex, dataIndex, val)}
            style={{ width: "100%" }}
          >
            <Option value="male">male</Option>
            <Option value="female">female</Option>
            <Option value="other">other</Option>
          </Select>
        );
      }

      if (dataIndex === "status") {
        return (
          <Select
            autoFocus
            defaultValue={text || ""}
            onBlur={() => stopEditCell()}
            onChange={(val) => handleSaveCell(rowIndex, dataIndex, val)}
            style={{ width: "100%" }}
          >
            <Option value="active">active</Option>
            <Option value="inactive">inactive</Option>
          </Select>
        );
      }

      // default editor: text input for most fields
      return (
        <Input
          autoFocus
          defaultValue={text === undefined || text === null ? "" : String(text)}
          onPressEnter={(e) =>
            handleSaveCell(rowIndex, dataIndex, e.target.value)
          }
          onBlur={(e) => handleSaveCell(rowIndex, dataIndex, e.target.value)}
        />
      );
    };

    // how to display arrays: suggestions/subjects -> join
    const displayValue = () => {
      const val = record[dataIndex];
      if (Array.isArray(val)) return val.join(", ");
      return val === undefined || val === null ? "—" : String(val);
    };

    return isEditing ? (
      getEditor()
    ) : (
      <div
        onDoubleClick={() => startEditCell(rowIndex, dataIndex)}
        style={{
          minHeight: 20,
          cursor: "pointer",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title="Double-click to edit"
      >
        {displayValue()}
      </div>
    );
  };

  // ------------------------------
  // CSV preview table column defs
  // include all fields you listed plus any others that may appear
  // ------------------------------
  const csvColumns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      // width: 130,
      render: (text, record, idx) =>
        renderEditableCell(text, record, idx, "firstName"),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      // width: 130,
      render: (text, record, idx) =>
        renderEditableCell(text, record, idx, "lastName"),
    },
    {
      title: "DOB",
      dataIndex: "dob",
      key: "dob",
      // width: 110,
      render: (text, record, idx) =>
        renderEditableCell(text, record, idx, "dob"),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      // width: 100,
      render: (text, record, idx) =>
        renderEditableCell(text, record, idx, "gender"),
    },
    {
      title: "House",
      dataIndex: "house",
      key: "house",
      // width: 120,
      render: (text, record, idx) =>
        renderEditableCell(text, record, idx, "house"),
    },
    {
      title: "Session",
      dataIndex: "session",
      key: "session",
      // width: 120,
      render: (text, record, idx) =>
        renderEditableCell(text, record, idx, "session"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // width: 110,
      render: (text, record, idx) =>
        renderEditableCell(text, record, idx, "status"),
    },
    {
      title: "Parent Phone",
      dataIndex: "parentPhone",
      key: "parentPhone",
      // width: 140,
      render: (text, record, idx) =>
        renderEditableCell(text, record, idx, "parentPhone"),
    },
    {
      title: "Parent Email",
      dataIndex: "parentEmail",
      key: "parentEmail",
      // width: 200,
      render: (text, record, idx) =>
        renderEditableCell(text, record, idx, "parentEmail"),
    },
  ];

  // helper: map csvPreviewData to dataSource with row index keys
  const csvDataSource = csvPreviewData.map((r, idx) => ({ ...r, key: idx }));

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-1/3">
          <Input
            placeholder="Search student by name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => {
              const value = e.target.value;
              setSearchText(value);
              if (value.trim() === "") {
                getStudents(); // 🔥 fetch all when input is cleared
              }
            }}
            onPressEnter={handleSearch} // ✅ triggers search on Enter
            className="flex-1"
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={loading}
            disabled={loading}
            onClick={handleSearch} // ✅ triggers search on button click
          >
            Search
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select
            placeholder="Select Class"
            allowClear
            className="w-40"
            loading={isLoadingClasses}
            value={selectedClass}
            onChange={(value) => {
              setSelectedClass(value);
              if (value) {
                getStudents(1, "", value); // fetch students for the selected class
              } else {
                getStudents(); // reset to all students
              }
            }}
          >
            {classes.map((c) => (
              <Option key={c._id} value={c._id}>
                {c.displayName}
              </Option>
            ))}
          </Select>

          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
            >
              Add Student
            </Button>
            {/* <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
            >
              Assign Subjects
            </Button> */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              id="csvUploadInput"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleCsvUpload(file);
                  e.target.value = "";
                }
              }}
            />

            <Button
              icon={<UploadOutlined />}
              loading={csvLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload CSV File
            </Button>
          </Space>
        </div>
      </div>

      {/* {selectedClass && (
        <p className="mb-3 text-gray-600">
          <span className="font-semibold">Teacher Assigned:</span>{" "}
          {teacherAssigned[selectedClass] || "Not Assigned"}
        </p>
      )} */}

      {/* Skeleton Loader */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Card className="shadow-md rounded-xl">
          <Table
            columns={columns}
            dataSource={students}
            rowKey="key"
            bordered
            size="small"
            pagination={{
              current: pagination.current,
              total: pagination.total,
              pageSize: pagination.pageSize,
              position: ["bottomCenter"],
              className: "custom-pagination",
              showSizeChanger: false,
            }}
            onChange={handleTableChange}
            className="custom-table"
            scroll={{ x: "max-content" }}
          />
        </Card>
      )}

      {/* ... your modals remain unchanged ... */}

      {/* 🧩 Add/Edit Modal with Avatar Upload */}
      <Modal
        title={editingStudent ? "Edit Student" : "Add Student"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingStudent(null);
          setFileList([]);
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Title level={5} className="mb-2 text-center">
            Student Information
          </Title>

          {/* 🧩 Avatar Upload */}
          <Form.Item label="Student Avatar" name="avatar">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Modal
            open={previewOpen}
            footer={null}
            onCancel={() => setPreviewOpen(false)}
          >
            <img alt="Preview" style={{ width: "100%" }} src={previewImage} />
          </Modal>

          {/* 🧾 Student Info Fields */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: "Please enter first name" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: "Please enter last name" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* <Col span={12}>
              <Form.Item
                label="Admission Number"
                name="admissionNumber"
                rules={[
                  { required: true, message: "Please enter admission number" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col> */}

            <Col span={12}>
              <Form.Item label="Roll Number" name="rollNumber">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Date of Birth"
                name="dob"
                rules={[
                  { required: true, message: "Please enter date of birth" },
                ]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Gender"
                name="gender"
                rules={[{ required: true, message: "Please select gender" }]}
              >
                <Select placeholder="Select gender">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Class"
                name="class"
                rules={[{ required: true, message: "Please select class" }]}
              >
                <Select
                  placeholder="Select class"
                  loading={isLoadingClasses}
                  showSearch
                  optionFilterProp="children"
                >
                  {classes.map((c) => (
                    <Option key={c._id} value={c._id}>
                      {`${c.name}${c.arm ? " - " + c.arm : ""}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Status" name="status" initialValue="active">
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Session"
                name="session"
                rules={[{ required: true, message: "Please select session" }]}
              >
                <Select placeholder="Select session">
                  {sessions.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="House" name="house">
                <Input placeholder="e.g. Blue House" />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} className="mb-2 text-center">
            Parent Information
          </Title>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Parent Email"
                name="parentEmail"
                rules={[
                  { required: true, message: "Please enter parent email" },
                ]}
              >
                <Input type="email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Parent Phone"
                name="parentPhone"
                rules={[
                  { required: true, message: "Please enter parent phone" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Parent Address"
                name="parentAddress"
                rules={[
                  { required: true, message: "Please enter parent address" },
                ]}
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
                setEditingStudent(null);
                setFileList([]);
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingStudent ? "Update" : "Save"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title="Student Details"
        open={isDetailsOpen}
        onCancel={() => setIsDetailsOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailsOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        <div className="w-50 h-50 mb-3">
          <img
            src={detailsStudent?.avatar || std_img}
            alt=""
            className="object-cover w-full h-full rounded-md"
          />
        </div>
        {detailsStudent && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Amission No">
              {detailsStudent.admissionNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Name">
              {detailsStudent.name}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {detailsStudent.gender}
            </Descriptions.Item>
            <Descriptions.Item label="Session">
              {detailsStudent.session}
            </Descriptions.Item>
            <Descriptions.Item label="class">
              {detailsStudent.class?.name}
            </Descriptions.Item>
            <Descriptions.Item label="PIN">
              {detailsStudent.pin}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Name">
              {detailsStudent.parent?.name || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Phone">
              {detailsStudent.parentPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Email">
              {detailsStudent.parentEmail}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Occupation">
              {detailsStudent.parent?.occupation || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Parent Address">
              {detailsStudent.parentAddress || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Class Teacher">
              {/* {detailsStudent?.detailsStudent.class || "—"} */}
            </Descriptions.Item>
            <Descriptions.Item label="Subjects Offered">
              {detailsStudent.subjects && detailsStudent.subjects.length > 0
                ? detailsStudent.subjects.map((s) => s.name).join(", ")
                : "—"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Progress Report Modal */}
      <Modal
        title={`Progress Report - ${progressStudent?.name}`}
        open={isProgressOpen}
        onCancel={() => setIsProgressOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsProgressOpen(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {progressStudent && (
          <Table
            dataSource={progressStudent.results.map((r, idx) => {
              const total =
                r.firstTest +
                r.secondTest +
                r.assignment +
                r.practical +
                r.exam;
              const grade =
                total >= 70
                  ? "A"
                  : total >= 60
                  ? "B"
                  : total >= 50
                  ? "C"
                  : total >= 40
                  ? "D"
                  : "F";
              return { ...r, key: idx, total, grade };
            })}
            columns={[
              { title: "Subject", dataIndex: "subject", key: "subject" },
              { title: "1st Test", dataIndex: "firstTest", key: "firstTest" },
              { title: "2nd Test", dataIndex: "secondTest", key: "secondTest" },
              {
                title: "Assignment",
                dataIndex: "assignment",
                key: "assignment",
              },
              { title: "Practical", dataIndex: "practical", key: "practical" },
              { title: "Exam", dataIndex: "exam", key: "exam" },
              { title: "Total", dataIndex: "total", key: "total" },
              { title: "Grade", dataIndex: "grade", key: "grade" },
            ]}
            pagination={false}
            bordered
            size="small"
          />
        )}
      </Modal>

      {/* CSV Preview Modal with editable table + pagination */}
      <Modal
        title="CSV Preview"
        open={isCsvModalVisible}
        onCancel={() => setIsCsvModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setIsCsvModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={importing}
            onClick={confirmImport}
          >
            Confirm Import
          </Button>,
        ]}
      >
        <Table
          dataSource={csvDataSource}
          columns={csvColumns}
          bordered
          rowKey="key"
          size="small"
          pagination={{
            current: csvPagination.current,
            pageSize: csvPagination.pageSize,
            total: csvPreviewData.length,
            showSizeChanger: true,
            className: "custom-pagination",
            pageSizeOptions: ["5", "10", "20", "50"],
            onChange: (page, pageSize) => {
              setCsvPagination({ current: page, pageSize });
            },
            onShowSizeChange: (current, size) =>
              setCsvPagination({ current: 1, pageSize: size }),
          }}
          className="custom-table"
          scroll={{ x: "max-content" }}
        />
        <div style={{ marginTop: 12 }}>
          <small>
            Tip: double-click any cell to edit it. Press Enter or click outside
            to save the cell value.
          </small>
        </div>
      </Modal>

      {/* Asign Modal */}
      <Modal
        title={`Assign Subjects - ${selectedStudent?.name || ""}`}
        open={openSubjectAssignModal}
        onCancel={() => {
          setOpenAssignSubjectsModal(false);
          setSelectedStudent(null);
          setSelectedSubjects([]);
        }}
        onOk={() => form.submit()} // ✅ safe submit
        okText="Assign"
        confirmLoading={loading}
      >
        <Form layout="vertical" form={form} onFinish={assignSubject}>
          <Form.Item label="Select Subjects">
            <Select
              mode="multiple"
              placeholder="Select subjects"
              value={selectedSubjects}
              onChange={setSelectedSubjects}
              loading={loading}
              style={{ width: "100%" }}
            >
              {subjects?.map((s) => (
                <Option key={s._id} value={s._id}>
                  {s.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Student;

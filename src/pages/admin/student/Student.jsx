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
  Card
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
} from "@ant-design/icons";
import std_img from "../../../assets/student.jpg";
import { useApp } from "../../../context/AppContext";
import axios from "axios";

const { Title } = Typography;
const { Option } = Select;

const sessions = ["2023/2024", "2024/2025", "2025/2026"];

const teacherAssigned = {
  JSS1: "Mr. Adams",
  JSS2: "Mrs. Akande",
  JSS3: "Mr. Brown",
  SS1: "Mrs. Johnson",
  SS2: "Mr. Peters",
  SS3: "Mrs. Gomez",
};

// const generatePin = () =>
//   Math.floor(100000 + Math.random() * 900000).toString();
// const generateRegNo = () => `STU${Date.now().toString().slice(-6)}`;

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

  const [isFocused, setIsFocused] = useState(false);

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
      // Populate form fields
      form.setFieldsValue({
        ...editingStudent,
        parentEmail: editingStudent.parentEmail || "",
        parentPhone: editingStudent.parentPhone || "",
        parentAddress: editingStudent.parentAddress || "",
      });

      // Populate avatar if exists
      if (editingStudent.avatar) {
        setFileList([
          {
            uid: "-1",
            name: "avatar.png",
            status: "done",
            url: editingStudent.avatar, // existing image
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [editingStudent, form]);

  // Fetch students (with search)
  const getStudents = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const normalizedSearch = search.trim().toLowerCase();
      const searchParam = normalizedSearch
        ? `&search=${encodeURIComponent(normalizedSearch)}`
        : "";

      const res = await axios.get(
        `${API_BASE_URL}/api/student-management/student?page=${page}${searchParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(res);

      const studentsWithFullName = (res?.data?.data || []).map((s) => ({
        ...s,
        key: s._id,
        name: `${s.firstName || ""} ${s.lastName || ""}`.trim(),
      }));

      messageApi.success(res.data?.message);
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
    const waitForClasses = () => {
      if (!classes || classes.length === 0) {
        setTimeout(waitForClasses, 300); // try again after 300ms
        return;
      }

      console.log("Editing:", student.class);

      const matchingClass = classes.find(
        (c) =>
          c._id === student.class?._id ||
          c.name === student.class?.name ||
          c.displayName ===
            `${student.class?.name}${
              student.class?.arm ? " - " + student.class?.arm : ""
            }`
      );

      console.log("matchingClass:", matchingClass);

      form.setFieldsValue({
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNumber: student.admissionNumber,
        rollNumber: student.rollNumber,
        dob: student.dob ? student.dob.split("T")[0] : "",
        gender: student.gender,
        class: matchingClass?._id || "",
        session: student.session,
        status: student.status || "active",
        house: student.house,
        parentEmail: student.parentEmail,
        parentPhone: student.parentPhone,
        parentAddress: student.parentAddress,
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
      } else {
        setFileList([]);
      }

      setEditingStudent(student);
      setIsModalOpen(true);
    };

    waitForClasses();
  };

  const openDetails = (record) => {
    setDetailsStudent(record);
    setIsDetailsOpen(true);
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
                type: "divider",
              },
              {
                key: "3",
                icon: <BarChartOutlined style={{ color: "#52c41a" }} />,
                label: "Progress Report",
                onClick: () => openProgressModal(record),
              },
              {
                type: "divider",
              },
              {
                key: "4",
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

  // console.log(token)
  // console.log(API_BASE_URL)

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

      console.log(res)
      
      if (res.data?.success) {
        messageApi.success(res.data?.message || "Preview generated successfully");
        // store preview array in state
        // ensure it's a deep copy so edits don't mutate original response (safety)
        const previewArray = Array.isArray(res.data.preview)
          ? res.data.preview.map((r) => ({ ...r }))
          : [];
        setCsvPreviewData(previewArray);
        setCsvPagination((p) => ({ ...p, current: 1 })); // reset preview pager
        setIsCsvModalVisible(true);
        console.log(res)
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

  // Helper: try to parse DOB from formats like "3/22/2015" -> "2015-03-22"
// If it's already ISO-like, return as-is.
const normalizeDob = (dob) => {
  if (!dob) return "";
  // common mm/dd/yyyy or m/d/yyyy
  if (typeof dob === "string" && dob.includes("/")) {
    const parts = dob.split("/").map((p) => p.trim());
    // expect M/D/YYYY
    if (parts.length === 3) {
      let [m, d, y] = parts;
      if (y.length === 2) {
        // assume 20xx for two-digit years (unlikely here)
        y = "20" + y;
      }
      // zero-pad month/day
      if (m.length === 1) m = "0" + m;
      if (d.length === 1) d = "0" + d;
      return `${y}-${m}-${d}`;
    }
  }
  // fallback: return original (server may accept different formats)
  return dob;
};

// Helper: try to find a classId from classes list using className and arm
const findClassId = (row, classes) => {
  if (!classes || classes.length === 0) return null;
  const name = (row.className || "").trim();
  const arm = (row.arm || "").trim();

  // 1) exact match on name + arm
  let c = classes.find(
    (cl) =>
      String(cl.name).trim().toLowerCase() === name.toLowerCase() &&
      String(cl.arm || "").trim().toLowerCase() === arm.toLowerCase()
  );
  if (c) return c._id;

  // 2) match on displayName (if you stored `${name} - ${arm}`)
  c = classes.find(
    (cl) =>
      String(cl.displayName || "")
        .trim()
        .toLowerCase() === `${name}${arm ? " - " + arm : ""}`.toLowerCase()
  );
  if (c) return c._id;

  // 3) fallback: match by name only
  c = classes.find(
    (cl) => String(cl.name).trim().toLowerCase() === name.toLowerCase()
  );
  if (c) return c._id;

  // 4) last resort: try partial match (startsWith)
  c = classes.find((cl) =>
    String(cl.name).trim().toLowerCase().startsWith(name.toLowerCase())
  );
  if (c) return c._id;

  return null; // couldn't find
};

// confirmImport function - place inside your component (has access to csvPreviewData, classes, token, API_BASE_URL, message, setCsvLoading, getStudents, setIsCsvModalVisible)
const confirmImport = async () => {
  if (!csvPreviewData || csvPreviewData.length === 0) {
    messageApi.warning("No preview data to import.");
    return;
  }

  // Build payload.students and validate class mapping
  const studentsPayload = [];
  const missingClassRows = []; // collect indices or info for rows we can't map to classId

  csvPreviewData.forEach((row, idx) => {
    // map row fields -> expected API fields
    const classId = findClassId(row, classes);

    if (!classId) {
      missingClassRows.push({
        row: idx + 1,
        firstName: row.firstName || "",
        lastName: row.lastName || "",
        className: row.className || "",
        arm: row.arm || "",
      });
      // still build payload but with null classId so user sees the issue if they inspect
    }

    // normalize phone - if 10 digits and doesn't start with 0, add leading 0
    let phone = row.parentPhone || "";
    const digitsOnly = String(phone).replace(/\D/g, "");
    if (digitsOnly.length === 10 && !String(phone).startsWith("0")) {
      phone = "0" + digitsOnly;
    }

    // normalize dob
    const dob = normalizeDob(row.dob);

    // normalize subjects (if array -> join, if string -> use as-is)
    let subjects = row.subjects;
    if (Array.isArray(subjects)) subjects = subjects.join(", ");
    if (subjects == null) subjects = "";

    // build student object
    studentsPayload.push({
      firstName: row.firstName || "",
      lastName: row.lastName || "",
      classId: classId || null,
      session: row.session || "",
      gender: row.gender || "",
      dob: dob || "",
      subjects: subjects,
      parentEmail: row.parentEmail || "",
      parentPhone: phone,
      house: row.house || "",
      status: row.status || "active",
    });
  });

  // If some rows are missing classId, notify user & abort so they can fix in the preview modal
  if (missingClassRows.length > 0) {
    // produce a helpful message describing which rows are missing mapping
    const details = missingClassRows
      .slice(0, 5) // show up to 5 examples
      .map(
        (r) =>
          `Row ${r.row}: ${r.firstName} ${r.lastName} (class: ${r.className}${
            r.arm ? " - " + r.arm : ""
          })`
      )
      .join("\n");

    messageApi.error(
      `Unable to resolve classId for ${missingClassRows.length} row(s). Please fix className/arm in the preview modal.\n\nExamples:\n${details}`
    );
    return;
  }

  // All good -> call import endpoint
  try {
    setLoading(true);

    // Endpoint expects { students: [...] } per your sample
    const payload = { students: studentsPayload };

    const res = await axios.post(
      `${API_BASE_URL}/api/student-management/student/bulk/commit`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data?.success) {
      messageApi.success(res.data.message || "Students imported successfully");
      setIsCsvModalVisible(false);
      // refresh main students list
      getStudents();
    } else {
      // API responded but reported failure
      messageApi.error(res.data?.message || "Import failed");
      console.error("Import response:", res.data);
    }
  } catch (err) {
    console.error("Import error:", err);
    messageApi.error(err?.response?.data?.message || "Import request failed");
  } finally {
    setLoading(false);
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
    // {
    //   title: "Subjects",
    //   dataIndex: "subjects",
    //   key: "subjects",
    //   // width: 250,
    //   render: (text, record, idx) => {
    //     // if subjects is an array keep it, otherwise it's a string -> treat as comma list
    //     const subj = Array.isArray(record.subjects)
    //       ? record.subjects.join(", ")
    //       : record.subjects;
    //     return renderEditableCell(subj, record, idx, "subjects");
    //   },
    // },
    // {
    //   title: "Suggestions",
    //   dataIndex: "suggestions",
    //   key: "suggestions",
    //   // width: 200,
    //   render: (text, record, idx) => {
    //     const sug = Array.isArray(record.suggestions)
    //       ? record.suggestions.join(", ")
    //       : record.suggestions || "";
    //     return renderEditableCell(sug, record, idx, "suggestions");
    //   },
    // },
    // actions column to allow row-level operations (optional)
  ];

  // helper: map csvPreviewData to dataSource with row index keys
  const csvDataSource = csvPreviewData.map((r, idx) => ({ ...r, key: idx }));

  // Confirm import handler (optional: call import API or send csvPreviewData)
  const handleConfirmImport = async () => {
    try {
      // Example: call bulk/import endpoint with edited preview data
      setCsvLoading(true);
      // convert suggestions/subjects from comma string to arrays if needed
      const payload = csvPreviewData.map((row) => {
        const copy = { ...row };
        if (typeof copy.subjects === "string") {
          copy.subjects = copy.subjects
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        if (typeof copy.suggestions === "string") {
          copy.suggestions = copy.suggestions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        return copy;
      });

      // adjust endpoint as your API expects
      const res = await axios.post(
        `${API_BASE_URL}/api/student-management/student/bulk/import`,
        { data: payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        message.success(res.data?.message || "Import successful");
        setIsCsvModalVisible(false);
        getStudents(); // refresh main list
      } else {
        message.error(res.data?.message || "Import failed");
      }
    } catch (err) {
      console.error("Import error:", err);
      message.error(err?.response?.data?.message || "Import failed");
    } finally {
      setCsvLoading(false);
    }
  };

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
            onChange={(value) => setSelectedClass(value)}
            allowClear
            className="w-40"
            value={selectedClass}
          >
            {classes.map((c) => (
              <Option key={c} value={c}>
                {c}
              </Option>
            ))}
          </Select>

          {/* <Select
            placeholder="Select Session"
            // onChange={(value) => setSelectedSession(value)}
            allowClear
            className="w-40"
            value={selectedSession}
          >
            {sessions.map((s) => (
              <Option key={s} value={s}>
                {s}
              </Option>
            ))}
          </Select> */}

          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
            >
              Add Student
            </Button>
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

      {selectedClass && (
        <p className="mb-3 text-gray-600">
          <span className="font-semibold">Teacher Assigned:</span>{" "}
          {teacherAssigned[selectedClass] || "Not Assigned"}
        </p>
      )}

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
              {teacherAssigned[detailsStudent.class] || "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Subjects Offered">
              {detailsStudent.subjects?.length
                ? detailsStudent.subjects.join(", ")
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
            loading={loading}
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
    </div>
  );
};

export default Student


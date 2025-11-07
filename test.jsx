


import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  message,
  Popconfirm,
  Select,
  Space,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useApp } from "../../../context/AppContext.jsx";

const { Option } = Select;

/**
 * StudentsManagement component
 * - existing CRUD + upload CSV that calls /bulk/preview
 * - shows CSV preview in modal table with pagination and cell editing
 */
const StudentsManagement = () => {
  const { API_BASE_URL, token, loading, setLoading } = useApp();

  // main app state (kept from your existing code)
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

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

  // -------------------------
  // Fetch helpers (unchanged)
  // -------------------------
  const getStudents = async (page = 1, search = "", classFilter = selectedClass) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/student-management/students`, {
        params: {
          page,
          limit: pagination.pageSize,
          search,
          class: classFilter,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetched = res.data?.data?.students || [];
      setStudents(fetched);
      setFilteredStudents(fetched);
      setPagination((prev) => ({
        ...prev,
        total: res.data?.data?.pagination?.totalDocs || fetched.length,
      }));
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const getClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/class-management/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(res.data?.data?.classes || []);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  useEffect(() => {
    getStudents();
    getClasses();
  }, []);

  useEffect(() => {
    if (!searchText) {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(
        students.filter(
          (s) =>
            s.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    }
  }, [searchText, students]);

  // Save student (unchanged)
  const handleSave = async (values) => {
    try {
      setLoading(true);
      if (editingStudent) {
        const res = await axios.put(
          `${API_BASE_URL}/api/student-management/student/${editingStudent._id}`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        message.success(res.data?.message || "Student updated successfully");
      } else {
        const res = await axios.post(
          `${API_BASE_URL}/api/student-management/create-student`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        message.success(res.data?.message || "Student added successfully");
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingStudent(null);
      getStudents(pagination.current, searchText);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to save student");
    } finally {
      setLoading(false);
    }
  };

  // Delete student (unchanged)
  const handleDelete = async (record) => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `${API_BASE_URL}/api/student-management/student/${record._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success(res.data?.message || "Student deleted successfully");
      getStudents(pagination.current, searchText);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to delete student");
    } finally {
      setLoading(false);
    }
  };

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

      if (res.data?.success) {
        message.success(res.data?.message || "Preview generated successfully");
        // store preview array in state
        // ensure it's a deep copy so edits don't mutate original response (safety)
        const previewArray = Array.isArray(res.data.preview) ? res.data.preview.map((r) => ({ ...r })) : [];
        setCsvPreviewData(previewArray);
        setCsvPagination((p) => ({ ...p, current: 1 })); // reset preview pager
        setIsCsvModalVisible(true);
      } else {
        message.error(res.data?.message || "Preview failed");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "CSV preview failed");
      console.error("CSV preview error:", error);
    } finally {
      setCsvLoading(false);
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
          onPressEnter={(e) => handleSaveCell(rowIndex, dataIndex, e.target.value)}
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

    return isEditing ? getEditor() : (
      <div
        onDoubleClick={() => startEditCell(rowIndex, dataIndex)}
        style={{ minHeight: 20, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
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
    { title: "First Name", dataIndex: "firstName", key: "firstName", width: 130, render: (text, record, idx) => renderEditableCell(text, record, idx, "firstName") },
    { title: "Last Name", dataIndex: "lastName", key: "lastName", width: 130, render: (text, record, idx) => renderEditableCell(text, record, idx, "lastName") },
    { title: "DOB", dataIndex: "dob", key: "dob", width: 110, render: (text, record, idx) => renderEditableCell(text, record, idx, "dob") },
    { title: "Gender", dataIndex: "gender", key: "gender", width: 100, render: (text, record, idx) => renderEditableCell(text, record, idx, "gender") },
    { title: "Class", dataIndex: "className", key: "className", width: 120, render: (text, record, idx) => renderEditableCell(text, record, idx, "className") },
    { title: "Arm", dataIndex: "arm", key: "arm", width: 120, render: (text, record, idx) => renderEditableCell(text, record, idx, "arm") },
    { title: "House", dataIndex: "house", key: "house", width: 120, render: (text, record, idx) => renderEditableCell(text, record, idx, "house") },
    { title: "Session", dataIndex: "session", key: "session", width: 120, render: (text, record, idx) => renderEditableCell(text, record, idx, "session") },
    { title: "Status", dataIndex: "status", key: "status", width: 110, render: (text, record, idx) => renderEditableCell(text, record, idx, "status") },
    { title: "Parent Phone", dataIndex: "parentPhone", key: "parentPhone", width: 140, render: (text, record, idx) => renderEditableCell(text, record, idx, "parentPhone") },
    { title: "Parent Email", dataIndex: "parentEmail", key: "parentEmail", width: 200, render: (text, record, idx) => renderEditableCell(text, record, idx, "parentEmail") },
    { title: "Subjects", dataIndex: "subjects", key: "subjects", width: 250, render: (text, record, idx) => {
        // if subjects is an array keep it, otherwise it's a string -> treat as comma list
        const subj = Array.isArray(record.subjects) ? record.subjects.join(", ") : record.subjects;
        return renderEditableCell(subj, record, idx, "subjects");
      }
    },
    { title: "Suggestions", dataIndex: "suggestions", key: "suggestions", width: 200, render: (text, record, idx) => {
        const sug = Array.isArray(record.suggestions) ? record.suggestions.join(", ") : record.suggestions || "";
        return renderEditableCell(sug, record, idx, "suggestions");
      }
    },
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
          copy.subjects = copy.subjects.split(",").map((s) => s.trim()).filter(Boolean);
        }
        if (typeof copy.suggestions === "string") {
          copy.suggestions = copy.suggestions.split(",").map((s) => s.trim()).filter(Boolean);
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

  // -----------------------
  // Render component
  // -----------------------
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Students Management</h2>

      {/* Top toolbar (kept minimal; hidden file input triggers handleCsvUpload) */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input.Search placeholder="Search students" allowClear onSearch={(val) => setSearchText(val)} style={{ width: 250 }} />

        <Select
          placeholder="Select Class"
          onChange={(value) => {
            setSelectedClass(value);
            getStudents(1, searchText, value);
          }}
          allowClear
          className="w-40"
          value={selectedClass}
        >
          {classes.map((c) => (
            <Option key={c._id} value={c.displayName}>
              {c.displayName}
            </Option>
          ))}
        </Select>

        {/* Hidden input for CSV */}
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

        <Button icon={<UploadOutlined />} loading={csvLoading} onClick={() => fileInputRef.current?.click()}>
          Upload CSV File
        </Button>

        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          form.resetFields();
          setEditingStudent(null);
          setIsModalVisible(true);
        }}>
          Add Student
        </Button>
      </div>

      {/* Main students table (unchanged from your code) */}
      <Table
        loading={loading}
        columns={[
          { title: "Full Name", dataIndex: "fullName", key: "fullName" },
          { title: "Email", dataIndex: "email", key: "email" },
          { title: "Class", dataIndex: "className", key: "className" },
          {
            title: "Parent Name",
            dataIndex: "parentName",
            key: "parentName",
            render: (_, record) => record.parentName || record.parent?.name || "—",
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <Space>
                <Button type="link" onClick={() => {
                  setEditingStudent(record);
                  form.setFieldsValue(record);
                  setIsModalVisible(true);
                }}>Edit</Button>
                <Popconfirm title="Are you sure to delete this student?" onConfirm={() => handleDelete(record)}>
                  <Button danger type="link">Delete</Button>
                </Popconfirm>
              </Space>
            ),
          },
        ]}
        dataSource={filteredStudents}
        rowKey="_id"
        pagination={pagination}
        onChange={(pag) => {
          setPagination(pag);
          getStudents(pag.current, searchText);
        }}
        scroll={{ x: true }}
      />

      {/* Add/Edit student modal (kept from your code) */}
      <Modal title={editingStudent ? "Edit Student" : "Add Student"} open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ className: "" }}>
          <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: "Please enter full name" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Enter a valid email" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Class" name="className" rules={[{ required: true, message: "Please select class" }]}>
            <Select placeholder="Select Class">
              {classes.map((c) => (
                <Option key={c._id} value={c.displayName}>
                  {c.displayName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {editingStudent ? "Update" : "Add"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* CSV Preview Modal with editable table + pagination */}
      <Modal
        title="CSV Preview"
        open={isCsvModalVisible}
        onCancel={() => setIsCsvModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setIsCsvModalVisible(false)}>Close</Button>,
          <Button key="confirm" type="primary" loading={csvLoading} onClick={handleConfirmImport}>
            Confirm Import
          </Button>
        ]}
      >
        <Table
          dataSource={csvDataSource}
          columns={csvColumns}
          rowKey="key"
          pagination={{
            current: csvPagination.current,
            pageSize: csvPagination.pageSize,
            total: csvPreviewData.length,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            onChange: (page, pageSize) => {
              setCsvPagination({ current: page, pageSize });
            },
            onShowSizeChange: (current, size) => setCsvPagination({ current: 1, pageSize: size }),
          }}
          scroll={{ x: 1400 }}
        />
        <div style={{ marginTop: 12 }}>
          <small>Tip: double-click any cell to edit it. Press Enter or click outside to save the cell value.</small>
        </div>
      </Modal>
    </div>
  );
};

export default StudentsManagement;

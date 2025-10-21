import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  message,
  Popconfirm,
  Form,
  Input,
  Modal,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bulkSubjects, setBulkSubjects] = useState([""]);
  const [singleSubject, setSingleSubject] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [form] = Form.useForm();

  // Open modal
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setBulkSubjects([""]);
    setSingleSubject("");
  };

  // Add single subject
  const handleAddSingle = () => {
    if (!singleSubject.trim()) {
      return message.warning("Please enter a subject name");
    }
    const newSubject = { key: Date.now(), name: singleSubject };
    setSubjects([...subjects, newSubject]);
    setSingleSubject("");
    message.success("Subject added successfully!");
    closeModal();
  };

  // Add bulk subjects
  const handleAddBulk = () => {
    const validSubjects = bulkSubjects.filter((s) => s.trim() !== "");
    if (validSubjects.length === 0) {
      return message.warning("Please enter at least one subject");
    }

    const newSubjects = validSubjects.map((name) => ({
      key: Date.now() + Math.random(),
      name,
    }));

    setSubjects([...subjects, ...newSubjects]);
    message.success("Subjects added successfully!");
    closeModal();
  };

  // Delete subject
  const handleDelete = (key) => {
    setSubjects(subjects.filter((subject) => subject.key !== key));
    message.success("Subject deleted");
  };

  // Edit subject
  const handleEdit = (record) => {
    setEditingKey(record.key);
    form.setFieldsValue({ name: record.name });
  };

  const handleSaveEdit = (key) => {
    form
      .validateFields()
      .then((values) => {
        const updated = subjects.map((sub) =>
          sub.key === key ? { ...sub, name: values.name } : sub
        );
        setSubjects(updated);
        setEditingKey(null);
        message.success("Subject updated!");
      })
      .catch(() => {});
  };

  const columns = [
    {
      title: "Subject Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => {
        if (record.key === editingKey) {
          return (
            <Form form={form} layout="inline">
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Please enter subject name" },
                ]}
              >
                <Input placeholder="Enter subject name" />
              </Form.Item>
            </Form>
          );
        }
        return record.name;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        if (record.key === editingKey) {
          return (
            <Space>
              <Button type="link" onClick={() => handleSaveEdit(record.key)}>
                Save
              </Button>
              <Button type="link" onClick={() => setEditingKey(null)}>
                Cancel
              </Button>
            </Space>
          );
        }

        return (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure to delete this subject?"
              onConfirm={() => handleDelete(record.key)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Subject Management</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openModal}
          className="!bg-blue-600"
        >
          Add Subject
        </Button>
      </div>

      <Table
        dataSource={subjects}
        columns={columns}
        bordered
        size="small"
        pagination={{
          pageSize: 7,
          position: ["bottomCenter"],
          className: "custom-pagination",
        }}
        className="custom-table"
        scroll={{ x: "max-content" }}
      />

      {/* Add Subject Modal */}
      <Modal
        title="Add Subjects"
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Single Add",
              children: (
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Enter subject name"
                    value={singleSubject}
                    onChange={(e) => setSingleSubject(e.target.value)}
                  />
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddSingle}
                  >
                    Add
                  </Button>
                </div>
              ),
            },
            {
              key: "2",
              label: "Bulk Add",
              children: (
                <div className="space-y-2 mt-2">
                  {bulkSubjects.map((subject, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Subject ${index + 1}`}
                        value={subject}
                        onChange={(e) => {
                          const newBulk = [...bulkSubjects];
                          newBulk[index] = e.target.value;
                          setBulkSubjects(newBulk);
                        }}
                      />
                      <Button
                        icon={<PlusOutlined />}
                        onClick={() => setBulkSubjects([...bulkSubjects, ""])}
                      />
                      {bulkSubjects.length > 1 && (
                        <Button
                          icon={<MinusCircleOutlined />}
                          danger
                          onClick={() =>
                            setBulkSubjects(
                              bulkSubjects.filter((_, i) => i !== index)
                            )
                          }
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    type="primary"
                    className="mt-2"
                    onClick={handleAddBulk}
                  >
                    Save All
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default SubjectManagement;

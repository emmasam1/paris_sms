import { useEffect, useState, useMemo } from "react";
import { Modal, Transfer, Select, Button, Typography, Divider, message } from "antd";
import axios from "axios";
import { useApp } from "../../context/AppContext";

const { Title, Text } = Typography;
const { Option } = Select;

const MigrateClassModal = ({
  open,
  onClose,
  students = [],
  onMigrate,
  currentClass,
  currentSession,
}) => {
  const { token, API_BASE_URL, loading, setLoading } = useApp();

  const [targetKeys, setTargetKeys] = useState([]); // promoted students IDs
  const [nextClass, setNextClass] = useState(null); // classId
  const [nextSession, setNextSession] = useState("");
  const [classes, setClasses] = useState([]);

  /* ------------------------------------------------
     Reset modal state when closed / reopened
  ------------------------------------------------ */
  useEffect(() => {
    if (!open) {
      setTargetKeys([]);
      setNextClass(null);
      setNextSession("");
    }
  }, [open]);

  /* ------------------------------------------------
     Fetch all classes
  ------------------------------------------------ */
  const getClasses = async () => {
    if (!token) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setClasses(res?.data?.data || []);
    } catch (error) {
      console.error(error);
      message.error("Failed to load classes");
    }
  };

  useEffect(() => {
    if (open) getClasses();
  }, [open]);

  /* ------------------------------------------------
     Students belonging to current class
  ------------------------------------------------ */
  const classStudents = useMemo(() => {
    if (!currentClass?._id) return [];
    return students.filter(
      (s) => s.class?._id === currentClass._id
    );
  }, [students, currentClass]);

  /* ------------------------------------------------
     Handle transfer change
  ------------------------------------------------ */
  const handleChange = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
  };

  /* ------------------------------------------------
     Handle migration
  ------------------------------------------------ */
  const handleMigrate = () => {
    if (!nextClass || !nextSession) {
      message.warning("Select next class and session");
      return;
    }

    const promoted = classStudents.filter((s) =>
      targetKeys.includes(s._id)
    );

    const notPromoted = classStudents.filter(
      (s) => !targetKeys.includes(s._id)
    );

    onMigrate(promoted, notPromoted, {
      fromClass: currentClass._id,
      toClass: nextClass,
      nextSession,
    });

    onClose();
  };

  return (
    <Modal
      title={<Title level={4}>Class Migration</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={850}
      destroyOnClose
    >
      {/* Top info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <Text className="text-gray-700">
          Migrating from{" "}
          <b>
            {currentClass?.name} ({currentClass?.arm})
          </b>{" "}
          — Session {currentSession}
        </Text>

        <div className="flex gap-3">
          {/* Next class */}
          <Select
            placeholder="Select next class"
            style={{ width: 200 }}
            value={nextClass || undefined}
            onChange={setNextClass}
          >
            {classes
              .filter((cls) => cls._id !== currentClass?._id)
              .map((cls) => (
                <Option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.arm})
                </Option>
              ))}
          </Select>

          {/* Next session */}
          <Select
            placeholder="Select new session"
            style={{ width: 200 }}
            value={nextSession || undefined}
            onChange={setNextSession}
          >
            <Option value="2024/2025">2024/2025</Option>
            <Option value="2025/2026">2025/2026</Option>
          </Select>
        </div>
      </div>

      <Divider />

      {/* Transfer list */}
      <Transfer
        dataSource={classStudents.map((s) => ({
          key: s._id,
          title: s.studentName,
        }))}
        targetKeys={targetKeys}
        onChange={handleChange}
        render={(item) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
              {item.title.charAt(0).toUpperCase()}
            </div>
            <span>{item.title}</span>
          </div>
        )}
        listStyle={{ width: 340, height: 360 }}
        titles={[
          `Current Class (${currentClass?.name})`,
          `Promoted Students`,
        ]}
      />

      {/* Footer buttons */}
      <div className="flex justify-end mt-5 gap-3">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="primary"
          disabled={!nextClass || !nextSession || targetKeys.length === 0}
          onClick={handleMigrate}
        >
          Promote Selected
        </Button>
      </div>
    </Modal>
  );
};

export default MigrateClassModal;

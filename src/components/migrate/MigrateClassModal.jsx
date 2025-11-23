import { useEffect, useState } from "react";
import { Modal, Transfer, Select, Button, Typography, Divider } from "antd";
import axios from "axios";
import { useApp } from "../../context/AppContext";

const { Title, Text } = Typography;

const MigrateClassModal = ({
  open,
  onClose,
  students = [],
  onMigrate,
  currentClass,
  currentSession,
}) => {
  const [targetKeys, setTargetKeys] = useState([]); // promoted students
  const [nextClass, setNextClass] = useState("");
  const [nextSession, setNextSession] = useState("");
  const [classes, setClasses] = useState([]);

  const { token, API_BASE_URL } = useApp();

  const handleChange = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
  };

  // Fetch classes
  const getClass = async () => {
    if (!token) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/class-management/classes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setClasses(res?.data?.data || []);
      console.log("All class:", res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getClass();
  }, []);

  const handleMigrate = () => {
    const promoted = students.filter((s) => targetKeys.includes(s.id));
    const notPromoted = students.filter((s) => !targetKeys.includes(s.id));

    onMigrate(promoted, notPromoted, { nextClass, nextSession });
    onClose();
  };

  return (
    <Modal
      title={<Title level={4}>Class Migration</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={850}
      className="rounded-lg"
    >
      {/* Top info bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <Text className="font-medium text-gray-700">
            Migrating from <b>{currentClass}</b> ({currentSession})
          </Text>
        </div>

        <div className="flex items-center gap-3">
          <Select
            placeholder="Select next class"
            style={{ width: 180 }}
            value={nextClass?.name || undefined} // 👈 use undefined when nothing is selected
            onChange={(value) => setNextClass(value)}
          >
            {classes
              .filter((cls) => cls._id !== currentClass?._id) // exclude current class
              .map((cls) => (
                <Select.Option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.arm})
                </Select.Option>
              ))}
          </Select>

          <Select
            placeholder="Select new session"
            style={{ width: 180 }}
            onChange={(value) => setNextSession(value)}
          >
            <Select.Option value="2024/2025">2024/2025</Select.Option>
            <Select.Option value="2025/2026">2025/2026</Select.Option>
          </Select>
        </div>
      </div>

      <Divider className="my-3" />

      {/* Transfer list */}
      <Transfer
        dataSource={students
          .filter((s) => s.class?.name === currentClass) // only students from this class
          .map((s) => ({
            key: s._id,
            title: s.studentName,
          }))}
        targetKeys={targetKeys}
        onChange={handleChange}
        render={(item) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
              {item.title.charAt(0).toUpperCase()}
            </div>
            <span>{item.title}</span>
          </div>
        )}
        listStyle={{ width: 340, height: 360 }}
        titles={[
          `Current Class (${currentClass})`,
          `Next Class (${nextClass?.name || "Select class"})`,
        ]}
      />

      {/* Buttons */}
      <div className="flex justify-end mt-5 gap-3">
        <Button onClick={onClose}>Cancel</Button>
        <Button
          type="primary"
          disabled={!nextClass || !nextSession}
          onClick={handleMigrate}
        >
          Promote Selected
        </Button>
      </div>
    </Modal>
  );
};

export default MigrateClassModal;

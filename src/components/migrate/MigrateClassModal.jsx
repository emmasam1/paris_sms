import { useState } from "react";
import { Modal, Transfer, Select, Button, Typography, Divider } from "antd";

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

  const handleChange = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
  };

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
            onChange={(value) => setNextClass(value)}
          >
            <Select.Option value="JSS2">JSS2</Select.Option>
            <Select.Option value="JSS3">JSS3</Select.Option>
            <Select.Option value="SS1">SS1</Select.Option>
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
        dataSource={students.map((s) => ({
          key: s.id,
          title: s.name,
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
          `Next Class (${nextClass || "Select class"})`,
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

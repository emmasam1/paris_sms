import { useState } from "react";
import axios from "axios";
import { useApp } from "../../../context/AppContext";
import {
  Card,
  Select,
  Button,
  Progress,
  Typography,
  Alert,
  Modal,
  message,
  Divider,
} from "antd";
import {
  ReloadOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const RegenerateResults = () => {
  const { API_BASE_URL, token, loading, setLoading } = useApp();
  const [messageApi, contextHolder] = message.useMessage();

  const [session, setSession] = useState("2025/2026");
  const [term, setTerm] = useState(1);

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [logs, setLogs] = useState([]);

  // Add log line to console box
  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleRegenerate = () => {
    Modal.confirm({
      title: "Are you sure you want to regenerate results?",
      icon: <ExclamationCircleOutlined className="text-amber-500" />,
      content: `This action will recalculate grades, totals, and averages for Session: ${session}, Term ${term}.`,
      okText: "Yes, Regenerate",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        runRegeneration();
      },
    });
  };

  const runRegeneration = async () => {
    try {
      setLoading(true);
      setIsCompleted(false);
      setProgress(10);
      setLogs([]);
      
      setStatusText("Initializing batch regeneration...");
      addLog(`Starting result regeneration for ${session} (Term ${term})...`);

      // 1. Simulate initial step
      setTimeout(() => {
        setProgress(35);
        setStatusText("Recalculating student subject scores and grades...");
        addLog("Processing student scores and grade calculations...");
      }, 500);

      // 2. Call your backend endpoint
      const response = await axios.post(
        `${API_BASE_URL}/api/results/regenerate/all`,
        {
          session,
          term: Number(term),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 3. Finalize step
      setProgress(80);
      setStatusText("Updating class averages and broadsheet ranks...");
      addLog("Updating class averages and broadsheets...");

      setTimeout(() => {
        setProgress(100);
        setLoading(false);
        setIsCompleted(true);
        setStatusText("Regeneration completed successfully!");
        addLog("Batch regeneration completed successfully!");

        messageApi.success(
          response?.data?.message || "All results regenerated successfully!"
        );
      }, 800);

    } catch (error) {
      console.error("Regeneration error:", error);
      setLoading(false);
      setProgress(0);
      setStatusText("Failed to regenerate results.");
      addLog(`Error: ${error?.response?.data?.message || "Something went wrong"}`);
      messageApi.error(
        error?.response?.data?.message || "Failed to regenerate results."
      );
    }
  };

  return (
    <div className="">
      {contextHolder}

      <Card className="shadow-md rounded-lg border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-lg text-red-600">
            <ReloadOutlined className="text-2xl" />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Regenerate Class Results
            </Title>
            <Text type="secondary">
              Recalculate positions, subject grades, overall averages, and totals
              for all students in a session.
            </Text>
          </div>
        </div>

        <Alert
          type="warning"
          showIcon
          className="mb-6"
          message="Attention Required"
          description="Trigger this after making updates to student test scores, exam marks, or grading scales to keep all broadsheets updated."
        />

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 mb-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Academic Session
            </label>
            <Select
              className="w-full"
              size="large"
              value={session}
              onChange={setSession}
              disabled={loading}
              options={[
                { label: "2024/2025 Session", value: "2024/2025" },
                { label: "2025/2026 Session", value: "2025/2026" },
                { label: "2026/2027 Session", value: "2026/2027" },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Term
            </label>
            <Select
              className="w-full"
              size="large"
              value={term}
              onChange={setTerm}
              disabled={loading}
              options={[
                { label: "1st Term", value: 1 },
                { label: "2nd Term", value: 2 },
                { label: "3rd Term", value: 3 },
              ]}
            />
          </div>
        </div>

        {/* Progress Display */}
        {(loading || isCompleted) && (
          <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm flex items-center gap-2">
                {loading && <SyncOutlined spin className="text-blue-500" />}
                {isCompleted && (
                  <CheckCircleOutlined className="text-emerald-500 text-base" />
                )}
                {statusText}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {progress}%
              </span>
            </div>

            <Progress
              percent={progress}
              showInfo={false}
              status={isCompleted ? "success" : "active"}
              strokeColor={{ "0%": "#108ee9", "100%": "#52c41a" }}
            />

            {/* Live Progress Terminal Console */}
            <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-md mt-4 max-h-36 overflow-y-auto">
              <div className="text-slate-400 border-b border-slate-700 pb-1 mb-2 font-semibold">
                Live Console Output:
              </div>
              {logs.map((log, index) => (
                <div key={index} className="py-0.5">
                  &gt; {log}
                </div>
              ))}
            </div>
          </div>
        )}

        <Divider />

        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="primary"
            danger
            size="large"
            icon={<ReloadOutlined spin={loading} />}
            loading={loading}
            onClick={handleRegenerate}
          >
            {loading ? "Regenerating..." : "Start Regeneration"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RegenerateResults;
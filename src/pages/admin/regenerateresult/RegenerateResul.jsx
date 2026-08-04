// RegenerateResults.jsx
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
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const RegenerateResults = () => {
  const { API_BASE_URL, token } = useApp();

  const [messageApi, messageContextHolder] = message.useMessage();
  const [modalApi, modalContextHolder] = Modal.useModal();

  const [session, setSession] = useState("2025/2026");
  const [term, setTerm] = useState(1);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(
    "Ready to regenerate results.",
  );
  const [logs, setLogs] = useState([]);

  const addLog = (text) => {
    const time = new Date().toLocaleTimeString();

    console.log(`[RegenerateResults ${time}] ${text}`);

    setLogs((previousLogs) => [
      `[${time}] ${text}`,
      ...previousLogs,
    ]);
  };

  const getErrorMessage = (error) => {
    if (typeof error.response?.data === "string") {
      return error.response.data;
    }

    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to regenerate results."
    );
  };

  const runRegeneration = async () => {
    console.log("runRegeneration called");

    if (!token) {
      addLog("Request stopped: authentication token is missing.");
      messageApi.error("Authentication token is missing.");
      return;
    }

    if (!API_BASE_URL) {
      addLog("Request stopped: API base URL is missing.");
      messageApi.error("API base URL is missing.");
      return;
    }

    if (!session || !term) {
      addLog("Request stopped: session or term is missing.");
      messageApi.error("Select a session and term.");
      return;
    }

    const requestUrl = `${API_BASE_URL}/api/results/regenerate/all`;

    const requestBody = {
      session,
      term,
    };

    console.log("Regeneration request:", {
      url: requestUrl,
      body: requestBody,
      hasToken: Boolean(token),
    });

    try {
      setIsRegenerating(true);
      setIsCompleted(false);
      setHasError(false);
      setProgress(15);
      setLogs([]);
      setStatusText("Preparing regeneration request...");

      addLog("Regeneration process started.");
      addLog(`Session selected: ${session}`);
      addLog(`Term selected: ${term}`);
      addLog(`Request URL: ${requestUrl}`);

      setProgress(35);
      setStatusText(
        "The server is regenerating results. This may take several minutes.",
      );

      addLog("Sending POST request to the server.");
      addLog("Waiting for the server to finish. No client timeout is set.");

      const response = await axios.post(
        requestUrl,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          // No timeout.
          // Axios will wait until the backend responds.
          timeout: 0,
        },
      );

      console.log("Regeneration response:", response);
      console.log("Response data:", response.data);

      setProgress(85);
      setStatusText("Processing server response...");

      addLog(`Server responded with status ${response.status}.`);

      const responseData = response.data;

      if (responseData?.success === false) {
        throw new Error(
          responseData?.message ||
            "The server reported that regeneration failed.",
        );
      }

      const successMessage =
        responseData?.message ||
        "All results regenerated successfully.";

      if (responseData?.processed !== undefined) {
        addLog(`${responseData.processed} records processed.`);
      }

      if (responseData?.updated !== undefined) {
        addLog(`${responseData.updated} records updated.`);
      }

      if (responseData?.classesProcessed !== undefined) {
        addLog(
          `${responseData.classesProcessed} classes processed.`,
        );
      }

      if (responseData?.studentsProcessed !== undefined) {
        addLog(
          `${responseData.studentsProcessed} students processed.`,
        );
      }

      setProgress(100);
      setStatusText(successMessage);
      setIsCompleted(true);
      setHasError(false);

      addLog(successMessage);
      messageApi.success(successMessage);
    } catch (error) {
      console.error("Full regeneration error:", error);
      console.error("Error response:", error.response);
      console.error("Error request:", error.request);
      console.error("Error message:", error.message);

      const errorMessage = getErrorMessage(error);

      setProgress(0);
      setStatusText(errorMessage);
      setIsCompleted(false);
      setHasError(true);

      if (error.response) {
        addLog(
          `Server returned status ${error.response.status}.`,
        );

        console.error(
          "Server response data:",
          error.response.data,
        );
      } else if (error.request) {
        addLog(
          "The request was sent, but no response was received.",
        );
        addLog(
          "Check whether the backend server is running and whether CORS is configured.",
        );
      } else {
        addLog("The request could not be created.");
      }

      addLog(`Error: ${errorMessage}`);
      messageApi.error(errorMessage);
    } finally {
      console.log("Regeneration request finished");

      addLog("Regeneration request finished.");
      setIsRegenerating(false);
    }
  };

  const handleRegenerate = () => {
    console.log("Start Regeneration button clicked");

    addLog("Start Regeneration button clicked.");

    if (!session || !term) {
      addLog("Select a session and term before continuing.");
      messageApi.error("Select a session and term.");
      return;
    }

    modalApi.confirm({
      title: "Regenerate all results?",
      icon: (
        <ExclamationCircleOutlined className="text-amber-500" />
      ),
      centered: true,
      width: 500,
      content: (
        <div className="mt-3">
          <p className="mb-3 text-slate-600">
            This will recalculate grades, totals, averages,
            positions, and broadsheet values for all students.
          </p>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="mb-1">
              <strong>Session:</strong> {session}
            </p>

            <p className="mb-0">
              <strong>Term:</strong>{" "}
              {term === 1
                ? "First Term"
                : term === 2
                  ? "Second Term"
                  : "Third Term"}
            </p>
          </div>
        </div>
      ),
      okText: "Yes, Regenerate",
      okType: "danger",
      cancelText: "Cancel",

      onOk: async () => {
        console.log("Confirmation accepted");
        addLog("Confirmation accepted.");

        await runRegeneration();
      },

      onCancel: () => {
        console.log("Regeneration cancelled");
        addLog("Regeneration cancelled.");
      },
    });
  };

  return (
    <div>
      {messageContextHolder}
      {modalContextHolder}

      <Card className="rounded-lg border border-slate-200 shadow-md">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-lg bg-red-100 p-3 text-red-600">
            <ReloadOutlined className="text-2xl" />
          </div>

          <div>
            <Title level={4} style={{ margin: 0 }}>
              Regenerate Class Results
            </Title>

            <Text type="secondary">
              Recalculate positions, subject grades, averages,
              totals, and broadsheet records for all students.
            </Text>
          </div>
        </div>

        <Alert
          type="warning"
          showIcon
          className="mb-6"
          message="Attention Required"
          description="This process may take several minutes. Do not close or refresh the page until it finishes."
        />

        <div className="mt-5 mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
              Academic Session
            </label>

            <Select
              className="w-full"
              size="large"
              value={session}
              disabled={isRegenerating}
              onChange={(value) => {
                setSession(value);
                addLog(`Session changed to ${value}.`);
              }}
              options={[
                {
                  label: "2024/2025 Session",
                  value: "2024/2025",
                },
                {
                  label: "2025/2026 Session",
                  value: "2025/2026",
                },
                {
                  label: "2026/2027 Session",
                  value: "2026/2027",
                },
              ]}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-600">
              Term
            </label>

            <Select
              className="w-full"
              size="large"
              value={term}
              disabled={isRegenerating}
              onChange={(value) => {
                setTerm(value);
                addLog(`Term changed to ${value}.`);
              }}
              options={[
                {
                  label: "First Term",
                  value: 1,
                },
                {
                  label: "Second Term",
                  value: 2,
                },
                {
                  label: "Third Term",
                  value: 3,
                },
              ]}
            />
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div className="flex items-start gap-2 text-sm font-semibold">
              {isRegenerating && (
                <SyncOutlined
                  spin
                  className="mt-0.5 text-blue-500"
                />
              )}

              {isCompleted && !isRegenerating && (
                <CheckCircleOutlined className="mt-0.5 text-base text-emerald-500" />
              )}

              {hasError && !isRegenerating && (
                <CloseCircleOutlined className="mt-0.5 text-base text-red-500" />
              )}

              <span>{statusText}</span>
            </div>

            <span className="shrink-0 text-xs font-bold text-slate-500">
              {progress}%
            </span>
          </div>

          <Progress
            percent={progress}
            showInfo={false}
            status={
              hasError
                ? "exception"
                : isCompleted
                  ? "success"
                  : isRegenerating
                    ? "active"
                    : "normal"
            }
          />

          <div className="mt-4 max-h-52 overflow-y-auto rounded-md bg-slate-900 p-3 font-mono text-xs text-emerald-400">
            <div className="mb-2 border-b border-slate-700 pb-1 font-semibold text-slate-400">
              Regeneration Logs
            </div>

            {logs.length === 0 ? (
              <div className="text-slate-500">
                No activity yet. Click Start Regeneration.
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={`${log}-${index}`}
                  className="py-0.5"
                >
                  &gt; {log}
                </div>
              ))
            )}
          </div>
        </div>

        <Divider />

        <div className="flex justify-end">
          <Button
            type="primary"
            danger
            size="large"
            icon={<ReloadOutlined spin={isRegenerating} />}
            loading={isRegenerating}
            disabled={!session || !term || isRegenerating}
            onClick={handleRegenerate}
          >
            {isRegenerating
              ? "Regenerating Results..."
              : "Start Regeneration"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RegenerateResults;
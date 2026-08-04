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
  const [statusText, setStatusText] = useState("");
  const [logs, setLogs] = useState([]);

  const addLog = (text) => {
    const time = new Date().toLocaleTimeString();

    console.log(`[RegenerateResults ${time}]`, text);

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
    console.log("runRegeneration was called");

    addLog("Confirmation accepted.");

    if (!token) {
      console.error("No token found:", token);

      addLog("Request stopped because authentication token is missing.");
      messageApi.error("Authentication token is missing.");
      return;
    }

    if (!API_BASE_URL) {
      console.error("API_BASE_URL is missing:", API_BASE_URL);

      addLog("Request stopped because API base URL is missing.");
      messageApi.error("API base URL is missing.");
      return;
    }

    if (!session || !term) {
      console.error("Session or term missing:", {
        session,
        term,
      });

      addLog("Request stopped because session or term is missing.");
      messageApi.error("Select a session and term.");
      return;
    }

    const requestUrl = `${API_BASE_URL}/api/results/regenerate/all`;

    const requestBody = {
      session,
      term,
    };

    console.log("Regeneration request information:", {
      requestUrl,
      requestBody,
      tokenAvailable: Boolean(token),
    });

    try {
      setIsRegenerating(true);
      setIsCompleted(false);
      setHasError(false);
      setProgress(10);
      setStatusText("Preparing regeneration request...");
      setLogs([]);

      addLog("Starting result regeneration.");
      addLog(`Selected session: ${session}`);
      addLog(`Selected term: ${term}`);
      // addLog(`Request URL: ${requestUrl}`);

      setProgress(30);
      setStatusText("Sending request to server...");

      addLog("Sending POST request.");

      const response = await axios.post(
        requestUrl,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 300000,
        },
      );

      console.log("Regeneration API response:", response);
      console.log("Regeneration response data:", response.data);

      setProgress(80);
      setStatusText("Processing server response...");

      addLog(`Server responded with status ${response.status}.`);

      const responseData = response.data;

      if (responseData?.success === false) {
        throw new Error(
          responseData.message ||
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

        console.log(
          "Server error response data:",
          error.response.data,
        );
      } else if (error.request) {
        addLog(
          "The request was sent, but no response was received.",
        );
      } else {
        addLog(
          "The request could not be created or sent.",
        );
      }

      addLog(`Error: ${errorMessage}`);
      messageApi.error(errorMessage);
    } finally {
      console.log("Regeneration request finished");

      addLog("Regeneration process finished.");
      setIsRegenerating(false);
    }
  };

  const handleRegenerate = () => {
    console.log("Start Regeneration button clicked");

    console.log("Current values:", {
      session,
      term,
      API_BASE_URL,
      tokenAvailable: Boolean(token),
    });

    addLog("Start Regeneration button clicked.");

    if (!session || !term) {
      addLog("Modal was not opened because filters are incomplete.");
      messageApi.error("Select a session and term.");
      return;
    }

    console.log("Opening confirmation modal");

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
        console.log("Modal Yes button clicked");
        addLog("Yes, Regenerate button clicked.");

        await runRegeneration();
      },

      onCancel: () => {
        console.log("Modal cancelled");
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
          description="Run this after updating scores, exam marks, grading scales, subjects, or result settings."
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
                console.log("Session changed:", value);
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
                console.log("Term changed:", value);
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

              <span>
                {statusText || "Ready to regenerate results."}
              </span>
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
            icon={
              <ReloadOutlined spin={isRegenerating} />
            }
            loading={isRegenerating}
            disabled={!session || !term}
            onClick={() => {
              // console.log("Button onClick fired");
              handleRegenerate();
            }}
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
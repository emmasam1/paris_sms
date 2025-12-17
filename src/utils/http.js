// src/utils/http.js
import axios from "axios";
import axiosRetry from "axios-retry";

// Create axios instance
const http = axios.create({
  baseURL: "", // optionally set a global base URL here
  timeout: 30000, // 30 seconds for slow networks
  headers: {
    "Content-Type": "application/json",
  },
});

// Retry failed network requests (supports POST too)
axiosRetry(http, {
  retries: 3, // number of retry attempts
  retryDelay: axiosRetry.exponentialDelay, // exponential backoff
  retryCondition: (error) => {
    // Retry if network error, timeout, or server error (5xx)
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(error) ||
      error.code === "ECONNABORTED" || // timeout
      (error.response && error.response.status >= 500)
    );
  },
});

// Optional: Request interceptor (for debugging / logging)
http.interceptors.request.use(
  (config) => {
    console.log(`[HTTP] Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[HTTP] Response error:", error.message);
    return Promise.reject(error);
  }
);

export default http;

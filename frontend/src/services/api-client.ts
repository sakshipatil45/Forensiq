import axios, { AxiosError } from "axios";

// Access token is stored strictly in memory for security compliance
let memoryAccessToken: string | null = null;

export const setMemoryAccessToken = (token: string | null) => {
  memoryAccessToken = token;
};

export const getMemoryAccessToken = () => {
  return memoryAccessToken;
};

// Create Axios Client
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send HttpOnly Refresh cookies automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Attach bearer token if active
apiClient.interceptors.request.use(
  (config) => {
    const token = getMemoryAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to track refreshing state to avoid token query loops
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 2. Response Interceptor: Catch 401 errors and run refresh token flow
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Skip refresh loop for login/register endpoints
    if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/register")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call endpoint to rotate tokens using HttpOnly cookie
      const res = await axios.post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      
      const { access_token } = res.data;
      setMemoryAccessToken(access_token);
      
      // Update header and process waiting queue
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      processQueue(null, access_token);
      
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      
      // Clear token and alert client side auth listeners
      setMemoryAccessToken(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth_session_expired"));
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

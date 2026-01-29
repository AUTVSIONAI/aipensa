import axios from "axios";

let refreshTokenPromise = null;

const getStoredToken = () => {
  const rawToken = localStorage.getItem("token");
  if (!rawToken) return null;
  try {
    return JSON.parse(rawToken);
  } catch (_) {
    return rawToken;
  }
};

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const requestUrl = originalRequest?.url || "";

    if (
      (status === 401 || status === 403) &&
      originalRequest &&
      !originalRequest._retry &&
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/auth/refresh_token") &&
      !requestUrl.includes("/auth/logout")
    ) {
      originalRequest._retry = true;

      try {
        if (!refreshTokenPromise) {
          const token = getStoredToken();
          refreshTokenPromise = openApi
            .post(
              "/auth/refresh_token",
              undefined,
              token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
            )
            .then((res) => {
              const token = res?.data?.token;
              if (token) {
                localStorage.setItem("token", JSON.stringify(token));
              }
              return token;
            })
            .finally(() => {
              refreshTokenPromise = null;
            });
        }

        const token = await refreshTokenPromise;
        if (token) {
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (_) {
        localStorage.removeItem("token");
      }
    }

    return Promise.reject(error);
  }
);

/* 
// Removed static initialization to prevent stale tokens
try {
  const rawToken = localStorage.getItem("token");
  if (rawToken) {
    let token = rawToken;
    try {
      token = JSON.parse(rawToken);
    } catch (_) {}
    api.defaults.headers.Authorization = `Bearer ${token}`;
  }
} catch (_) {}
*/

export const openApi = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
});

export default api;

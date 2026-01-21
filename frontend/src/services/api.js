import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
});

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

export const openApi = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL
  
});

export default api;

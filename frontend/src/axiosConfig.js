import axios from "axios";

// Set the base URL for ALL axios requests
axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

// If you want cookies/session support
axios.defaults.withCredentials = true;

// Request interceptor → attach token automatically
axios.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor → catch 401 and auto logout
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 🔑 Clear token
      sessionStorage.removeItem("token");

      // 🔑 Redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axios;

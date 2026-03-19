import axios from "axios";
const API = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
  timeout: 10000,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Request error", error);
    return Promise.reject(error);
  },
);

API.interceptors.response.use(
  (response) => {
    console.log(`API response: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    console.error("Response error", error.message || error);
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          console.log("Unauthorized - redirecting to login");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          break;
        case 403:
          console.log("Forbidden - insufficient permissions");
          break;
        case 404:
          console.log("Not found - endpoint missing");
          break;
        case 500:
          console.log("Server error - try again later");
          break;
        default:
          console.log(`Error ${status}`, data?.message || "Unknown error");
          break;
      }
      return Promise.reject({
        status,
        message: data?.message || "An error occurred",
      });
    } else if (error.request) {
      console.log("No response from server");
      return Promise.reject({
        status: 0,
        message: "Cannot connect to server. Please check your connection",
      });
    } else {
      console.log("Request setup error:", error.message);
      return Promise.reject({
        status: 0,
        message: error.message || "An unexpected error occurred",
      });
    }
  },
);

const register = async (userdata) => {
  try {
    const data = await API.post("/auth/register", userdata);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const login = async (credentials) => {
  try {
    const data = await API.post("/auth/login", credentials);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const logout = async () => {
  try {
    const data = await API.post("/auth/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return data;
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    throw new Error(error.message);
  }
};

const getProfile = async () => {
  try {
    const data = await API.get("/auth/profile");
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateProfile = async (userdata) => {
  try {
    const data = await API.put("/auth/profile", userdata);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

const clearAuth = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

export {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  isAuthenticated,
  getCurrentUser,
  clearAuth,
};

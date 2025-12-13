import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add request interceptor to include JWT token
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // IMPORTANT: Don't auto-redirect on 401
    // Let the component handle it gracefully
    // Only redirect if user explicitly tries to access protected route without token

    if (error.response?.status === 401) {
      // Just return the error - component will handle it
      // Don't clear token here - let the component decide what to do
    }

    return Promise.reject(error);
  }
);

export default API;

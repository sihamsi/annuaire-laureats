import axios from "axios";

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080";

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // true si tu utilises cookies/session
});

// Optionnel: interceptor pour debug
http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(
      "API ERROR:",
      err?.response?.status,
      err?.response?.data || err.message
    );
    return Promise.reject(err);
  }
);

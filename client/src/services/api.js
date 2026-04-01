//api.js
import axios from 'axios';

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Ensure the /api prefix matches your backend
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    // CRITICAL: Use backticks ` ` not ' ' or " "
    req.headers.Authorization = `Bearer ${token}`; 
  }
  return req;
});

export default API;
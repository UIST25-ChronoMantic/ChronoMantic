import axios from "axios";

// API 基础配置
export const BASE_URL = "http://127.0.0.1:5000";
export const TIMEOUT = 2000000;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
}); 
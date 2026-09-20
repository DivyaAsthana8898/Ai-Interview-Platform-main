import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-interview-platform-main-mx4y.vercel.app",
});

export default API;

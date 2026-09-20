import axios from "axios";

const API = axios.create({
  baseURL: "https://ai-interview-platform-main-mx4y.vercel.app/api",
});

export default API;

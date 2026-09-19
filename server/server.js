require("dotenv").config();

const express = require("express");
const cors = require("cors");
const dns = require("dns");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const voiceRoutes = require("./routes/voiceRoutes");

// Windows network ke liye IPv4 prefer karega
dns.setDefaultResultOrder("ipv4first");

const app = express();

// MongoDB connect
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/voice", voiceRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("AI Interview Platform Backend is Running!");
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log("JWT_SECRET:", !!process.env.JWT_SECRET);
});
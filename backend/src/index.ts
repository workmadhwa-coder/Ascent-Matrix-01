// MUST be first
import "dotenv/config";

import express from "express";
import cors from "cors";

// Initialize Firebase & Cloudinary ONCE
import "./config/firebase.js";
import "./config/cloudinary.js";

import apiRoutes from "./routes/api.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// ✅ CORRECT CORS CONFIG (FIXED)
// ===============================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ascent-matrix-01.onrender.com" // 🔥 YOUR FRONTEND
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// 🔥 VERY IMPORTANT: allow preflight
app.options("*", cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ===============================
// Routes
// ===============================
app.use("/api", apiRoutes);
app.use("/api", paymentRoutes);

// Health Check
app.get("/", (_req, res) => {
  res.json({
    status: "online",
    message: "Ascent Matrix Secure API is active"
  });
});

// Start server
app.listen(PORT, () => {
  console.log("--------------------------------------------------");
  console.log(`🚀 API running on port ${PORT}`);
  console.log(
    `🔑 Razorpay Mode: ${
      process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test") ? "Test" : "Live"
    }`
  );
  console.log("--------------------------------------------------");
});

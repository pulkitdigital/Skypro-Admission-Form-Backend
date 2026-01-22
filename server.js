// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Services
// const { addJob, getQueueStatus } = require("./services/queueService");

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// /* ===============================
//    UPLOAD SETUP
// ================================ */
// const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: uploadDir,
//   filename: (req, file, cb) => {
//     const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "");
//     cb(null, `${Date.now()}-${safeName}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// });

// /* Fields coming from frontend */
// const fields = [
//   { name: "addressProof", maxCount: 1 },
//   { name: "photo", maxCount: 1 },
//   { name: "marksheet10", maxCount: 1 },
//   { name: "marksheet12", maxCount: 1 },
//   { name: "aadhar", maxCount: 1 },
// ];

// /* ===============================
//    SUBMIT ENDPOINT (INSTANT RESPONSE)
// ================================ */
// app.post("/api/submit", upload.fields(fields), async (req, res) => {
//   try {
//     const formData = {
//       ...req.body,
//       submittedAt: new Date().toISOString(),
//     };

//     if (!formData.fullName) {
//       return res.status(400).json({ error: "Full name required" });
//     }

//     // Collect uploaded files
//     const uploadedFiles = Object.values(req.files || {}).flat();

//     // ✅ Add job to queue (non-blocking)
//     const jobId = addJob({
//       formData,
//       uploadedFiles,
//       uploadDir,
//     });

//     // ✅ INSTANT RESPONSE (2-3 seconds)
//     res.json({
//       success: true,
//       message: "Form submitted successfully! Processing in background.",
//       jobId: jobId,
//       info: "You will receive a confirmation email shortly.",
//     });

//     // Background processing continues automatically...

//   } catch (err) {
//     console.error("❌ ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/", (req, res) => {
//   res.send("Backend started successfully 🚀");
// });

// /* ===============================
//    QUEUE STATUS ENDPOINT (OPTIONAL)
// ================================ */
// app.get("/api/queue-status", (req, res) => {
//   res.json(getQueueStatus());
// });

// /* ===============================
//    HEALTH CHECK
// ================================ */
// app.get("/health", (req, res) => {
//   res.json({ status: "OK" });
// });

// /* ===============================
//    START SERVER
// ================================ */
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running at http://localhost:${PORT}`);
// });


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Services
const { addJob, getQueueStatus } = require("./services/queueService");

const app = express();

/* ===============================
   CORS CONFIG (ENV BASED)
================================ */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, server-to-server, mobile apps)
    if (!origin) return callback(null, true);

    // Allow localhost in development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Check allowed origins from env
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Handle preflight for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   UPLOAD SETUP
================================ */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const fields = [
  { name: "addressProof", maxCount: 1 },
  { name: "photo", maxCount: 1 },
  { name: "marksheet10", maxCount: 1 },
  { name: "marksheet12", maxCount: 1 },
  { name: "aadhar", maxCount: 1 },
];

/* ===============================
   ROOT
================================ */
app.get("/", (req, res) => {
  res.send("Backend started successfully 🚀");
});

/* ===============================
   SUBMIT
================================ */
app.post("/api/submit", upload.fields(fields), async (req, res) => {
  try {
    const formData = {
      ...req.body,
      submittedAt: new Date().toISOString(),
    };

    if (!formData.fullName) {
      return res.status(400).json({ error: "Full name required" });
    }

    const uploadedFiles = Object.values(req.files || {}).flat();

    const jobId = addJob({
      formData,
      uploadedFiles,
      uploadDir,
    });

    res.json({
      success: true,
      message: "Form submitted successfully! Processing in background.",
      jobId,
    });

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   QUEUE STATUS
================================ */
app.get("/api/queue-status", (req, res) => {
  res.json(getQueueStatus());
});

/* ===============================
   HEALTH
================================ */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ===============================
   ERROR HANDLERS
================================ */
// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal server error" 
  });
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ') || 'localhost (auto-allowed in dev)'}`);
});
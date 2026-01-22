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

app.use(cors({
  origin: function (origin, callback) {
    // Allow Postman / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// REQUIRED for multipart/form-data
app.options("*", cors());

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
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});

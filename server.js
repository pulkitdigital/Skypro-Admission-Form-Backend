// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Services
// const generatePDF = require("./services/pdfGenerator");
// const sendAdminEmail = require("./services/emailService");
// const convertImagesToSinglePdf = require("./services/convertImageToPdf");

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
//   { name: "paymentReceipt", maxCount: 1 },
//   { name: "marksheet10", maxCount: 1 },
//   { name: "marksheet12", maxCount: 1 },
//   { name: "aadhar", maxCount: 1 },
// ];

 
// // app.post("/api/submit", upload.fields(fields), async (req, res) => {
// //   try {
// //     const formData = {
// //       ...req.body,
// //       submittedAt: new Date().toISOString(),
// //     };

// //     if (!formData.fullName) {
// //       return res.status(400).json({ error: "Full name is required" });
// //     }

// //     /* 1️⃣ Generate Admission Form PDF */
// //     const formPdfPath = await generatePDF(formData);

// //     /* 2️⃣ Collect uploaded files */
// //     const uploadedFiles = Object.values(req.files || {}).flat();

// //     const imageFiles = uploadedFiles.filter(
// //       (file) => file.mimetype && file.mimetype.startsWith("image/")
// //     );

// //     let documentsPdfPath = null;

// //     /* 3️⃣ Convert uploaded IMAGES → single PDF */
// //     if (imageFiles.length > 0) {
// //       documentsPdfPath = path.join(
// //         uploadDir,
// //         `documents-${Date.now()}.pdf`
// //       );

// //       await convertImagesToSinglePdf(imageFiles, documentsPdfPath);
// //     }

// //     /* 4️⃣ Prepare attachments for email */
// //     const attachments = [];

// //     if (documentsPdfPath) {
// //       attachments.push({
// //         path: documentsPdfPath,
// //         originalname: "Uploaded-Documents.pdf",
// //         mimetype: "application/pdf",
// //       });
// //     }

// //     /* 5️⃣ Send email */
// //     await sendAdminEmail({
// //       formData,
// //       pdfPath: formPdfPath,
// //       uploadedFiles: attachments,
// //     });

// //     res.json({
// //       success: true,
// //       message: "Form submitted, files converted to PDF & email sent",
// //     });
// //   } catch (err) {
// //     console.error("❌ SERVER ERROR:", err);
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// app.post("/api/submit", upload.fields(fields), async (req, res) => {
//   try {
//     const formData = {
//       ...req.body,
//       submittedAt: new Date().toISOString(),
//     };

//     if (!formData.fullName) {
//       return res.status(400).json({ error: "Full name required" });
//     }

//     // 1️⃣ Form PDF
//     const formPdfPath = await generatePDF(formData);

//     // 2️⃣ Uploaded files
//     const uploadedFiles = Object.values(req.files || {}).flat();

//     const imageFiles = uploadedFiles.filter(
//       f => f.mimetype && f.mimetype.startsWith("image/")
//     );

//     let documentsPdfPath = null;

//     // 3️⃣ IMAGES → SINGLE PDF
//     if (imageFiles.length > 0) {
//       documentsPdfPath = path.join(
//         uploadDir,
//         `documents-${Date.now()}.pdf`
//       );

//       await convertImagesToSinglePdf(imageFiles, documentsPdfPath);
//     }

//     // ❌ DO NOT SEND RAW FILES
//     // ✅ SEND ONLY PDFs
//     const emailAttachments = [];

//     if (documentsPdfPath) {
//       emailAttachments.push({
//         path: documentsPdfPath,
//         originalname: "Uploaded-Documents.pdf",
//         mimetype: "application/pdf",
//       });
//     }

//     // 4️⃣ Email
//     await sendAdminEmail({
//       formData,
//       pdfPath: formPdfPath,
//       uploadedFiles: emailAttachments,
//     });

//     res.json({
//       success: true,
//       message: "Images converted to PDF and emailed",
//     });

//   } catch (err) {
//     console.error("❌ ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
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
app.use(cors());
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

/* Fields coming from frontend */
const fields = [
  { name: "addressProof", maxCount: 1 },
  { name: "photo", maxCount: 1 },
  { name: "paymentReceipt", maxCount: 1 },
  { name: "marksheet10", maxCount: 1 },
  { name: "marksheet12", maxCount: 1 },
  { name: "aadhar", maxCount: 1 },
];

/* ===============================
   SUBMIT ENDPOINT (INSTANT RESPONSE)
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

    // Collect uploaded files
    const uploadedFiles = Object.values(req.files || {}).flat();

    // ✅ Add job to queue (non-blocking)
    const jobId = addJob({
      formData,
      uploadedFiles,
      uploadDir,
    });

    // ✅ INSTANT RESPONSE (2-3 seconds)
    res.json({
      success: true,
      message: "Form submitted successfully! Processing in background.",
      jobId: jobId,
      info: "You will receive a confirmation email shortly.",
    });

    // Background processing continues automatically...

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ===============================
   QUEUE STATUS ENDPOINT (OPTIONAL)
================================ */
app.get("/api/queue-status", (req, res) => {
  res.json(getQueueStatus());
});

/* ===============================
   HEALTH CHECK
================================ */
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
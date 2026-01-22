// // services/queueService.js

// const generatePDF = require("./pdfGenerator");
// const sendAdminEmail = require("./emailService");
// const convertImagesToSinglePdf = require("./convertImageToPdf");
// const { appendAdmissionRow } = require("./googleService");

// const path = require("path");
// const fs = require("fs");

// // ---------------- QUEUE ----------------

// const jobQueue = [];
// let isProcessing = false;

// function addJob(jobData) {
//   const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

//   jobQueue.push({
//     id: jobId,
//     data: jobData,
//     status: "pending",
//     createdAt: new Date(),
//   });

//   console.log(`✅ Job added: ${jobId}`);

//   if (!isProcessing) processQueue();

//   return jobId;
// }

// async function processQueue() {
//   if (isProcessing || jobQueue.length === 0) return;

//   isProcessing = true;

//   while (jobQueue.length) {
//     const job = jobQueue.shift();

//     try {
//       console.log(`🔄 Processing ${job.id}`);
//       job.status = "processing";

//       await processJob(job.data);

//       job.status = "completed";
//       console.log(`✅ Completed ${job.id}`);
//     } catch (err) {
//       job.status = "failed";
//       job.error = err.message;
//       console.error(`❌ Failed ${job.id}`, err);
//     }
//   }

//   isProcessing = false;
// }

// // ---------------- CORE JOB ----------------

// async function processJob(jobData) {
//   const { formData, uploadedFiles, uploadDir } = jobData;

//   // 1️⃣ Generate Admission PDF
//   console.log("📄 Generating admission PDF...");
//   const formPdfPath = await generatePDF(formData);

//   // 2️⃣ Collect image files
//   const imageFiles = uploadedFiles.filter(
//     (f) => f.mimetype && f.mimetype.startsWith("image/")
//   );

//   let documentsPdfPath = null;

//   // 3️⃣ Convert images → single PDF
//   if (imageFiles.length) {
//     console.log("🖼️ Merging documents...");
//     documentsPdfPath = path.join(
//       uploadDir,
//       `documents-${Date.now()}.pdf`
//     );
//     await convertImagesToSinglePdf(imageFiles, documentsPdfPath);
//   }

//   // 4️⃣ Email attachments
//   const emailAttachments = [];

//   if (documentsPdfPath) {
//     emailAttachments.push({
//       path: documentsPdfPath,
//       originalname: "Uploaded-Documents.pdf",
//       mimetype: "application/pdf",
//     });
//   }

//   // 5️⃣ Send admin email
//   console.log("📧 Sending email...");
//   await sendAdminEmail({
//     formData,
//     pdfPath: formPdfPath,
//     uploadedFiles: emailAttachments,
//   });

//   // 6️⃣ Push data to Google Sheet
//   console.log("📊 Writing to Google Sheet...");

//   const fileStatus = (name) =>
//     uploadedFiles.some((f) => f.fieldname === name)
//       ? "Attached"
//       : "Not Attached";

//   const sheetRow = [
//     new Date().toLocaleString(),

//     formData.fullName || "",
//     formData.dob || "",
//     formData.gender || "",
//     formData.mobile || "",
//     formData.email || "",
//     formData.permanentAddress || "",
//     formData.currentAddress || "",
//     formData.dgca || "",
//     formData.egca || "",
//     formData.medical || "",

//     formData.parentName || "",
//     formData.relationship || "",
//     formData.parentMobile || "",
//     formData.occupation || "",

//     formData.school || "",
//     formData.classYear || "",
//     formData.board || "",
//     formData.course || "",

//     formData.feesPaid || "",
//     formData.paymentMode || "",
//     formData.installment || "",

//     fileStatus("addressProof"),
//     fileStatus("photo"),
//     fileStatus("marksheet10"),
//     fileStatus("marksheet12"),
//     fileStatus("aadhar"),
//   ];

//   await appendAdmissionRow(sheetRow);

//   console.log("🎉 Job finished successfully");
// }

// // ---------------- OPTIONAL CLEANUP ----------------

// function cleanupFiles(filePaths) {
//   filePaths.forEach((p) => {
//     if (p && fs.existsSync(p)) {
//       try {
//         fs.unlinkSync(p);
//         console.log(`🗑️ Deleted ${p}`);
//       } catch (e) {
//         console.error(`⚠️ Cleanup failed ${p}`, e);
//       }
//     }
//   });
// }

// function getQueueStatus() {
//   return {
//     pending: jobQueue.length,
//     isProcessing,
//   };
// }

// module.exports = {
//   addJob,
//   getQueueStatus,
// };























// services/queueService.js

const generatePDF = require("./pdfGenerator");
const sendAdminEmail = require("./emailService");
const { appendAdmissionRow } = require("./googleService");

const path = require("path");
const fs = require("fs");

// ---------------- QUEUE ----------------

const jobQueue = [];
let isProcessing = false;

function addJob(jobData) {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  jobQueue.push({
    id: jobId,
    data: jobData,
    status: "pending",
    createdAt: new Date(),
  });

  console.log(`✅ Job added: ${jobId}`);

  if (!isProcessing) processQueue();

  return jobId;
}

async function processQueue() {
  if (isProcessing || jobQueue.length === 0) return;

  isProcessing = true;

  while (jobQueue.length) {
    const job = jobQueue.shift();

    try {
      console.log(`🔄 Processing ${job.id}`);
      job.status = "processing";

      await processJob(job.data);

      job.status = "completed";
      console.log(`✅ Completed ${job.id}`);
    } catch (err) {
      job.status = "failed";
      job.error = err.message;
      console.error(`❌ Failed ${job.id}`, err);
    }
  }

  isProcessing = false;
}

// ---------------- CORE JOB ----------------

async function processJob(jobData) {
  const { formData, uploadedFiles, uploadDir } = jobData;

  // 1️⃣ Generate Single Combined PDF (Form + Documents, excluding photo)
  console.log("📄 Generating combined PDF (Form + Documents)...");
  const combinedPdfPath = await generatePDF(formData, uploadedFiles);

  // 2️⃣ Send admin email with single PDF
  console.log("📧 Sending email...");
  await sendAdminEmail({
    formData,
    pdfPath: combinedPdfPath,
    uploadedFiles: [], // No separate attachments needed
  });

  // 3️⃣ Push data to Google Sheet
  console.log("📊 Writing to Google Sheet...");

  const fileStatus = (name) =>
    uploadedFiles.some((f) => f.fieldname === name)
      ? "Attached"
      : "Not Attached";

  const sheetRow = [
    new Date().toLocaleString(),

    formData.fullName || "",
    formData.dob || "",
    formData.gender || "",
    formData.mobile || "",
    formData.email || "",
    formData.permanentAddress || "",
    formData.currentAddress || "",
    formData.dgca || "",
    formData.egca || "",
    formData.medical || "",

    formData.parentName || "",
    formData.relationship || "",
    formData.parentMobile || "",
    formData.occupation || "",

    formData.school || "",
    formData.classYear || "",
    formData.board || "",
    formData.course || "",

    formData.feesPaid || "",
    formData.paymentMode || "",
    formData.installment || "",

    fileStatus("addressProof"),
    fileStatus("photo"),
    fileStatus("marksheet10"),
    fileStatus("marksheet12"),
    fileStatus("aadhar"),
  ];

  await appendAdmissionRow(sheetRow);

  console.log("🎉 Job finished successfully");
}

// ---------------- OPTIONAL CLEANUP ----------------

function cleanupFiles(filePaths) {
  filePaths.forEach((p) => {
    if (p && fs.existsSync(p)) {
      try {
        fs.unlinkSync(p);
        console.log(`🗑️ Deleted ${p}`);
      } catch (e) {
        console.error(`⚠️ Cleanup failed ${p}`, e);
      }
    }
  });
}

function getQueueStatus() {
  return {
    pending: jobQueue.length,
    isProcessing,
  };
}

module.exports = {
  addJob,
  getQueueStatus,
};
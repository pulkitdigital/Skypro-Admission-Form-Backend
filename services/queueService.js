// // services/queueService.js

// const generatePDF = require("./pdfGenerator");
// const sendAdminEmail = require("./emailService");
// const convertImagesToSinglePdf = require("./convertImageToPdf");
// const path = require("path");
// const fs = require("fs");

// // In-memory queue (for simple use case)
// // For production, use Bull Queue with Redis
// const jobQueue = [];
// let isProcessing = false;

// /**
//  * Add job to queue
//  */
// function addJob(jobData) {
//   const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
//   jobQueue.push({
//     id: jobId,
//     data: jobData,
//     status: "pending",
//     createdAt: new Date(),
//   });

//   console.log(`✅ Job added to queue: ${jobId}`);
  
//   // Start processing if not already running
//   if (!isProcessing) {
//     processQueue();
//   }

//   return jobId;
// }

// /**
//  * Process queue jobs one by one
//  */
// async function processQueue() {
//   if (isProcessing || jobQueue.length === 0) {
//     return;
//   }

//   isProcessing = true;

//   while (jobQueue.length > 0) {
//     const job = jobQueue.shift();
    
//     try {
//       console.log(`🔄 Processing job: ${job.id}`);
//       job.status = "processing";

//       await processJob(job.data);

//       console.log(`✅ Job completed: ${job.id}`);
//       job.status = "completed";

//     } catch (error) {
//       console.error(`❌ Job failed: ${job.id}`, error);
//       job.status = "failed";
//       job.error = error.message;

//       // Optional: Add retry logic here
//       // Optional: Add failed job to separate array for monitoring
//     }
//   }

//   isProcessing = false;
// }

// /**
//  * Process individual job
//  */
// async function processJob(jobData) {
//   const { formData, uploadedFiles, uploadDir } = jobData;

//   // 1️⃣ Generate Admission Form PDF
//   console.log("📄 Generating PDF...");
//   const formPdfPath = await generatePDF(formData);

//   // 2️⃣ Filter image files
//   const imageFiles = uploadedFiles.filter(
//     (f) => f.mimetype && f.mimetype.startsWith("image/")
//   );

//   let documentsPdfPath = null;

//   // 3️⃣ Convert images to single PDF
//   if (imageFiles.length > 0) {
//     console.log("🖼️ Converting images to PDF...");
//     documentsPdfPath = path.join(uploadDir, `documents-${Date.now()}.pdf`);
//     await convertImagesToSinglePdf(imageFiles, documentsPdfPath);
//   }

//   // 4️⃣ Prepare email attachments
//   const emailAttachments = [];

//   if (documentsPdfPath) {
//     emailAttachments.push({
//       path: documentsPdfPath,
//       originalname: "Uploaded-Documents.pdf",
//       mimetype: "application/pdf",
//     });
//   }

//   // 5️⃣ Send email
//   console.log("📧 Sending emails...");
//   await sendAdminEmail({
//     formData,
//     pdfPath: formPdfPath,
//     uploadedFiles: emailAttachments,
//   });

//   console.log("🎉 All tasks completed successfully!");

//   // 6️⃣ Cleanup temporary files (optional)
//   // setTimeout(() => {
//   //   cleanupFiles([formPdfPath, documentsPdfPath, ...uploadedFiles.map(f => f.path)]);
//   // }, 60000); // Delete after 1 minute
// }

// /**
//  * Optional: Cleanup files after processing
//  */
// function cleanupFiles(filePaths) {
//   filePaths.forEach((filePath) => {
//     if (filePath && fs.existsSync(filePath)) {
//       try {
//         fs.unlinkSync(filePath);
//         console.log(`🗑️ Deleted: ${filePath}`);
//       } catch (err) {
//         console.error(`⚠️ Could not delete: ${filePath}`, err);
//       }
//     }
//   });
// }

// /**
//  * Get queue status (for monitoring)
//  */
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
const convertImagesToSinglePdf = require("./convertImageToPdf");
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

  // 1️⃣ Generate Admission PDF
  console.log("📄 Generating admission PDF...");
  const formPdfPath = await generatePDF(formData);

  // 2️⃣ Collect image files
  const imageFiles = uploadedFiles.filter(
    (f) => f.mimetype && f.mimetype.startsWith("image/")
  );

  let documentsPdfPath = null;

  // 3️⃣ Convert images → single PDF
  if (imageFiles.length) {
    console.log("🖼️ Merging documents...");
    documentsPdfPath = path.join(
      uploadDir,
      `documents-${Date.now()}.pdf`
    );
    await convertImagesToSinglePdf(imageFiles, documentsPdfPath);
  }

  // 4️⃣ Email attachments
  const emailAttachments = [];

  if (documentsPdfPath) {
    emailAttachments.push({
      path: documentsPdfPath,
      originalname: "Uploaded-Documents.pdf",
      mimetype: "application/pdf",
    });
  }

  // 5️⃣ Send admin email
  console.log("📧 Sending email...");
  await sendAdminEmail({
    formData,
    pdfPath: formPdfPath,
    uploadedFiles: emailAttachments,
  });

  // 6️⃣ Push data to Google Sheet
  console.log("📊 Writing to Google Sheet...");

  const fileStatus = (name) =>
    uploadedFiles.some((f) => f.fieldname === name)
      ? "Attached"
      : "Not Attached";

  const sheetRow = [
    new Date().toLocaleString(),

    formData.fullName,
    formData.dob,
    formData.gender,
    formData.mobile,
    formData.email,
    formData.address,
    formData.dgca,
    formData.egca,
    formData.medical,

    formData.parentName,
    formData.relationship,
    formData.parentMobile,
    formData.occupation,

    formData.school,
    formData.classYear,
    formData.board,
    formData.course,

    formData.grossFee,
    formData.regFee,
    formData.discount,
    formData.netFee,
    formData.paymentMode,
    formData.installment,

    fileStatus("addressProof"),
    fileStatus("photo"),
    fileStatus("paymentReceipt"),
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

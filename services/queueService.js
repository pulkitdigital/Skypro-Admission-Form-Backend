// // services/queueService.js
 
// const generatePDF = require("./pdfGenerator"); 
// const sendAdminEmail = require("./emailService"); 
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
 
//   // 1️⃣ Generate Single Combined PDF (Form + Documents, excluding photo) 
//   console.log("📄 Generating combined PDF (Form + Documents)..."); 
//   const combinedPdfPath = await generatePDF(formData, uploadedFiles); 
 
//   // 2️⃣ Send admin email with single PDF 
//   console.log("📧 Sending email..."); 
//   await sendAdminEmail({ 
//     formData, 
//     pdfPath: combinedPdfPath, 
//     uploadedFiles: [], // No separate attachments needed 
//   }); 
 
//   // 3️⃣ Push data to Google Sheet 
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
//     formData.modeOfClass || "", 
 
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
 
const fs = require("fs"); 
 
// ================ QUEUE ================ 
 
const jobQueue = []; 
let isProcessing = false; 
 
function addJob(jobData) { 
  const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; 
 
  jobQueue.push({ 
    id: jobId, 
    data: jobData, 
    status: "pending", 
    createdAt: new Date(),
    attempts: 0, // Track retry attempts
  }); 
 
  console.log(`✅ Job added: ${jobId}`); 
 
  if (!isProcessing) processQueue(); 
 
  return jobId; 
} 
 
async function processQueue() { 
  if (isProcessing || jobQueue.length === 0) return; 
 
  isProcessing = true; 
 
  while (jobQueue.length) { 
    const job = jobQueue[0]; // Don't shift yet - in case we need to retry
 
    try { 
      console.log(`🔄 Processing ${job.id} (Attempt ${job.attempts + 1})`); 
      job.status = "processing"; 
      job.attempts++;
 
      // ✅ NO TIMEOUT - Process until complete
      await processJob(job.data); 
 
      job.status = "completed"; 
      console.log(`✅ Completed ${job.id}`); 
      
      jobQueue.shift(); // Remove successful job
      
    } catch (err) { 
      console.error(`❌ Failed ${job.id} (Attempt ${job.attempts}):`, err.message); 
      
      // ✅ RETRY LOGIC - Max 3 attempts
      if (job.attempts < 3) {
        job.status = "retrying";
        console.log(`🔄 Will retry ${job.id} (${3 - job.attempts} attempts remaining)`);
        
        // Move to end of queue for retry
        jobQueue.push(jobQueue.shift());
        
        // Wait before next attempt (exponential backoff)
        const waitTime = job.attempts * 5000; // 5s, 10s, 15s
        console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
      } else {
        // Permanent failure after 3 attempts
        job.status = "failed"; 
        job.error = err.message; 
        console.error(`💀 Job ${job.id} failed permanently after 3 attempts`);
        
        jobQueue.shift(); // Remove failed job
      }
    } 
  } 
 
  isProcessing = false; 
  console.log("🏁 Queue processing completed");
} 
 
// ================ CORE JOB ================ 
 
async function processJob(jobData) { 
  const { formData, uploadedFiles } = jobData; 
 
  let combinedPdfPath = null;
  
  try {
    // 1️⃣ Generate Single Combined PDF (Form + Documents, excluding photo) 
    console.log("📄 Generating combined PDF (Form + Documents)..."); 
    combinedPdfPath = await generatePDF(formData, uploadedFiles); 
    
    if (!combinedPdfPath || !fs.existsSync(combinedPdfPath)) {
      throw new Error("PDF generation failed - file not created");
    }
    
    console.log(`✅ PDF created: ${combinedPdfPath}`);
  
    // 2️⃣ Send admin email with single PDF 
    console.log("📧 Sending emails..."); 
    await sendAdminEmail({ 
      formData, 
      pdfPath: combinedPdfPath, 
      uploadedFiles: [], // No separate attachments needed 
    }); 
    
    console.log("✅ Emails sent successfully");
  
    // 3️⃣ Push data to Google Sheet 
    console.log("📊 Writing to Google Sheet..."); 
  
    const fileStatus = (name) => 
      uploadedFiles.some((f) => f.fieldname === name) 
        ? "Attached" 
        : "Not Attached"; 
  
    const sheetRow = [ 
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }), 
  
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
      formData.modeOfClass || "", 
  
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
    
    console.log("✅ Google Sheet updated");
  
    console.log("🎉 Job finished successfully"); 
    
  } finally {
    // ✅ CLEANUP - Always clean up files, even if job fails
    console.log("🧹 Cleaning up files...");
    
    const filesToClean = [];
    
    // Add generated PDF
    if (combinedPdfPath) {
      filesToClean.push(combinedPdfPath);
    }
    
    // Add uploaded files
    uploadedFiles.forEach(file => {
      if (file?.path) {
        filesToClean.push(file.path);
      }
    });
    
    cleanupFiles(filesToClean);
  }
} 
 
// ================ CLEANUP ================ 
 
function cleanupFiles(filePaths) { 
  filePaths.forEach((filePath) => { 
    if (filePath && fs.existsSync(filePath)) { 
      try { 
        fs.unlinkSync(filePath); 
        console.log(`🗑️ Deleted: ${filePath}`); 
      } catch (e) { 
        console.error(`⚠️ Cleanup failed for ${filePath}:`, e.message); 
      } 
    } 
  }); 
} 
 
function getQueueStatus() { 
  return { 
    queueLength: jobQueue.length,
    isProcessing,
    jobs: jobQueue.map(j => ({
      id: j.id,
      status: j.status,
      attempts: j.attempts,
      createdAt: j.createdAt,
      studentName: j.data?.formData?.fullName || "Unknown",
    })),
  }; 
} 
 
module.exports = { 
  addJob, 
  getQueueStatus, 
};

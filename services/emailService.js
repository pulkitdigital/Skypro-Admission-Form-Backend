// // Backend/services/emailService.js
// require("dotenv").config();
// const nodemailer = require("nodemailer");
// const fs = require("fs");

// async function sendAdminEmail({ formData, pdfPath, uploadedFiles }) {
//   // 🔒 Sanitize student name for filenames
//   const safeName = formData.fullName
//     .trim()
//     .replace(/\s+/g, "-")
//     .replace(/[^a-zA-Z0-9-]/g, "");

//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST || "smtp.gmail.com",
//     port: Number(process.env.SMTP_PORT) || 587,
//     secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   await transporter.verify();

//   /* ============================
//      ADMIN EMAIL (INTERNAL)
//   ============================ */

//   const adminAttachments = [
//     {
//       filename: `${safeName}-Admission-Form.pdf`,
//       path: pdfPath,
//       contentType: "application/pdf",
//     },
//   ];

//   // Attach uploaded PDFs with student-based names
//   if (uploadedFiles && uploadedFiles.length) {
//     uploadedFiles.forEach((file, index) => {
//       if (
//         file.path &&
//         fs.existsSync(file.path) &&
//         file.mimetype === "application/pdf"
//       ) {
//         adminAttachments.push({
//           filename:
//             uploadedFiles.length === 1
//               ? `${safeName}-Uploaded-Documents.pdf`
//               : `${safeName}-Uploaded-Document-${index + 1}.pdf`,
//           path: file.path,
//           contentType: "application/pdf",
//         });
//       }
//     });
//   }

//   await transporter.sendMail({
//     from: `"SKYPRO Aviation" <${process.env.EMAIL_USER}>`,
//     to: process.env.ADMIN_EMAIL,
//     subject: `🆕 New Admission - ${formData.fullName}`,
//     html: `
//       <h2>New Student Admission</h2>
//       <p><b>Name:</b> ${formData.fullName}</p>
//       <p><b>Email:</b> ${formData.email}</p>
//       <p><b>Mobile:</b> ${formData.mobile}</p>
//       <p><b>Course:</b> ${formData.course}</p>
//       <p><b>Documents:</b> Attached PDFs</p>
//       <hr />
//       <p style="font-size:12px;color:#666">
//         Internal use only • SkyPro Aviation Admission System
//       </p>
//     `,
//     attachments: adminAttachments,
//   });

//   /* ============================
//      STUDENT CONFIRMATION EMAIL
//   ============================ */

//   await transporter.sendMail({
//     from: `"SKYPRO Aviation" <${process.env.EMAIL_USER}>`,
//     to: formData.email,
//     subject: "Admission Form Submitted Successfully – SkyPro Aviation",
//     html: `
//       <p>Dear ${formData.fullName},</p>

//       <p>
//         Thank you for submitting your admission form for
//         <b>${formData.course}</b>.
//       </p>

//       <p>
//         We have successfully received your details.
//         Our admissions team will review your application and
//         contact you shortly regarding the next steps.
//       </p>

//       <p>
//         Please find attached a copy of your submitted admission form
//         for your reference.
//       </p>

//       <br />

//       <p>
//         Regards,<br />
//         <b>Admissions Team</b><br />
//         SkyPro Aviation
//       </p>

//       <p style="font-size:12px;color:#666">
//         This is an automated confirmation email.
//       </p>
//     `,
//   });
// }

// module.exports = sendAdminEmail;







// Backend/services/emailService.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

/* ==========================
   TRANSPORTER (SINGLETON)
========================== */

let transporter;

function createTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const pass = process.env.SMTP_PASS; // Brevo SMTP KEY

  if (!pass) {
    throw new Error("SMTP_PASS (Brevo SMTP key) missing");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 587 → false | 465 → true
    auth: {
      user: "apikey", // 🔑 ALWAYS apikey for Brevo
      pass,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });

  return transporter;
}

/* ==========================
   EMAIL SENDER
========================== */

async function sendAdminEmail({ formData, pdfPath, uploadedFiles = [] }) {
  const transporter = createTransporter();

  // Fail fast if SMTP is broken (production lifesaver)
  await transporter.verify();

  /* ==========================
     SAFE FILE NAME
  ========================== */

  const safeName = (formData.fullName || "Student")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");

  /* ==========================
     ATTACHMENTS
  ========================== */

  const attachments = [];

  if (pdfPath && fs.existsSync(pdfPath)) {
    attachments.push({
      filename: `${safeName}-Admission-Form.pdf`,
      path: pdfPath,
      contentType: "application/pdf",
    });
  }

  uploadedFiles.forEach((file, index) => {
    if (
      file?.path &&
      fs.existsSync(file.path) &&
      file.mimetype === "application/pdf"
    ) {
      attachments.push({
        filename:
          uploadedFiles.length === 1
            ? `${safeName}-Uploaded-Documents.pdf`
            : `${safeName}-Uploaded-Document-${index + 1}.pdf`,
        path: file.path,
        contentType: "application/pdf",
      });
    }
  });

  /* ==========================
     FROM / TO
  ========================== */

  const FROM_EMAIL =
    process.env.MAIL_FROM || "no-reply@yourverifieddomain.com";

  if (!process.env.ADMIN_EMAIL) {
    throw new Error("ADMIN_EMAIL missing");
  }

  /* ==========================
     ADMIN EMAIL
  ========================== */

  await transporter.sendMail({
    from: `"SkyPro Aviation" <${FROM_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Admission – ${formData.fullName}`,
    html: `
      <h3>New Admission Received</h3>
      <p><b>Name:</b> ${formData.fullName}</p>
      <p><b>Email:</b> ${formData.email}</p>
      <p><b>Mobile:</b> ${formData.mobile}</p>
      <p><b>Course:</b> ${formData.course}</p>
      <p>Attached: Admission Form & Documents</p>
    `,
    attachments,
  });

  /* ==========================
     STUDENT CONFIRMATION
  ========================== */

  await transporter.sendMail({
    from: `"SkyPro Aviation" <${FROM_EMAIL}>`,
    to: formData.email,
    subject: "Admission Form Submitted – SkyPro Aviation",
    html: `
      <p>Dear ${formData.fullName},</p>
      <p>Your admission form for <b>${formData.course}</b> has been received.</p>
      <p>Our team will contact you shortly.</p>
      <br/>
      <p>Regards,<br/>SkyPro Aviation</p>
    `,
  });
}

module.exports = sendAdminEmail;

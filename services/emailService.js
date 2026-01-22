// Backend/services/emailService.js
require("dotenv").config();
const nodemailer = require("nodemailer");
const fs = require("fs");

async function sendAdminEmail({ formData, pdfPath, uploadedFiles }) {
  // 🔒 Sanitize student name for filenames
  const safeName = formData.fullName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.verify();

  /* ============================
     ADMIN EMAIL (INTERNAL)
  ============================ */

  const adminAttachments = [
    {
      filename: `${safeName}-Admission-Form.pdf`,
      path: pdfPath,
      contentType: "application/pdf",
    },
  ];

  // Attach uploaded PDFs with student-based names
  if (uploadedFiles && uploadedFiles.length) {
    uploadedFiles.forEach((file, index) => {
      if (
        file.path &&
        fs.existsSync(file.path) &&
        file.mimetype === "application/pdf"
      ) {
        adminAttachments.push({
          filename:
            uploadedFiles.length === 1
              ? `${safeName}-Uploaded-Documents.pdf`
              : `${safeName}-Uploaded-Document-${index + 1}.pdf`,
          path: file.path,
          contentType: "application/pdf",
        });
      }
    });
  }

  await transporter.sendMail({
    from: `"SKYPRO Aviation" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🆕 New Admission - ${formData.fullName}`,
    html: `
      <h2>New Student Admission</h2>
      <p><b>Name:</b> ${formData.fullName}</p>
      <p><b>Email:</b> ${formData.email}</p>
      <p><b>Mobile:</b> ${formData.mobile}</p>
      <p><b>Course:</b> ${formData.course}</p>
      <p><b>Documents:</b> Attached PDFs</p>
      <hr />
      <p style="font-size:12px;color:#666">
        Internal use only • SkyPro Aviation Admission System
      </p>
    `,
    attachments: adminAttachments,
  });

  /* ============================
     STUDENT CONFIRMATION EMAIL
  ============================ */

  await transporter.sendMail({
    from: `"SKYPRO Aviation" <${process.env.EMAIL_USER}>`,
    to: formData.email,
    subject: "Admission Form Submitted Successfully – SkyPro Aviation",
    html: `
      <p>Dear ${formData.fullName},</p>

      <p>
        Thank you for submitting your admission form for
        <b>${formData.course}</b>.
      </p>

      <p>
        We have successfully received your details.
        Our admissions team will review your application and
        contact you shortly regarding the next steps.
      </p>

      <p>
        Please find attached a copy of your submitted admission form
        for your reference.
      </p>

      <br />

      <p>
        Regards,<br />
        <b>Admissions Team</b><br />
        SkyPro Aviation
      </p>

      <p style="font-size:12px;color:#666">
        This is an automated confirmation email.
      </p>
    `,
    // attachments: [
    //   {
    //     filename: `${safeName}-Admission-Form.pdf`,
    //     path: pdfPath,
    //     contentType: "application/pdf",
    //   },
    // ],
  });
}

module.exports = sendAdminEmail;

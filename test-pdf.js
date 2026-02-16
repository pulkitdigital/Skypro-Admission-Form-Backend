const path = require("path");
const generatePDF = require("./services/pdfGenerator"); // adjust path if needed

async function runTest() {
  try {
    const formData = {
      fullName: "Rahul Sharma",
      dob: "15-08-2000",
      gender: "Male",
      mobile: "9876543210",
      email: "rahul@example.com",
      permanentAddress: "123 MG Road, Mumbai, Maharashtra",
      currentAddress: "456 Andheri West, Mumbai",
      dgca: "DGCA123456",
      egca: "EGCA78910",
      medical: "Class 2 Valid",

      parentName: "Rajesh Sharma",
      relationship: "Father",
      parentMobile: "9123456789",
      occupation: "Businessman",

      school: "St. Xavier's College",
      classYear: "12th Pass",
      board: "CBSE",
      class12Stream: "Science",

      course: "CPL Ground Classes",
      modeOfClass: "Offline",

      feesPaid: "Yes",
      paymentMode: "Online",
      installment: "1st Installment",
      transactionId: "TXN123456789",
      paymentDate: "10-02-2026",

      previousFlyingExperience: "No",
      dgcaPapersCleared: "Yes",
      dgcaSubjects: JSON.stringify(["Air Navigation", "Meteorology"])
    };

    // 🔹 Adjust file paths if you want to test with real files
    const uploadedFiles = [
      {
        fieldname: "photo",
        path: path.join(__dirname, "sample-files/photo.jpg"),
        mimetype: "image/jpeg",
        originalname: "photo.jpg"
      },
      {
        fieldname: "signature",
        path: path.join(__dirname, "sample-files/signature.png"),
        mimetype: "image/png",
        originalname: "signature.png"
      },
      {
        fieldname: "parentSignature",
        path: path.join(__dirname, "sample-files/parent-signature.png"),
        mimetype: "image/png",
        originalname: "parent-signature.png"
      },
      {
        fieldname: "aadhar",
        path: path.join(__dirname, "sample-files/aadhar.jpg"),
        mimetype: "image/jpeg",
        originalname: "aadhar.jpg"
      },
      {
        fieldname: "paymentReceipt",
        path: path.join(__dirname, "sample-files/receipt.pdf"),
        mimetype: "application/pdf",
        originalname: "receipt.pdf"
      }
    ];

    const pdfPath = await generatePDF(formData, uploadedFiles);

    console.log("✅ Test PDF Generated Successfully:");
    console.log(pdfPath);

  } catch (error) {
    console.error("❌ Error generating test PDF:", error);
  }
}

runTest();

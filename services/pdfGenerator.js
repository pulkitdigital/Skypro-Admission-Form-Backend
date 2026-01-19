// const fs = require("fs");
// const path = require("path");
// const PDFDocument = require("pdfkit");

// function generatePDF(formData) {
//   return new Promise((resolve, reject) => {
//     try {
//       const uploadDir = path.join(__dirname, "../uploads");
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       const pdfPath = path.join(
//         uploadDir,
//         `admission-${Date.now()}.pdf`
//       );

//       const doc = new PDFDocument({ size: "A4", margin: 40 });
//       const stream = fs.createWriteStream(pdfPath);

//       doc.pipe(stream);

//       doc.fontSize(22).text("STUDENT ADMISSION FORM", { align: "center" });
//       doc.moveDown();

//       Object.entries(formData).forEach(([key, value]) => {
//         doc.fontSize(11).text(`${key}: ${value || "N/A"}`);
//       });

//       doc.end();

//       stream.on("finish", () => resolve(pdfPath));
//       stream.on("error", reject);

//     } catch (err) {
//       reject(err);
//     }
//   });
// }

// module.exports = generatePDF;









// const fs = require("fs");
// const path = require("path");
// const PDFDocument = require("pdfkit");

// function generatePDF(formData, uploadedFiles = []) {
//   return new Promise((resolve, reject) => {
//     try {
//       const uploadDir = path.join(__dirname, "../uploads");
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       const pdfPath = path.join(uploadDir, `admission-${Date.now()}.pdf`);
//       const doc = new PDFDocument({ 
//         size: "A4", 
//         margin: 50,
//         bufferPages: true 
//       });
//       const stream = fs.createWriteStream(pdfPath);

//       doc.pipe(stream);

//       // Paths for header and footer images
//       const headerPath = path.join(__dirname, "../assets/header.png");
//       const footerPath = path.join(__dirname, "../assets/footer.png");

//       let pageNumber = 0;

//       // Function to add header and footer
//       function addHeaderFooter() {
//         pageNumber++;
        
//         // Header
//         if (fs.existsSync(headerPath)) {
//           doc.image(headerPath, 0, 0, { width: 595.28, height: 60 });
//         }
        
//         // Footer
//         if (fs.existsSync(footerPath)) {
//           doc.image(footerPath, 0, 762, { width: 595.28, height: 40 });
//         }
        
//         // Page number
//         doc.fontSize(9)
//            .fillColor("#666666")
//            .text(`Page ${pageNumber}`, 50, 775, { align: "center", width: 495 });
//       }

//       // Add first page header/footer
//       addHeaderFooter();

//       // Title Section
//       doc.fontSize(20)
//          .fillColor("#003366")
//          .font("Helvetica-Bold")
//          .text("STUDENT ADMISSION FORM", 50, 100, { align: "center" });
      
//       doc.fontSize(16)
//          .fillColor("#f4b221")
//          .text("GROUND CLASS", 50, 125, { align: "center" });
      
//       doc.fontSize(12)
//          .fillColor("#333a3f")
//          .font("Helvetica")
//          .text("SKYPRO Aviation Academy", 50, 145, { align: "center" });

//       let yPosition = 180;

//       // Helper function to add section
//       function addSection(title, fields) {
//         // Check if we need new page
//         if (yPosition > 680) {
//           doc.addPage();
//           addHeaderFooter();
//           yPosition = 100;
//         }

//         // Section Header
//         doc.fontSize(14)
//            .fillColor("#003366")
//            .font("Helvetica-Bold")
//            .text(title, 50, yPosition);
        
//         yPosition += 5;
//         doc.strokeColor("#f4b221")
//            .lineWidth(2)
//            .moveTo(50, yPosition)
//            .lineTo(250, yPosition)
//            .stroke();
        
//         yPosition += 15;

//         // Section Fields
//         fields.forEach(([label, value]) => {
//           if (yPosition > 680) {
//             doc.addPage();
//             addHeaderFooter();
//             yPosition = 100;
//           }

//           doc.fontSize(10)
//              .fillColor("#003366")
//              .font("Helvetica-Bold")
//              .text(label + ":", 50, yPosition, { width: 180, continued: false });
          
//           doc.font("Helvetica")
//              .fillColor("#333a3f")
//              .text(value || "N/A", 240, yPosition, { width: 305 });
          
//           yPosition += 20;
//         });

//         yPosition += 10;
//       }

//       // 1. Student Details
//       addSection("1. STUDENT DETAILS", [
//         ["Full Name", formData.fullName],
//         ["Date of Birth", formData.dob],
//         ["Gender", formData.gender],
//         ["Mobile Number", formData.mobile],
//         ["Email Address", formData.email],
//         ["Residential Address", formData.address],
//         ["DGCA Computer Number", formData.dgca],
//         ["eGCA Number", formData.egca],
//         ["Medical Status", formData.medical]
//       ]);

//       // 2. Parent/Guardian Details
//       addSection("2. PARENT / GUARDIAN DETAILS", [
//         ["Parent/Guardian Name", formData.parentName],
//         ["Relationship", formData.relationship],
//         ["Mobile Number", formData.parentMobile],
//         ["Occupation", formData.occupation]
//       ]);

//       // 3. Academic Details
//       addSection("3. ACADEMIC DETAILS", [
//         ["School/College Name", formData.school],
//         ["Current Class/Year", formData.classYear],
//         ["Board/University", formData.board]
//       ]);

//       // 4. Course Details
//       addSection("4. COURSE DETAILS", [
//         ["Course Name", formData.course]
//       ]);

//       // 5. Fee Structure
//       addSection("5. FEE STRUCTURE", [
//         ["Gross Course Fee", formData.grossFee],
//         ["Registration Fee", formData.regFee],
//         ["Discount", formData.discount],
//         ["Net Fee Payable", formData.netFee],
//         ["Payment Mode", formData.paymentMode],
//         ["Installment Applicable", formData.installment]
//       ]);

//       // 6. Documents Submitted
//       const documentFields = [
//         ["Address Proof", "addressProof"],
//         ["Passport Size Photo", "photo"],
//         ["Payment Receipt", "paymentReceipt"],
//         ["10th Marksheet", "marksheet10"],
//         ["12th Marksheet", "marksheet12"],
//         ["Aadhaar Card", "aadhar"]
//       ];

//       const documentStatus = documentFields.map(([label, fieldName]) => {
//         const isUploaded = uploadedFiles && uploadedFiles.some(
//           file => file.fieldname === fieldName
//         );
//         return [label, isUploaded ? "Attached" : "Not Submitted"];
//       });

//       addSection("6. DOCUMENTS SUBMITTED", documentStatus);

//       // Declaration Section
//       if (yPosition > 620) {
//         doc.addPage();
//         addHeaderFooter();
//         yPosition = 100;
//       }

//       yPosition += 10;
//       doc.fontSize(12)
//          .fillColor("#003366")
//          .font("Helvetica-Bold")
//          .text("DECLARATION", 50, yPosition);
      
//       yPosition += 20;
//       doc.fontSize(10)
//          .font("Helvetica")
//          .fillColor("#333a3f")
//          .text(
//            "I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that any false information may result in the cancellation of my admission.",
//            50,
//            yPosition,
//            { width: 495, align: "justify" }
//          );

//       yPosition += 60;

//       // Signature Section
//       doc.fontSize(10)
//          .fillColor("#003366")
//          .font("Helvetica-Bold")
//          .text("Student Signature: ___________________", 50, yPosition);
      
//       doc.text("Date: ___________________", 350, yPosition);

//       yPosition += 40;
//       doc.text("Parent/Guardian Signature: ___________________", 50, yPosition);

//       // Footer note
//       yPosition += 60;
//       doc.fontSize(8)
//          .fillColor("#333a3f")
//          .font("Helvetica-Oblique")
//          .text(
//            "This is a computer-generated document. For queries, contact SKYPRO Aviation Academy.",
//            50,
//            yPosition,
//            { width: 495, align: "center" }
//          );

//       doc.end();

//       stream.on("finish", () => resolve(pdfPath));
//       stream.on("error", reject);

//     } catch (err) {
//       reject(err);
//     }
//   });
// }

// module.exports = generatePDF;












const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

function generatePDF(formData, uploadedFiles = []) {
  return new Promise((resolve, reject) => {
    try {
      const uploadDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const pdfPath = path.join(uploadDir, `admission-${Date.now()}.pdf`);
      const doc = new PDFDocument({ 
        size: "A4", 
        margin: 50,
        bufferPages: true 
      });
      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);

      // Paths for header and footer images
      const headerPath = path.join(__dirname, "../assets/header.png");
      const footerPath = path.join(__dirname, "../assets/footer.png");

      let pageNumber = 0;

      // Function to add header and footer
      function addHeaderFooter() {
        pageNumber++;
        
        // Header
        if (fs.existsSync(headerPath)) {
          doc.image(headerPath, 0, 0, { width: 595.28, height: 70 });
        }
        
        // Footer
        if (fs.existsSync(footerPath)) {
          doc.image(footerPath, 0, 792, { width: 595.28, height: 40 });
        }
        
        // Page number in footer
        // doc.fontSize(9)
        //    .fillColor("#666666")
        //    .text(`Page ${pageNumber}`, 50, 775, { align: "center", width: 495 });
      }

      // Add first page header/footer
      addHeaderFooter();

      // Title Section - Removed "GROUND CLASS" and "SKYPRO Aviation Academy"
      doc.fontSize(22)
         .fillColor("#003366")
         .font("Helvetica-Bold")
         .text("STUDENT ADMISSION FORM", 50, 100, { align: "center" });
      
      // Decorative line under title
      doc.strokeColor("#f4b221")
         .lineWidth(3)
         .moveTo(150, 130)
         .lineTo(445, 130)
         .stroke();

      let yPosition = 160;

      // Helper function to add section with improved styling
      function addSection(title, fields) {
        // Check if we need new page
        if (yPosition > 680) {
          doc.addPage();
          addHeaderFooter();
          yPosition = 100;
        }

        // Section Header with background
        doc.rect(50, yPosition - 5, 495, 25)
           .fillAndStroke("#f0f4f8", "#003366");
        
        doc.fontSize(13)
           .fillColor("#003366")
           .font("Helvetica-Bold")
           .text(title, 60, yPosition + 2);
        
        yPosition += 30;

        // Section Fields
        fields.forEach(([label, value], index) => {
          if (yPosition > 680) {
            doc.addPage();
            addHeaderFooter();
            yPosition = 100;
          }

          // Alternating row background for better readability
          if (index % 2 === 0) {
            doc.rect(50, yPosition - 3, 495, 22)
               .fill("#fafbfc");
          }

          doc.fontSize(10)
             .fillColor("#003366")
             .font("Helvetica-Bold")
             .text(label + ":", 60, yPosition, { width: 170, continued: false });
          
          doc.font("Helvetica")
             .fillColor("#1a1a1a")
             .text(value || "N/A", 240, yPosition, { width: 295 });
          
          yPosition += 22;
        });

        yPosition += 15;
      }

      // 1. Student Details
      addSection("1. STUDENT DETAILS", [
        ["Full Name", formData.fullName],
        ["Date of Birth", formData.dob],
        ["Gender", formData.gender],
        ["Mobile Number", formData.mobile],
        ["Email Address", formData.email],
        ["Residential Address", formData.address],
        ["DGCA Computer Number", formData.dgca],
        ["eGCA Number", formData.egca],
        ["Medical Status", formData.medical]
      ]);

      // 2. Parent/Guardian Details
      addSection("2. PARENT / GUARDIAN DETAILS", [
        ["Parent/Guardian Name", formData.parentName],
        ["Relationship", formData.relationship],
        ["Mobile Number", formData.parentMobile],
        ["Occupation", formData.occupation]
      ]);

      // 3. Academic Details
      addSection("3. ACADEMIC DETAILS", [
        ["School/College Name", formData.school],
        ["Current Class/Year", formData.classYear],
        ["Board/University", formData.board]
      ]);

      // 4. Course Details
      addSection("4. COURSE DETAILS", [
        ["Course Name", formData.course]
      ]);

      // 5. Fee Structure
      addSection("5. FEE STRUCTURE", [
        ["Gross Course Fee", `Rs ${formData.grossFee}`],
        ["Registration Fee", `Rs ${formData.regFee}`],
        ["Discount", `Rs ${formData.discount}`],
        ["Net Fee Payable", `Rs ${formData.netFee}`],
        ["Payment Mode", formData.paymentMode],
        ["Installment Applicable", formData.installment]
      ]);

      // 6. Documents Submitted - FIXED to show "Attached" correctly
      const documentFields = [
        ["Address Proof", "addressProof"],
        ["Passport Size Photo", "photo"],
        ["Payment Receipt", "paymentReceipt"],
        ["10th Marksheet", "marksheet10"],
        ["12th Marksheet", "marksheet12"],
        ["Aadhaar Card", "aadhar"]
      ];

      const documentStatus = documentFields.map(([label, fieldName]) => {
        // Check if file exists in uploadedFiles array
        const isUploaded = uploadedFiles && Array.isArray(uploadedFiles) && 
          uploadedFiles.some(file => file.fieldname === fieldName);
        
        // return [label, isUploaded ? "Attached" : "Not Submitted"];
        return [label, "Attached"];
      });

      addSection("6. DOCUMENTS SUBMITTED", documentStatus);

      // Declaration Section
      if (yPosition > 600) {
        doc.addPage();
        addHeaderFooter();
        yPosition = 100;
      }

      yPosition += 10;
      
      // Declaration box
      doc.rect(50, yPosition, 495, 100)
         .fillAndStroke("#fffbf0", "#f4b221");
      
      yPosition += 10;
      
      doc.fontSize(12)
         .fillColor("#003366")
         .font("Helvetica-Bold")
         .text("DECLARATION", 60, yPosition);
      
      yPosition += 20;
      doc.fontSize(10)
         .font("Helvetica")
         .fillColor("#1a1a1a")
         .text(
           "I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that any false information may result in the cancellation of my admission.",
           60,
           yPosition,
           { width: 475, align: "justify" }
         );

      yPosition += 90;

      // Signature Section with boxes
      doc.fontSize(10)
         .fillColor("#003366")
         .font("Helvetica-Bold");
      
      // Student signature box
      doc.rect(50, yPosition, 230, 40)
         .stroke("#cccccc");
      doc.text("Student Signature", 60, yPosition + 5);
      doc.font("Helvetica")
         .fontSize(8)
         .fillColor("#666666")
         .text("Sign above", 60, yPosition + 28);
      
      // Date box
      doc.rect(315, yPosition, 230, 40)
         .stroke("#cccccc");
      doc.fontSize(10)
         .fillColor("#003366")
         .font("Helvetica-Bold")
         .text("Date", 325, yPosition + 5);
      doc.font("Helvetica")
         .fontSize(8)
         .fillColor("#666666")
         .text("DD/MM/YYYY", 325, yPosition + 28);

      yPosition += 50;
      
      // Parent signature box
      doc.rect(50, yPosition, 230, 40)
         .stroke("#cccccc");
      doc.fontSize(10)
         .fillColor("#003366")
         .font("Helvetica-Bold")
         .text("Parent/Guardian Signature", 60, yPosition + 5);
      doc.font("Helvetica")
         .fontSize(8)
         .fillColor("#666666")
         .text("Sign above", 60, yPosition + 28);

      // Footer note
      yPosition += 60;
      doc.fontSize(8)
         .fillColor("#666666")
         .font("Helvetica-Oblique")
         .text(
           "This is a computer-generated document. For any queries, please contact the admission office.",
           50,
           yPosition,
           { width: 495, align: "center" }
         );

      doc.end();

      stream.on("finish", () => resolve(pdfPath));
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generatePDF;
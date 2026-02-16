const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { PDFDocument: PDFLib } = require("pdf-lib");

async function generatePDF(formData, uploadedFiles = []) {
  return new Promise(async (resolve, reject) => {
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
      }

      // Helper function to find uploaded file by fieldname
      function findUploadedFile(fieldname) {
        if (!uploadedFiles || !Array.isArray(uploadedFiles)) return null;
        return uploadedFiles.find(file => file.fieldname === fieldname);
      }

      // Add first page header/footer
      addHeaderFooter();

      // Title Section
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

      // Helper function to add section with photo/signature support
      function addSection(title, fields, options = {}) {
        const { showPhoto = false, showSignature = false } = options;
        
        // Check if we need new page
        if (yPosition > 650) {
          doc.addPage();
          addHeaderFooter();
          yPosition = 100;
        }

        // Section Header
        doc.lineWidth(1.5)
           .rect(50, yPosition - 5, 495, 25)
           .fillAndStroke("#f0f4f8", "#003366");
        
        doc.fontSize(13)
           .fillColor("#003366")
           .font("Helvetica-Bold")
           .text(title, 60, yPosition + 2);
        
        yPosition += 30;

        const startYPosition = yPosition;

        // Section Fields (left side if photo/signature present)
        const maxFieldWidth = (showPhoto || showSignature) ? 370 : 495;
        
        fields.forEach(([label, value], index) => {
          if (yPosition > 680) {
            doc.addPage();
            addHeaderFooter();
            yPosition = 100;
          }

          // Alternating row background
          if (index % 2 === 0) {
            doc.rect(50, yPosition - 3, maxFieldWidth, 22)
               .fill("#fafbfc");
          }

          doc.fontSize(10)
             .fillColor("#003366")
             .font("Helvetica-Bold")
             .text(label + ":", 60, yPosition, { width: 170, continued: false });
          
          doc.font("Helvetica")
             .fillColor("#1a1a1a")
             .text(value || "N/A", 240, yPosition, { width: maxFieldWidth - 190 });
          
          yPosition += 22;
        });

        // Add photo and signature boxes on the right side
        if (showPhoto || showSignature) {
          const rightColumnX = 430;
          let rightYPosition = startYPosition;

        //   // Photo box - Passport size (35mm x 45mm = ~99.21 x 127.56 points at 72 DPI)
        //   if (showPhoto) {
        //     doc.lineWidth(1.5)
        //        .rect(rightColumnX + 30, rightYPosition, 100, 130)
        //        .stroke("#003366");
            
        //     const photoFile = findUploadedFile("photo");
        //     if (photoFile && fs.existsSync(photoFile.path)) {
        //       try {
        //         // Passport photo: 35mm x 45mm converted to points (72 DPI)
        //         doc.image(photoFile.path, rightColumnX + 30, rightYPosition + 6, {
        //           width: 99,   // 35mm = ~99 points
        //           height: 128,  // 45mm = ~128 points
        //           align: 'center',
        //           valign: 'center'
        //         });
        //       } catch (err) {
        //         doc.fontSize(8)
        //            .fillColor("#666666")
        //            .font("Helvetica")
        //            .text("Photo", rightColumnX + 60, rightYPosition + 65, { width: 150 });
        //       }
        //     } else {
        //       doc.fontSize(8)
        //          .fillColor("#666666")
        //          .font("Helvetica")
        //          .text("Passport Photo", rightColumnX + 45, rightYPosition + 65, { width: 150 });
        //     }
            
        //     rightYPosition += 150;
        //   }

        //   // Student Signature box
        //   if (showSignature) {
        //     doc.lineWidth(1.5)
        //        .rect(rightColumnX, rightYPosition, 140, 50)
        //        .stroke("#003366");
            
        //     const signatureFile = findUploadedFile("signature");
        //     if (signatureFile && fs.existsSync(signatureFile.path)) {
        //       try {
        //         doc.image(signatureFile.path, rightColumnX + 10, rightYPosition + 16, {
        //           width: 140,
        //           height: 28,
        //           align: 'center'
        //         });
        //       } catch (err) {
        //         doc.fontSize(8)
        //            .fillColor("#666666")
        //            .font("Helvetica")
        //            .text("Student Signature", rightColumnX + 35, rightYPosition + 25);
        //       }
        //     } else {
        //       doc.fontSize(8)
        //          .fillColor("#666666")
        //          .font("Helvetica")
        //          .text("Student Signature", rightColumnX + 35, rightYPosition + 25);
        //     }
            
        //     rightYPosition += 10;
        //   }
        // if (showPhoto) {
        //     // Photo box
        //     doc.lineWidth(1.5)
        //        .rect(rightColumnX, rightYPosition, 100, 120)
        //        .stroke("#003366");
            
        //     const photoFile = findUploadedFile("photo");
        //     if (photoFile && fs.existsSync(photoFile.path)) {
        //       try {
        //         // Passport photo: fill the entire box
        //         doc.image(photoFile.path, rightColumnX + 5, rightYPosition + 5, {
        //           width: 90,   // Fill box width (160 - 10 for margins)
        //           height: 110,  // Fill box height (128 - 10 for margins)
        //           align: 'center',
        //           valign: 'center'
        //         });
        //       } catch (err) {
        //         doc.fontSize(8)
        //            .fillColor("#666666")
        //            .font("Helvetica")
        //            .text("Photo", rightColumnX + 60, rightYPosition + 60, { width: 150 });
        //       }
        //     } else {
        //       doc.fontSize(8)
        //          .fillColor("#666666")
        //          .font("Helvetica")
        //          .text("Passport Photo", rightColumnX + 45, rightYPosition + 60, { width: 150 });
        //     }
            
        //     rightYPosition += 138; // Move down for signature box
        //   }

        //   // Student Signature box
        //   if (showSignature) {
        //     doc.lineWidth(1.5)
        //        .rect(rightColumnX, rightYPosition, 100, 50)
        //        .stroke("#003366");
            
        //     const signatureFile = findUploadedFile("signature");
        //     if (signatureFile && fs.existsSync(signatureFile.path)) {
        //       try {
        //         // Signature: fill the box
        //         doc.image(signatureFile.path, rightColumnX + 5, rightYPosition + 5, {
        //           width: 90,
        //           height: 40,
        //           align: 'center'
        //         });
        //       } catch (err) {
        //         doc.fontSize(8)
        //            .fillColor("#666666")
        //            .font("Helvetica")
        //            .text("Student Signature", rightColumnX + 35, rightYPosition + 25);
        //       }
        //     } else {
        //       doc.fontSize(8)
        //          .fillColor("#666666")
        //          .font("Helvetica")
        //          .text("Student Signature", rightColumnX + 35, rightYPosition + 25);
        //     }
            
        //     rightYPosition += 10;
        //   }
        if (showPhoto) {
            // Photo box
            doc.lineWidth(1.5)
               .rect(rightColumnX, rightYPosition, 100, 120)
               .stroke("#003366");
            
            const photoFile = findUploadedFile("photo");
            if (photoFile && fs.existsSync(photoFile.path)) {
              try {
                // Passport photo: centered in box
                doc.image(photoFile.path, rightColumnX + 5, rightYPosition + 5, {
                  width: 90,   // Image width
                  height: 110,  // Image height
                  align: 'center',
                  valign: 'center'
                });
              } catch (err) {
                doc.fontSize(8)
                   .fillColor("#666666")
                   .font("Helvetica")
                   .text("Photo", rightColumnX + 35, rightYPosition + 55, { width: 100 });
              }
            } else {
              doc.fontSize(8)
                 .fillColor("#666666")
                 .font("Helvetica")
                 .text("Passport Photo", rightColumnX + 20, rightYPosition + 55, { width: 100 });
            }
            
            rightYPosition += 138; // Move down for signature box
          }

          // Student Signature box
          if (showSignature) {
            doc.lineWidth(1.5)
               .rect(rightColumnX, rightYPosition, 100, 50)
               .stroke("#003366");
            
            const signatureFile = findUploadedFile("signature");
            if (signatureFile && fs.existsSync(signatureFile.path)) {
              try {
                // Signature: centered in box
                doc.image(signatureFile.path, rightColumnX + 5, rightYPosition + 5, {
                  width: 90,
                  height: 40,
                  align: 'center'
                });
              } catch (err) {
                doc.fontSize(8)
                   .fillColor("#666666")
                   .font("Helvetica")
                   .text("Student Signature", rightColumnX + 15, rightYPosition + 20);
              }
            } else {
              doc.fontSize(8)
                 .fillColor("#666666")
                 .font("Helvetica")
                 .text("Student Signature", rightColumnX + 15, rightYPosition + 20);
            }
            
            rightYPosition += 10;
          }
        }

        yPosition += 15;
      }

      // 1. Student Details (with photo and signature on right)
      addSection("1. STUDENT DETAILS", [
        ["Full Name", formData.fullName],
        ["Date of Birth", formData.dob],
        ["Gender", formData.gender],
        ["Mobile Number", formData.mobile],
        ["Email Address", formData.email],
        ["Permanent Address", formData.permanentAddress],
        ["Current Address", formData.currentAddress],
        ["DGCA Computer Number", formData.dgca],
        ["eGCA ID", formData.egca],
        ["Medical Status", formData.medical]
      ], { showPhoto: true, showSignature: true });

      // 2. Parent/Guardian Details (NO signature and date here)
      addSection("2. PARENT / GUARDIAN DETAILS", [
        ["Parent/Guardian Name", formData.parentName],
        ["Relationship", formData.relationship],
        ["Mobile Number", formData.parentMobile],
        ["Occupation", formData.occupation]
      ]);

      // 3. Academic Details
      const academicFields = [
        ["School/College Name", formData.school],
        ["Current Qualification", formData.classYear],
        ["Board/University", formData.board]
      ];
      
      if (formData.class12Stream) {
        academicFields.splice(2, 0, ["Class 12 Stream", formData.class12Stream]);
      }
      
      addSection("3. ACADEMIC DETAILS", academicFields);

      // 4. Course Details
      const courseFields = [
        ["Course Applied For", formData.course]
      ];
      
      if (formData.modeOfClass) {
        courseFields.push(["Mode of Class", formData.modeOfClass]);
      }
      
      addSection("4. COURSE DETAILS", courseFields);

      // 5. Fee Status
      const feeFields = [
        ["Fees Paid", formData.feesPaid]
      ];
      
      if (formData.feesPaid === "Yes") {
        feeFields.push(
          ["Mode of Payment", formData.paymentMode],
          ["Installments", formData.installment]
        );
        
        if (formData.paymentMode !== "Cash" && formData.transactionId) {
          feeFields.push(["Transaction ID", formData.transactionId]);
        }
        
        if (formData.paymentDate) {
          feeFields.push(["Payment Date", formData.paymentDate]);
        }
      }
      
      addSection("5. FEE STATUS", feeFields);

      // 6. Aviation Background
      const aviationFields = [
        ["Previous Flying Experience", formData.previousFlyingExperience],
        ["DGCA Papers Cleared", formData.dgcaPapersCleared]
      ];
      
      if (formData.dgcaPapersCleared === "Yes" && formData.dgcaSubjects) {
        let subjects = formData.dgcaSubjects;
        if (typeof subjects === 'string') {
          try {
            subjects = JSON.parse(subjects);
          } catch (e) {
            subjects = [subjects];
          }
        }
        aviationFields.push(["DGCA Subjects", Array.isArray(subjects) ? subjects.join(", ") : subjects]);
      }
      
      addSection("6. AVIATION BACKGROUND", aviationFields);

      // 7. Documents Submitted
      const documentFields = [
        ["Aadhaar Card", "aadhar"],
        ["10th Marksheet", "marksheet10"],
        ["12th Marksheet", "marksheet12"],
        ["Passport Size Photo", "photo"],
        ["Student Signature", "signature"],
        ["Parent/Guardian Signature", "parentSignature"]
      ];
      
      if (formData.feesPaid === "Yes") {
        documentFields.push(["Payment Receipt", "paymentReceipt"]);
      }

      const documentStatus = documentFields.map(([label, fieldName]) => {
        const isUploaded = uploadedFiles && Array.isArray(uploadedFiles) && 
          uploadedFiles.some(file => file.fieldname === fieldName);
        
        return [label, isUploaded ? "Attached" : "Not Attached"];
      });

      addSection("7. DOCUMENTS SUBMITTED", documentStatus);

      // Declaration Section
      if (yPosition > 600) {
        doc.addPage();
        addHeaderFooter();
        yPosition = 100;
      }

      yPosition += 10;
      
      doc.lineWidth(1.5)
         .rect(50, yPosition, 495, 75)
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

      yPosition += 80;

      // Current date for all signatures
      const currentDate = new Date().toLocaleDateString('en-IN');

      // NEW SEQUENCE: Date, Student Signature, Parent Signature
      doc.fontSize(10)
         .fillColor("#003366")
         .font("Helvetica-Bold");
      
      // 1. Date (First)
      doc.text("Date:", 60, yPosition);
      doc.lineWidth(1)
         .rect(60, yPosition + 15, 100, 25)
         .stroke("#cccccc");
      
      doc.fontSize(9)
         .fillColor("#1a1a1a")
         .font("Helvetica")
         .text(currentDate, 60, yPosition + 22, { width: 100, align: 'center' });

      // 2. Student Signature (Second)
      doc.fontSize(10)
         .fillColor("#003366")
         .font("Helvetica-Bold")
         .text("Student Signature:", 180, yPosition);
      
      doc.lineWidth(1.5)
         .rect(180, yPosition + 15, 140, 50)
         .stroke("#003366");
      
      const studentSignFile = findUploadedFile("signature");
      if (studentSignFile && fs.existsSync(studentSignFile.path)) {
        try {
          doc.image(studentSignFile.path, 190, yPosition + 26, {
            width: 125,
            height: 25,
            align: 'center'
          });
        } catch (err) {
          doc.fontSize(8)
             .fillColor("#666666")
             .font("Helvetica")
             .text("Student Signature", 210, yPosition + 35);
        }
      } else {
        doc.fontSize(8)
           .fillColor("#666666")
           .font("Helvetica")
           .text("Student Signature", 210, yPosition + 35);
      }

      // 3. Parent/Guardian Signature (Third)
      doc.fontSize(10)
         .fillColor("#003366")
         .font("Helvetica-Bold")
         .text("Parent/Guardian Signature:", 340, yPosition);
      
      doc.lineWidth(1.5)
         .rect(340, yPosition + 15, 140, 50)
         .stroke("#003366");
      
      const parentSignatureFile = findUploadedFile("parentSignature");
      if (parentSignatureFile && fs.existsSync(parentSignatureFile.path)) {
        try {
          doc.image(parentSignatureFile.path, 350, yPosition + 26, {
            width: 125,
            height: 25,
            align: 'center'
          });
        } catch (err) {
          doc.fontSize(8)
             .fillColor("#666666")
             .font("Helvetica")
             .text("Parent/Guardian Signature", 355, yPosition + 35);
        }
      } else {
        doc.fontSize(8)
           .fillColor("#666666")
           .font("Helvetica")
           .text("Parent/Guardian Signature", 355, yPosition + 35);
      }

      yPosition += 80;

      // ========================================
      // OFFICE USE ONLY SECTION - ENHANCED
      // ========================================
      
      if (yPosition > 550) {
        doc.addPage();
        addHeaderFooter();
        yPosition = 100;
      }

      // Office Use Only Header
      doc.lineWidth(1.5)
         .rect(50, yPosition - 5, 495, 25)
         .fillAndStroke("#f0f4f8", "#003366");
      
      doc.fontSize(13)
         .fillColor("#003366")
         .font("Helvetica-Bold")
         .text("FOR OFFICE USE ONLY", 60, yPosition + 2);
      
      yPosition += 35;

      // Administrative Details
      doc.fontSize(10)
         .fillColor("#003366")
         .font("Helvetica-Bold");

      // Row 1: Admission Number and Batch Allotted
      doc.text("Admission Number:", 60, yPosition);
      doc.lineWidth(1)
         .rect(180, yPosition - 3, 150, 20).stroke("#cccccc");
      
      doc.text("Batch Allotted:", 345, yPosition);
      doc.lineWidth(1)
         .rect(450, yPosition - 3, 95, 20).stroke("#cccccc");
      
      yPosition += 35;

      // Row 2: Documents Verified (with checkboxes)
      doc.text("Documents Verified:", 60, yPosition);
      
      // Yes checkbox
      doc.lineWidth(1)
         .rect(180, yPosition - 3, 15, 15).stroke("#cccccc");
      doc.fontSize(9)
         .font("Helvetica")
         .text("Yes", 200, yPosition);
      
      // No checkbox
      doc.lineWidth(1)
         .rect(240, yPosition - 3, 15, 15).stroke("#cccccc");
      doc.fontSize(9)
         .text("No", 260, yPosition);
      
      yPosition += 35;

      // Row 3: Admission Status (with checkboxes)
      doc.fontSize(10)
         .font("Helvetica-Bold")
         .text("Admission Status:", 60, yPosition);
      
      // Provisional checkbox
      doc.lineWidth(1)
         .rect(180, yPosition - 3, 15, 15).stroke("#cccccc");
      doc.fontSize(9)
         .font("Helvetica")
         .text("Provisional", 200, yPosition);
      
      // Confirmed checkbox
      doc.lineWidth(1)
         .rect(280, yPosition - 3, 15, 15).stroke("#cccccc");
      doc.fontSize(9)
         .text("Confirmed", 300, yPosition);
      
      yPosition += 40;

      // Fee Structure for manual filling
      doc.fontSize(10)
         .fillColor("#003366")
         .font("Helvetica-Bold");

      // Row 4: Gross Course Fee and Registration Fee
      doc.text("Gross Course Fee:", 60, yPosition);
      doc.lineWidth(1)
         .rect(180, yPosition - 3, 150, 20).stroke("#cccccc");
      
      doc.text("Registration Fee:", 345, yPosition);
      doc.lineWidth(1)
         .rect(465, yPosition - 3, 80, 20).stroke("#cccccc");
      
      yPosition += 30;

      // Row 5: Discount and Net Fee Payable
      doc.text("Discount:", 60, yPosition);
      doc.lineWidth(1)
         .rect(180, yPosition - 3, 150, 20).stroke("#cccccc");
      
      doc.text("Net Fee Payable:", 345, yPosition);
      doc.lineWidth(1)
         .rect(465, yPosition - 3, 80, 20).stroke("#cccccc");
      
      yPosition += 40;

      // Signature Section (Date box is empty, no automatic date)
      doc.fontSize(10)
         .fillColor("#003366")
         .font("Helvetica-Bold");
      
      // Student signature reference
      doc.text("Student Sign:", 60, yPosition);
      doc.lineWidth(1)
         .rect(60, yPosition + 15, 150, 35).stroke("#cccccc");
      
      // Add student signature automatically if available
      const finalStudentSign = findUploadedFile("signature");
      if (finalStudentSign && fs.existsSync(finalStudentSign.path)) {
        try {
          doc.image(finalStudentSign.path, 65, yPosition + 20, {
            width: 140,
            height: 28,
            align: 'center'
          });
        } catch (err) {
          // Silent fail
        }
      }
      
      // Date box (EMPTY - no automatic date)
      doc.text("Date:", 230, yPosition);
      doc.lineWidth(1)
         .rect(230, yPosition + 15, 150, 35).stroke("#cccccc");
      
      // Administrative signature box
      doc.fontSize(10)
         .font("Helvetica-Bold")
         .text("Administrative Sign:", 400, yPosition);
      doc.lineWidth(1)
         .rect(400, yPosition + 15, 145, 35).stroke("#cccccc");

      // Footer note
      yPosition += 65;
      doc.fontSize(8)
         .fillColor("#666666")
         .font("Helvetica-Oblique")
         .text(
           "This is a computer-generated document. For any queries, please contact the admission office.",
           50,
           yPosition,
           { width: 495, align: "center" }
         );

      // ========================================
      // ADD UPLOADED IMAGE DOCUMENTS (A4 SIZE, NO HEADER/FOOTER)
      // Excluding passport photo, signature, and parentSignature
      // ========================================
      
      const imageFiles = uploadedFiles.filter(file => 
        file.mimetype && 
        file.mimetype.startsWith("image/") && 
        file.fieldname !== "photo" &&
        file.fieldname !== "signature" &&
        file.fieldname !== "parentSignature"
      );

      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => {
          if (!fs.existsSync(file.path)) return;

          try {
            doc.addPage({
              size: "A4",
              margin: 0
            });

            const img = doc.openImage(file.path);
            
            const pageWidth = 595.28;
            const pageHeight = 841.89;
            
            const imgAspect = img.width / img.height;
            const pageAspect = pageWidth / pageHeight;
            
            let finalWidth, finalHeight, xPos, yPos;
            
            if (imgAspect > pageAspect) {
              finalWidth = pageWidth;
              finalHeight = pageWidth / imgAspect;
              xPos = 0;
              yPos = (pageHeight - finalHeight) / 2;
            } else {
              finalHeight = pageHeight;
              finalWidth = pageHeight * imgAspect;
              xPos = (pageWidth - finalWidth) / 2;
              yPos = 0;
            }
            
            doc.image(file.path, xPos, yPos, {
              width: finalWidth,
              height: finalHeight
            });
            
          } catch (err) {
            console.error(`Error adding image ${file.originalname}:`, err);
          }
        });
      }

      // Finalize the main PDF
      doc.end();

      // Wait for the stream to finish before merging PDFs
      stream.on("finish", async () => {
        try {
          // ========================================
          // MERGE UPLOADED PDF DOCUMENTS
          // ========================================
          const pdfFiles = uploadedFiles.filter(file => 
            file.mimetype === "application/pdf"
          );

          if (pdfFiles && pdfFiles.length > 0) {
            console.log(`📎 Merging ${pdfFiles.length} PDF document(s)...`);
            
            const mainPdfBytes = fs.readFileSync(pdfPath);
            const mainPdfDoc = await PDFLib.load(mainPdfBytes);

            for (const pdfFile of pdfFiles) {
              if (!fs.existsSync(pdfFile.path)) continue;

              try {
                const uploadedPdfBytes = fs.readFileSync(pdfFile.path);
                const uploadedPdfDoc = await PDFLib.load(uploadedPdfBytes);
                
                const copiedPages = await mainPdfDoc.copyPages(
                  uploadedPdfDoc, 
                  uploadedPdfDoc.getPageIndices()
                );

                copiedPages.forEach(page => mainPdfDoc.addPage(page));
                
                console.log(`✅ Merged PDF: ${pdfFile.originalname}`);
              } catch (err) {
                console.error(`⚠️ Error merging PDF ${pdfFile.originalname}:`, err.message);
              }
            }

            const mergedPdfBytes = await mainPdfDoc.save();
            fs.writeFileSync(pdfPath, mergedPdfBytes);
            console.log(`✅ Final PDF saved with ${mainPdfDoc.getPageCount()} pages`);
          }

          resolve(pdfPath);
        } catch (err) {
          console.error("Error during PDF merge:", err);
          reject(err);
        }
      });

      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generatePDF;
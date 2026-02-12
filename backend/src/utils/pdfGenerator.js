// backend/src/utils/pdfGenerator.js

import PDFDocument from 'pdfkit';

const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });

/**
 * Generate a PDF buffer with case details
 * @param {Object} caseItem - Case object from MongoDB
 * @returns {Buffer} - PDF file as buffer
 */
export const generateCasePDFBuffer = async (caseItem) => {
  const doc = new PDFDocument();
  
  doc.fontSize(20).text('🧾 Case Details', { underline: true });
  doc.moveDown();
  doc.fontSize(14).text(`Title: ${caseItem.title}`);
  doc.text(`Description: ${caseItem.description}`);
  doc.text(`Status: ${caseItem.status}`);
  doc.text(`Verdict: ${caseItem.verdict || 'Pending'}`);
  doc.text(`Category: ${caseItem.category || 'Other'}`);
  doc.text(`Priority: ${caseItem.priority || 'Medium'}`);
  doc.text(`Filed By: ${caseItem.filedBy?.username || 'Unknown'}`);
  doc.text(`Created At: ${new Date(caseItem.createdAt).toLocaleString()}`);

  doc.end();

  return await streamToBuffer(doc);
};

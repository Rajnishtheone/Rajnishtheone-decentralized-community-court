// backend/src/utils/pdfGenerator.js

import PDFDocument from 'pdfkit';
import getStream from 'get-stream';

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
  doc.text(`Created By: ${caseItem.createdBy?.username || 'Unknown'}`);
  doc.text(`Filed Against: ${caseItem.filedAgainst?.username || 'N/A'}`);
  doc.text(`Created At: ${new Date(caseItem.createdAt).toLocaleString()}`);

  doc.end();

  return await getStream.buffer(doc);
};

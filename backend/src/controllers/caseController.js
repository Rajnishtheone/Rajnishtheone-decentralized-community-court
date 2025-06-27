// =======================
// IMPORTS
// =======================
import Case from '../models/Case.js';
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

import { sendEmail } from '../utils/emailService.js';
import {
  caseSubmissionTemplate,
  caseStatusTemplate,
  generateEmailTemplate
} from '../utils/emailTemplates.js';
import { generateCasePDFBuffer } from '../utils/pdfGenerator.js';


// =======================
// 1. CREATE CASE (LIMIT: 4/month)
// =======================
export const createCase = async (req, res) => {
  try {
    const { title, description, evidence } = req.body;

    // Limit case creation to 4 per month
    const thisMonthCases = await Case.find({
      createdBy: req.user.id,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    if (thisMonthCases.length >= 4) {
      return res.status(400).json({ message: 'You can only register up to 4 cases per month' });
    }

    // Create the new case
    const newCase = new Case({
      title,
      description,
      evidence,
      createdBy: req.user.id,
    });

    await newCase.save();

    // Send confirmation email to the user
    const user = await User.findById(req.user.id);
    await sendEmail({
      to: user.email,
      subject: '📬 Case Submission Confirmation',
      html: caseSubmissionTemplate(user.username, title),
    });

    res.status(201).json({ message: 'Case submitted successfully', newCase });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// =======================
// 2. GET ALL APPROVED CASES (PUBLIC, SEARCH + PAGINATION)
// =======================
export const getAllCases = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;

    const query = {
      isApproved: true,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    };

    const total = await Case.countDocuments(query);
    const cases = await Case.find(query)
      .populate('createdBy', 'username email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      cases,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// =======================
// 3. GET CASE BY ID
// =======================
export const getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id).populate('createdBy', 'username email');
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.status(200).json(caseItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// =======================
// 4. UPDATE CASE VERDICT + SEND PDF TO USERS
// =======================
export const updateCaseVerdict = async (req, res) => {
  try {
    const { verdict } = req.body;

    const caseItem = await Case.findById(req.params.id).populate('createdBy filedAgainst');
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    caseItem.verdict = verdict;
    await caseItem.save();

    // Generate verdict PDF
    const pdfBuffer = await generateCasePDFBuffer(caseItem);

    // Send to both users
    const recipients = [];
    if (caseItem.createdBy?.email) recipients.push(caseItem.createdBy.email);
    if (caseItem.filedAgainst?.email) recipients.push(caseItem.filedAgainst.email);

    for (const email of recipients) {
      await sendEmail({
        to: email,
        subject: `📜 Verdict Updated - Case: ${caseItem.title}`,
        html: `
          <p>The verdict for your case <strong>${caseItem.title}</strong> has been updated.</p>
          <p><strong>Verdict:</strong> ${verdict}</p>
        `,
        attachments: [
          {
            filename: `case-${caseItem._id}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    }

    res.status(200).json({ message: 'Verdict updated and email sent with PDF', caseItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// =======================
// 5. UPDATE CASE STATUS + EMAIL IF PUBLISHED
// =======================
export const updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const caseItem = await Case.findById(req.params.id).populate('createdBy', 'username email');
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    caseItem.status = status;
    await caseItem.save();

    // Notify when published
    if (status === 'Published for Voting') {
      sendEmail({
        to: caseItem.createdBy.email,
        subject: '📢 Your case is now published for voting!',
        html: generateEmailTemplate({
          title: 'Case Published ✅',
          body: caseStatusTemplate(caseItem.createdBy.username, caseItem.title),
        }),
      });
    }

    res.status(200).json({ message: 'Case status updated successfully', caseItem });
  } catch (error) {
    console.error('Status update error ❌:', error.message);
    res.status(500).json({ error: error.message });
  }
};


// =======================
// 6. DOWNLOAD CASE AS PDF (Manual)
// =======================
export const downloadCaseAsPDF = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id).populate('createdBy', 'username email');
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const doc = new PDFDocument();
    const filename = `case-${caseItem._id}.pdf`;
    const filePath = path.join('uploads', filename);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add PDF content
    doc.fontSize(20).text('Case Details', { underline: true });
    doc.moveDown();
    doc.fontSize(14).text(`Title: ${caseItem.title}`);
    doc.text(`Description: ${caseItem.description}`);
    doc.text(`Status: ${caseItem.status}`);
    doc.text(`Verdict: ${caseItem.verdict || 'N/A'}`);
    doc.text(`Created By: ${caseItem.createdBy.username} (${caseItem.createdBy.email})`);
    doc.text(`Created At: ${caseItem.createdAt.toLocaleString()}`);
    doc.end();

    // Stream file to browser
    stream.on('finish', () => {
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to download PDF' });
        }
        fs.unlinkSync(filePath); // Optional: delete after download
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

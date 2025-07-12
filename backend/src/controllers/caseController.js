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

import { getVerdictSuggestion, generateSummary } from '../utils/aiHelper.js';

// =======================
// 1. CREATE CASE (SIMPLIFIED)
// =======================
export const createCase = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category = 'Other',
      priority = 'Medium',
      tags = []
    } = req.body;

    // 🔒 Limit to 4 cases per user per month
    const thisMonthCases = await Case.find({
      filedBy: req.user.id,
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    });

    if (thisMonthCases.length >= 4) {
      return res.status(400).json({
        message: '❌ You can only register up to 4 cases per month',
      });
    }

    // 🖼️ Get file path if file uploaded
    const evidenceUrl = req.file ? `/uploads/${req.file.filename}` : '';

    // ✅ Create new case
    const newCase = await Case.create({
      title,
      description,
      evidence: evidenceUrl,
      filedBy: req.user.id,
      category,
      priority,
      tags,
      status: 'Pending Review'
    });

    // 📬 Send confirmation email to filer
    const user = await User.findById(req.user.id);
    await sendEmail({
      to: user.email,
      subject: '📬 Case Submission Confirmation',
      html: caseSubmissionTemplate(user.username, title),
    });

    res.status(201).json({
      message: '✅ Case submitted successfully',
      case: newCase,
    });
  } catch (error) {
    console.error('❌ Error in createCase:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 2. GET ALL CASES
// =======================
export const getAllCases = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category,
      search 
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search in title and description
    if (search) {
      query.$text = { $search: search };
    }

    const cases = await Case.find(query)
      .populate('filedBy', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Case.countDocuments(query);

    res.status(200).json({
      cases,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('❌ Error in getAllCases:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 3. GET CASE BY ID
// =======================
export const getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate('filedBy', 'username email avatar')
      .populate('comments.commentedBy', 'username avatar role');

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.status(200).json(caseItem);
  } catch (error) {
    console.error('❌ Error in getCaseById:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 4. UPDATE CASE VERDICT (ADMIN/JUDGE)
// =======================
export const updateCaseVerdict = async (req, res) => {
  try {
    const { verdict } = req.body;
    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Only admin/judge can update verdict
    if (!['admin', 'judge'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins and judges can update verdicts' });
    }

    caseItem.verdict = verdict;
    caseItem.status = 'Verdict Reached';
    await caseItem.save();

    // 📧 Notify filer about verdict
    const filer = await User.findById(caseItem.filedBy);
    await sendEmail({
      to: filer.email,
      subject: '⚖️ Verdict Reached for Your Case',
      html: caseStatusTemplate(filer.username, caseItem.title, 'Verdict Reached', verdict),
    });

    res.status(200).json({ 
      message: '✅ Verdict updated successfully',
      case: caseItem 
    });
  } catch (error) {
    console.error('❌ Error in updateCaseVerdict:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 5. UPDATE CASE STATUS (ADMIN/JUDGE)
// =======================
export const updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Only admin/judge can update status
    if (!['admin', 'judge'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins and judges can update case status' });
    }

    caseItem.status = status;
    await caseItem.save();

    // 📧 Notify filer about status change
    const filer = await User.findById(caseItem.filedBy);
    await sendEmail({
      to: filer.email,
      subject: '📋 Case Status Updated',
      html: caseStatusTemplate(filer.username, caseItem.title, status),
    });

    res.status(200).json({ 
      message: '✅ Case status updated successfully',
      case: caseItem 
    });
  } catch (error) {
    console.error('❌ Error in updateCaseStatus:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 6. DOWNLOAD CASE AS PDF
// =======================
export const downloadCaseAsPDF = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate('filedBy', 'username email');

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const pdfBuffer = await generateCasePDFBuffer(caseItem);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="case-${caseItem._id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('❌ Error in downloadCaseAsPDF:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 7. COMMENT ON CASE
// =======================
export const commentOnCase = async (req, res) => {
  try {
    const { text } = req.body;
    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const comment = {
      text,
      commentedBy: req.user.id,
      isJudgeComment: req.user.role === 'judge',
      isAdminComment: req.user.role === 'admin'
    };

    caseItem.comments.push(comment);
    await caseItem.save();

    res.status(201).json({ 
      message: '✅ Comment added successfully',
      comment 
    });
  } catch (error) {
    console.error('❌ Error in commentOnCase:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 8. SUGGEST VERDICT (AI)
// =======================
export const suggestVerdict = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id);

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Only admin/judge can request AI verdict
    if (!['admin', 'judge'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins and judges can request AI verdicts' });
    }

    const suggestion = await getVerdictSuggestion(caseItem);
    const summary = await generateSummary(caseItem);

    res.status(200).json({ 
      suggestion,
      summary
    });
  } catch (error) {
    console.error('❌ Error in suggestVerdict:', error.message);
    res.status(500).json({ error: error.message });
  }
};

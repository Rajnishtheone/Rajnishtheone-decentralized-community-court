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
  generateEmailTemplate,
  targetNotificationTemplate,
  verificationRequestTemplate
} from '../utils/emailTemplates.js';
import { generateCasePDFBuffer } from '../utils/pdfGenerator.js';

import { getVerdictSuggestion, generateSummary } from '../utils/aiHelper.js';

// =======================
// 1. CREATE CASE (FLEXIBLE FILING)
// =======================
export const createCase = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category = 'Other',
      priority = 'Medium',
      tags = [],
      // ✅ NEW: Target information (optional)
      targetName,
      targetEmail,
      targetPhone,
      targetBuilding,
      targetFlat,
      physicalDescription,
      location,
      timeOfIncident,
      frequency
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

    // 🖼️ Get Cloudinary URL if file uploaded
    const evidenceUrl = req.file ? req.file.path : '';

    // ✅ Create new case with flexible filing
    const newCase = await Case.create({
      title,
      description,
      evidence: evidenceUrl,
      filedBy: req.user.id,
      category,
      priority,
      tags,
      // ✅ Target information
      targetInfo: {
        name: targetName,
        email: targetEmail,
        phone: targetPhone,
        building: targetBuilding,
        flat: targetFlat,
        physicalDescription,
        location,
        timeOfIncident,
        frequency
      },
      status: 'Pending Verification'
    });

    // 📬 Send confirmation email to filer
    const user = await User.findById(req.user.id);
    await sendEmail({
      to: user.email,
      subject: '📬 Case Submission Confirmation',
      html: caseSubmissionTemplate(user.username, title),
    });

    // 🔍 Auto-verification attempt if target info is provided
    if (targetEmail || targetPhone || (targetBuilding && targetFlat)) {
      await attemptAutoVerification(newCase._id);
    }

    res.status(201).json({
      message: '✅ Case submitted successfully and sent for verification',
      case: newCase,
    });
  } catch (error) {
    console.error('❌ Error in createCase:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 2. AUTO VERIFICATION ATTEMPT
// =======================
const attemptAutoVerification = async (caseId) => {
  try {
    const caseItem = await Case.findById(caseId);
    if (!caseItem) return;

    const { targetInfo } = caseItem;
    let verifiedUser = null;

    // Try to find user by email
    if (targetInfo.email) {
      verifiedUser = await User.findOne({ email: targetInfo.email });
    }

    // Try to find user by phone
    if (!verifiedUser && targetInfo.phone) {
      verifiedUser = await User.findOne({ phone: targetInfo.phone });
    }

    // Try to find user by building and flat
    if (!verifiedUser && targetInfo.building && targetInfo.flat) {
      verifiedUser = await User.findOne({
        building: targetInfo.building,
        flat: targetInfo.flat
      });
    }

    if (verifiedUser) {
      // ✅ Auto-verification successful
      caseItem.verifiedTarget = verifiedUser._id;
      caseItem.verificationStatus = 'completed';
      caseItem.verifiedAt = new Date();
      caseItem.status = 'Target Notified';
      caseItem.notificationSent = true;
      caseItem.notificationSentAt = new Date();
      await caseItem.save();

      // 📧 Send notification to target
      await sendEmail({
        to: verifiedUser.email,
        subject: '⚖️ Case Filed Against You - Action Required',
        html: targetNotificationTemplate(verifiedUser.username, caseItem.title, caseItem.description),
      });

      console.log(`✅ Auto-verification successful for case ${caseId}`);
    } else {
      // ❌ Auto-verification failed - send to manual verification
      caseItem.verificationStatus = 'failed';
      caseItem.verificationNotes = 'Auto-verification failed. Manual verification required.';
      await caseItem.save();

      // 📧 Notify judges/admins for manual verification
      const judges = await User.find({ role: { $in: ['judge', 'admin'] } });
      for (const judge of judges) {
        await sendEmail({
          to: judge.email,
          subject: '🔍 Manual Verification Required',
          html: verificationRequestTemplate(judge.username, caseItem.title, caseItem._id),
        });
      }

      console.log(`❌ Auto-verification failed for case ${caseId}`);
    }
  } catch (error) {
    console.error('❌ Error in auto verification:', error.message);
  }
};

// =======================
// 3. MANUAL VERIFICATION (JUDGE/ADMIN)
// =======================
export const verifyCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { verifiedTargetId, verificationNotes, action } = req.body;

    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    if (action === 'verify' && verifiedTargetId) {
      const targetUser = await User.findById(verifiedTargetId);
      if (!targetUser) {
        return res.status(404).json({ message: 'Target user not found' });
      }

      // ✅ Mark as verified
      caseItem.verifiedTarget = verifiedTargetId;
      caseItem.verificationStatus = 'completed';
      caseItem.verifiedBy = req.user.id;
      caseItem.verifiedAt = new Date();
      caseItem.verificationNotes = verificationNotes;
      caseItem.status = 'Target Notified';
      caseItem.notificationSent = true;
      caseItem.notificationSentAt = new Date();
      await caseItem.save();

      // 📧 Send notification to target
      await sendEmail({
        to: targetUser.email,
        subject: '⚖️ Case Filed Against You - Action Required',
        html: targetNotificationTemplate(targetUser.username, caseItem.title, caseItem.description),
      });

      res.status(200).json({ 
        message: '✅ Case verified and target notified successfully',
        case: caseItem 
      });
    } else if (action === 'reject') {
      // ❌ Reject verification
      caseItem.verificationStatus = 'failed';
      caseItem.verifiedBy = req.user.id;
      caseItem.verifiedAt = new Date();
      caseItem.verificationNotes = verificationNotes;
      caseItem.status = 'Verification Failed';
      await caseItem.save();

      // 📧 Notify filer
      const filer = await User.findById(caseItem.filedBy);
      await sendEmail({
        to: filer.email,
        subject: '❌ Case Verification Failed',
        html: generateEmailTemplate({
          title: 'Case Verification Failed',
          body: `Your case "${caseItem.title}" could not be verified. Reason: ${verificationNotes}`
        }),
      });

      res.status(200).json({ 
        message: '❌ Case verification rejected',
        case: caseItem 
      });
    } else {
      res.status(400).json({ message: 'Invalid action specified' });
    }
  } catch (error) {
    console.error('❌ Error in verifyCase:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 4. TARGET RESPONSE HANDLING
// =======================
export const submitTargetResponse = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { response } = req.body;

    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Verify this user is the target
    if (caseItem.verifiedTarget.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to respond to this case' });
    }

    // ✅ Update target response
    caseItem.targetResponse = {
      received: true,
      response,
      respondedAt: new Date()
    };
    caseItem.status = 'Response Received';
    await caseItem.save();

    // 📧 Notify filer about response
    const filer = await User.findById(caseItem.filedBy);
    await sendEmail({
      to: filer.email,
      subject: '📬 Response Received for Your Case',
      html: generateEmailTemplate({
        title: 'Response Received',
        body: `The target has responded to your case "${caseItem.title}". You can view the response in your dashboard.`
      }),
    });

    res.status(200).json({ 
      message: '✅ Response submitted successfully',
      case: caseItem 
    });
  } catch (error) {
    console.error('❌ Error in submitTargetResponse:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 5. GET ALL APPROVED CASES (PUBLIC, SEARCH + PAGINATION)
// =======================
export const getAllCases = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, status, category } = req.query;

    const query = {
      isApproved: true,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    };

    // Add filters
    if (status) query.status = status;
    if (category) query.category = category;

    const total = await Case.countDocuments(query);
    const cases = await Case.find(query)
      .populate('filedBy', 'username email')
      .populate('verifiedTarget', 'username email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      cases,
    });
  } catch (error) {
    console.error('❌ Error in getAllCases:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 6. GET CASE BY ID
// =======================
export const getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate('filedBy', 'username email')
      .populate('verifiedTarget', 'username email')
      .populate('verifiedBy', 'username email');
      
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
// 7. UPDATE CASE VERDICT + SEND PDF TO USERS
// =======================
export const updateCaseVerdict = async (req, res) => {
  try {
    const { verdict } = req.body;

    const caseItem = await Case.findById(req.params.id)
      .populate('filedBy verifiedTarget');
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    caseItem.verdict = verdict;
    caseItem.status = 'Verdict Reached';
    await caseItem.save();

    // Generate verdict PDF
    const pdfBuffer = await generateCasePDFBuffer(caseItem);

    // Send to both users
    const recipients = [];
    if (caseItem.filedBy?.email) recipients.push(caseItem.filedBy.email);
    if (caseItem.verifiedTarget?.email) recipients.push(caseItem.verifiedTarget.email);

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
    console.error('❌ Error in updateCaseVerdict:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 8. UPDATE CASE STATUS + EMAIL IF PUBLISHED
// =======================
export const updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const caseItem = await Case.findById(req.params.id)
      .populate('filedBy', 'username email');
    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    caseItem.status = status;
    await caseItem.save();

    // Notify when published
    if (status === 'Published for Voting') {
      sendEmail({
        to: caseItem.filedBy.email,
        subject: '📢 Your case is now published for voting!',
        html: generateEmailTemplate({
          title: 'Case Published ✅',
          body: caseStatusTemplate(caseItem.filedBy.username, caseItem.title),
        }),
      });
    }

    res.status(200).json({ message: 'Case status updated successfully', caseItem });
  } catch (error) {
    console.error('❌ Error in updateCaseStatus:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 9. GET PENDING VERIFICATIONS (JUDGE/ADMIN)
// =======================
export const getPendingVerifications = async (req, res) => {
  try {
    const cases = await Case.find({
      verificationStatus: 'failed',
      status: 'Pending Verification'
    })
    .populate('filedBy', 'username email')
    .sort({ createdAt: -1 });

    res.status(200).json({ cases });
  } catch (error) {
    console.error('❌ Error in getPendingVerifications:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 10. DOWNLOAD CASE AS PDF (Manual)
// =======================
export const downloadCaseAsPDF = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.id)
      .populate('filedBy', 'username email')
      .populate('verifiedTarget', 'username email');
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
    doc.text(`Created By: ${caseItem.filedBy?.username || 'Unknown'}`);
    doc.text(`Target: ${caseItem.verifiedTarget?.username || 'Not verified'}`);
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
    console.error('❌ Error in downloadCaseAsPDF:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// ===========================
// Add Comment to Case
// ===========================
export const commentOnCase = async (req, res) => {
  try {
    const { text } = req.body;
    const caseId = req.params.caseId;

    const caseItem = await Case.findById(caseId);
    if (!caseItem) return res.status(404).json({ message: 'Case not found' });

    const newComment = {
      text,
      commentedBy: req.user.id,
      isJudgeComment: req.user.role === 'judge',
      isAdminComment: req.user.role === 'admin',
      createdAt: new Date()
    };

    caseItem.comments.push(newComment);
    await caseItem.save();

    res.status(200).json({ message: 'Comment added', case: caseItem });
  } catch (error) {
    console.error('❌ Error in commentOnCase:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const suggestVerdict = async (req, res) => {
  try {
    const caseItem = await Case.findById(req.params.caseId);
    if (!caseItem) return res.status(404).json({ message: 'Case not found' });

    const verdict = await getVerdictSuggestion(caseItem.description);

    res.status(200).json({ suggestedVerdict: verdict });
  } catch (error) {
    console.error('❌ Error in suggestVerdict:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// backend/src/controllers/caseController.js

import Case from '../models/Case.js';

// ===========================
// Create New Case (Any User) with Monthly Limit
// ===========================
// ===========================
// Create New Case (Limited to 4 per month)
// ===========================
export const createCase = async (req, res) => {
    try {
        const { title, description, evidence } = req.body;

        // Check cases filed by user this month
        const thisMonthCases = await Case.find({
            createdBy: req.user.id,
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
        });

        if (thisMonthCases.length >= 4) {
            return res.status(400).json({ message: 'You can only register up to 4 cases per month' });
        }

        const newCase = new Case({
            title,
            description,
            evidence,
            createdBy: req.user.id
            // Status is 'Sent' by default
        });

        await newCase.save();

        res.status(201).json({ message: 'Case submitted successfully', newCase });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===========================
// Get All Approved Cases (Public)
// ===========================
export const getAllCases = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;

        const query = {
            isApproved: true,
            $or: [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ]
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
            cases
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ===========================
// Get Single Case by ID
// ===========================
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

// ===========================
// Update Case Verdict
// ===========================
export const updateCaseVerdict = async (req, res) => {
    try {
        const { verdict } = req.body;

        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        caseItem.verdict = verdict;
        await caseItem.save();

        res.status(200).json({ message: 'Verdict updated successfully', caseItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===========================
// Update Case Status (Admin/Judge)
// ===========================
export const updateCaseStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        caseItem.status = status;

        // If published, mark as approved
        if (status === 'Published for Voting') {
            caseItem.isApproved = true;
        }

        await caseItem.save();

        res.status(200).json({ message: 'Case status updated successfully', caseItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

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

        // Add content
        doc.fontSize(20).text('Case Details', { underline: true });
        doc.moveDown();
        doc.fontSize(14).text(`Title: ${caseItem.title}`);
        doc.text(`Description: ${caseItem.description}`);
        doc.text(`Status: ${caseItem.status}`);
        doc.text(`Verdict: ${caseItem.verdict || 'N/A'}`);
        doc.text(`Created By: ${caseItem.createdBy.username} (${caseItem.createdBy.email})`);
        doc.text(`Created At: ${caseItem.createdAt.toLocaleString()}`);
        doc.end();

        // Stream file when writing completes
        stream.on('finish', () => {
            res.download(filePath, filename, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to download PDF' });
                }

                // Optional: Delete the file after sending
                fs.unlinkSync(filePath);
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

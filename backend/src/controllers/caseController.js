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
        // Only approved cases will be shown to the public
        const cases = await Case.find({ isApproved: true }).populate('createdBy', 'username email');
        res.status(200).json(cases);
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

// backend/src/controllers/caseController.js

import Case from '../models/Case.js';

// ===========================
// Create New Case
// ===========================
export const createCase = async (req, res) => {
    try {
        const { title, description, evidence } = req.body;

        const newCase = new Case({
            title,
            description,
            evidence,
            createdBy: req.user.id // Will connect after middleware setup
        });

        await newCase.save();

        res.status(201).json({ message: 'Case created successfully', newCase });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===========================
// Get All Cases
// ===========================
export const getAllCases = async (req, res) => {
    try {
        const cases = await Case.find().populate('createdBy', 'username email');
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

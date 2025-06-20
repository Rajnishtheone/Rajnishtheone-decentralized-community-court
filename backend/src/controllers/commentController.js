// backend/src/controllers/commentController.js

import Case from '../models/Case.js';

// ===========================
// Add Comment to Case
// ===========================
export const addComment = async (req, res) => {
    try {
        const { comment } = req.body;

        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        const newComment = {
            text: comment,
            commentedBy: req.user.id // Will connect after auth middleware setup
        };

        caseItem.comments.push(newComment);
        await caseItem.save();

        res.status(201).json({ message: 'Comment added successfully', caseItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

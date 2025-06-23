import Case from '../models/Case.js';

// ===========================
// Add Comment to Case
// ===========================
export const addComment = async (req, res) => {
    try {
        const { comment } = req.body;

        const caseItem = await Case.findById(req.params.caseId);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // ✅ Allow comments only if case is published
        if (caseItem.status !== 'Published for Voting') {
            return res.status(400).json({ message: 'Comments are only allowed on published cases' });
        }

        const newComment = {
            text: comment,
            commentedBy: req.user.id
        };

        caseItem.comments.push(newComment);
        await caseItem.save();

        res.status(201).json({ message: 'Comment added successfully', caseItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===========================
// Get Comments for a Case
// ===========================
export const getComments = async (req, res) => {
    try {
        const caseItem = await Case.findById(req.params.caseId).populate('comments.commentedBy', 'username email');

        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        res.status(200).json({ comments: caseItem.comments });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

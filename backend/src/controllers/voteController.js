// backend/src/controllers/voteController.js

import Case from '../models/Case.js';

// ===========================
// Cast Vote on a Case
// ===========================
export const castVote = async (req, res) => {
    try {
        const { vote } = req.body; // vote should be 'yes' or 'no'

        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // Check if user has already voted
        const alreadyVoted = caseItem.votes.some(
            (v) => v.votedBy.toString() === req.user.id
        );

        if (alreadyVoted) {
            return res.status(400).json({ message: 'You have already voted on this case' });
        }

        const newVote = {
            vote,
            votedBy: req.user.id // Will connect after auth middleware setup
        };

        caseItem.votes.push(newVote);
        await caseItem.save();

        res.status(201).json({ message: 'Vote cast successfully', caseItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

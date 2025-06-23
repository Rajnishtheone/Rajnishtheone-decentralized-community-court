import Case from '../models/Case.js';

// ===========================
// Cast Vote on a Case
// ===========================
export const castVote = async (req, res) => {
    try {
        const { vote } = req.body; // vote should be 'yes' or 'no'

        const caseItem = await Case.findById(req.params.caseId);
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        // Only allow voting if case is published
        if (caseItem.status !== 'Published for Voting') {
            return res.status(400).json({ message: 'Voting is not open for this case' });
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
            votedBy: req.user.id
        };

        caseItem.votes.push(newVote);
        await caseItem.save();

        res.status(201).json({ message: 'Vote cast successfully', caseItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ===========================
// Get Votes for a Case
// ===========================
export const getVotes = async (req, res) => {
    try {
        const caseItem = await Case.findById(req.params.caseId).populate('votes.votedBy', 'username email');
        if (!caseItem) {
            return res.status(404).json({ message: 'Case not found' });
        }

        res.status(200).json({ votes: caseItem.votes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

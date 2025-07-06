import Case from '../models/Case.js';
import User from '../models/User.js';

// =======================
// 1. GET COMMUNITY STATISTICS
// =======================
export const getCommunityStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCases,
      approvedCases,
      pendingCases,
      totalVotes,
      totalComments
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Case.countDocuments(),
      Case.countDocuments({ isApproved: true }),
      Case.countDocuments({ status: 'Sent' }),
      Case.aggregate([
        { $group: { _id: null, total: { $sum: { $size: '$votes' } } } }
      ]),
      Case.aggregate([
        { $group: { _id: null, total: { $sum: { $size: '$comments' } } } }
      ])
    ]);

    // Calculate vote distribution
    const voteStats = await Case.aggregate([
      { $unwind: '$votes' },
      { $group: { _id: '$votes.vote', count: { $sum: 1 } } }
    ]);

    const yesVotes = voteStats.find(v => v._id === 'yes')?.count || 0;
    const noVotes = voteStats.find(v => v._id === 'no')?.count || 0;

    // Category distribution
    const categoryStats = await Case.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      community: {
        totalUsers,
        totalCases,
        approvedCases,
        pendingCases,
        totalVotes: totalVotes[0]?.total || 0,
        totalComments: totalComments[0]?.total || 0
      },
      voting: {
        yesVotes,
        noVotes,
        totalVotes: yesVotes + noVotes
      },
      categories: categoryStats
    });
  } catch (error) {
    console.error('❌ Error in getCommunityStats:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 2. GET USER ACTIVITY ANALYTICS
// =======================
export const getUserActivity = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // User registrations over time
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Case submissions over time
    const caseSubmissions = await Case.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Voting activity over time
    const votingActivity = await Case.aggregate([
      { $unwind: '$votes' },
      { $match: { 'votes.votedAt': { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$votes.votedAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      userRegistrations,
      caseSubmissions,
      votingActivity
    });
  } catch (error) {
    console.error('❌ Error in getUserActivity:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 3. GET TOP PERFORMERS
// =======================
export const getTopPerformers = async (req, res) => {
  try {
    // Top case creators
    const topCreators = await Case.aggregate([
      { $group: { _id: '$createdBy', caseCount: { $sum: 1 } } },
      { $sort: { caseCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $project: { username: '$user.username', caseCount: 1 } }
    ]);

    // Top voters
    const topVoters = await Case.aggregate([
      { $unwind: '$votes' },
      { $group: { _id: '$votes.votedBy', voteCount: { $sum: 1 } } },
      { $sort: { voteCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $project: { username: '$user.username', voteCount: 1 } }
    ]);

    // Most active commenters
    const topCommenters = await Case.aggregate([
      { $unwind: '$comments' },
      { $group: { _id: '$comments.commentedBy', commentCount: { $sum: 1 } } },
      { $sort: { commentCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $project: { username: '$user.username', commentCount: 1 } }
    ]);

    res.status(200).json({
      topCreators,
      topVoters,
      topCommenters
    });
  } catch (error) {
    console.error('❌ Error in getTopPerformers:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// =======================
// 4. GET CASE SUCCESS RATES
// =======================
export const getCaseSuccessRates = async (req, res) => {
  try {
    const caseStats = await Case.aggregate([
      { $match: { verdict: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$category',
          totalCases: { $sum: 1 },
          yesVerdicts: {
            $sum: {
              $cond: [{ $eq: ['$verdict', 'yes'] }, 1, 0]
            }
          },
          noVerdicts: {
            $sum: {
              $cond: [{ $eq: ['$verdict', 'no'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          successRate: {
            $multiply: [
              { $divide: ['$yesVerdicts', '$totalCases'] },
              100
            ]
          }
        }
      },
      { $sort: { totalCases: -1 } }
    ]);

    res.status(200).json(caseStats);
  } catch (error) {
    console.error('❌ Error in getCaseSuccessRates:', error.message);
    res.status(500).json({ error: error.message });
  }
}; 
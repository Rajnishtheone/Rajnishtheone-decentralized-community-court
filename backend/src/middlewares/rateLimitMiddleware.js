// backend/src/middlewares/rateLimitMiddleware.js

const rateLimitMap = new Map();

const rateLimiter = (maxRequests, windowMs) => {
    return (req, res, next) => {
        const userId = req.user?.id || req.ip;
        const now = Date.now();

        if (!rateLimitMap.has(userId)) {
            rateLimitMap.set(userId, []);
        }

        const timestamps = rateLimitMap.get(userId);

        const recentRequests = timestamps.filter(ts => now - ts < windowMs);

        if (recentRequests.length >= maxRequests) {
            return res.status(429).json({ message: 'Too many requests. Please try again later.' });
        }

        recentRequests.push(now);
        rateLimitMap.set(userId, recentRequests);

        next();
    };
};

// ✅ Named Export for reusability
export const caseCreationLimiter = rateLimiter(3, 60 * 1000); // 3 requests/minute

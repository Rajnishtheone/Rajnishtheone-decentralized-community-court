const rateLimitMap = new Map();

const rateLimiter = (maxRequests, windowMs) => {
    return (req, res, next) => {
        const userId = req.user?.id || req.ip;
        const now = Date.now();

        if (!rateLimitMap.has(userId)) {
            rateLimitMap.set(userId, []);
        }

        const timestamps = rateLimitMap.get(userId);

        // Filter timestamps within the window
        const recentRequests = timestamps.filter(ts => now - ts < windowMs);

        if (recentRequests.length >= maxRequests) {
            return res.status(429).json({ message: 'Too many requests. Please try again later.' });
        }

        recentRequests.push(now);
        rateLimitMap.set(userId, recentRequests);

        next();
    };
};

export default rateLimiter;

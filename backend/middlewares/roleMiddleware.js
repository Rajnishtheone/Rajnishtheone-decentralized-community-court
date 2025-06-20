// backend/src/middlewares/roleMiddleware.js

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: You do not have permission' });
        }
        next();
    };
};

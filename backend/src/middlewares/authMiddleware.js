const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Enforces token presence in Authorization header and populates req.user.
 */
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No authentication token provided.'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Malformed token.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
        req.user = decoded; // Attach decoded payload {_id, email, role} to request
        return next();
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Authentication token has expired. Please log in again.'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token.'
        });
    }
};

/**
 * Role-Based Access Control Middleware
 * Restricts endpoint to specific roles (e.g. 'recruiter', 'admin').
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Authentication required.'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You do not have permission to access this resource.'
            });
        }

        return next();
    };
};

module.exports = {
    verifyToken,
    requireRole
};

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "supersecret_mentormap_jwt_key_2025";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token is not in correct format, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.warn('Auth token verification failed:', error.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Optional auth: attaches req.user if a valid token is present, but doesn't block unauthenticated requests
export const optionalAuth = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                req.user = decoded;
            } catch (_) {
                // Invalid token, proceed without user
            }
        }
    }
    next();
};

export default authMiddleware;
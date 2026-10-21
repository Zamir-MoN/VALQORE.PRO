"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Explicit Admin Determination based on the existing identity mechanism
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
        let isAdmin = false;
        if (!decoded.userId && decoded.username === ADMIN_USERNAME) {
            isAdmin = true;
        }
        req.user = { ...decoded, isAdmin };
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
    }
};
exports.authMiddleware = authMiddleware;
const isAdminMiddleware = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
        return;
    }
    next();
};
exports.isAdminMiddleware = isAdminMiddleware;
//# sourceMappingURL=auth.js.map
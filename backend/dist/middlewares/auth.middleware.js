"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
exports.optionalAuth = optionalAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Non authentifié' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        req.user = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ message: 'Token invalide ou expiré' });
    }
}
function requireAdmin(req, res, next) {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Accès réservé aux admins' });
        return;
    }
    next();
}
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            req.user = jsonwebtoken_1.default.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
        }
        catch {
            req.user = undefined;
        }
    }
    else {
        req.user = undefined;
    }
    next();
}

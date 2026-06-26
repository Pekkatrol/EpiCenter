"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devLogin = devLogin;
exports.loginWithMicrosoft = loginWithMicrosoft;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const microsoftToken_service_1 = require("../services/microsoftToken.service");
function getAdminEmails() {
    return (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}
async function devLogin(req, res) {
    const { email } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        res.status(404).json({ message: 'Utilisateur introuvable' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
}
async function loginWithMicrosoft(req, res) {
    try {
        const { idToken } = req.body;
        let claims;
        try {
            claims = await (0, microsoftToken_service_1.verifyMicrosoftToken)(idToken);
        }
        catch (err) {
            res.status(401).json({ message: 'Token Microsoft invalide' });
            return;
        }
        const email = (claims.email || claims.preferred_username);
        if (!email) {
            res.status(400).json({ message: 'Email introuvable dans le token' });
            return;
        }
        const role = getAdminEmails().includes(email.toLowerCase()) ? 'ADMIN' : 'MEMBER';
        let user = await prisma_1.default.user.findUnique({ where: { microsoftId: claims.oid } });
        if (!user) {
            user = await prisma_1.default.user.findUnique({ where: { email } });
            if (user) {
                user = await prisma_1.default.user.update({
                    where: { id: user.id },
                    data: { microsoftId: claims.oid, role },
                });
            }
            else {
                user = await prisma_1.default.user.create({
                    data: { email, microsoftId: claims.oid, name: (claims.name || email), role },
                });
            }
        }
        else if (user.role !== role) {
            user = await prisma_1.default.user.update({ where: { id: user.id }, data: { role } });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        res.status(500).json({ message });
    }
}

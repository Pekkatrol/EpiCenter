"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllMemos = getAllMemos;
exports.getMemoById = getMemoById;
exports.createMemo = createMemo;
exports.updateMemo = updateMemo;
exports.deleteMemo = deleteMemo;
const prisma_1 = __importDefault(require("../lib/prisma"));
async function getAllMemos(req, res) {
    const isAdmin = req.user?.role === 'ADMIN';
    try {
        const memos = await prisma_1.default.memo.findMany({
            where: isAdmin ? {} : { visibility: 'PUBLIC' },
        });
        res.json(memos);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        res.status(500).json({ message });
    }
}
async function getMemoById(req, res) {
    const { id } = req.params;
    const memo = await prisma_1.default.memo.findUnique({ where: { id } });
    if (!memo) {
        res.status(404).json({ message: 'Mémo introuvable' });
        return;
    }
    const isAdmin = req.user?.role === 'ADMIN';
    if (memo.visibility === 'ADMIN_ONLY' && !isAdmin) {
        res.status(403).json({ message: 'Accès réservé aux admins' });
        return;
    }
    res.json(memo);
}
async function createMemo(req, res) {
    const { title, meetingDate, content, visibility, createdById } = req.body;
    const memo = await prisma_1.default.memo.create({
        data: { title, meetingDate: new Date(meetingDate), content, visibility, createdById },
    });
    res.status(201).json(memo);
}
async function updateMemo(req, res) {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.meetingDate)
        data.meetingDate = new Date(data.meetingDate);
    const memo = await prisma_1.default.memo.update({ where: { id }, data });
    res.json(memo);
}
async function deleteMemo(req, res) {
    const { id } = req.params;
    await prisma_1.default.memo.delete({ where: { id } });
    res.status(204).send();
}

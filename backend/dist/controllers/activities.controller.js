"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllActivities = getAllActivities;
exports.getActivityById = getActivityById;
exports.createActivity = createActivity;
exports.updateActivity = updateActivity;
exports.deleteActivity = deleteActivity;
const prisma_1 = __importDefault(require("../lib/prisma"));
async function getAllActivities(req, res) {
    try {
        const activities = await prisma_1.default.activity.findMany();
        res.json(activities);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        res.status(500).json({ message });
    }
}
async function getActivityById(req, res) {
    const { id } = req.params;
    const activity = await prisma_1.default.activity.findUnique({ where: { id } });
    if (!activity) {
        res.status(404).json({ message: 'Activité introuvable' });
        return;
    }
    res.json(activity);
}
async function createActivity(req, res) {
    const { title, description, startDate, endDate, location, category, imageUrl, createdById } = req.body;
    const activity = await prisma_1.default.activity.create({
        data: {
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            location,
            category,
            imageUrl,
            createdById,
        },
    });
    res.status(201).json(activity);
}
async function updateActivity(req, res) {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.startDate)
        data.startDate = new Date(data.startDate);
    if (data.endDate)
        data.endDate = new Date(data.endDate);
    const activity = await prisma_1.default.activity.update({ where: { id }, data });
    res.json(activity);
}
async function deleteActivity(req, res) {
    const { id } = req.params;
    await prisma_1.default.activity.delete({ where: { id } });
    res.status(204).send();
}

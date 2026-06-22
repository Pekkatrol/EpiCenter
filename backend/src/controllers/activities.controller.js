const prisma = require('../lib/prisma');

async function getAllActivities(req, res) {
  const activities = await prisma.activity.findMany();
  res.json(activities);
}

async function getActivityById(req, res) {
  const { id } = req.params;
  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) return res.status(404).json({ message: 'Activité introuvable' });
  res.json(activity);
}

async function createActivity(req, res) {
  const { title, description, startDate, endDate, location, category, imageUrl, createdById } = req.body;
  const activity = await prisma.activity.create({
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
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);
  const activity = await prisma.activity.update({ where: { id }, data });
  res.json(activity);
}

async function deleteActivity(req, res) {
  const { id } = req.params;
  await prisma.activity.delete({ where: { id } });
  res.status(204).send();
}

module.exports = { getAllActivities, getActivityById, createActivity, updateActivity, deleteActivity };
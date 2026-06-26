import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getAllActivities(req: AuthRequest, res: Response): Promise<void> {
  try {
    const activities = await prisma.activity.findMany();
    res.json(activities);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function getActivityById(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const activity = await prisma.activity.findUnique({ where: { id } });
  if (!activity) {
    res.status(404).json({ message: 'Activité introuvable' });
    return;
  }
  res.json(activity);
}

export async function createActivity(req: AuthRequest, res: Response): Promise<void> {
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

export async function updateActivity(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const data = { ...req.body };
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);
  const activity = await prisma.activity.update({ where: { id }, data });
  res.json(activity);
}

export async function deleteActivity(req: AuthRequest, res: Response): Promise<void> {
  const { id } = req.params;
  await prisma.activity.delete({ where: { id } });
  res.status(204).send();
}
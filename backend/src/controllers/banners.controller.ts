import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getAllBanners(req: AuthRequest, res: Response): Promise<void> {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(banners);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function createBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, description, imageUrl, link } = req.body;
    if (!title) { res.status(400).json({ message: 'Titre requis' }); return; }
    const banner = await prisma.banner.create({
      data: { title, description, imageUrl, link, createdById: req.user!.userId },
    });
    res.status(201).json(banner);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function updateBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
    const banner = await prisma.banner.update({ where: { id }, data: req.body });
    res.json(banner);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function deleteBanner(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
    await prisma.banner.delete({ where: { id } });
    res.status(204).send();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}
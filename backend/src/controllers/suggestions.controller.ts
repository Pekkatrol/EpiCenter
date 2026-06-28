import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getAllSuggestions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const suggestions = await prisma.suggestion.findMany({
      include: {
        createdBy: { select: { id: true, name: true } },
        likes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(suggestions);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function createSuggestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      res.status(400).json({ message: 'Titre et contenu requis' });
      return;
    }
    const suggestion = await prisma.suggestion.create({
      data: { title, content, createdById: req.user!.userId },
      include: {
        createdBy: { select: { id: true, name: true } },
        likes: true,
      },
    });
    res.status(201).json(suggestion);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function toggleLike(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
    const userId = req.user!.userId;

    const existing = await prisma.suggestionLike.findUnique({
      where: { suggestionId_userId: { suggestionId: id, userId } },
    });

    if (existing) {
      await prisma.suggestionLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.suggestionLike.create({ data: { suggestionId: id, userId } });
    }

    const updated = await prisma.suggestion.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        likes: true,
      },
    });
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function updateStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
    const { status } = req.body;
    if (!['PENDING', 'SEEN', 'DONE'].includes(status)) {
      res.status(400).json({ message: 'Statut invalide' });
      return;
    }
    const suggestion = await prisma.suggestion.update({
      where: { id },
      data: { status },
      include: {
        createdBy: { select: { id: true, name: true } },
        likes: true,
      },
    });
    res.json(suggestion);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function deleteSuggestion(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
    await prisma.suggestion.delete({ where: { id } });
    res.status(204).send();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}
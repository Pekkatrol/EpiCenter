import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getAllPolls(req: AuthRequest, res: Response): Promise<void> {
  try {
    const polls = await prisma.poll.findMany({
      include: {
        options: { include: { votes: true } },
        votes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(polls);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function createPoll(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { question, options } = req.body;
    if (!question || !options || options.length < 2) {
      res.status(400).json({ message: 'Il faut une question et au moins 2 options' });
      return;
    }
    const poll = await prisma.poll.create({
      data: {
        question,
        createdById: req.user!.userId,
        options: {
          create: (options as string[]).map((text) => ({ text })),
        },
      },
      include: { options: { include: { votes: true } }, votes: true },
    });
    res.status(201).json(poll);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function vote(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
    const { optionId } = req.body;
    const userId = req.user!.userId;

    const poll = await prisma.poll.findUnique({ where: { id } });
    if (!poll) { res.status(404).json({ message: 'Sondage introuvable' }); return; }
    if (poll.closed) { res.status(400).json({ message: 'Ce sondage est fermé' }); return; }

    const existingVote = await prisma.pollVote.findUnique({
      where: { pollId_userId: { pollId: id, userId } },
    });
    if (existingVote) { res.status(400).json({ message: 'Vous avez déjà voté' }); return; }

    await prisma.pollVote.create({
      data: { pollId: id, optionId, userId },
    });

    const updated = await prisma.poll.findUnique({
      where: { id },
      include: { options: { include: { votes: true } }, votes: true },
    });
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function closePoll(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
    const poll = await prisma.poll.update({
      where: { id },
      data: { closed: true },
      include: { options: { include: { votes: true } }, votes: true },
    });
    res.json(poll);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function deletePoll(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
    await prisma.poll.delete({ where: { id } });
    res.status(204).send();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}
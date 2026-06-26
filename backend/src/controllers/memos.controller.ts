import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export async function getAllMemos(req: AuthRequest, res: Response): Promise<void> {
  const isAdmin = req.user?.role === 'ADMIN';
  try {
    const memos = await prisma.memo.findMany({
      where: isAdmin ? {} : { visibility: 'PUBLIC' },
    });
    res.json(memos);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}

export async function getMemoById(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
  const memo = await prisma.memo.findUnique({ where: { id } });
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

export async function createMemo(req: AuthRequest, res: Response): Promise<void> {
  const { title, meetingDate, content, visibility, createdById } = req.body;
  const memo = await prisma.memo.create({
    data: { title, meetingDate: new Date(meetingDate), content, visibility, createdById },
  });
  res.status(201).json(memo);
}

export async function updateMemo(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
  const data = { ...req.body };
  if (data.meetingDate) data.meetingDate = new Date(data.meetingDate);
  const memo = await prisma.memo.update({ where: { id }, data });
  res.json(memo);
}

export async function deleteMemo(req: AuthRequest, res: Response): Promise<void> {
  const id = Array.isArray(req.params.id)
  ? req.params.id[0]
  : req.params.id;
  await prisma.memo.delete({ where: { id } });
  res.status(204).send();
}
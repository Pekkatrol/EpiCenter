import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { verifyMicrosoftToken } from '../services/microsoftToken.service';

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function devLogin(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ message: 'Utilisateur introuvable' });
    return;
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
}

export async function loginWithMicrosoft(req: Request, res: Response): Promise<void> {
  try {
    const { idToken } = req.body;

    let claims: jwt.JwtPayload;
    try {
      claims = await verifyMicrosoftToken(idToken);
    } catch (err) {
      res.status(401).json({ message: 'Token Microsoft invalide' });
      return;
    }

    const email = (claims.email || claims.preferred_username) as string;
    if (!email) {
      res.status(400).json({ message: 'Email introuvable dans le token' });
      return;
    }

    const role = getAdminEmails().includes(email.toLowerCase()) ? 'ADMIN' : 'MEMBER';

    let user = await prisma.user.findUnique({ where: { microsoftId: claims.oid } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { microsoftId: claims.oid, role },
        });
      } else {
        user = await prisma.user.create({
          data: { email, microsoftId: claims.oid as string, name: (claims.name || email) as string, role },
        });
      }
    } else if (user.role !== role) {
      user = await prisma.user.update({ where: { id: user.id }, data: { role } });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    res.status(500).json({ message });
  }
}
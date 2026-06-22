const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { verifyMicrosoftToken } = require('../services/microsoftToken.service');

async function devLogin(req, res) {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function loginWithMicrosoft(req, res) {
  const { idToken } = req.body;

  let claims;
  try {
    claims = await verifyMicrosoftToken(idToken);
  } catch (err) {
    return res.status(401).json({ message: 'Token Microsoft invalide' });
  }

  const email = claims.email || claims.preferred_username;
  if (!email) return res.status(400).json({ message: 'Email introuvable dans le token' });

  const role = getAdminEmails().includes(email.toLowerCase()) ? 'ADMIN' : 'MEMBER';

  let user = await prisma.user.findUnique({ where: { microsoftId: claims.oid } });

  if (!user) {
    user = await prisma.user.create({
      data: { email, microsoftId: claims.oid, name: claims.name || email, role },
    });
  } else if (user.role !== role) {
    user = await prisma.user.update({ where: { id: user.id }, data: { role } });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
}

module.exports = { devLogin, loginWithMicrosoft };
const prisma = require('../lib/prisma');

async function getAllMemos(req, res) {
  const isAdmin = req.user?.role === 'ADMIN';
  const memos = await prisma.memo.findMany({
    where: isAdmin ? {} : { visibility: 'PUBLIC' },
  });
  res.json(memos);
}

async function getMemoById(req, res) {
  const { id } = req.params;
  const memo = await prisma.memo.findUnique({ where: { id } });
  if (!memo) return res.status(404).json({ message: 'Mémo introuvable' });

  const isAdmin = req.user?.role === 'ADMIN';
  if (memo.visibility === 'ADMIN_ONLY' && !isAdmin) {
    return res.status(403).json({ message: 'Accès réservé aux admins' });
  }
  res.json(memo);
}

async function createMemo(req, res) {
  const { title, meetingDate, content, visibility, createdById } = req.body;
  const memo = await prisma.memo.create({
    data: {
      title,
      meetingDate: new Date(meetingDate),
      content,
      visibility,
      createdById,
    },
  });
  res.status(201).json(memo);
}

async function updateMemo(req, res) {
  const { id } = req.params;
  const data = { ...req.body };
  if (data.meetingDate) data.meetingDate = new Date(data.meetingDate);
  const memo = await prisma.memo.update({ where: { id }, data });
  res.json(memo);
}

async function deleteMemo(req, res) {
  const { id } = req.params;
  await prisma.memo.delete({ where: { id } });
  res.status(204).send();
}

module.exports = { getAllMemos, getMemoById, createMemo, updateMemo, deleteMemo };
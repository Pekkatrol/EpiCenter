const express = require('express');
const router = express.Router();
const {
  getAllMemos,
  getMemoById,
  createMemo,
  updateMemo,
  deleteMemo,
} = require('../controllers/memos.controller');
const { requireAuth, requireAdmin, optionalAuth } = require('../middlewares/auth.middleware');

router.get('/', optionalAuth, getAllMemos);
router.get('/:id', optionalAuth, getMemoById);
router.post('/', requireAuth, requireAdmin, createMemo);
router.put('/:id', requireAuth, requireAdmin, updateMemo);
router.delete('/:id', requireAuth, requireAdmin, deleteMemo);

module.exports = router;
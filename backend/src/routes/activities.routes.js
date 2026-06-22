const express = require('express');
const router = express.Router();
const {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
} = require('../controllers/activities.controller');

const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');

router.get('/', getAllActivities);
router.get('/:id', getActivityById);
router.post('/', requireAuth, requireAdmin, createActivity);
router.put('/:id', requireAuth, requireAdmin, updateActivity);
router.delete('/:id', requireAuth, requireAdmin, deleteActivity);

module.exports = router;
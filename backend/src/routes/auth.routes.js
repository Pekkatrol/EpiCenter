const express = require('express');
const router = express.Router();
const { devLogin, loginWithMicrosoft } = require('../controllers/auth.controller');

router.post('/dev-login', devLogin);
router.post('/microsoft', loginWithMicrosoft);

module.exports = router;
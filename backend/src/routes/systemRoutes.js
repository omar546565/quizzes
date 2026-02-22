const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const auth = require('../middleware/auth');

router.get('/backup', auth, systemController.exportData);
router.post('/restore', auth, systemController.importData);

module.exports = router;

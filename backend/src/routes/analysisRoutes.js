const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, analysisController.getAllAnalyses);
router.post('/analyze', authMiddleware, analysisController.analyzeIndicator);

module.exports = router;
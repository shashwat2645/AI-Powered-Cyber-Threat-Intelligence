const express = require('express');
const router = express.Router();
const indicatorController = require('../controllers/indicatorController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, indicatorController.getAllIndicators);
router.get('/:id', authMiddleware, indicatorController.getIndicatorById);
router.post('/', authMiddleware, indicatorController.createIndicator);
router.delete('/:id', authMiddleware, indicatorController.deleteIndicator);

module.exports = router;
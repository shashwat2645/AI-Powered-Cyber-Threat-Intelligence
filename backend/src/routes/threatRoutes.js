const express = require('express');
const router = express.Router();
const threatController = require('../controllers/threatController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, threatController.getAllThreats);
router.get('/:id', authMiddleware, threatController.getThreatById);
router.post('/', authMiddleware, threatController.createThreat);
router.put('/:id', authMiddleware, threatController.updateThreat);
router.delete('/:id', authMiddleware, threatController.deleteThreat);
router.get('/analyze/:id', authMiddleware, threatController.analyzeThreat);

module.exports = router;
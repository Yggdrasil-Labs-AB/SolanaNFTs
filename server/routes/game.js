const express = require('express');
const {verifyApiKey} = require('../Middleware/authMiddleware')
const {getInGameCurrency, deductInGameCurrency, fetchRollQualityData, validateGameId, getMinimumGameVersion} = require('../controllers/gameController');
const router = express.Router();

//Test Data
router.get('/usercoins', verifyApiKey, getInGameCurrency);

router.get('/minVersion', getMinimumGameVersion);

router.post('/deductcoins', verifyApiKey, deductInGameCurrency);

router.post('/rollquality', fetchRollQualityData);

router.post('/validate-game-id', verifyApiKey, validateGameId);

module.exports = router;
const express = require('express');
const {verifyApiKey} = require('../Middleware/authMiddleware')
const { requireAdmin } = require('../controllers/loginController');
const {
    getInGameCurrency, 
    deductInGameCurrency, 
    fetchRollQualityData, 
    validateGameId, 
    getMinimumGameVersion, 
    addNewInGameItem,
    getAllItems,
    updateItem,
    deleteItem } = require('../controllers/gameController');
const router = express.Router();

//Test Data
router.get('/usercoins', verifyApiKey, getInGameCurrency);

router.get('/minVersion', getMinimumGameVersion);

router.post('/deductcoins', verifyApiKey, deductInGameCurrency);

router.post('/rollquality', fetchRollQualityData);

router.post('/validate-game-id', verifyApiKey, validateGameId);

router.get('/items', getAllItems);

router.post('/items', verifyApiKey, requireAdmin, addNewInGameItem);

router.patch('/items/:id', verifyApiKey, requireAdmin, updateItem);

router.delete('/items/:id', verifyApiKey, requireAdmin, deleteItem);


module.exports = router;
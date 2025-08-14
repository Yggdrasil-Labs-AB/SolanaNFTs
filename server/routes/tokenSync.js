const express = require('express');
const { buildAndSendSyncTX, checkAndSubmitSignedTX } = require('../controllers/tokenSyncController');
const router = express.Router();

router.post('/gtob', buildAndSendSyncTX);
router.post('/signedTx', checkAndSubmitSignedTX);

module.exports = router;
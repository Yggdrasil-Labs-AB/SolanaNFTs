const express = require('express');
const {verifyApiKey} = require('../Middleware/authMiddleware');
const botBlocker = require('../Middleware/botBlocker');
const {verifySolPayment} = require('../Middleware/checkSolPayment');
const {checkWhitelistSpot} = require('../Middleware/whitelistCheck');
const {verifyAdminStatus} = require("../Middleware/adminCheck");
const { requireAuth } = require("../controllers/loginController");
const { 
    getAllNftConcepts, 
    addNftConcept, 
    deleteNftConcept, 
    updateNftConcept, 
    saveMetadataUri, 
    voteForNftConcept, 
    testData, 
    createAndSendNFT,
    getCoreNFTs,
    getNftConceptById,
    trackNftTransaction,
    getCoreNFTsDevNet,
    updateRarityOfNfts } = require('../controllers/nftController');
const router = express.Router();

//Test Data
router.get('/hello', testData);

//GET /api/nft/concepts (get all nft concepts)
router.get('/concepts', botBlocker, verifyApiKey, getAllNftConcepts);

//GET /api/nft/concepts (get ONE nft concept)
router.get('/concepts/:id', verifyApiKey, getNftConceptById);

//POST /api/nft/concepts (add new entry)
router.post('/concepts', verifyApiKey, addNftConcept);

//UPDATE /api/nft/concepts/:id
router.patch('/concepts/:id', verifyApiKey, updateNftConcept);

//Lock /api/nft/locknft/:id
router.patch('/concepts/:id/metadata', verifyApiKey, saveMetadataUri);

// DELETE /api/nft/delete/:id
router.delete('/concepts/:id', verifyApiKey, deleteNftConcept);

router.patch('/concepts/:id/vote', verifyApiKey, voteForNftConcept);

// 🔹 Record NFT Create/Buy Transactions
router.patch('/concepts/:id/transaction', verifyApiKey, trackNftTransaction);

router.post('/createnft', verifyApiKey, requireAuth, createAndSendNFT);

router.post('/getCoreNfts', getCoreNFTs);

router.post('/getCoreNfts/Devnet', getCoreNFTsDevNet);

router.post('/rarities', verifyApiKey, verifyAdminStatus, updateRarityOfNfts);

module.exports = router;

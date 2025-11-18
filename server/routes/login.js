// routes/login.js
const express = require("express");
const router = express.Router();

const {
  getNonce,
  verifySignature,
} = require("../controllers/loginController");

router.post("/nonce", getNonce);
router.post("/verify", verifySignature);

module.exports = router;

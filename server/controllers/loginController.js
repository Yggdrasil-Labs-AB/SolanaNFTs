// controllers/loginController.js
const nacl = require("tweetnacl");
const { PublicKey } = require("@solana/web3.js");
const jwt = require("jsonwebtoken");
const { TextEncoder } = require("util"); // for Node < 18, otherwise global
const User = require("../Models/User");

// One secret for signing & verifying JWTs (backend only)
const JWT_SECRET = process.env.JWT_SECRET;

// In-memory nonce store (demo). For production use DB/Redis if you scale.
const nonces = new Map();

/**
 * POST /auth/nonce
 * Body: { publicKey }
 * Returns: { message }
 */
const getNonce = (req, res) => {
  const { publicKey } = req.body;

  if (!publicKey) {
    return res.status(400).json({ error: "Missing publicKey" });
  }

  const nonce = `Login to Booh Marketplace

Wallet: ${publicKey}
Nonce: ${Math.random().toString(36).slice(2)}`;

  nonces.set(publicKey, nonce);

  return res.json({ message: nonce });
};

/**
 * POST /auth/verify
 * Body: { publicKey, signature }
 *  - signature must be base64 string from client
 * Returns: { success, role, token }
 */
const verifySignature = async (req, res) => {
  const { publicKey, signature } = req.body;

  if (!publicKey || !signature) {
    return res.status(400).json({ error: "Missing publicKey or signature" });
  }

  const storedNonce = nonces.get(publicKey);
  if (!storedNonce) {
    return res
      .status(400)
      .json({ error: "Nonce not found or expired. Request a new nonce." });
  }

  try {
    const pk = new PublicKey(publicKey);
    const messageBytes = new TextEncoder().encode(storedNonce);
    const signatureBytes = Buffer.from(signature, "base64");

    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      pk.toBytes()
    );

    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Signature valid, remove nonce so it can't be reused
    nonces.delete(publicKey);

    // Look up or create the user in Mongo
    let user = await User.findOne({ walletAddress: publicKey });

    if (!user) {
      // New wallet -> create as "member" by default
      user = await User.create({
        walletAddress: publicKey,
        // role defaults to "member" per your schema
      });
    }

    const role = user.role; // "admin" or "member"

    // Create JWT that includes user id, wallet, role
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        walletAddress: user.walletAddress,
        role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      role,
      token,
    });
  } catch (err) {
    console.error("Error verifying signature:", err);
    return res.status(500).json({ error: "Server error verifying signature" });
  }
};

/**
 * Middleware: requireAuth
 * Reads JWT from Authorization: Bearer <token>
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { userId, walletAddress, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Middleware: requireAdmin
 * Uses requireAuth, then checks role === 'admin'
 */
const requireAdmin = (req, res, next) => {
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admins only" });
    }
    next();
  });
};

module.exports = {
  getNonce,
  verifySignature,
  requireAuth,
  requireAdmin,
};

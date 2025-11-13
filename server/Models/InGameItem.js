const mongoose = require('mongoose');

const InGameItem = new mongoose.Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  external_link: { type: String, required: true },
  attributes: [
    {
      trait_type: { type: String, required: true },
      value: { type: String, required: true },
      _id: false
    },
  ],
  properties: {
    files: [
      {
        uri: { type: String, required: false },
        type: { type: String, required: true },
      },
    ],
    category: { type: String, required: true },
  },
  storeInfo: {
    available: {
      type: Boolean,
      required: [function () { return this.isNew; }, 'Store availability is required.'],
    },
    price: {
      type: Number,
      required: [function () { return this.isNew; }, 'Price is required.'],
    },
    season: {
      type: Number,
      required: [function () { return this.isNew; }, 'Season is required.'],
    },
    metadataUri: {
      type: String,
      required: false
    },
    creator: {
      type: String,
      required: false
    },
    created: {
      type: Number,
      required: false
    },
    goldCost: {
      type: Number,
      required: false,
    },
    babyBoohCost: {
      type: Number,
      required: false
    },
    rollQuality: {
      type: Number,
      required: false
    },
    statsSeedRoll: {
      type: Number,
      required: false
    },
    mintLimit: {type: Number, default: -1}
  },
  votes: {
    count: { type: Number, default: 0 }, // Total number of votes
    voters: { type: [String], default: [] }, // List of wallet addresses who voted
  },
  purchases: {
    totalCreates: { type: Number, default: 0 }, // Total number of NFTs created
    totalBuys: { type: Number, default: 0 }, // Total number of purchases (subset of creates)
    creators: { type: [String], default: [] }, // List of creators (one-time record per user)
    buyers: { type: [String], default: [] }, // List of buyers (repeatable purchases allowed)
    transactions: [
        {
            type: { type: String, enum: ['create', 'buy'], required: true }, // Type of transaction
            user: { type: String, required: true }, // Wallet address or User ID
            amount: { type: Number, required: true }, // Amount spent (SOL, USD, etc.)
            currency: { type: String, required: true, enum: ['SOL', 'USD', 'BABYBOOH', 'CARD'] }, // Payment currency
            txSignature: { type: String, required: true }, // ✅ Transaction Signature of Creating & Sending Nft
            timestamp: { type: Date, default: Date.now } // Time of transaction
        }
    ],
}
}, { timestamps: true });

module.exports = mongoose.model('InGameItem', InGameItem);


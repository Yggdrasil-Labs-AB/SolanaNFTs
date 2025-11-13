const mongoose = require('mongoose');

const AttributeSchema = new mongoose.Schema(
  {
    trait_type: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const InGameItemSchema = new mongoose.Schema(
  {
    // Core display info (matches infoData)
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // final URL (e.g. Cloudinary)

    // Attribute list (matches getAttributesData shape)
    attributes: {
      type: [AttributeSchema],
      default: [],
    },

    // Store / economy info (matches storeInfoData)
    storeInfo: {
      available: {
        type: Boolean,
        default: false,
      },
      season: {
        type: Number,
        required: true,
      },
      goldCost: {
        type: Number,
        default: 0,
      },
      babyBoohCost: {
        type: Number,
        default: 0,
      },
      boohShardsCost: {
        type: Number,
        default: 0,
      },
      rollQuality: {
        type: Number,
        default: 0,
      },
      statsRollSeed: {
        type: Number,
        default: 0,
      },
      creator: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InGameItem', InGameItemSchema);

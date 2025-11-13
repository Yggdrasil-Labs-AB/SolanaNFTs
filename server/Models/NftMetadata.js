const mongoose = require('mongoose');
const { Schema } = mongoose;

/** Attribute subdoc */
const AttributeSchema = new Schema(
  {
    trait_type: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }, // string | number | boolean | etc.
  },
  { _id: false }
);

/** Properties.files[] item */
const FileRefSchema = new Schema(
  {
    uri: { type: String, required: true }, // e.g. ipfs://.../preview.png
    type: {
      type: String,
      required: true,                       // e.g. image/png, model/gltf-binary
    },
  },
  { _id: false }
);

/** Properties block */
const PropertiesSchema = new Schema(
  {
    files: {
      type: [FileRefSchema],
      default: [],
      validate: {
        validator(arr) {
          return Array.isArray(arr) && arr.length > 0; // require at least one file reference
        },
        message: 'At least one file reference is required in properties.files',
      },
    },
    category: {
      type: String,
      required: true,
      enum: ['image', 'vr', 'video', 'audio', 'other'],
      default: 'image',
    },
  },
  { _id: false }
);

/** Store info block */
const StoreInfoSchema = new Schema(
  {
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
    metadataUri: { type: String },
    creator: { type: String },
    created: { type: Number },
    mintLimit: { type: Number, default: -1 },
  },
  { _id: false }
);

/** Purchases block */
const TransactionSchema = new Schema(
  {
    action: { type: String, enum: ['create', 'buy'], required: true }, // renamed from "type"
    user: { type: String, required: true }, // wallet or user id
    amount: { type: Number, required: true },
    currency: { type: String, required: true, enum: ['SOL', 'USD', 'BABYBOOH', 'CARD'] },
    txSignature: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PurchasesSchema = new Schema(
  {
    totalCreates: { type: Number, default: 0 },
    totalBuys: { type: Number, default: 0 },
    creators: { type: [String], default: [] },
    buyers: { type: [String], default: [] },
    transactions: { type: [TransactionSchema], default: [] },
  },
  { _id: false }
);

/** Main schema */
const NftMetadataSchema = new Schema(
  {
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    description: { type: String, required: true },

    // Canonical media
    image: { type: String },           // ipfs://.../preview.png (not always required if you only have animation_url)
    animation_url: { type: String },   // ipfs://.../model.glb

    // Use whichever you prefer, but be consistent with your app
    external_url: { type: String },    // (was external_link)

    attributes: { type: [AttributeSchema], default: [] },
    properties: { type: PropertiesSchema, required: true },

    storeInfo: { type: StoreInfoSchema, required: true },

    votes: {
      count: { type: Number, default: 0 },
      voters: { type: [String], default: [] },
    },

    purchases: { type: PurchasesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

/** Custom validator: require at least one of image or animation_url */
NftMetadataSchema.path('image').validate(function () {
  if (!this.image && !this.animation_url) {
    return false;
  }
  return true;
}, 'Either "image" or "animation_url" is required.');

module.exports = mongoose.model('NftMetadata', NftMetadataSchema);

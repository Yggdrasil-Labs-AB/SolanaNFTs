// General Information Data
export const infoData = {
    name: '', // Default name for the entity
    symbol: 'BOOH', // Default symbol
    description: '', // Placeholder for description
    image: '', // Placeholder for the image URL
    animation_url: "",
    external_url: 'https://nft.boohworld.io/marketplace', // External link for more details
};

// Properties Data for Metadata
export const propertiesData = {
    files: [
      { uri: "PREVIEW_IMAGE_URI", type: "image/png" },
      { uri: "MODEL_URI",         type: "model/gltf-binary" } // .glb MIME
    ],
    category: "vr"
};

// --- Stat modifiers you want included as trait_type/value pairs
export const nftStatModifiers = [
  "strength",
  "vitality",
  "resilience",
  "intelligence",
  "resistance",
];

// --- Base attributes (do NOT mutate this directly)
export const baseAttributesData = [
  { trait_type: "type", value: "" },
  { trait_type: "subType", value: "" },
  { trait_type: "rarity", value: "common" },
  { trait_type: "division", value: "none" },
];

const currentSeason = 1; // Current season number
const startingAvailability = false; // Default availability status
export const storeInfoData = {
    available: startingAvailability, //Available In-Game
    season: currentSeason, // Season the item belongs to
    metadataUri: '', // URI for metadata
    glbUri: '',
    mintLimit: ''
};

/**
 * Build final attributes array:
 * - Ensures all nftStatModifiers exist with default "0" (if not present)
 * - Lets you pass overrides to set/replace values
 *
 * @param {Array<{trait_type: string, value: string|number}>} overrides
 * @returns {Array<{trait_type: string, value: string}>}
 */
export const getAttributesData = (overrides = []) => {
  // Start with a shallow copy so baseAttributesData stays immutable
  const attributes = [...baseAttributesData];

  // Map of existing trait_types for fast lookup
  const byKey = new Map(attributes.map(a => [a.trait_type, a]));

  // Ensure each stat modifier exists with default "0"
  for (const key of nftStatModifiers) {
    if (!byKey.has(key)) {
      const entry = { trait_type: key, value: "0" };
      attributes.push(entry);
      byKey.set(key, entry);
    }
  }

  // Apply overrides (stringify numbers for NFT metadata consistency)
  for (const o of overrides) {
    const val = typeof o.value === "number" ? String(o.value) : o.value;
    if (byKey.has(o.trait_type)) {
      byKey.get(o.trait_type).value = val;
    } else {
      const entry = { trait_type: o.trait_type, value: val };
      attributes.push(entry);
      byKey.set(o.trait_type, entry);
    }
  }

  return attributes;
};

export const divisionOptions = [
    'crebel',
    'elites'
]

export const generalTypes = [
    'skin',
]

export const skinOptions = [
    'body',
    'sword',
    'axe',
    'dagger',
    'staff',
    'bow',
    'scythe',
    'twoHandedSword',
    'spear'
];

// Cost Associated with Each Rarity Level
export const creatorCosts = {
    common: 0.05,
    uncommon: 0.11,
    rare: 0.99,
    epic: 3.99,
    legendary: 5.99,
};

// Pricing Values (Base price adjusted dynamically)
const priceIncrease = 0; // Adjustable price increment
export const pricingValues = {
    common: 4.99 + priceIncrease,
    uncommon: 9.99 + priceIncrease,
    rare: 15.99 + priceIncrease,
    epic: 29.99 + priceIncrease,
    legendary: 44.99 + priceIncrease,
};

export const mintCost = 0.004;

export const rarityOptions = [
    'common',
    'uncommon',
    'rare',
    'epic',
    'legendary',
    'unique',
    'event'
];

export const sellingThreshold = {
    common: 100,
    uncommon: 100,
    rare: 75,
    epic: 50,
    legendary: 50
}

// General Information Data
export const infoData = {
    name: '', // Default name for the entity
    symbol: 'BOOH', // Default symbol
    description: '', // Placeholder for description
    image: '', // Placeholder for the image URL
    external_link: 'https://nft.boohworld.io/marketplace', // External link for more details
};

// Talents List
export const stats = [
    "health",
    "damage",
    "defense",
    "criticalStrikeDamage",
    "spellAttack",
    "spellDefense",
]; // Key talents used in the attributes system

export const statModifiers = [
    "strengthModifier",
    "vitalityModifier",
    "resilienceModifier",
    "intelligenceModifier",
    "resistanceModifier",
]

export const nftStatModifiers = [
    "strength",
    "vitality",
    "resilience",
    "intelligence",
    "resistance",
]

export const combinedTraits = Array.from(new Set([...statModifiers, ...stats]));

// Base Attributes Data
export const attributesData = [
    { trait_type: "type", value: "" }, // Item type
    { trait_type: "subType", value: "" }, // Item sub-type
    { trait_type: "rarity", value: "common" }, // Default rarity
    { trait_type: "affinity", value: "" }, // Default affinity
    { trait_type: "division", value: "none" },
];

// Function to dynamically add missing talents to attributesData
export const getAttributesData = () => {
    // Extract existing talents from attributesData
    const existingTalents = attributesData
        .filter(attr => stats.includes(attr.trait_type))
        .map(attr => attr.trait_type);

    // Add any missing talents with default values
    const newTalents = combinedTraits
        .filter(talent => !existingTalents.includes(talent))
        .map(talent => ({ trait_type: talent, value: "0" }));

    // Return the updated attributesData array
    return [...attributesData, ...newTalents];
};

// Properties Data for Metadata
export const propertiesData = {
    files: [
        {
            uri: null, // Placeholder for the file URI
            type: "image/png", // Default file type
        },
    ],
    category: "image", // Default category for the file
};

export const inGameCurrencyCost = {}

const currentSeason = 1; // Current season number
const startingAvailability = false; // Default availability status
export const storeInfoData = {
    available: startingAvailability, //Available In-Game
    season: currentSeason, // Season the item belongs to
    metadataUri: '', // URI for metadata
    goldCost: 0,
    babyBoohCost: 0,
    rollQuality: 0,
    statsRollSeed: 95,
};

// Option Types for Select Inputs

export const generalTypes = [
    'skin',
    'weapon',
    'armor',
    'accessory'
]

export const affinityOptions = [
    'fire',
    'ice',
    'water',
    'lightning',
    'earth',
    'wind',
    'light',
    'dark',
    'poison',
];

export const armorOptions = [
    'chest',
    'helm',
];

export const weaponOptions = [
    'sword',
    'axe',
    'dagger',
    'staff',
    'bow',
    'scythe',
    'twoHandedSword',
    'spear'
];

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

export const accessoriesOptions = [
    'pendant',
    'tome',
    'necklace',
    'ring',
    'amulet'
];

export const rarityOptions = [
    'common',
    'uncommon',
    'rare',
    'epic',
    'legendary',
    'unique',
    'event'
];

export const divisionOptions = [
    'crebel',
    'elites'
]

export const defaultMintCost = .004;

export const submissionCost = 24.99;

export const newStats = {
    strength: ''
}
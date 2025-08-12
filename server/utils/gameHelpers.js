const axios = require('axios');

async function fetchRollQualityHelper(seedNumber, rollQuality, rarity) {
  if (!seedNumber || !rollQuality || !rarity) {
    throw new Error("Missing required parameters");
  }

  const token = await getBearerToken();

  const buildURL = `https://cloud-code.services.api.unity.com/v1/projects/${process.env.BB_PROJECT_ID}/modules/BoohItemRollQualityModule/RollItemAttributesRemote`;

  const response = await axios.post(
    buildURL,
    {
      params: {
        statsRollSeed: seedNumber,
        rollQuality,
        rarityStr: rarity
      }
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

async function getBearerToken() {
  const credentials = Buffer.from(`${process.env.BB_KEY_ID}:${process.env.BB_SECRET_KEY}`).toString('base64');

  const res = await fetch(
    `https://services.api.unity.com/auth/v1/token-exchange?projectId=${process.env.BB_PROJECT_ID}&environmentId=${process.env.BB_ENVIRONMENT_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log("✅ Bearer Token Fetched!");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Failed to get bearer token: ${JSON.stringify(data)}`);
  }

  return data.accessToken;
}

async function getBearerTokenWithAuth() {
  const credentials = Buffer.from(`${process.env.BB_KEY_ID}:${process.env.BB_SECRET_KEY}`).toString('base64');

  const res = await fetch(
    `https://services.api.unity.com/auth/v1/token-exchange?projectId=${process.env.BB_PROJECT_ID}&environmentId=${process.env.BB_ENVIRONMENT_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `${process.env.BB_AUTH}`,
        'Content-Type': 'application/json',
      },
    }
  );

  console.log("✅ Bearer Token Fetched!");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Failed to get bearer token: ${JSON.stringify(data)}`);
  }

  return data.accessToken;
}



const applyAttributes = (attributes, rolledAttributes) => {
  const rolledMap = {
    strengthRolled: "strengthModifier",
    vitalityRolled: "vitalityModifier",
    agilityRolled: "agilityModifier",
    resilienceRolled: "resilienceModifier",
    focusRolled: "focusModifier",
    fearRolled: "fearModifier",
    specialAttackRolled: "specialAttackModifier",
    specialDefenseRolled: "specialDefenseModifier",
    luckRolled: "luckModifier",
    healthRolled: 'health',
    damageRolled: 'damage',
    defenseRolled: 'defense',
    evasionRolled: 'evasion',
    coinMultiplierRolled: 'coinMultiplier',
    criticalStrikeDamageRolled: 'criticalStrikeDamage',
    criticalStrikeChanceRolled: 'criticalStrikeChance',
    focus: 'focus',
    gasReserve: 'gasReserve',
    specialAttack: 'specialAttack',
    specialDefense: 'specialDefense'

    // Add others if needed
  };

  return attributes.map(attr => {
    // Check if there's a rolled version that maps to this trait_type
    const matchedEntry = Object.entries(rolledMap).find(
      ([rolledKey, traitType]) => traitType === attr.trait_type
    );

    if (matchedEntry) {
      const [rolledKey] = matchedEntry;
      if (rolledKey in rolledAttributes) {
        return {
          ...attr,
          value: rolledAttributes[rolledKey].toString(), // keep consistent as string
        };
      }
    }

    // If not rolled, leave unchanged
    return attr;
  });
};

const rollSecureRandomInt = () => {
  const min = -2147483648;
  const max = 2147483648;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const validateGameIdUtils = async (playerId) => {
  if (!playerId) throw new Error("playerId is required");

  const token = await getBearerTokenWithAuth();

  const url = `https://cloud-save.services.api.unity.com/v1/data/projects/${process.env.BB_PROJECT_ID}/players/${encodeURIComponent(playerId)}/items`

  try {
    const { data } = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    return data.results;
  } catch (err) {
    // Helpful error surface
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const body = err.response?.data;
      console.error("Get Player failed:", status, body);
    }
    throw err; // don't `throw new (e)` — just rethrow
  }

}

const DeductInGameBabyBooh = async (playerId, newAmount, cryptoData) => {
  if (!playerId) throw new Error("playerId is required");
  if (!(newAmount > 0)) throw new Error("Amount must be > 0");

  const projectId = process.env.BB_PROJECT_ID; // Vite env
  if (!projectId) throw new Error("VITE_BB_PROJECT_ID is not set");

  const token = await getBearerTokenWithAuth();

  const url = `https://cloud-save.services.api.unity.com/v1/data/projects/${encodeURIComponent(projectId)}/players/${encodeURIComponent(playerId)}/items`;

  const updatedValue = {
      ...cryptoData?.value,
      BabyBoohCoin: newAmount
  }
  // Cloud Save expects: { key, value}
  const payload = {
    key: "CryptoData",
    value: updatedValue
  };

  try {
    const { data } = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`, // ClientServiceAccount bearer
        "Content-Type": "application/json"
      },
      timeout: 10000
    });

    return data?.writeLock;
    
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error(
        "Cloud Save set item failed:",
        err.response?.status,
        err.response?.data
      );
    }
    throw err;
  }
}

module.exports = { fetchRollQualityHelper, rollSecureRandomInt, applyAttributes, validateGameIdUtils, DeductInGameBabyBooh };
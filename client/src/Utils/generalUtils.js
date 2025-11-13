export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const isSolanaWalletApp = () => {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent.toLowerCase();

  // Detects if the user is on a mobile device
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

  // Detects if the user is using a Solana wallet app (only on mobile)
  return isMobile && (
    userAgent.includes("phantom") ||
    userAgent.includes("solflare") ||
    userAgent.includes("sollet") ||
    userAgent.includes("slope")
  );
};

// Utility function to capitalize the first letter of a string
export const capitalizeFirstLetter = (string) => {
  if (!string) return ""; // Handle empty or undefined strings
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const duplicateData = (data, index, times) => {

  console.log('Duplicate Data');
  if (!data || data.length <= index) {
    console.error("Invalid data array or index out of bounds");
    return [];
  }

  // Get the item at the specified index
  const itemToDuplicate = data[index];

  console.log(itemToDuplicate)

  // Duplicate it `times` number of times
  const newArray = Array(times).fill({ ...itemToDuplicate });

  return newArray;
};

//Function to shorten long address strings
export const shortenAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const rollSecureRandomInt = () => {
  const min = -2147483648;
  const max = 2147483648;

  const range = max - min + 1;
  const randomBuffer = new Uint32Array(1);
  window.crypto.getRandomValues(randomBuffer);

  const randomFraction = randomBuffer[0] / 0xFFFFFFFF;
  return Math.floor(randomFraction * range) + min;
}

/**
 * Maps rolled attribute fields from Unity to trait_types and applies them.
 *
 * @param {Array<{ trait_type: string, value: string | number }>} attributes - Base metadata attributes.
 * @param {Object} rolledAttributes - Response from Unity's API.
 * @param {Number} seedRoll - seed roll tracked via Cloud
 * @param {Number} rollQuality - level of roll on an item
 * @returns {Array} Updated attribute array with applied rolled values.
 */
export const applyAttributes = (attributes, rolledAttributes, statsSeedRoll, rollQuality) => {
  const rolledMap = {
    strengthRolled: "strengthModifier",
    vitalityRolled: "vitalityModifier",
    resilienceRolled: "resilienceModifier",
    specialAttackRolled: "specialAttackModifier",
    specialDefenseRolled: "specialDefenseModifier",
    healthRolled: 'health',
    damageRolled: 'damage',
    defenseRolled: 'defense',
    criticalStrikeDamageRolled: 'criticalStrikeDamage',
    specialAttack: 'specialAttack',
    specialDefense: 'specialDefense'
  };

  const updatedAttributes = attributes.map(attr => {
    const matchedEntry = Object.entries(rolledMap).find(
      ([_rolledKey, traitType]) => traitType === attr.trait_type
    );

    if (matchedEntry) {
      const [rolledKey] = matchedEntry;
      if (rolledKey in rolledAttributes) {
        return {
          ...attr,
          value: rolledAttributes[rolledKey].toString(),
        };
      }
    }

    return attr;
  });

  // Append seedRoll and rollQuality at the end
  updatedAttributes.push(
    {
      trait_type: 'rollQuality',
      value: rollQuality.toString(),
    },
    {
      trait_type: 'statsSeedRoll',
      value: statsSeedRoll.toString(),
    }
  );

  return updatedAttributes;
};

/**
 * Removes any attributes that have a value of 0.
 *
 * @param {Array<{ trait_type: string, value: string | number }>} attributes - Base metadata attributes.
 * @returns {Array} Updated attribute array with cleaned up elements.
 */

export const cleanAttributes = (attributes) => {
  return attributes.filter(attr => {
    const value = attr.value;
    return !(value === 0 || value === '0');
  });
};
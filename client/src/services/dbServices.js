import axios from "axios";
import { URI_SERVER } from "../config/config";

const API_KEY = import.meta.env.VITE_SERVE_KEY;

/**
 * Fetch all NFT concepts from the database.
 * @returns {Promise<object[]>} Resolves with an array of NFT concepts.
 * @throws {Error} Throws an error if the request fails.
 */
export const fetchAllNftConcepts = async () => {
    try {
        const response = await axios.get(
            `${URI_SERVER}/api/nft/concepts`,
            { headers: { "x-api-key": API_KEY } });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch all NFT concepts:", error.response?.data || error.message);
        throw new Error(`Failed to fetch all NFT concepts: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Fetch metadata for a specific NFT concept by ID.
 * @param {string} nftId - The ID of the NFT concept.
 * @returns {Promise<object>} Resolves with the NFT metadata.
 * @throws {Error} Throws an error if the request fails.
 */
export const fetchSingleNftMetadata = async (nftId) => {
    try {
        const response = await axios.get(
            `${URI_SERVER}/api/nft/concepts/${nftId}`,
            { headers: { "x-api-key": API_KEY } });
        return response.data;
    } catch (error) {
        console.error("Error fetching NFT metadata:", error.response?.data || error.message);
        throw new Error(`Failed to fetch NFT metadata: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Add a new NFT concept to the database.
 * @param {object} metadataForDB - The NFT concept metadata.
 * @returns {Promise<object>} Resolves with the created NFT concept.
 * @throws {Error} Throws an error if the request fails.
 */
export const addNftConcept = async (metadataForDB) => {
    try {
        const response = await axios.post(`${URI_SERVER}/api/nft/concepts`,
            metadataForDB,
            { headers: { "x-api-key": API_KEY } }
        );
        return response.data;
    } catch (error) {
        console.error("Failed to add NFT concept:", error.response?.data || error.message);
        throw new Error(`Failed to add NFT concept: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Update an existing NFT concept.
 * @param {object} updates - Updated NFT concept data.
 * @returns {Promise<object>} Resolves with the updated NFT concept.
 * @throws {Error} Throws an error if the request fails.
 */
export const updateNftConcept = async (updates) => {
    try {
        const response = await axios.patch(
            `${URI_SERVER}/api/nft/concepts/${updates._id}`,
            updates,
            {
                headers: { "x-api-key": API_KEY }
            });
        return response.data;
    } catch (error) {
        console.error("Error updating NFT concept:", error.response?.data || error.message);
        throw new Error(`Error updating NFT concept: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Save the metadata URI for an NFT concept.
 * @param {string} nftId - The ID of the NFT concept.
 * @param {string} metadataUri - The metadata URI to store.
 * @returns {Promise<object>} Resolves with the updated NFT concept.
 * @throws {Error} Throws an error if the request fails.
 */
export const saveMetadataUri = async (nftId, metadataUri) => {
    try {
        const response = await axios.patch(
            `${URI_SERVER}/api/nft/concepts/${nftId}/metadata`,
            { metadataUri },
            { headers: { "x-api-key": API_KEY } }
        );
        return response.data;
    } catch (error) {
        console.error("Error storing metadata URI:", error.response?.data || error.message);
        throw new Error(`Error storing metadata URI: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Delete an NFT concept by ID.
 * @param {string} id - The ID of the NFT concept.
 * @returns {Promise<object>} Resolves with the deletion confirmation.
 * @throws {Error} Throws an error if the request fails.
 */
export const deleteNftConcept = async (id) => {
    try {
        const response = await axios.delete(
            `${URI_SERVER}/api/nft/concepts/${id}`,
            { headers: { "x-api-key": API_KEY } });
        return response.data;
    } catch (error) {
        console.error("Error deleting NFT concept:", error.response?.data || error.message);
        throw new Error(`Error deleting NFT concept: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Check if a user is an admin based on their wallet address.
 * @param {string} walletAddress - The wallet address to check.
 * @returns {Promise<boolean>} Resolves with `true` if admin, otherwise `false`.
 */
export const checkIfAdmin = async (walletAddress) => {
    try {
        const response = await axios.post(`${URI_SERVER}/api/user/role`, { walletAddress }, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data.isAdmin || false;
    } catch (error) {
        console.error("Failed to check admin role:", error.response?.data || error.message);
        throw new Error(`Failed to check admin role: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Vote for an NFT concept.
 * @param {string} nftId - The ID of the NFT concept.
 * @param {string} walletAddress - The voter's wallet address.
 * @returns {Promise<object>} Resolves with the updated vote count.
 * @throws {Error} Throws an error if the request fails.
 */
export const voteForNFT = async (nftId, voterAddress, voteType) => {
    try {
        const response = await axios.patch(
            `${URI_SERVER}/api/nft/concepts/${nftId}/vote`,
            {
                voterAddress,
                nftId,
                voteType
            },
            { headers: { "x-api-key": API_KEY } }
        );

        return response.data;
    } catch (error) {
        console.error("Error while voting:", error.response?.data || error.message);
        throw new Error(`Failed to vote for NFT: ${error.response?.data?.message || error.message}`);
    }
};


/**
 * Logs an NFT transaction (either 'create' or 'buy').
 * @param {string} nftId - The ID of the NFT.
 * @param {string} userId - The wallet address or user ID.
 * @param {'create' | 'buy'} type - The type of transaction.
 * @param {number} amount - The amount spent (0 for in-game currency).
 * @param {'SOL' | 'USD' | 'BABYBOOH'} currency - The payment currency.
 * @returns {Promise<object>} - The updated NFT data.
 */
export const trackNftTransaction = async (nftId, userId, type, amount, currency, txSignature) => {


    try {
        const response = await axios.patch(
            `${URI_SERVER}/api/nft/concepts/${nftId}/transaction`,
            {
                nftId,
                userId,
                type,
                amount,
                currency,
                txSignature
            },
            { headers: { "x-api-key": API_KEY } } // If you require authentication
        );

        return response.data; // Return updated NFT data
    } catch (error) {
        console.error("Error tracking NFT transaction:", error.response?.data || error.message);
        throw new Error(`Failed to track NFT transaction: ${error.response?.data?.message || error.message}`);
    }
};

export const submitCharacter = async (name, description, imageUrl, walletAddress, paymentTx) => {

    try {
        const response = await axios.post(
            `${URI_SERVER}/api/character-submission/submit`,
            {
                name,
                description,
                imageUrl,
                walletAddress,
                paymentTx
            },
            { headers: { "x-api-key": API_KEY } } // If you require authentication
        )

        return response.data; // Return updated NFT data
    } catch (error) {
        console.error("Error tracking NFT transaction:", error.response?.data || error.message);
        throw new Error(`Failed to track NFT transaction: ${error.response?.data?.message || error.message}`);
    }
}

export const fetchUserSubmissions = async (walletAddress) => {

    try {
        const response = await axios.get(
            `${URI_SERVER}/api/character-submission/${walletAddress}`,
            { headers: { "x-api-key": API_KEY } } // If you require authentication
        )

        return response.data; // Return updated NFT data
    } catch (error) {
        throw new Error(`Failed to access user Submissions: ${error.response?.data?.message || error.message}`);
    }
}

/**
 * Fetch all whitelist addresses from the backend.
 * @returns {Promise<Object>} { message, count, whitelistAddresses }
 */
export const getWhitelistAddresses = async () => {
    try {
        const response = await axios.get(
            `${URI_SERVER}/api/whitelist/get`,
            { headers: { "x-api-key": API_KEY } }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching whitelist addresses:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Submit a new address to the whitelist.
 * @param {string} address - The wallet address to submit.
 * @returns {Promise<Object>} { message, submission }
 */
export const submitWhitelistAddress = async (address, email, x) => {
    try {

        const response = await axios.post(
            `${URI_SERVER}/api/whitelist/add`,
            { address, email, x },
            { headers: { "x-api-key": API_KEY } });

        return { success: true, message: response.data.message }; // Success response

    } catch (error) {
        console.error("Error submitting whitelist address:", error.response?.data || error.message);

        // Return error instead of throwing
        return { success: false, error: error.response?.data?.error || "An unexpected error occurred" };
    }
};

/**
 *Update All pricing on NFTs by Season
 *@param {string} season - The season you want to update.
 *@param {struct} pricingValues - New pricing values per NFT type
 *@returns {Promise<Object>} {Message: success or failure}
 */
export const updateRarityOnAllNfts = async (season, pricingValues, walletAddress) => {
    try {

        const response = await axios.post(
            `${URI_SERVER}/api/nft/rarities`,
            { season, pricingValues },
            {
                headers: {
                    "x-api-key": API_KEY,
                    "wallet-address": walletAddress
                }
            }
        );

        return { success: true, message: response.data.message }; // Success response

    } catch (error) {
        console.error("Error updating pricing:", error.response?.data || error.message);

        // Return error instead of throwing
        return { success: false, error: error.response?.data?.error || "An unexpected error occurred" };
    }
}

export const getUTCTimezone = async () => {

    try {
        const response = await axios.get(`${URI_SERVER}/api/timezone/utc`);

        return response.data;
    } catch (error) {
        console.error("Error updating pricing:", error.response?.data || error.message);

        // Return error instead of throwing
        return { success: false, error: error.response?.data?.error || "An unexpected error occurred" };
    }
}

/**
 *Patch attributes on database
 *@param {Array} attributesToAdd - The season you want to update.
 *@param {String} walletAddress - Wallet address of admin
 *@returns {Promise<Object>} {Message: success or failure}
 */
export const patchAttributes = async (attributesToAdd, walletAddress) => {
    try {

        const response = await axios.post(
            `${URI_SERVER}/api/xyz/patch`,
            { attributesToAdd },
            {
                headers: {
                    "x-api-key": API_KEY,
                    "wallet-address": walletAddress
                }
            }
        );

        return { success: true, message: response.data.message }; // Success response

    } catch (error) {
        console.error("Error updating pricing:", error.response?.data || error.message);

        // Return error instead of throwing
        return { success: false, error: error.response?.data?.error || "An unexpected error occurred" };
    }
}

/**
 *Update All pricing on NFTs by Season
 *@param {string} attribute - Attribute to remove.
 *@param {struct} walletAddress - Wallet address of admin.
 *@returns {Promise<Object>} {Message: success or failure}
 */
export const deleteAttribute = async (attributeToRemove, walletAddress) => {
    try {

        const response = await axios.post(
            `${URI_SERVER}/api/xyz/deleteAttri`,
            { attributeToRemove },
            {
                headers: {
                    "x-api-key": API_KEY,
                    "wallet-address": walletAddress
                }
            }
        );

        return { success: true, message: response.data.message }; // Success response

    } catch (error) {
        console.error("Error updating pricing:", error.response?.data || error.message);

        // Return error instead of throwing
        return { success: false, error: error.response?.data?.error || "An unexpected error occurred" };
    }
}

/**
 *Update All pricing on NFTs by Season
 *@param {string} from - Attribute to remove.
 *@param {string} to - Attribute to replace with.
 *@param {struct} walletAddress - Wallet address of admin.
 *@returns {Promise<Object>} {Message: success or failure}
 */
export const replaceAttribute = async (from, to, walletAddress) => {
    try {

        const response = await axios.post(
            `${URI_SERVER}/api/xyz/replaceAttri`,
            { from, to },
            {
                headers: {
                    "x-api-key": API_KEY,
                    "wallet-address": walletAddress
                }
            }
        );

        return { success: true, message: response.data.message }; // Success response

    } catch (error) {
        console.error("Error to replace attribute:", error.response?.data || error.message);

        // Return error instead of throwing
        return { success: false, error: error.response?.data?.error || "An unexpected error occurred" };
    }
}

export const rollAllServerItems = async (walletAddress) => {

    try {

        const response = await axios.post(
            `${URI_SERVER}/api/xyz/rollallitems`,
            {}, // empty body, if you're not sending anything
            {
                headers: {
                    "x-api-key": API_KEY,
                    "wallet-address": walletAddress
                }
            }
        );

        return { success: true, message: response.data.message }; // Success response

    } catch (error) {
        console.error("Error to replace attribute:", error.response?.data || error.message);

        // Return error instead of throwing
        return { success: false, error: error.response?.data?.error || "An unexpected error occurred" };
    }
}

export const updateBlueprintMetadata = async (walletAddress) => {

    try {

        const response = await axios.post(
            `${URI_SERVER}/api/xyz/replaceBlueprintMD`,
            {}, // empty body, if you're not sending anything
            {
                headers: {
                    "x-api-key": API_KEY,
                    "wallet-address": walletAddress
                }
            }
        );

        return { success: true, message: response.data.message }; // Success response

    } catch (error) {
        console.error("Error to replace attribute:", error.response?.data || error.message);

        // Return error instead of throwing
        return { success: false, error: error.response?.data?.error || "An unexpected error occurred" };
    }
}

//Build server side transaction from Game $BOOH to Blockchain $BOOH
export const buildGToBTX = async (pubKey, amount) => {

    try {

        const response = await axios.post(
            `${URI_SERVER}/api/tokensync/gtob`,
            {pubKey, amount},
            {
                headers: {
                    "x-api-key": API_KEY,
                }
            }
        );

        if(response.status === 200)
            return response.data; // Success response
        

    } catch (error) {
        console.error("Error to replace attribute:", error.response?.data || error.message);

        // Return error instead of throwing
        return { success: false, error: error.response?.data?.error || "An unexpected error occurred" };
    }
}

//Build server side transaction from Game $BOOH to Blockchain $BOOH
export const sendBuiltTokenSyncTX = async (pubKey, amount, base64UserSignedTx, blockhash, lastValidBlockHeight, playerId) => {

    try {

        const response = await axios.post(
            `${URI_SERVER}/api/tokensync/signedTx`,
            {pubKey, amount, base64UserSignedTx, blockhash, lastValidBlockHeight, playerId},
            {
                headers: {
                    "x-api-key": API_KEY,
                }
            }
        );

        if(response.status === 200)
            return response.data; // Success response
        

    } catch (error) {
        console.error("Failed to Complete TX:", error.response?.data || error.message);

        // Return error instead of throwing
        return { success: false, error: error.response?.data?.error || "An unexpected error occurred" };
    }
}
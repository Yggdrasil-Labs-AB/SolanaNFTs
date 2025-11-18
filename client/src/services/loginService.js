import axios from "axios";
import { URI_SERVER } from "../config/config";

const API_KEY = import.meta.env.VITE_SERVE_KEY;

/**
 * Fetch all NFT concepts from the database.
 * @returns {Promise<object[]>} Resolves with message to sing.
 * @throws {Error} Throws an error if the request fails.
 */
export const getNonce = async (publicKey) => {
    try {
        const response = await axios.post(
            `${URI_SERVER}/api/auth/nonce`,
            { publicKey },
            { headers: { "x-api-key": API_KEY } });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch nonce:", error.response?.data || error.message);
        throw new Error(`Failed to fetch nonce: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Fetch all NFT concepts from the database.
 * @returns {Promise<object[]>} Resolves with verified user.
 * @throws {Error} Throws an error if the request fails.
 */
export const verifyUser = async (publicKey, signatureBase64) => {
    try {
        const response = await axios.post(
            `${URI_SERVER}/api/auth/verify`,
            {
                publicKey,
                signature: signatureBase64,
            },
            { headers: { "x-api-key": API_KEY } }
        );
        return response.data;
    } catch (error) {
        console.error(
            "Failed verify signed message:",
            error.response?.data || error.message
        );
        throw new Error(
            `Failed to verify signed message: ${
                error.response?.data?.message || error.message
            }`
        );
    }
};

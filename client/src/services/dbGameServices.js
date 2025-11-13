import axios from "axios";
import { URI_SERVER } from "../config/config";

const API_KEY = import.meta.env.VITE_SERVE_KEY;

/**
 * Add a new In Game Item to database.
 * @param {object} item - The item to add.
 * @returns {Promise<object>} Resolves with the created NFT concept.
 * @throws {Error} Throws an error if the request fails.
 */
export const addNewGameItem = async (item) => {
    try {
        const response = await axios.post(`${URI_SERVER}/api/boohbrawlers/items`,
            item,
            { headers: { "x-api-key": API_KEY } }
        );
        return response.data;
    } catch (error) {
        console.error("Failed to add In Game Item:", error.response?.data || error.message);
        throw new Error(`Failed to add In Game Item: ${error.response?.data?.message || error.message}`);
    }
};
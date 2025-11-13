import axios from 'axios';

import { URI_SERVER } from "../config/config";

const API_KEY = import.meta.env.VITE_SERVE_KEY

export const fetchBabyBooh = async (address) => {


    try {

        const response = await axios.get(`${URI_SERVER}/api/boohbrawlers/usercoins`,
            {
                params: { address },
                headers: {
                    'x-api-key': API_KEY, // Custom header for the API key
                },
            }
        );

        return response.data;

    } catch (e) {
        console.log(e);
    }
};

/**
 * Fetches roll quality data based on the provided seed and parameters.
 *
 * @param {string} playerId - A random seed used for roll generation (e.g., any integer).
 * @param {number} amount - The quality of the roll.
 * @returns {Promise<Object>} The fetched roll data.
**/
export const deductBabyBooh = async (playerId, amount = 5) => {

    try {
        // Make the POST request with address in the body
        const response = await axios.post(
            `${URI_SERVER}/api/boohbrawlers/deductcoins`,
            { playerId, amount }, // Body of the POST request
            {
                headers: {
                    'x-api-key': API_KEY, // Custom header for the API key
                },
            }
        );

        if (response.status == 200) {
            return true; //Successfully deducted In Game Currency
        } else {
            return false; //Failed to deduct In Game Currency
        }

    } catch (e) {
        console.error("Error in deductBabyBooh:", e.message);
        throw e; // Optionally re-throw for the caller to handle
    }
};

/**
 * Fetches roll quality data based on the provided seed and parameters.
 *
 * @param {number} seedNumber - A random seed used for roll generation (e.g., any integer).
 * @param {number} rollQuality - The quality of the roll.
 * @param {"common" | "uncommon" | "rare" | "epic" | "legendary" | "cursed"} rarity - The rarity level of the item.
 * @returns {Promise<Object>} The fetched roll data.
**/
export const fetchRollQualityData = async (seedNumber, rollQuality, rarity, itemType, subItemType) => {

    console.log(`Seed Number: ${seedNumber}, Roll Quality: ${rollQuality}, "rarity: ${rarity}"`);
    try {
        // Make the POST request with address in the body
        const response = await axios.post(
            `${URI_SERVER}/api/boohbrawlers/rollquality`,
            { seedNumber, rollQuality, rarity, itemType, subItemType }, // Body of the POST request
            {
                headers: {
                    'x-api-key': API_KEY, // Custom header for the API key
                },
            }
        );


        if (response.status == 200)
            return response.data.output; //Found Roll Quality

    } catch (e) {
        console.error("Error in fetching roll quality:", e.message);
        throw e; // Optionally re-throw for the caller to handle
    }
};

/**
 * Fetches roll quality data based on the provided seed and parameters.
 *
 * @param {string} playerId  - A random seed used for roll generation (e.g., any integer).
 * @returns {number} Return of BabyBooh Amount
**/
export const validateGameId = async (playerId) => {

    try {
        // Make the POST request with address in the body
        const response = await axios.post(
            `${URI_SERVER}/api/boohbrawlers//validate-game-id`,
            { playerId }, // Body of the POST request
            {
                headers: {
                    'x-api-key': API_KEY, // Custom header for the API key
                },
            }
        );

        if (response.status == 200)
            return response.data; //Found Roll Quality

    } catch (e) {
        console.error("Error in fetching roll quality:", e.message);
        throw e; // Optionally re-throw for the caller to handle
    }
};

export const GetMinimumVersion = async () => {
    const response = await axios.get(`${URI_SERVER}/api/boohbrawlers/minVersion`)

    console.log(response);
    return response.data;
}
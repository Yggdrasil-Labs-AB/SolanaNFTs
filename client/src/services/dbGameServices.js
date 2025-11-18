// src/services/inGameItemsService.js
import axios from "axios";
import { URI_SERVER } from "../config/config";

const API_KEY = import.meta.env.VITE_SERVE_KEY;

/**
 * Fetch all In-Game Items from the database (admin-only).
 * @param {string} authToken - JWT from admin login.
 * @returns {Promise<object[]>}
 */
export const fetchAllInGameItems = async (authToken) => {
  try {
    const response = await axios.get(
      `${URI_SERVER}/api/boohbrawlers/items`,
      {
        headers: {
          "x-api-key": API_KEY,
          Authorization: `Bearer ${authToken}`, // 👈 admin JWT
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Failed to fetch all NFT concepts:",
      error.response?.data || error.message
    );
    throw new Error(
      `Failed to fetch all NFT concepts: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

/**
 * Add a new In-Game Item (admin-only).
 * @param {object} item
 * @param {string} authToken
 */
export const addNewGameItem = async (item, authToken) => {
  try {
    const response = await axios.post(
      `${URI_SERVER}/api/boohbrawlers/items`,
      item,
      {
        headers: {
          "x-api-key": API_KEY,
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Failed to add In Game Item:",
      error.response?.data || error.message
    );
    throw new Error(
      `Failed to add In Game Item: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

/**
 * Update an existing In-Game Item (admin-only).
 * @param {string} id
 * @param {object} updates
 * @param {string} authToken
 */
export const updateInGameItem = async (id, updates, authToken) => {
  try {
    const response = await axios.patch(
      `${URI_SERVER}/api/boohbrawlers/items/${id}`,
      updates,
      {
        headers: {
          "x-api-key": API_KEY,
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating NFT concept:",
      error.response?.data || error.message
    );
    throw new Error(
      `Error updating NFT concept: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

/**
 * Delete an In-Game Item (admin-only).
 * @param {string} id
 * @param {string} authToken
 */
export const deleteItem = async (id, authToken) => {
  try {
    const response = await axios.delete(
      `${URI_SERVER}/api/boohbrawlers/items/${id}`,
      {
        headers: {
          "x-api-key": API_KEY,
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting NFT concept:",
      error.response?.data || error.message
    );
    throw new Error(
      `Error deleting NFT concept: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

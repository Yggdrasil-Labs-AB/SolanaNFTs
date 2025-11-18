import { IS_MAINNET, COLLECTION_ADDRESS } from "../config/config";

import axios from 'axios';
import { URI_SERVER } from '../config/config';

export const fetchNFTsUtils = async (ownerAddress) => {
  try {
    const wallet = ownerAddress;

    const body = {
      method: "qn_fetchNFTs", // QuickNode's method for fetching NFTs
      params: [wallet, []], // Wallet address and any filters (e.g., collections)
      id: 1, // Unique ID for this request
      jsonrpc: "2.0", // JSON-RPC version
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    };

    const solanaNode = IS_MAINNET ? import.meta.env.VITE_SOLANA_NODE : import.meta.env.VITE_SOLANA_NODE_DEVNET

    const response = await fetch(solanaNode, options);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const collection = data.result.assets.filter((nft) => nft.tokenAddress === COLLECTION_ADDRESS);

    if (data.error) {
      throw new Error(`QuickNode Error: ${data.error.message}`);
    }

  } catch (error) {
    console.error("Failed to fetch NFTs:", error);
    throw error; // Rethrow error if needed
  }
};

// Function to fetch NFTs owned by the wallet
export const getCoreNftsServer = async (walletString) => {
  try {
    if (!walletString) {
      console.error("No wallet public key provided.");
      return;
    }

    // Send request to backend to fetch assets
    const response = await axios.post(`${URI_SERVER}/api/nft/getCoreNfts`, {
      walletPublicKey: walletString, // Send wallet address as a string
    });

    // Extract NFT data from response
    if (response.data.success) {
      console.log("Fetched NFTs:", response.data.data);
      return response.data.data; // Return the NFT data
    } else {
      console.error("Error fetching NFTs:", response.data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching assets:", error.message || error);
    return [];
  }
};

// Function to fetch NFTs owned by the wallet
export const getCoreNftsServerDevnet = async (walletString) => {
  try {
    if (!walletString) {
      console.error("No wallet public key provided.");
      return;
    }

    // Send request to backend to fetch assets
    const response = await axios.post(`${URI_SERVER}/api/nft/getCoreNfts/Devnet`, {
      walletPublicKey: walletString, // Send wallet address as a string
    });

    // Extract NFT data from response
    if (response.data.success) {
      console.log("Fetched NFTs:", response.data.data);
      return response.data.data; // Return the NFT data
    } else {
      console.error("Error fetching NFTs:", response.data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching assets:", error.message || error);
    return [];
  }
};
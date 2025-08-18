import {
    generateSigner,
    sol,
} from '@metaplex-foundation/umi'

import {
    createCollection,
    fetchAsset,
} from '@metaplex-foundation/mpl-core'

import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters' //If connecting a wallet via WalletProvider
import { fetchAssetsByOwner } from '@metaplex-foundation/mpl-core'

import { IS_MAINNET } from '../config/config'
import { URI_SERVER, COLLECTION_ADDRESS } from '../config/config'

import { Connection } from '@solana/web3.js';

import axios from 'axios';

const API_KEY = import.meta.env.VITE_SERVE_KEY;

const solanaNode = IS_MAINNET ? import.meta.env.VITE_SOLANA_NODE : 'https://api.devnet.solana.com'

const connection = new Connection(solanaNode, 'confirmed'); // or 'devnet'

const TEST_WALLET = "5ZyYTa4gR3pzMcgtHYYBfANL5nvc2za7EM5BjhB78ogz" //Update to Wallet that will receive money in production

//CREATE AND CONNECT TO UMI WITH mplTokenMetadata Program
const umi = createUmi(solanaNode)

export const createCoreNft = async (nft, wallet, signature = "") => {

    try {
        const requestBody = { nft, receiverPubKey: wallet.publicKey, signature };

        const apiUrl = `${URI_SERVER}/api/nft/createnft`;

        // Make the POST request to the backend
        const resp = await axios.post(
            apiUrl, 
            requestBody,
            {headers: { "x-api-key": API_KEY }});
        
        return resp;

    } catch (walletError) {
        console.error("Error registering wallet adapter:", walletError);
    }
};

export const createSendSolTx = async (fromPubkeyString, payment = 0) => {

    const amount = payment;

    const fromPubkey = new PublicKey(fromPubkeyString);
    const toPubkey = new PublicKey(TEST_WALLET);

    console.log("Building Send Trasaction to: ", TEST_WALLET)

    console.log(amount);

    try {

        const transaction = new Transaction();
        const sendSolInstruction = SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: Math.round(amount * 1_000_000_000),
        });

        transaction.add(sendSolInstruction);

        console.log("Transaction built");

        return transaction;
    } catch (error) {
        console.error("Error sending SOL:", error);
    }
};

export const createCoreCollection = async (wallet) => {
    try {
        // Register Wallet Adapter to Umi
        umi.use(walletAdapterIdentity(wallet));
        console.log("Wallet updated:", wallet.publicKey);

        const collectionSigner = generateSigner(umi);

        // Create collection
        const transaction = await createCollection(umi, {
            collection: collectionSigner,
            name: 'Booh Brawlers Collection v1.0',
            uri: 'https://nft.boohworld.io',
        }).sendAndConfirm(umi);

        console.log("Collection created successfully:", collectionSigner.publicKey);
        console.log("Transaction #: ", transaction);
        return collectionSigner.publicKey;
    } catch (error) {
        console.error("Error creating collection:", error);
        throw error; // Re-throw if you want the caller function to handle it
    }
};


export const airdropTestSol = async () => {
    console.log("Airdropping 1 SOL to identity");
    await umi.rpc.airdrop("5ZyYTa4gR3pzMcgtHYYBfANL5nvc2za7EM5BjhB78ogz", sol(1));
}

export const logNftData = async (address) => {

    //CORE
    const asset = await fetchAsset(umi, address, {
        skipDerivePlugins: false
    })

    console.log(asset);
}

export const getTokenBalance = async (walletAddress, connection) => {

    const mintAddress = 'bttEP13PVTuvGzpNEVhU4Q7FDjBbQx22zXJG38xxMEE';

    try {
        if (!walletAddress || !mintAddress) {
            throw new Error("Wallet address and mint address are required");
        }

        // Derive the associated token account address
        const associatedTokenAddress = PublicKey.findProgramAddressSync(
            [
                new PublicKey(walletAddress).toBuffer(),
                new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
                new PublicKey(mintAddress).toBuffer(),
            ],
            new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL") // Associated Token Program ID
        );

        // Fetch account info
        const tokenAccountInfo = await connection.getParsedAccountInfo(associatedTokenAddress[0]);

        if (!tokenAccountInfo.value) {
            // console.log("Token account does not exist");
            return 0; // No balance if account doesn't exist
        }

        // Extract balance
        const tokenAccountData = tokenAccountInfo.value.data;
        const balance = tokenAccountData.parsed.info.tokenAmount.uiAmount;

        return balance;
    } catch (error) {
        console.error("Error fetching token balance:", error);
        return null;
    }
};

export const getCoreNftsClient = async (walletAddress) => {

    try {
        // Extract wallet public key from the request
        const ownerType = new PublicKey(walletAddress); // Ensure `walletPublicKey` is sent in the request body
    
        // Fetch assets owned by the specified wallet
        const fetchedAssets = await fetchAssetsByOwner(umi, ownerType, {
          skipDerivePlugins: false,
        });
    
        // console.log('Fetched assets:', assetsByOwner);
    
        // Remove unnecessary fields (rentEpoch, lamports, pluginHeader, immutableMetadata)
        const sanitizedAssets = fetchedAssets.map(({ header, ...asset }) => {
          const { ...sanitizedHeader } = header; // Remove rentEpoch and lamports
          return {
            ...asset,
            header: sanitizedHeader, // Include sanitized header without rentEpoch and lamports
          };
        });

        const collection = sanitizedAssets.filter((nft) => nft.updateAuthority.address === COLLECTION_ADDRESS);

        return collection;
    
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
}

export const checkTransactionStatus = async (signature) => {
    try {
      const { value } = await connection.getSignatureStatuses([signature], {
        searchTransactionHistory: true,
      });
  
      const status = value?.[0];
      const confirmation = status?.confirmationStatus;
  
      if (confirmation === 'confirmed' || confirmation === 'finalized') {
        console.log('✅ Transaction confirmed:', confirmation);
        return true;
      } else if (status) {
        console.log('⏳ Transaction pending:', confirmation || 'pending');
        return false;
      } else {
        console.warn('❌ Transaction not found or dropped from RPC history');
        return false;
      }
    } catch (err) {
      console.error('Error checking transaction status:', err);
      return false;
    }
  };

  /**
 * Vote for an NFT concept.
 * @param {string} walletAddress - The voter's wallet address.
 * @returns {Promise<object>} Resolves with list of nft's [name, seed, roll].
 * @throws {Error} Throws an error if the request fails.
 */
export const getCoreNFTs = async (walletPublicKey) => {
    try {
        const response = await axios.post(
            `${URI_SERVER}/api/nft/getCoreNfts/`,
            {
                walletPublicKey
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
 * Vote for an NFT concept.
 * @param {string} walletAddress - The voter's wallet address.
 * @returns {Promise<object>} Resolves with list of nft's [name, seed, roll].
 * @throws {Error} Throws an error if the request fails.
 */
export const getCoreNFTsDevnet = async (walletPublicKey) => {
    try {
        const response = await axios.post(
            `${URI_SERVER}/api/nft/getCoreNfts/Devnet`,
            {
                walletPublicKey
            },
            { headers: { "x-api-key": API_KEY } }
        );

        return response.data;
    } catch (error) {
        console.error("Error while voting:", error.response?.data || error.message);
        throw new Error(`Failed to vote for NFT: ${error.response?.data?.message || error.message}`);
    }
};
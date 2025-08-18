const NftMetadata = require('../Models/NftMetadata');

const {
  generateSigner,
  publicKey,
  transactionBuilder,
} = require('@metaplex-foundation/umi');

const {
  create,
  fetchCollection,
  fetchAssetsByOwner,
  transferV1,
  addPlugin
} = require('@metaplex-foundation/mpl-core');

const { setComputeUnitLimit, setComputeUnitPrice } = require('@metaplex-foundation/mpl-toolbox')

const { PublicKey } = require('@solana/web3.js');

const { initializeUmi, initializeDevUmi } = require('../config/umiInstance');
const { validateNFT } = require('../utils/validateNFT');
const { getPriorityFee } = require('../utils/transactionHelpers');

const { base58 } = require("@metaplex-foundation/umi/serializers");

const umi = initializeUmi();

const CORE_COLLECTION_ADDRESS = process.env.IS_MAINNET === "true" ? "Esr1cTMpbNRNVHvMrGWMMpCEosH2L1dJU3pXyWmLNZoW" : 'AQWGjfgwj8fuQsQFrfN58JzVxWG6dAosU33e35amUcPo';

exports.testData = async (req, res) => {
  try {
    const metadataList = "hello from server"
    res.status(200).json(metadataList); // Send the data as JSON
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
}

exports.getAllNftConcepts = async (req, res) => {
  try {
    const metadataList = await NftMetadata.find(); // Retrieve all documents from the collection
    res.status(200).json(metadataList); // Send the data as JSON
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
};

exports.getNftConceptById = async (req, res) => {
  try {
    const { id } = req.params; // Extract the id from the request parameters

    // Find the NFT metadata by id
    const metadata = await NftMetadata.findById(id);

    // Check if metadata exists
    if (!metadata) {
      return res.status(404).json({ error: 'Metadata not found' });
    }

    // Return the found metadata
    res.status(200).json(metadata);
  } catch (error) {
    console.error('Error fetching metadata by id:', error);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
};

exports.addNftConcept = async (req, res) => {
  try {
    console.log("Insert new NFT");

    // Ensure `votes` field is properly initialized
    const requestData = {
      ...req.body,
      votes: {
        count: 0, // Default count
        voters: [], // Default empty array for voters
      },
    };

    const metadata = new NftMetadata(requestData);
    const savedMetadata = await metadata.save();

    res.status(201).json(savedMetadata);
  } catch (error) {
    console.error("Error creating NFT metadata:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateNftConcept = async (req, res) => {
  try {
    const { id } = req.params; // Extract id from request parameters
    const updates = req.body; // Extract updates from request body

    console.log(updates);

    // Fetch the current metadata
    const existingNft = await NftMetadata.findById(id);
    if (!existingNft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    // Check for changes
    const updatedFields = {};
    Object.keys(updates).forEach((key) => {
      if (JSON.stringify(existingNft[key]) !== JSON.stringify(updates[key])) {
        updatedFields[key] = updates[key];
      }
    });

    const updatedNft = await NftMetadata.findByIdAndUpdate(
      id,
      { $set: updates }, // Apply updates using $set
      { new: true, runValidators: true } // Return the updated document and run validation
    );

    if (!updatedNft) {
      return res.status(404).json({ message: 'NFT not found' }); // Handle case when the document doesn't exist
    }

    res.status(200).json(updatedNft); // Respond with the updated document
  } catch (error) {
    console.error('Error updating NFT:', error);
    res.status(400).json({ error: error.message }); // Respond with a 400 status and the error message
  }
};

exports.updateRarityOfNfts = async (req, res) => {
  const { season, pricingValues } = req.body;

  if (typeof season !== 'number' || typeof pricingValues !== 'object') {
    return res.status(400).json({ error: 'season (string) and pricingValues (object) are required in the request body.' });
  }

  try {
    const nfts = await NftMetadata.find({ 'storeInfo.season': season });

    let updatedCount = 0;

    for (const nft of nfts) {
      const rarityAttr = nft.attributes.find(attr => attr.trait_type.toLowerCase() === 'rarity');
      if (!rarityAttr) continue;

      const rarityKey = rarityAttr.value.toLowerCase();
      const newPrice = pricingValues[rarityKey];

      if (newPrice !== undefined) {
        const currentPrice = nft.storeInfo.price;

        if (currentPrice !== newPrice) {
          nft.storeInfo.price = newPrice;
          await nft.save();
          updatedCount++;
        }
      }
    }

    res.json({ message: `Updated ${updatedCount} NFTs with new pricing for ${season}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while updating prices.' });
  }
}

exports.saveMetadataUri = async (req, res) => {
  try {
    const { id } = req.params; // Extract the NFT ID from request parameters
    const { metadataUri } = req.body; // Extract metadataUri from request body

    console.log(id);
    console.log(metadataUri);

    // Ensure metadataUri is provided
    if (!metadataUri) {
      return res.status(400).json({ message: 'metadataUri is required' });
    }

    // Update the storeInfo.metadataUri field
    const updatedNft = await NftMetadata.findByIdAndUpdate(
      id,
      { $set: { 'storeInfo.metadataUri': metadataUri } }, // Update only metadataUri
      { new: true, runValidators: true, providers: 'query' } // Return updated document and run validation
    );

    // Handle case where NFT does not exist
    if (!updatedNft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    res.status(200).json(updatedNft); // Respond with the updated document
  } catch (error) {
    console.error('Error updating metadataUri:', error);
    res.status(400).json({ error: error.message }); // Respond with a 400 status and the error message
  }
};

exports.deleteNftConcept = async (req, res) => {
  try {
    const deletedMetadata = await NftMetadata.findByIdAndDelete(req.params.id);
    if (!deletedMetadata) {
      return res.status(404).json({ error: 'Metadata not found' });
    }
    res.status(200).json({ message: 'Metadata deleted successfully' });
  } catch (error) {
    console.error('Error deleting NFT metadata:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.voteForNftConcept = async (req, res) => {
  try {
    const { nftId, voterAddress, voteType } = req.body; // Accept voteType ("upvote" or "downvote")

    // Fetch the NFT by ID
    const nft = await NftMetadata.findById(nftId);
    if (!nft) return res.status(404).json({ error: "NFT not found" });

    // Prevent the creator from voting on their own NFT
    if (nft.creator === voterAddress) {
      return res.status(403).json({ error: "You cannot vote on your own NFT" });
    }

    const hasVoted = nft.votes.voters.includes(voterAddress);

    if (voteType === "upvote") {
      if (!hasVoted) {
        nft.votes.count += 1;
        nft.votes.voters.push(voterAddress);
      } else {
        nft.votes.count = Math.max(0, nft.votes.count - 1);
        nft.votes.voters = nft.votes.voters.filter((voter) => voter !== voterAddress);
      }
    } else if (voteType === "downvote") {
      if (hasVoted) {
        nft.votes.count = Math.max(0, nft.votes.count - 1); // Prevents negative votes
        nft.votes.voters = nft.votes.voters.filter((voter) => voter !== voterAddress);
      }
    }

    await nft.save();

    res.json({ success: true, votes: nft.votes.count });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

exports.createAndSendNFT = async (req, res) => {
  const { nft, receiverPubKey } = req.body;

  const isValidated = await validateNFT(nft);

  if (!isValidated.success) {
    console.error("NFT validation failed");
    return res.status(400).json({ success: false, error: 'Invalid NFT data.' });
  }

  try {
    const collection = await fetchCollection(umi, CORE_COLLECTION_ADDRESS);
    const assetSigner = generateSigner(umi);

    let perComputeUnit;
    try {
      perComputeUnit = await getPriorityFee();
    } catch (error) {
      perComputeUnit = 3500000; // fallback fee
    }

    let builder = transactionBuilder()
      .add(setComputeUnitLimit(umi, { units: 600_000 }))
      .add(setComputeUnitPrice(umi, { microLamports: perComputeUnit }))
      .add(create(umi, {
        asset: assetSigner,
        collection,
        name: nft.name,
        uri: nft.storeInfo.metadataUri,
      }))
      .add(addPlugin(umi, {
        asset: assetSigner.publicKey,
        collection,
        plugin: { type: 'ImmutableMetadata' },
      }))
      .add(transferV1(umi, {
        asset: publicKey(assetSigner.publicKey),
        newOwner: publicKey(receiverPubKey),
        collection: CORE_COLLECTION_ADDRESS
      }));

    // Send the transaction (without confirmation yet)
    const signature = await builder.send(umi);
    const serializedSignature = base58.deserialize(signature)[0];

    // Attempt to confirm the transaction (with timeout)
    try {
      await Promise.race([
        umi.rpc.confirmTransaction(signature, {
          strategy: { type: 'blockhash', ...(await umi.rpc.getLatestBlockhash()) },
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Confirmation timeout')), 30000)) //30000
      ]);

      console.log("Transaction confirmed on server:", serializedSignature);

      // Confirmed successfully on server
      return res.status(200).json({ success: true, serializedSignature, confirmed: true });

    } catch (confirmationError) {
      // Confirmation failed/timed out
      console.warn("Server confirmation failed/timed out:", confirmationError.message);

      // Still send signature to frontend for second confirmation attempt
      return res.status(202).json({
        success: true,
        serializedSignature,
        confirmed: false,
        warning: 'Server confirmation timed out. Frontend must retry confirmation.'
      });
    }

  } catch (sendError) {
    console.error("Error sending transaction:", sendError.message);
    return res.status(500).json({ success: false, error: sendError.message });
  }
};

exports.getCoreNFTs = async (req, res) => {

  const { walletPublicKey } = req.body

  if (!walletPublicKey)
    return res.status(404).json({ error: "Wallet Address not found." });

  try {
    // Extract wallet public key from the request
    const ownerType = new PublicKey(req.body.walletPublicKey); // Ensure `walletPublicKey` is sent in the request body

    // Fetch assets owned by the specified wallet using mainnet umi
    const fetchedAssets = await fetchAssetsByOwner(umi, ownerType, {
      skipDerivePlugins: false,
    });

    // Remove unnecessary fields (rentEpoch, lamports, pluginHeader, immutableMetadata)
    const sanitizedAssets = fetchedAssets.map(({ header, pluginHeader, immutableMetadata, ...asset }) => {
      const { rentEpoch, lamports, ...sanitizedHeader } = header; // Remove rentEpoch and lamports
      return {
        ...asset,
        header: sanitizedHeader, // Include sanitized header without rentEpoch and lamports
      };
    });

    // Simplify assets by fetching metadata from URI
    const simplifiedAssets = await Promise.all(
      sanitizedAssets.map(async asset => {
        try {
          const response = await fetch(asset.uri);
          const metadata = await response.json();

          const attributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];

          const rollQualityAttr = attributes.find(attr => attr.trait_type === 'rollQuality');
          const statsSeedRollAttr = attributes.find(attr => attr.trait_type === 'statsSeedRoll');

          const statsSeedRoll = parseInt(statsSeedRollAttr?.value, 10);
          const rollQuality = parseInt(rollQualityAttr?.value, 10);

          return {
            name: asset.name,
            statsSeedRoll: Number.isNaN(statsSeedRoll) ? null : statsSeedRoll,
            rollQuality: Number.isNaN(rollQuality) ? null : rollQuality,
            mint: asset.publicKey,
          };
        } catch (err) {
          console.error(`Failed to fetch metadata for asset ${asset.publicKey}`, err);
          return {
            name: asset.name,
            statsSeedRoll: null,
            rollQuality: null,
            mint: asset.publicKey,
          };
        }
      })
    );

    // Return the simplified assets
    res.status(200).json({
      success: true,
      message: 'Assets fetched successfully',
      address: ownerType.toString(),
      data: simplifiedAssets,
    });
  } catch (error) {
    console.error('Error fetching assets:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets',
      error: error.message || 'An unexpected error occurred',
    });
  }
};

//GET DEVNET NFTS
exports.getCoreNFTsDevNet = async (req, res) => {
  const devNetUmi = initializeDevUmi();

  const { walletPublicKey } = req.body

  if (!walletPublicKey)
    return res.status(404).json({ error: "Wallet Address not found." });

  try {
    // Extract wallet public key from the request
    const ownerType = new PublicKey(req.body.walletPublicKey); // Ensure `walletPublicKey` is sent in the request body

    // Fetch assets owned by the specified wallet
    const fetchedAssets = await fetchAssetsByOwner(devNetUmi, ownerType, {
      skipDerivePlugins: false,
    });

    // console.log('Fetched assets:', assetsByOwner);

    // Remove unnecessary fields (rentEpoch, lamports, pluginHeader, immutableMetadata)
    const sanitizedAssets = fetchedAssets.map(({ header, pluginHeader, immutableMetadata, ...asset }) => {
      const { rentEpoch, lamports, ...sanitizedHeader } = header; // Remove rentEpoch and lamports
      return {
        ...asset,
        header: sanitizedHeader, // Include sanitized header without rentEpoch and lamports
      };
    });

    const simplifiedAssets = await Promise.all(
      sanitizedAssets.map(async asset => {
        try {
          const response = await fetch(asset.uri);
          const metadata = await response.json();

          const attributes = Array.isArray(metadata.attributes) ? metadata.attributes : [];

          const rollQualityAttr = attributes.find(attr => attr.trait_type === 'rollQuality');
          const statsSeedRollAttr = attributes.find(attr => attr.trait_type === 'statsSeedRoll');

          const statsSeedRoll = parseInt(statsSeedRollAttr?.value, 10);
          const rollQuality = parseInt(rollQualityAttr?.value, 10);

          return {
            name: asset.name,
            statsSeedRoll: Number.isNaN(statsSeedRoll) ? null : statsSeedRoll,
            rollQuality: Number.isNaN(rollQuality) ? null : rollQuality,
            mint: asset.publicKey,
          };
        } catch (err) {
          console.error(`Failed to fetch metadata for asset ${asset.publicKey}`, err);
          return {
            name: asset.name,
            statsSeedRoll: null,
            rollQuality: null,
            mint: asset.publicKey,
          };
        }
      })
    );

    // Return the assets as a response
    res.status(200).json({
      success: true,
      message: 'Assets fetched successfully',
      address: ownerType.toString(), // Return the address as a string
      data: simplifiedAssets,
    });

  } catch (error) {
    console.error('Error fetching assets:', error);

    // Return an error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assets',
      error: error.message || 'An unexpected error occurred',
    });
  }
};

// 🔹 Universal Function to Track NFT Creates & Buys
exports.trackNftTransaction = async (req, res) => {
  try {
    const { nftId, userId, type, amount, currency, txSignature } = req.body;

    if (!nftId || !userId || !type || !amount || !currency || !txSignature) {
      return res.status(400).json({ error: "Missing required fields (nftId, userId, type, amount, currency)" });
    }

    if (!['create', 'buy'].includes(type)) {
      return res.status(400).json({ error: "Invalid transaction type. Must be 'create' or 'buy'." });
    }

    const nft = await NftMetadata.findById(nftId);
    if (!nft) {
      return res.status(404).json({ error: "NFT not found." });
    }

    const updateData = {
      $inc: { "purchases.totalCreates": 1 },
      $push: { "purchases.transactions": { type, user: userId, amount, currency, txSignature } }
    };

    if (type === 'buy') {
      updateData.$inc["purchases.totalBuys"] = 1;
      updateData.$push["purchases.buyers"] = userId; // Allows multiple buys per user
    }

    if (type === 'create') {
      updateData.$addToSet = { "purchases.creators": userId }; // Ensures unique creator
    }

    const updatedNft = await NftMetadata.findByIdAndUpdate(nftId, updateData, { new: true });

    res.status(200).json({ message: `NFT ${type} recorded successfully`, data: updatedNft });

  } catch (error) {
    console.error("Error tracking NFT transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

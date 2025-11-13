const axios = require('axios');
const { fetchRollQualityHelper, validateGameIdUtils, DeductInGameBabyBooh } = require('../utils/gameHelpers');

const InGameItem = require('../Models/InGameItem');

exports.addNewInGameItem = async (req, res) => {
  try {
    console.log("Insert new Item");

    const data = new InGameItem(req.body);
    const savedData = await data.save();

    res.status(201).json(savedData);
  } catch (error) {
    console.error("Error creating NFT metadata:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.getInGameCurrency = async (req, res) => {
    try {
        // Extract the address from query parameters
        const { address } = req.query;
        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        // Build the external API URL
        const buildURL = `${process.env.VERCEL_URL}/user?wallet=${address}`;

        // Make the request to the external API
        const response = await axios.get(buildURL, {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN_BEARER}`,
            },
        });
        // Return the data as a response
        res.status(200).json(response.data.balances[0].balance);
    } catch (error) {
        // Enhanced error logging
        if (error.response) {
            // Error response from the API
            // console.error("API Error Response:", {
            //     status: error.response.status,
            //     headers: error.response.headers,
            //     data: error.response.data,
            // });
        } else if (error.request) {
            // No response received
            console.error("No Response Received:", error.request);
        } else {
            // Other errors (e.g., request setup issues)
            console.error("Request Error:", error.message);
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.deductInGameCurrency = async (req, res) => {

    try {
        // Extract the address from query parameters
        const { playerId, amount } = req.body;

        const conversionAmount = amount;

        if (!playerId)
            return res.status(400).json({ error: "Address is required" });

        if (!conversionAmount)
            return res.status(400).json({ error: "No Amount sent" });

        const playerContent = await validateGameIdUtils(playerId); //Returns BabyBooh

        const newAmount = playerContent[1].value.BabyBoohCoin - conversionAmount;
        const cryptoData = playerContent[1];

        const writeLock = await DeductInGameBabyBooh(playerId, newAmount, cryptoData);

        // Return the data as a response
        res.status(200).json(writeLock);
    } catch (error) {
        // Enhanced error logging
        if (error.response) {
            // Error response from the API
            console.error("API Error Response:", {
                status: error.response.status,
                headers: error.response.headers,
                data: error.response.data,
            });
        } else if (error.request) {
            // No response received
            console.error("No Response Received:", error.request);
        } else {
            // Other errors (e.g., request setup issues)
            console.error("Request Error:", error.message);
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.fetchRollQualityData = async (req, res) => {
    try {
        const { seedNumber, rollQuality, rarity, itemType, subItemType } = req.body;
        const result = await fetchRollQualityHelper(seedNumber, rollQuality, rarity, itemType, subItemType);
        res.status(200).json(result);
    } catch (error) {
        if (error.response) {
            console.error("API Error Response:", error.response.status, error.response.data);
            res.status(error.response.status).json({ error: error.response.data || "External API Error" });
        } else if (error.request) {
            console.error("No response received from API:", error.request);
            res.status(502).json({ error: "No response from external API" });
        } else {
            console.error("Request setup error:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
};

exports.validateGameId = async (req, res) => {
    try {

        const { playerId } = req.body;

        if (!playerId)
            res.status(400).json({ error: "No Player Id Found" });

        const playerContent = await validateGameIdUtils(playerId); //Returns BabyBooh

        res.status(200).json(playerContent[1].value.BabyBoohCoin);

    } catch (error) {
        if (error.response) {
            console.error("API Error Response:", error.response.status, error.response.data);
            res.status(error.response.status).json({ error: error.response.data || "External API Error" });
        } else if (error.request) {
            console.error("No response received from API:", error.request);
            res.status(502).json({ error: "No response from external API" });
        } else {
            console.error("Request setup error:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

exports.getMinimumGameVersion = (req, res) => {

    try {
        const minimumVersion = {
            minIOSVersion: '1.1.396',
            minAndroidVersion: '',
            updateUrl: 'updateURL'
        }

        res.status(200).json(minimumVersion);

    } catch (error) {
        if (error.response) {
            console.error("API Error Response:", error.response.status, error.response.data);
            res.status(error.response.status).json({ error: error.response.data || "External API Error" });
        } else if (error.request) {
            console.error("No response received from API:", error.request);
            res.status(502).json({ error: "No response from external API" });
        } else {
            console.error("Request setup error:", error.message);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

}


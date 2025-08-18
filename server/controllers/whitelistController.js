const WhitelistSubmission = require("../Models/Whitelist.js");

exports.getWhitelistAddresses = async (req, res) => {
  try {
    // Fetch all whitelist addresses from the database
    const whitelistAddresses = await WhitelistSubmission.find({});

    // Return success response
    res.status(200).json({
      message: "Whitelist addresses retrieved successfully",
      count: whitelistAddresses.length,
      whitelistAddresses,
    });
  } catch (error) {
    console.error("Error fetching whitelist addresses:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};


// Handle whitelist submission
exports.submitAddress = async (req, res) => {
  try {
    const { address, email, x } = req.body;

    // Ensure all fields are provided
    // if (!address) {
    //   return res.status(400).json({ error: "Address is required." });
    // }

    // Check if the total number of submissions has reached the limit (30)
    const submissionCount = await WhitelistSubmission.countDocuments();
    // if (submissionCount >= 300) {
    //   return res.status(403).json({ error: "Whitelist is full. No more submissions allowed." });
    // }

    // Check if the address already exists
    const existingSubmission = await WhitelistSubmission.findOne({ email });

    if (existingSubmission) {
      return res.status(409).json({ error: "Address already submitted." }); // HTTP 409: Conflict
    }

    // If address does not exist, create a new submission
    const submission = new WhitelistSubmission({ address, email, x });
    await submission.save();

    res.status(201).json({
      message: "Wallet submitted successfully!",
      submission,
    });
  } catch (error) {
    console.error("Error submitting character:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// Handle whitelist deduction
exports.deductUsage = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Find the whitelist entry by email
    const entry = await WhitelistSubmission.findOne({ email });

    if (!entry) {
      return res.status(404).json({ error: "Whitelist entry not found." });
    }

    if (entry.amounts <= 0) {
      return res.status(403).json({ error: "No remaining whitelist uses." });
    }

    // Deduct usage
    entry.amounts -= 1;
    await entry.save();

    res.status(200).json({
      message: "Whitelist usage deducted successfully.",
      remaining: entry.amounts,
      entry
    });

  } catch (error) {
    console.error("Error deducting whitelist usage:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

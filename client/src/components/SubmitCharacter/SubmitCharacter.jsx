import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUpload } from "react-icons/fa";

import SolConnection from "../Connection/SolConnection";
import { submitCharacter } from "../../services/dbServices";

import { useWalletAdmin } from "../../hooks/useWalletAdmin";

import { submissionCost } from "../../config/nftConfig";

import { convertUsdToSol } from "../../Utils/pricingModifiers";
import { createSendSolTx } from "../../services/blockchainServices";

import { uploadIcon } from "../../services/cloudinaryServices";

import { useConnection } from "@solana/wallet-adapter-react";

import SubmissionStatus from "./SubmissionStatus"; // ✅ Import new UI feedback component

import { delay } from "../../Utils/generalUtils";

const SubmitCharacter = () => {

    const { wallet, userRole } = useWalletAdmin();
    const { connection } = useConnection();

    const [image, setImage] = useState(null);
    const [uploadItem, setUploadItem] = useState(null);
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [submissionStatus, setSubmissionStatus] = useState("idle"); // ✅ "idle" | "uploading" | "processing" | "complete" | "failed"

    const handleImageUpload = (event) => {
        const file = event.target.files[0];

        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setError("File size must be under 2MB.");
            return;
        }

        setError("");
        setImage(URL.createObjectURL(file));
        setUploadItem(file);
    };

    const handleSubmissionPayment = async () => {
        try {
            const paymentInSol = await convertUsdToSol(submissionCost);
            const transaction = await createSendSolTx(wallet.publicKey, paymentInSol);

            if (!transaction) return false;

            const signature = await wallet.sendTransaction(transaction, connection);
            return signature || null;
        } catch (error) {
            throw new Error(`Submission payment failed: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleSubmit = async () => {
        if (!image || !name || !description) {
            setError("Please fill in all fields before submitting.");
            return;
        }

        setSubmissionStatus("uploading"); // ✅ Update status
        try {
            const address = wallet?.publicKey?.toString();
            const paymentTx = await handleSubmissionPayment();
            await delay(2000);
            if (!paymentTx) throw new Error("Payment failed!");

            setSubmissionStatus("processing");

            await delay(2000);
            const cloudinaryData = await uploadIcon(uploadItem);
            const data = await submitCharacter(name, description, cloudinaryData.secure_url, address, paymentTx);

            setSubmissionStatus("complete"); // ✅ Success!

            console.log("Submission successful:", data);
        } catch (error) {
            console.error("Submission error:", error);
            setSubmissionStatus("failed"); // ✅ Show failure
        }
    };

    return (
        <>
            <motion.div
                className="character-submission-box"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div>
                    <h2>Submit Your Character</h2>
                    <p className="character-description">
                        Got a cool character idea? Turn it into a ghost and bring it to life in <strong>Booh Brawlers</strong>! 👻✨
                        Upload an image of your original (or non-patented) character, and we'll transform it into a battle-ready ghost.
                        As a bonus, you'll receive your very own <strong>NFT reward</strong> of the character!
                        Make sure your <Link to='s'>submission follows the guidelines</Link>—let’s get going! 🚀
                    </p>
                    <p className='character-description'>
                        Submission Cost: <strong>${submissionCost}</strong>
                    </p>
                </div>

                <div>
                    <h5>Entry Details</h5>
                    {/* Name Input */}
                    <input
                        type="text"
                        className="character-input"
                        placeholder="Character Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    {/* Description Input */}
                    <textarea
                        className="character-textarea"
                        placeholder="Describe your character..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>

                    {/* Image Upload */}
                    <label className="upload-label">
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                        <div>
                            <FaUpload size={20} />
                            <span>Click to upload</span>
                        </div>
                    </label>

                    {error && <p className="error-message">{error}</p>}

                    {image && (
                        <motion.div
                            className="image-preview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img src={image} alt="Character Preview" />
                        </motion.div>
                    )}

                    {wallet?.publicKey ? (
                        <button
                            className="submit-button"
                            onClick={handleSubmit}
                            disabled={!image || !name || !description || (submissionStatus !== "idle" && submissionStatus !== "failed")} // ✅ Disable when processing
                        >
                            {submissionStatus === "uploading" && "Uploading..."}
                            {submissionStatus === "processing" && "Processing..."}
                            {submissionStatus === "complete" && "Submitted ✅"}
                            {submissionStatus === "failed" && "Retry Submission"}
                            {submissionStatus === "idle" && "Submit Character"}
                        </button>
                    ) : (
                        <div className="mt-4">
                            <SolConnection />
                        </div>
                    )}
                    <SubmissionStatus status={submissionStatus} />
                </div>
            </motion.div>
        </>
    )
}

export default SubmitCharacter;
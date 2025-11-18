import React, { useEffect } from 'react';

import { createCoreNft, createSendSolTx } from '../../services/blockchainServices';

import Navbar from '../Navbar/Navbar';
import PrintNfts from '../PrintNfts/PrintNfts';

import Filter from '../Filter/Filter';
import { useNFTs } from '../../hooks/useNFTs';

import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { convertUsdToSol } from '../../Utils/pricingModifiers';

import TxModalManager from '../txModal/TxModalManager'
import { deductBabyBooh } from '../../services/gameServices';
import { createPaymentIntent } from '../../services/stripeServices';

import Stripe from '../Stripe/Stripe';

import { useParams } from 'react-router-dom';
import { fetchSingleNftMetadata, trackNftTransaction } from '../../services/dbServices';

import { PublicKey } from '@solana/web3.js';

import { useTransactionsController } from '../../providers/TransactionsProvider';

import { inGameCurrencyCost } from '../../config/gameConfig';

import { useGlobalVariables } from '../../providers/GlobalVariablesProvider';
import { useWalletAdmin } from '../../providers/WalletAdminProvider';


const Marketplace = () => {

    const wallet = useWallet();
    const { authToken, loginWithWallet } = useWalletAdmin();
    const { connection } = useConnection();

    const { checkUserDiscount } = useGlobalVariables();

    const {
        nfts,
        selectedIndex,
        setSelectedIndex,
        selectedType,
        setSelectedType,
        selectedSubType,
        setSelectedSubType,
        selectedRarity,
        setSelectedRarity,
        selectedCreator,
        setSelectedCreator,
        nftConceptsLoadingState,
    } = useNFTs({ inStoreOnly: true });

    const {
        isModalOpen, //stores main transaction modal state
        setIsModalOpen, //updates main transaction state
        setTxState, //updates payment transaction state to handle UI render
        setCreateState,
        setTransactionSig,
        preCalcPayment,
        setPreCalcPayment,
        paymentTracker,
        setPaymentTracker,
        setSolPriceLoaded,
        stripeSecret,
        setStripeSecret,
        setStripeModal,
        redirectSecret,
        setRedirectSecret,
        setNameTracker,
        inGameSpend,
        setInGameSpend
    } = useTransactionsController();


    //Handle Stripe re-direction & confirmed payment
    const { id, redirectAddress } = useParams();

    useEffect(() => {
        // Retrieve the "payment_intent_client_secret" query parameter appended to
        // your return_url by Stripe.js
        const clientSecret = new URLSearchParams(window.location.search).get(
            'payment_intent_client_secret'
        );

        if (clientSecret) {
            console.log(clientSecret);
            setRedirectSecret(clientSecret);
        }
    }, []);

    useEffect(() => {
        const setUpModalPricing = async () => {
            if (!isModalOpen) return; // Exit early if modal is not open
            if (selectedIndex === null) return;

            setNameTracker(nfts[selectedIndex].name);

            const mintCosts = 0.004; // Cost to mint an NFT

            try {
                switch (paymentTracker) {
                    case 'SOL':
                        if (nfts[selectedIndex]?.storeInfo?.price) {

                            //Define Payment amount in current SOL
                            const priceInSol = await convertUsdToSol(nfts[selectedIndex].storeInfo.price); //mintCost should be 0 if purchasing

                            //Apply discount if any
                            const discountedPrice = await checkUserDiscount(wallet.publicKey.toString(), priceInSol.toFixed(4), 'sol');

                            //Set Pre Calc Payment
                            setPreCalcPayment(discountedPrice); // Set SOL price in USD per NFT price

                            //Loading the Sol price is complete
                            setSolPriceLoaded(true);
                        } else {
                            console.error("Invalid NFT data or selectedIndex for SOL payment.");
                        }
                        break;

                    case 'BABYBOOH':
                        {
                            console.log('In Baby Booh');
                            // TODO: Implement conversion rate for BABY BOOH
                            setPreCalcPayment(mintCosts);
                            setSolPriceLoaded(true);

                            const rarityAttribute = nfts[selectedIndex].attributes.find(attr => attr.trait_type === "rarity");
                            const nftRarity = rarityAttribute ? rarityAttribute.value : "common"; // default rarity if not found

                            setInGameSpend(inGameCurrencyCost[nftRarity]);

                            console.warn("Conversion rate for BABY BOOH is not implemented yet.");
                            break;
                        }

                    case 'CARD':
                        if (nfts[selectedIndex]?.storeInfo?.price) {
                            const toNumber = Number(nfts[selectedIndex].storeInfo.price);

                            if (!wallet.publicKey) return;

                            // Create a PaymentIntent
                            const data = await createPaymentIntent(toNumber, nfts[selectedIndex]._id, wallet.publicKey.toString());

                            //If client secret exists, continue
                            if (data?.client_secret) {

                                //Set client secret
                                setStripeSecret(data.client_secret);

                                //Determine any discounts
                                const discountedPrice = await checkUserDiscount(wallet.publicKey.toString(), toNumber, 'usd');

                                //Set precalc payment to track
                                setPreCalcPayment(discountedPrice);

                                //Loading the USD price is complete (TODO: UPDATE FUNCTION NAME TO ENCOMPASS SOL AND USD)
                                setSolPriceLoaded(true); // Hard value already stored
                            } else {
                                console.error("Failed to retrieve client_secret from PaymentIntent.");
                            }
                        } else {
                            console.error("Invalid NFT data or selectedIndex for CARD payment.");
                        }
                        break;

                    default:
                        console.warn("Unhandled payment method:", paymentTracker);
                        break;
                }
            } catch (error) {
                console.error("Error setting up modal pricing:", error.message);
            }
        };

        setUpModalPricing();
    }, [isModalOpen, wallet.publicKey]);

    const openModal = async () => {
        setIsModalOpen(true);
    };

    const payWithSol = async () => {

        try {
            const transaction = await createSendSolTx(wallet.publicKey, preCalcPayment); //Built a sent sol Transaction
            const signature = await wallet.sendTransaction(transaction, connection); //Send the transaction

            // Now wait for confirmation
            const latestBlockhash = await connection.getLatestBlockhash();

            await connection.confirmTransaction({
                signature,
                ...latestBlockhash
            }, 'confirmed');

            console.log(`Transaction signature: ${signature}`);
            return signature; //Return sig

        } catch (e) {
            setTxState('failed');
            console.log(e);
            return false;
        }


    }

    const payWithBabyBooh = async () => {

        try {
            const success = await deductBabyBooh(wallet.publicKey.toString(), inGameSpend);
            return success;
        } catch (e) {
            console.log(e);
            setTxState('failed');
            return false;
        }
    }

    const payWithCard = async () => {
        setStripeModal(true);
    }

    const createNft = async () => {

        if (!wallet.publicKey) {
            alert("User must sign in!");
        }

        setTxState('started');

        let effectiveToken = authToken;

        if (!effectiveToken) {
            const resp = await loginWithWallet();
            if (!resp || !resp.success) {
                setTxState("failed");
                alert("Wallet verification failed.");
                return;
            }
            effectiveToken = resp.token; // ✅ fresh token from login
        }

        let paymentTx;
        try {

            if (paymentTracker === 'SOL') {
                paymentTx = await payWithSol(); //Pay with sol

                setTxState('complete');
            }

            if (paymentTracker === 'BABYBOOH') {

                paymentTx = await payWithSol(); //First send Sol Transaction

                if (paymentTx) {
                    paymentTx = await payWithBabyBooh(); //Then pay Booh Amount
                }

                if (paymentTx) {
                    setTxState('complete');
                }
            }

            if (paymentTracker === 'CARD') {
                await payWithCard();
                setIsModalOpen(false);
                return //Different work flow with Card payments
            }

            if (paymentTx) { //If Sig is true, create and send NFT
                try {

                    setCreateState('started');

                    //TODO: HANDLE UI TRACKING OF PAYING WITH AND MINTING NFT
                    const txSig = await handleNFTCreation(nfts[selectedIndex], wallet, paymentTx, effectiveToken);

                    //Track Transaction
                    if (paymentTracker === 'BABYBOOH') {
                        //Add as create
                        await trackNftTransaction(nfts[selectedIndex]._id, wallet.publicKey.toString(), 'create', preCalcPayment, paymentTracker, txSig);
                    } else {
                        //Add as purchase
                        await trackNftTransaction(nfts[selectedIndex]._id, wallet.publicKey.toString(), 'buy', preCalcPayment, paymentTracker, txSig);
                    }

                    setCreateState('complete');

                } catch (e) {
                    alert('Failed to send Sol');
                    console.log('Failure to create NFT: ', e)
                    setCreateState('failed')
                    setTxState('failed');
                }

            } else {
                alert('Payment Failed');
            }
        } catch (e) {
            console.log('Payment Type Failed', e);
        }

        return;
    }

    const handleSuccessfulStripePayment = async () => {
        try {
            // Open modal and initialize states for transaction and creation process
            setIsModalOpen(true); // Open the modal to indicate payment success
            setTxState('complete'); // Mark the transaction as complete
            setCreateState('started'); // Begin the NFT creation process
            setSolPriceLoaded(true); // Indicate that the Solana price has been successfully loaded
            setPaymentTracker('CARD'); // Set the payment method to "Card"

            // Fetch the NFT metadata using the provided ID
            const nftToCreate = await fetchSingleNftMetadata(id);

            // Update state with NFT details
            setPreCalcPayment(nftToCreate.storeInfo.price); // Set the payment amount for the NFT
            setNameTracker(nftToCreate.name); // Set the NFT's name in the tracker

            // Construct a wallet object using the redirect address
            let walletConstruct = {
                publicKey: new PublicKey(redirectAddress),
            };

            // Handle the NFT creation process
            const txSig = await handleNFTCreation(nftToCreate, walletConstruct, 'CARD');

            if (!txSig) {
                setCreateState('failed');
                return;
            }

            //Add as purchase
            await trackNftTransaction(
                nftToCreate._id,
                redirectAddress,
                'buy',
                nftToCreate.storeInfo.price,
                'CARD',
                txSig);

            // Mark the creation process as complete
            setCreateState('complete');
        } catch (error) {
            setCreateState('failed');
            console.error("Error in handleSuccessfulStripePayment:", error);
            // Optionally add error handling here (e.g., show an error message to the user)
        }
    };

    const handleNFTCreation = async (nft, wallet, signature, authToken) => {

        try {
            // Ensure NFT and wallet are provided
            if (!nft || !wallet) {
                console.error("Invalid NFT or wallet data provided.");
                return; // Exit early if required data is missing
            }

            // Call the function to create the NFT on the blockchain
            const resp = await createCoreNft(nft, wallet, signature, authToken);

            const transactionSignature = resp.data.serializedSignature; //Set transaction signature

            // if (resp.data.confirmed !== true) //Check if server side confirmation failed
            //     await checkTransactionStatus(transactionSignature); //Double check blockchain on frontend

            // Log the serialized transaction signature (useful for debugging)
            console.log("Serialized Transaction Signature:", transactionSignature);

            // Update state with the transaction signature
            setTransactionSig(transactionSignature);

            return transactionSignature;
        } catch (error) {
            // Handle and log errors during the NFT creation process
            console.error("Error during NFT creation:", error);
            // Optionally: Add error handling logic (e.g., show a message to the user)
            return false;
        }
    };

    const setEditData = () => { }

    return (
        <div>
            <Navbar />
            <div className='layout-container-marketplace'>
                <div className='print-nfts-styling sidenav-scrollbar'>
                    <Filter
                        title={"MARKETPLACE"}
                        selectedType={selectedType}
                        setSelectedType={setSelectedType}
                        selectedSubType={selectedSubType}
                        setSelectedSubType={setSelectedSubType}
                        selectedRarity={selectedRarity}
                        setSelectedRarity={setSelectedRarity}
                        selectedCreator={selectedCreator}
                        setSelectedCreator={setSelectedCreator}
                    />
                    <PrintNfts
                        nfts={nfts}
                        selectedIndex={selectedIndex}
                        setSelectedIndex={setSelectedIndex}
                        location='marketplace'
                        openModal={openModal}
                        setEditData={setEditData}
                        setPaymentTracker={setPaymentTracker}
                        nftConceptsLoadingState={nftConceptsLoadingState}
                    />
                </div>
            </div>
            {isModalOpen && <TxModalManager
                createNft={createNft}
            />}
            {(stripeSecret || redirectSecret) && (
                <Stripe
                    nft={nfts[selectedIndex]}
                    handleSuccessfulStripePayment={handleSuccessfulStripePayment}
                />
            )}
        </div>
    );
};

export default Marketplace;
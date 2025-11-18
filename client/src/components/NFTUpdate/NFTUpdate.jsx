import { useState } from 'react';

import { checkTransactionStatus, createCoreNft, createSendSolTx } from '../../services/blockchainServices';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import PrintNfts from '../PrintNfts/PrintNfts';

import Filter from '../Filter/Filter';
import { useNFTs } from '../../hooks/useNFTs';

import { defaultMintCost } from '../../config/nftConfig';

import { useTransactionsController } from '../../providers/TransactionsProvider';

import MobileDetailsButton from '../MobileDetailsButton/MobileDetailsButton';
import TxModalManager from '../txModal/TxModalManager';

import { trackNftTransaction } from '../../services/dbServices';
import { useWalletAdmin } from '../../providers/WalletAdminProvider';

import { FaCrown } from "react-icons/fa";

const NFTUpdate = ({ setInfo, setAttributes, setProperties, setStoreInfo, userRole, wallet, createOffchainMetadata, handleDeleteNftConcept }) => {

    const { publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();

    const {authToken, loginWithWallet} = useWalletAdmin();

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
    } = useNFTs({ inStoreOnly: false });

    const {
        isModalOpen, //stores main transaction modal state
        setIsModalOpen, //updates main transaction state
        setTxState, //updates payment transaction state to handle UI render
        setCreateState,
        setTransactionSig,
        setPreCalcPayment,
        setPaymentTracker,
        setSolPriceLoaded,
        setNameTracker,
        setModalType
    } = useTransactionsController();

    // NEW: full royalty configuration
    const [royaltyConfig, setRoyaltyConfig] = useState({
        sellerFeeBps: 500,   // 500 = 5%
        partnerShare: 50,    // % of the royalty going to partner (minter/investor)
        partnerWallet: "",   // optional override; if empty, we use minter's wallet
    });

    const [showRoyaltyConfig, setShowRoyaltyConfig] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
        setModalType('mint');
        setNameTracker(nfts[selectedIndex].name);
        setPreCalcPayment(defaultMintCost);
        setSolPriceLoaded(true);
        setPaymentTracker('SOL');
    };

    const resetConfirmModal = () => {
        console.log("Reset");
        setIsModalOpen(false);
        setTxState('empty');
        setCreateState('empty');
        setTransactionSig(null);
    };

    const setEditData = async (nft) => {
        console.log(nft);

        const infoToUpdate = {
            name: nft.name,
            description: nft.description,
            external_url: nft.external_url,
            image: nft.image,
            animation_url: nft.animation_url,
            symbol: nft.symbol,
            _id: nft._id,
            _v: nft._v
        }
        setInfo(infoToUpdate);
        setProperties(nft.properties);
        setAttributes(nft.attributes);
        setStoreInfo(nft.storeInfo);
        setNameTracker(nft.name);
    }


    const isAdmin = userRole === "admin";

    const createNft = async () => {

        if (!publicKey) {
            alert("User must sign in!");
        }

        setTxState('started');

        try {

            if(!authToken){
                const resp = await loginWithWallet();
                if(!resp) return;
            }

            const transaction = await createSendSolTx(publicKey, defaultMintCost);
            const signature = await sendTransaction(transaction, connection);

            // Now wait for confirmation
            const latestBlockhash = await connection.getLatestBlockhash();

            await connection.confirmTransaction({
                signature,
                ...latestBlockhash
            }, 'confirmed');

            console.log(`Transaction signature: ${signature}`);

            setTxState('complete');

            if (signature) {
                try {

                    setCreateState('started') //Tell UI to track start changes

                    // NEW: attach royaltyBps to the NFT payload we send to backend
                    const nftWithRoyalty = {
                        ...nfts[selectedIndex],
                        royaltyConfig, // this is the admin-selected seller fee in bps
                    };

                    const resp = await createCoreNft(nftWithRoyalty, wallet, signature, authToken); //Create Core NFT

                    if (resp?.data?.confirmed !== true) //Check if server side confirmation failed
                        await checkTransactionStatus(resp.data.serializedSignature); //Double check blockchain on frontend

                    setTransactionSig(resp.data.serializedSignature); //Set transaction signature

                    const adminCreator = wallet.publicKey.toString() + ' [ADMIN CREATE]' //Created by Admin (this is the Admin page creator)

                    await trackNftTransaction(nfts[selectedIndex]._id, adminCreator, 'create', 0.004, 'SOL', resp.data.serializedSignature); //Store results

                    setCreateState('complete'); //Tell UI of create state completion

                } catch (e) {
                    console.log('Failure to create NFT: ', e)
                    setCreateState('failed') //Reset UI to Failure
                }

            }
        } catch (e) {
            console.log('Failure to transfer Sol', e);
            setTxState('failed');
        }

        return;
    }

    return (
        <div className="print-nfts-styling sidenav-scrollbar" style={{ height: 'calc(100vh - 60px)' }}>
            {/* <button onClick={() => openModal()}>Open</button> */}
            <Filter
                title={"CREATOR HUB"}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedSubType={selectedSubType}
                setSelectedSubType={setSelectedSubType}
                selectedRarity={selectedRarity}
                setSelectedRarity={setSelectedRarity}
                selectedCreator={selectedCreator}
                setSelectedCreator={setSelectedCreator}
                filterByCreator={true}
            />

            {/* ADMIN-ONLY: Royalties config for this mint */}
            {(!showRoyaltyConfig && isAdmin) ? (
                <div style={{ margin: 12 }}>
                    <button style={{width: 25, height: 25, fontSize: 8, padding: 0}} onClick={() => setShowRoyaltyConfig(true)}><FaCrown/></button>
                </div>
            ) : (
                <>
                    {isAdmin && (
                        <div className="tracker-container" style={{ margin: 12, width: 375 }}>
                            <div className="tracker-row">
                                <span className="tracker-label">Seller fee (bps)</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={10000}
                                    value={royaltyConfig.sellerFeeBps}
                                    onChange={(e) =>
                                        setRoyaltyConfig((prev) => ({
                                            ...prev,
                                            sellerFeeBps: Number(e.target.value) || 0,
                                        }))
                                    }
                                    style={{
                                        marginLeft: "8px",
                                        maxWidth: "120px",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        border: "1px solid #555",
                                        backgroundColor: "#2E2E2E",
                                        color: "#FFF",
                                    }}
                                />
                                <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
                                    ({royaltyConfig.sellerFeeBps} = {royaltyConfig.sellerFeeBps / 100}%)
                                </span>
                            </div>

                            <div className="tracker-row" style={{ marginTop: 8 }}>
                                <span className="tracker-label">Partner share (%)</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={royaltyConfig.partnerShare}
                                    onChange={(e) =>
                                        setRoyaltyConfig((prev) => ({
                                            ...prev,
                                            partnerShare: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                                        }))
                                    }
                                    style={{
                                        marginLeft: "8px",
                                        maxWidth: "80px",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        border: "1px solid #555",
                                        backgroundColor: "#2E2E2E",
                                        color: "#FFF",
                                    }}
                                />
                                <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
                                    Platform share: {100 - (royaltyConfig.partnerShare || 0)}%
                                </span>
                            </div>

                            <div className="tracker-row" style={{ marginTop: 8, flexDirection: "column", alignItems: "flex-start" }}>
                                <span className="tracker-label">Partner wallet (optional)</span>
                                <input
                                    type="text"
                                    placeholder="Leave blank to use minter wallet"
                                    value={royaltyConfig.partnerWallet}
                                    onChange={(e) =>
                                        setRoyaltyConfig((prev) => ({
                                            ...prev,
                                            partnerWallet: e.target.value,
                                        }))
                                    }
                                    style={{
                                        marginTop: 4,
                                        width: "100%",
                                        padding: "6px 8px",
                                        borderRadius: "4px",
                                        border: "1px solid #555",
                                        backgroundColor: "#2E2E2E",
                                        color: "#FFF",
                                    }}
                                />
                            </div>
                            <div>
                                <button onClick={() => setShowRoyaltyConfig(false)}>Close</button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <PrintNfts
                nfts={nfts}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                location='creator-hub'
                openModal={openModal}
                isAdmin={isAdmin}
                setEditData={setEditData}
                createOffchainMetadata={createOffchainMetadata}
                nftConceptsLoadingState={nftConceptsLoadingState}
            />
            {isModalOpen && <TxModalManager
                resetConfirmModal={resetConfirmModal}
                createNft={createNft}
                createOffchainMetadata={createOffchainMetadata}
                handleDeleteNftConcept={handleDeleteNftConcept}
                royaltyConfig={royaltyConfig}
            />}
            <MobileDetailsButton />
        </div>
    );
};


export default NFTUpdate;
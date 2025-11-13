import { useState, useEffect } from "react";
import "../../css/admin.css"; // Import CSS file for styling

import EmailList from '../../Utils/tempData';
import Navbar from "../Navbar/Navbar";
import TxModalManager from '../txModal/TxModalManager';
import AdminTransactionsPanel from "../AdminTransactions/AdminTransactionsPanel";

import { useTransactionsController } from "../../providers/TransactionsProvider";
import { useWalletAdmin } from "../../hooks/useWalletAdmin";
import { deleteAttribute, patchAttributes, replaceAttribute, rollAllServerItems, submitWhitelistAddress, updateBlueprintMetadata, updateRarityOnAllNfts } from "../../services/dbServices";

import { pricingValues } from "../../config/nftConfig";

import { getAttributesData } from "../../config/nftConfig";

const Admin = () => {
    const { userRole, wallet } = useWalletAdmin();
    const { isModalOpen } = useTransactionsController();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 500);
    const [renderState, setRenderState] = useState('home'); //home, adminConfig, transacitons

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 500);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 🚀 Return early if mobile
    if (isMobile) {
        return (
            <>
                <Navbar />
                <div className="d-flex justify-content-center align-items-center" style={{ width: "100vw", height: "100vh", color: "white" }}>
                    Please access the Admin panel on a desktop.
                </div>
            </>
        );
    }

    // 🚀 Return early if user is not an admin
    if (!userRole) {
        return (
            <>
                <Navbar />
                <div className="d-flex justify-content-center align-items-center" style={{ width: "100vw", height: "100vh", color: "white" }}>
                    Admin Access Required
                </div>
            </>
        );
    }

    const addToWarpacksList = async () => {
        try {
            for (const email of EmailList) {
                console.log(email);
                const resp = await submitWhitelistAddress(email, email, email);
                console.log(resp);
            }
        } catch (e) {
            console.log(e);
        }
    };

    const updateNftPricing = async () => {
        const resp = await updateRarityOnAllNfts(1, pricingValues, wallet.publicKey.toString());
        console.log(resp);
    }

    const callDelete = async () => {
        const resp = await deleteAttribute('dodge', wallet.publicKey.toString());
        console.log(resp);
    }

    const callReplace = async () => {
        const resp = await replaceAttribute('dodge', 'evasion', wallet.publicKey.toString());
        console.log(resp);
    }

    const rollCurrentItems = async () => {
        const resp = await rollAllServerItems(wallet.publicKey.toString());
        console.log(resp.data);
    }

    const replaceServerMetadata = async () => {
        const resp = await updateBlueprintMetadata(wallet.publicKey.toString());
        console.log(resp.data);
    }

    // 🚀 Main Admin UI
    return (
        <div>
            <Navbar />

            {renderState === 'home' && (
                <div style={{ marginTop: '80px' }} className="d-flex flex-column align-items-center gap-4">
                    <button
                        onClick={() => setRenderState('adminConfig')}
                        style={{ width: '200px', height: '80px', fontSize: '20px' }}
                    >
                        Admin Config
                    </button>
                    <button
                        onClick={() => setRenderState('transactions')}
                        style={{ width: '200px', height: '80px', fontSize: '20px' }}
                    >
                        NFT Transactions
                    </button>
                    <button
                        onClick={() => setRenderState('whitelist')}
                        style={{ width: '200px', height: '80px', fontSize: '20px' }}
                    >
                        Whitelist
                    </button>
                </div>
            )}

            {renderState === 'adminConfig' && (
                <div className="admin-panel-container">
                    {/* <AdminConfigPanel /> */}
                    <button className="mt-3" onClick={() => setRenderState('home')}>← Back</button>
                </div>
            )}

            {renderState === 'transactions' && (
                <div className="admin-panel-container">
                    <AdminTransactionsPanel setRenderState={setRenderState} />
                    <button className="mt-3" onClick={() => setRenderState('home')}>← Back</button>
                </div>
            )}

            {renderState === 'whitelist' && (
                <div className="admin-panel-container">
                    <button onClick={addToWarpacksList}>Add To Warpacks</button>
                </div>
            )}

            {/* Optional action button */}
            {renderState !== 'home' && (
                <div className="text-center mt-4">
                    <div className="mt-4">
                        {Object.entries(pricingValues).map(([rarity, price]) => (
                            <div key={rarity} style={{ marginBottom: '8px', fontSize: '16px', color: 'white' }}>
                                <strong>{rarity.charAt(0).toUpperCase() + rarity.slice(1)}:</strong> ${price.toFixed(2)}
                            </div>
                        ))}
                    </div>
                    <div className="d-flex flex-column gap-2 align-items-center justify-content-center" style={{width: '300px'}}>
                        {/* <button onClick={updateNftPricing}>Update NFT Pricing</button>
                        <button onClick={() => patchAttributes([...combinedTraits, 'level'], wallet.publicKey.toString())}>Patch Attributes</button>
                        <button onClick={rollCurrentItems}>Roll Current Items</button>
                        <button onClick={() => replaceServerMetadata()}>Replace Metadata</button>
                        <button onClick={callDelete}>Delete Attribute</button>
                        <button onClick={callReplace}>Replace</button> */}
                    </div>
                </div>
            )}

            {isModalOpen && <TxModalManager />}
        </div>
    );
};

export default Admin;

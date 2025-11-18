import React  from "react";

import TxModalHeader from "../components/TxModalHeader";

import { useWallet } from "@solana/wallet-adapter-react";

import { useGlobalVariables } from '../../../providers/GlobalVariablesProvider';

import { useTransactionsController } from "../../../providers/TransactionsProvider";

const TxModalDisconnect = () => {

    const wallet = useWallet();
    const { disconnect } = useWallet(); // Wallet hook

    const {inGameCurrency, boohToken, userNfts} = useGlobalVariables();

    const {setIsModalOpen, setModalType} = useTransactionsController();

    const disconnectWallet = () => {
        disconnect();
        setIsModalOpen(false);
        setModalType('');
    }

    return (
        <>
            {/* Close button */}
            <TxModalHeader title={'Wallet Info'} disableSimpleClose={true}/>

            {/* Modal Body */}
            <div className="modal-body">
                <div className="tracker-container">
                    <div className="tracker-row"><span className="tracker-label">Baby Booh</span><span className="tracker-value">{inGameCurrency}</span></div>
                    <div className="tracker-row"><span className="tracker-label">Booh Token</span><span className="tracker-value">{boohToken}</span></div>
                    <div className="tracker-row"><span className="tracker-label">Booh Brawler NFTs: </span><span className="tracker-value">{userNfts.length}</span></div>
                </div>
                {/* Status Indicators */}
            </div>

            {/* Confirm Button */}
            <div className="d-flex justify-content-center">
                <button className="login-nav-button" onClick={disconnectWallet}>DISCONNECT</button>
            </div>
        </>
    );
};

export default TxModalDisconnect;
import "../../css/booh-bridge.css";

import { toByteArray } from 'base64-js';

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useWalletAdmin } from "../../providers/WalletAdminProvider";
import TxModalManager from "../txModal/TxModalManager";

import { useTransactionsController } from "../../providers/TransactionsProvider";
import { deductBabyBooh, validateGameId } from "../../services/gameServices";

import { useGlobalVariables } from '../../providers/GlobalVariablesProvider';

import { useWallet, useConnection } from "@solana/wallet-adapter-react";

import { VersionedTransaction } from '@solana/web3.js';
import { buildGToBTX, sendBuiltTokenSyncTX } from "../../services/dbServices";

import { getTokenBalance } from '../../services/blockchainServices';

const TokenSyncComp = () => {

    const { wallet } = useWalletAdmin();
    const { signTransaction } = useWallet();
    const { connection } = useConnection();

    const { connectOrDisconnect, isModalOpen, setIsModalOpen, setModalType, setTxState, setTxSigningState, setTxError } = useTransactionsController();
    const { id } = useParams();

    const { setInGameCurrency, setBoohToken, inGameCurrency } = useGlobalVariables();

    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [gameIdValidated, setGameIdValidated] = useState(false);
    const [tokenAmountWarning, setTokenAmountWarning] = useState(false);

    const [transferType, setTransferType] = useState("");
    const btnRef = useRef(null);
    const menuRef = useRef(null);

    const fromLabel = transferType === "ingame"
        ? "In-Game $BOOH"
        : transferType === "blockchain"
            ? "Blockchain $BOOH"
            : "Select Transfer Type";

    const toLabel = transferType === "ingame"
        ? "Blockchain $BOOH"
        : transferType === "blockchain"
            ? "In-Game $BOOH"
            : "Select Above";

    // close on outside click / Esc
    useEffect(() => {
        function onClick(e) { if (open && menuRef.current && !menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) setOpen(false); }
        function onKey(e) { if (e.key === "Escape") setOpen(false); }
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
    }, [open]);

    useEffect(() => {
        if (!id) return;
        (async () => {
            const babyBoohAmount = await validateGameId(id);

            if (babyBoohAmount !== null) {
                setInGameCurrency(babyBoohAmount)
                setGameIdValidated(true);
            }

        })();
    }, []);

    const gameSyncedEmoji = gameIdValidated ? "✅" : "❌";
    const walletSyncedEmoji = wallet.publicKey ? "✅" : "❌";

    const buttonText = useMemo(() => {
        const connected = !!wallet?.publicKey;
        const hasAmount = Number(amount) > 0;

        if (!connected) return "Connect Source Wallet";
        if (!gameIdValidated) return "Must Link Game Id From Game";
        if (fromLabel === "Select Transfer Type") return "Select Transfer Type";
        if (!hasAmount) return "Set Conversion Amount";
        return "Convert";
    }, [wallet?.publicKey, gameIdValidated, amount, fromLabel]);

    const handleAmountChange = (e) => {
        setAmount(e.target.value);

        if(e.target.value > inGameCurrency){
            //Show Error
            setTokenAmountWarning(true);
        } else {
            //Remove Error
            setTokenAmountWarning(false);
        }
    };

    const handleButtonClick = () => {

        if(wallet.publicKey === null)
            connectOrDisconnect();

        if(wallet.publicKey !== null && amount <= inGameCurrency && fromLabel !== "Select Transfer Type" && amount > 0)
            transferTokens();
    }

    const transferTokens = async () => {

        setModalType('tokenSync');
        setIsModalOpen(true);

        setTxSigningState('started');

        await sendBoohTx();
    }

    const sendBoohTx = async () => {

        if (!wallet.publicKey) {
            console.error("Wallet not connected");
            return;
        }

        setTxSigningState('started');

        const data = await buildGToBTX(wallet.publicKey, amount);

        if (data?.success === false) {
            setTxError(data.error);
            setTxSigningState('failed');
            return;
        }

        // 2. Decode base64 transaction from server
        const txBytes = toByteArray(data.base64Tx);
        const transaction = VersionedTransaction.deserialize(txBytes);

        let signedByUser;

        try{
            signedByUser = await signTransaction(transaction, connection);
        }catch(e){
            console.log(e);
            setTxError("User Cancelled Transaction");
            setTxSigningState('failed');
            return;
        }

        setTxSigningState("complete");
        setTxState("started");

        const resp = await sendBuiltTokenSyncTX(
            wallet.publicKey.toString(),
            amount,
            btoa(String.fromCharCode(...signedByUser.serialize())),
            data.blockhash,
            data.lastValidBlockHeight,
            id
        );

        if (resp.success) {
            setInGameCurrency(resp.newAmount);

            const fetchedBoohToken = await getTokenBalance(wallet.publicKey.toString(), connection);

            if (fetchedBoohToken >= 0) {
                setBoohToken(fetchedBoohToken);
            }

            setTxState("complete");
        } else {
            setTxState('failed');
            setTxError(resp.error);
        }

        console.log(resp.success == true);
    }

    return (
        <main className="bridge-page">
            <div className="bridge-card" role="form" aria-labelledby="bridge-title">
                <div className="refresh" aria-label="refresh rates">
                    <p>{gameSyncedEmoji} Game Synced</p>
                    <p>{walletSyncedEmoji} Wallet Synced</p>
                </div>

                <section className="field-group" style={{ position: "relative" }}>
                    <label className="field-label" htmlFor="from-token">From</label>

                    <button
                        id="from-token"
                        ref={btnRef}
                        className="select-row"
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        onClick={() => setOpen(v => !v)}
                    >
                        <span className="token-pill" aria-hidden="true" />
                        <span className="select-text">
                            <strong>{fromLabel}</strong>
                        </span>
                        <svg className="chev" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
                            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>

                    {open && (
                        <ul
                            ref={menuRef}
                            className="menu-bridge"
                            role="listbox"
                            aria-label="Select transfer type"
                        >
                            <li role="option" aria-selected={transferType === "ingame"}>
                                <button
                                    className="menu-item-bridge"
                                    onClick={() => { setTransferType?.("ingame"); setOpen(false); }}
                                    type="button"
                                >
                                    In-Game $BOOH
                                </button>
                            </li>
                            {/* <li role="option" aria-selected={transferType === "blockchain"}>
                                <button
                                    className="menu-item-bridge"
                                    onClick={() => { setTransferType?.("blockchain"); setOpen(false); }}
                                    type="button"
                                >
                                    Blockchain $BOOH
                                </button>
                            </li> */}
                        </ul>
                    )}
                </section>

                <div className="swap-dots" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                            d="M6 9l6 6 6-6"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <section className="field-group">
                    <label className="field-label" htmlFor="to-token">To</label>
                    <button id="to-token" className="select-row" type="button" disabled={true}>
                        <span className="token-pill" aria-hidden="true" />
                        <span className="select-text">
                            <strong>{toLabel}</strong>
                        </span>
                    </button>
                </section>

                <section className="field-group">
                    <label className="field-label" htmlFor="amount">Amount</label>
                    <div className="amount-row">
                        <input
                            id="amount"
                            className="amount-input"
                            type="number"
                            min="0"
                            placeholder="0"
                            inputMode="decimal"
                            value={amount}
                            onChange={handleAmountChange}
                        />
                        <button
                            className="max-btn"
                            type="button"
                            onClick={handleButtonClick}
                        >
                            Max
                        </button>
                    </div>
                </section>
                {tokenAmountWarning && <p style={{color: 'red', textAlign: 'center'}}>Insufficient Balance</p>}
                <button className="cta" type="button" onClick={handleButtonClick} disabled={tokenAmountWarning}>
                    {buttonText}
                </button>

                <p className="powered">Powered by <b>BOOH BRAWLERS</b></p>
            </div>

            <footer className="bridge-footer">
                <a href="#" aria-label="Resume Transaction">Privacy Policy</a>
                <a href="#" aria-label="Resume Transaction">Restrictions</a>
                <a href="#" aria-label="Terms of Service">Terms of Service</a>
            </footer>

            {isModalOpen && <TxModalManager />}
        </main>
    )
}

export default TokenSyncComp;
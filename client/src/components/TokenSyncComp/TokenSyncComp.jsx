import "../../css/booh-bridge.css";

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useWalletAdmin } from "../../hooks/useWalletAdmin";
import TxModalManager from "../txModal/TxModalManager";

import { useTransactionsController } from "../../providers/TransactionsProvider";
import { deductBabyBooh, validateGameId } from "../../services/gameServices";

import { useGlobalVariables } from '../../providers/GlobalVariablesProvider';

const TokenSyncComp = () => {

    const { connectOrDisconnect, isModalOpen } = useTransactionsController();
    const { id } = useParams();

    const { setInGameCurrency } = useGlobalVariables();

    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [gameIdValidated, setGameIdValidated] = useState(false);

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

    const { wallet } = useWalletAdmin();

    const gameSyncedEmoji = gameIdValidated ? "✅" : "❌";
    const walletSyncedEmoji = wallet.publicKey ? "✅" : "❌";

    const buttonText = useMemo(() => {
        const connected = !!wallet?.publicKey;
        const hasAmount = Number(amount) > 0;

        if (!connected) return "Connect Source Wallet";
        if (!gameIdValidated) return "Must Link Game Id From Game";
        if (!hasAmount) return "Set Conversion Amount";
        return "Convert";
    }, [wallet?.publicKey, gameIdValidated, amount]);

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    const handleButtonClick = () => {
        if (wallet.publicKey !== null && amount > 0) {
            transferTokens();
        } else if (wallet.publicKey !== null && amount <= 0) {
            //Do nothing
        } else {
            console.log("connect");
            connectOrDisconnect();
        }
    }

    const transferTokens = async () => {
        const success = await deductBabyBooh(id, amount);

        console.log(success);
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
                            <li role="option" aria-selected={transferType === "blockchain"}>
                                <button
                                    className="menu-item-bridge"
                                    onClick={() => { setTransferType?.("blockchain"); setOpen(false); }}
                                    type="button"
                                >
                                    Blockchain $BOOH
                                </button>
                            </li>
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

                <button className="cta" type="button" onClick={handleButtonClick}>
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
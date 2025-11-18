import { useMemo } from "react";
import { Link } from 'react-router-dom';

import SolConnection from '../../Connection/SolConnection';
import TxModalHeader from "../components/TxModalHeader";

import { renderTxStateIcon, renderCreateStateIcon, renderCostSign } from "../renderStatus";
import { IS_MAINNET } from "../../../config/config";

import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionsController } from '../../../providers/TransactionsProvider';
import { calculateRoyalties, shortenAddress } from "../../../Utils/generalUtils";
import { useWalletAdmin } from "../../../providers/WalletAdminProvider";
import { DEFAULT_ROYALTY_CONFIG } from "../../../config/nftConfig";

const TxModalMint = ({ createNft, royaltyConfig }) => {
    const {
        txState,
        createState,
        preCalcPayment,
        paymentTracker,
        solPriceLoaded,
        transactionSig,
        redirectSecret,
        nameTracker,
        inGameSpend,
    } = useTransactionsController();

    const wallet = useWallet();
    const { userRole } = useWalletAdmin();

    const isAdmin = userRole === "admin" ? true : false;

    // Solscan URL for transaction tracking
    const solScanner = useMemo(() => {
        return IS_MAINNET
            ? `https://solscan.io/tx/${transactionSig}`
            : `https://solscan.io/tx/${transactionSig}?cluster=devnet`;
    }, [transactionSig]);

    // Merge with defaults – always have something sane
    const effectiveRoyaltyConfig = isAdmin
        ? { ...DEFAULT_ROYALTY_CONFIG, ...(royaltyConfig || {}) }
        : DEFAULT_ROYALTY_CONFIG; // 👈 non-admins can’t change anything

    const partner = effectiveRoyaltyConfig.partnerWallet
        ? shortenAddress(effectiveRoyaltyConfig.partnerWallet)
        : "self";

    const {
        totalRoyaltyPct,
        partnerOfSale,
        platformOfSale
    } = calculateRoyalties(
        effectiveRoyaltyConfig.sellerFeeBps,
        effectiveRoyaltyConfig.partnerShare
    );

    const who = isAdmin ? "Partner" : "Your";

    return (
        <>
            <TxModalHeader />
            {/* Modal Body */}
            <div className="modal-body">
                <div className="tracker-container">
                    <div className="tracker-row">
                        <span className="tracker-label">NFT Name:</span>
                        <span className="tracker-value">{nameTracker}</span>
                    </div>

                    <div className="tracker-row">
                        <span className="tracker-label">Payment type:</span>
                        <span className="tracker-value">{paymentTracker}</span>
                    </div>

                    {isAdmin && (
                        <div className="tracker-row">
                            <span className="tracker-label">Partner:</span>
                            <span className="tracker-value">{partner}</span>
                        </div>
                    )}

                    <div className="tracker-row">
                        <span className="tracker-label">Royalties:</span>
                        <span className="tracker-value">
                            {totalRoyaltyPct}%  {/* e.g. 5.00% */}
                        </span>
                    </div>

                    <div className="tracker-row">
                        <span className="tracker-label">{who} Share:</span>
                        <span className="tracker-value">
                            {partnerOfSale}%  {/* e.g. 2.5% */}
                        </span>
                    </div>

                    <div className="tracker-row">
                        <span className="tracker-label">Platform Share:</span>
                        <span className="tracker-value">
                            {platformOfSale}% {/* e.g. 2.5% */}
                        </span>
                    </div>
                    <div className="tracker-row">
                        <span className="tracker-label">Mint cost:</span>
                        {solPriceLoaded ? (<span className="tracker-value">-{preCalcPayment} {renderCostSign(paymentTracker)}</span>) : (<div className='loader'></div>)}
                    </div>
                    {(inGameSpend >= 0 && paymentTracker === 'BABYBOOH') &&
                        <div className="tracker-row">
                            <span className="tracker-label">In Game Currency:</span>
                            <span className="tracker-value">-{inGameSpend.toLocaleString()}</span>
                        </div>}
                </div>

                {/* Status Indicators */}
                <div className="loading-details">
                    <div className="d-flex gap-2 align-items-center">
                        {renderTxStateIcon(txState)}
                        <h5 className="modal-title">Process Mint Cost</h5>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                        {renderCreateStateIcon(createState)}
                        <h5 className="modal-title">Mint & Transfer NFT</h5>
                    </div>
                </div>
            </div>

            {/* Confirm Button */}
            <div className="d-flex justify-content-center">
                {wallet.publicKey ? (
                    <>
                        {!transactionSig ? (
                            <div className="d-flex flex-column">
                                {redirectSecret && <div className='center-text'>[DO NOT LEAVE PAGE! SENDING NFT!]</div>}
                                {redirectSecret ?
                                    (<div className="text-center">
                                        Generating...</div>) :
                                    (
                                        <>
                                            {createState !== 'started' ? (<button className="button-style-regular" onClick={() => createNft()}>Confirm</button>)
                                                : (
                                                    <div className="d-flex flex-column align-items-center">
                                                        <div style={{ borderBottom: '1px solid white' }}>
                                                            DO NOT EXIT PAGE!
                                                        </div>
                                                        <div>
                                                            NFT COMING SHORTLY!
                                                        </div>
                                                    </div>
                                                )}
                                        </>
                                    )}
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                <div className='tracker-container text-center d-flex flex-column' style={{ fontSize: '0.9rem' }}>
                                    <div>
                                        <strong>`{nameTracker}`</strong> has been successfully minted and sent to your wallet!
                                        <div className="mt-2">
                                            <Link
                                                to="#"
                                                onClick={(e) => {
                                                    e.preventDefault(); // Prevents default navigation
                                                    window.open('/docs', '_blank', 'noopener,noreferrer,width=800,height=600');
                                                }}
                                            >
                                                Need help seeing your NFT?
                                            </Link>
                                        </div>
                                        <div className="mt-1">You can track the transaction on Solscan below.</div>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-center'>
                                    <Link className="button-style-regular" to={solScanner} target="_blank">View Transaction</Link>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <SolConnection />
                )}
            </div>
        </>
    );
};

export default TxModalMint;

import { useTransactionsController } from '../../../providers/TransactionsProvider';
import TxModalHeader from "../components/TxModalHeader";

import { renderTxStateIcon, renderTxSigning } from "../renderStatus";

const TxModalTokenSync = () => {
    const {
        txState,
        txSigningState,
        txError,
    } = useTransactionsController();

    // const { simpleCloseModal } = useTransactionsController();

    // const handleRedirect = () => {
    //     simpleCloseModal();
    // }

    return (
        <>
            {/* TX Header */}
            <TxModalHeader title={'Token Sync'} />

            {/* Modal Body */}
            <div className="modal-body">
                <div className="tracker-container">
                    <div className="tracker-row"><span className="tracker-label">In-Game $BOOH to $BOOH:</span></div>
                </div>
                {/* Status Indicators */}
                <div className="loading-details">
                    <div className='text-start marykate' style={{ fontSize: '1.4rem' }}>Transactions List</div>
                    <div className="d-flex gap-2 align-items-center">
                        {renderTxSigning(txSigningState)}
                        <h5 className="modal-title">Signing Transaction</h5>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                        {renderTxStateIcon(txState)}
                        <h5 className="modal-title">Sending Tokens</h5>
                    </div>
                </div>
            </div>

            {/* Confirm Button */}
            <div className="d-flex justify-content-center">
                {txError === "" ? (
                    <>
                        {txState === "complete" && <p style={{color: 'green', textAlign: 'center'}}>Tokens Sent: Check Wallet!</p>}
                    </>
                ) : (
                    <p style={{color: 'red', textAlign: 'center'}}>Sync Failed: {txError}</p>
                )}
            </div>
        </>
    );
};

export default TxModalTokenSync;

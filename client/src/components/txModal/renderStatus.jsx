export const renderTxStateIcon = (txState) => {
    switch (txState) {
        case 'empty':
            return <div className="tx-state-icon">-</div>;
        case 'started':
            return <div className="loader"></div>;
        case 'complete':
            return <div className="tx-state-icon checkmark">✅</div>;
        case 'failed':
            return <div className="tx-state-icon red-x">❌</div>;
        default:
            return null;
    }
};

export const renderCreateStateIcon = (createState) => {
    switch (createState) {
        case 'empty':
            return <div className="tx-state-icon">-</div>;
        case 'started':
            return <div className="loader"></div>;
        case 'complete':
            return <div className="tx-state-icon checkmark">✅</div>;
        case 'failed':
            return <div className="tx-state-icon red-x">❌</div>;
        default:
            return null;
    }
};

export const renderCostSign = (paymentTracker) => {
    switch (paymentTracker) {
        case 'CARD':
            return 'usd';
        case 'SOL':
            return 'sol'
        case 'BABYBOOH':
            return 'sol';
        default:
            return '';
    }
};

export const renderTxSigning = (signingState) => {
    switch (signingState) {
        case 'empty':
            return <div className="tx-state-icon">-</div>;
        case 'started':
            return <div className="loader"></div>;
        case 'complete':
            return <div className="tx-state-icon checkmark">✅</div>;
        case 'failed':
            return <div className="tx-state-icon red-x">❌</div>;
        default:
            return null;
    }
};
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { useTransactionsController } from '../../providers/TransactionsProvider';

import { shortenAddress } from '../../Utils/generalUtils';

const SolConnection = () => {

    const { publicKey, connected } = useWallet(); // Wallet hook

    const [selectedAddress, setSelectedAddress] = useState('');
    
    const {connectOrDisconnect} = useTransactionsController();

    // Update the selected address whenever the wallet connection changes
    useEffect(() => {
        if (publicKey) {
            setSelectedAddress(publicKey.toString());
        } else {
            setSelectedAddress('');
        }
    }, [publicKey, connected]);

    return (
        <button
            className={`${connected ? 'disconnect-button' : 'login-nav-button'}`}
            onClick={connectOrDisconnect}
        >
            {connected ? shortenAddress(selectedAddress, 4) : 'CONNECT WALLET'}
        </button>
    );
};

export default SolConnection;

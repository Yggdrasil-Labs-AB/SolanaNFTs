// src/components/SolConnection/SolConnection.jsx (or wherever it lives)
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { useTransactionsController } from '../../providers/TransactionsProvider';
import { shortenAddress } from '../../Utils/generalUtils';
import { useWalletAdmin } from '../../providers/WalletAdminProvider'; // adjust path

const SolConnection = () => {
    const { publicKey, connected } = useWallet();
    const [selectedAddress, setSelectedAddress] = useState('');

    const { connectOrDisconnect } = useTransactionsController();

    // 🔐 admin/auth hook
    const {
        userRole,
        loadingRole,
        loginWithWallet,
        logout,
    } = useWalletAdmin();

    useEffect(() => {
        if (publicKey) {
            setSelectedAddress(publicKey.toString());
        } else {
            setSelectedAddress('');
        }
    }, [publicKey, connected]);

    const isVerified = !!userRole; // you can refine this if you want only "admin" to count

    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* EXISTING connect/disconnect button */}
            <button
                className={`${connected ? 'disconnect-button' : 'login-nav-button'}`}
                onClick={connectOrDisconnect}
            >
                {connected ? shortenAddress(selectedAddress, 4) : 'CONNECT WALLET'}
            </button>

            {/* NEW: small verification button */}
            {connected && (
                <button
                    className="verify-button" // style this in CSS as small
                    onClick={isVerified ? logout : loginWithWallet}
                    disabled={loadingRole}
                >
                    {loadingRole
                        ? 'Verifying...'
                        : isVerified
                            ? (userRole === 'admin' ? 'ADMIN' : 'VERIFIED')
                            : 'VERIFY'}
                </button>
            )}
        </div>
    );
};

export default SolConnection;

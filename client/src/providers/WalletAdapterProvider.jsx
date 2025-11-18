import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    SolflareWalletAdapter,
    PhantomWalletAdapter
} from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import {
    SolanaMobileWalletAdapter,
    createDefaultAddressSelector,
    createDefaultAuthorizationResultCache,
    createDefaultWalletNotFoundHandler
} from '@solana-mobile/wallet-adapter-mobile';


// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

import App from '../App';

import { IS_MAINNET } from '../config/config';
import { GlobalVariablesProvider } from './GlobalVariablesProvider';
import { TransactionProvider } from './TransactionsProvider';
import { WalletAdminProvider } from './WalletAdminProvider';

const WalletAdapterProvider = () => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = IS_MAINNET ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => {
        return IS_MAINNET ? import.meta.env.VITE_SOLANA_NODE : clusterApiUrl(network);
    }, [network]);

    const wallets = useMemo(
        () => [
            new SolanaMobileWalletAdapter({
                addressSelector: createDefaultAddressSelector(),
                appIdentity: {
                    name: 'Booh Brawlers NFTs',
                    uri: 'https://nft.boohworld.io',
                    icon: 'https://res.cloudinary.com/dagu222du/image/upload/v1737541236/dlwxdyx5ysbz1obtshhq.png', // Ensure this is a valid URL or Base64 image
                },
                authorizationResultCache: createDefaultAuthorizationResultCache(),
                chain: endpoint, // Ensure cluster is properly defined
                onWalletNotFound: async (adapter) => {
                    console.warn('Wallet not found. Handling the case...');
                    createDefaultWalletNotFoundHandler()(adapter);
                },
            }),
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter()
        ],
        [],
    );

    // const wallets = useMemo(
    //     () => [
    //         /**
    //          * Wallets that implement either of these standards will be available automatically.
    //          *
    //          *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
    //          *     (https://github.com/solana-mobile/mobile-wallet-adapter)
    //          *   - Solana Wallet Standard
    //          *     (https://github.com/anza-xyz/wallet-standard)
    //          *
    //          * If you wish to support a wallet that supports neither of those standards,
    //          * instantiate its legacy wallet adapter here. Common legacy adapters can be found
    //          * in the npm package `@solana/wallet-adapter-wallets`.
    //          */
    //         new UnsafeBurnerWalletAdapter(),
    //         new PhantomWalletAdapter(),
    //         new SolflareWalletAdapter()
    //     ],
    //     [network]
    // );



    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    <GlobalVariablesProvider>
                        <TransactionProvider>
                            <WalletAdminProvider> 
                                <App />
                            </WalletAdminProvider>
                        </TransactionProvider>
                    </GlobalVariablesProvider>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

export default WalletAdapterProvider;
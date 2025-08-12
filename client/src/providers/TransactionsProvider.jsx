import { createContext, useContext, useState } from 'react';

import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { isSolanaWalletApp } from '../Utils/generalUtils';
// Create Context
const TransactionsContext = createContext();

// Provider Component
export const TransactionProvider = ({ children }) => {

    const { publicKey, connected, disconnect } = useWallet(); // Wallet hook
    const walletModal = useWalletModal(); // Wallet modal hook
    const isWalletApp = isSolanaWalletApp();

    //Modal Type
    const [modalType, setModalType] = useState(''); //mint, create, lock, delete

    //MODAL CONTROLLERS
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isLockModalOpen, setIsLockModalOpen] = useState(false);

    //STATE UI CONTROLLERS
    const [txState, setTxState] = useState('empty'); // 'empty', 'started', 'complete', 'failed'
    const [createState, setCreateState] = useState('empty');

    //TRANSACTION SIG CONTROLLER
    const [transactionSig, setTransactionSig] = useState(null);

    //PAYMENT & PRICE CONTROLLERS
    const [preCalcPayment, setPreCalcPayment] = useState(0);
    const [paymentTracker, setPaymentTracker] = useState('none');
    const [solPriceLoaded, setSolPriceLoaded] = useState(false);
    const [inGameSpend, setInGameSpend] = useState(null);

    //STRIPE CONTROLLERS
    const [stripeSecret, setStripeSecret] = useState(null);
    const [stripeModal, setStripeModal] = useState(false);
    const [redirectSecret, setRedirectSecret] = useState('');

    //RENDER INFO CONTROLLER
    const [nameTracker, setNameTracker] = useState('');

    //TRACK UPLOADED IMAGES NAME
    const [imageName, setImageName] = useState('');

    //MANAGES PAGE SWITCH BETWEEN CREATE & EDIT
    const [page, setPage] = useState(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 500);

    const resetTxModal = () => {
        setIsModalOpen(false);
        setModalType('');
        reloadStates();
        setTransactionSig(null);
        setSolPriceLoaded(false);
        setStripeSecret(null);
        setInGameSpend(0);
    };

    const loadTxModal = (type, name = 'unknown', payment = 0, paymentType =  'none', isPriceLoaded = false ) => {
        setIsModalOpen(true);
        setModalType(type);
        setNameTracker(name);
        setPreCalcPayment(payment);
        setSolPriceLoaded(isPriceLoaded);
        setPaymentTracker(paymentType);
    }

    const reloadStates = () =>{
        setTxState('empty');
        setCreateState('empty');
    }

    const simpleCloseModal = () => {
        reloadStates();
        setIsModalOpen(false);
        setModalType('');
    }

    const connectOrDisconnect = () => {
        if (connected) {
            // disconnect(); // Disconnect if already connected
            setIsModalOpen(true);
            setModalType('disconnect');
        } else {

            if(isMobile && !isWalletApp){
                setIsModalOpen(true);
                setModalType('appRedirect');
            } else {
                connectWallet('sol'); // Attempt to connect
            }
        }
    };

    // Function to handle wallet connection or disconnection
    const connectWallet = async (blockchain) => {
        if (blockchain === 'sol') {
            if (!publicKey) {
                try {
                    console.log('Trying to connect...');
                    
                    // On desktop, just open the modal normally
                    walletModal.setVisible(true);
                    
                } catch (e) {
                    console.error('Failed to open wallet modal:', e);
                }
            } else {
                try {
                    await disconnect(); // Disconnect the wallet
                } catch (e) {
                    console.error('Failed to disconnect wallet:', e);
                }
            }
        }
    };

    return (
        <TransactionsContext.Provider
            value={{
                modalType,
                setModalType,
                isModalOpen,
                setIsModalOpen,
                txState,
                setTxState,
                createState,
                setCreateState,
                transactionSig,
                setTransactionSig,
                preCalcPayment,
                setPreCalcPayment,
                paymentTracker,
                setPaymentTracker,
                solPriceLoaded,
                setSolPriceLoaded,
                stripeSecret,
                setStripeSecret,
                stripeModal,
                setStripeModal,
                redirectSecret,
                setRedirectSecret,
                nameTracker,
                setNameTracker,
                inGameSpend,
                setInGameSpend,
                isDeleteModalOpen,
                setIsDeleteModalOpen,
                isLockModalOpen,
                setIsLockModalOpen,
                resetTxModal,
                imageName,
                setImageName,
                page,
                setPage,
                loadTxModal,
                simpleCloseModal,
                connectOrDisconnect
            }}
        >
            {children}
        </TransactionsContext.Provider>
    );
};

// Custom Hook for Consuming Context
export const useTransactionsController = () => {
    return useContext(TransactionsContext);
};
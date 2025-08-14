import React from 'react'

import TxModalHeader from '../components/TxModalHeader';

import { useWalletModal } from '@solana/wallet-adapter-react-ui';

import { useTransactionsController } from '../../../providers/TransactionsProvider';

const TxModalAppRedirect = () => {

    const walletModal = useWalletModal();

    const {simpleCloseModal} = useTransactionsController();

    const handleRedirect = () => {
        walletModal.setVisible(true);
        simpleCloseModal();
    }

    return (
        <>
            {/* Close button */}
            <TxModalHeader title={'App Redirect'} disableSimpleClose={true} />

            {/* Modal Body */}
            <div className="modal-body">
                <div className="tracker-container">
                    <div className='d-flex justify-content-center text-center'>
                        You&apos;re on a mobile device! Click Next to open a wallet app or connect if already in one.
                    </div>
                </div>
            </div>

            {/* Confirm Button */}
            <div className="d-flex justify-content-center">
                <button className="login-nav-button" onClick={handleRedirect} >NEXT</button>
            </div>
        </>
    )
}

export default TxModalAppRedirect;
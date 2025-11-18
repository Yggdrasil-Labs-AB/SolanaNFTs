import { useTransactionsController } from '../../providers/TransactionsProvider';

import TxModalWrapper from './TxModalWrapper';

import TxModalMint from './ModalTypes/TxModalMint';
import TxModalDelete from './ModalTypes/TxModalDelete';
import TxModalLockData from './ModalTypes/TxModalLockData';

import "../../Modal.css"; // Ensure this CSS file exists
import TxModalUploadImage from './ModalTypes/TxModalUploadImage';
import TxModalDisconnect from './ModalTypes/TxModalDisconnect';
import TxModalCreator from './ModalTypes/TxModalCreator';
import TxModalAppRedirect from './ModalTypes/TxModalAppRedirect';
import TxModalTokenSync from './ModalTypes/TxModalTokenSync';
import TxModalUploadModel from './ModalTypes/TxModalUploadModel';

const TxModalManager = ({  
    createNft, 
    createOffchainMetadata, 
    handleDeleteNftConcept, 
    handleAddNftConcept,
    handleImageChange,
    handleModelUpload,
    royaltyConfig
    }) => {
    
    const {
        modalType
    } = useTransactionsController();

    const renderModalContent = () => {

        switch (modalType) {
            case 'create':
                return <TxModalCreator handleAddNftConcept={handleAddNftConcept} />
            case "mint":
                return <TxModalMint createNft={createNft} royaltyConfig={royaltyConfig} />;
            case "delete":
                return <TxModalDelete handleDeleteNftConcept={handleDeleteNftConcept} />;
            case "lock":
                return <TxModalLockData createOffchainMetadata={createOffchainMetadata} />;
            case "image":
                return <TxModalUploadImage handleImageChange={handleImageChange}/>
            case "model":
                return <TxModalUploadModel handleModelUpload={handleModelUpload}/>
            case "disconnect":
                return <TxModalDisconnect />
            case 'appRedirect':
                return <TxModalAppRedirect />
            case 'tokenSync':
                return <TxModalTokenSync />
            default:
                return <TxModalMint createNft={createNft} />; //Default for Stripe Redirect
        }
    };

    return <TxModalWrapper>{renderModalContent()}</TxModalWrapper>;
};

export default TxModalManager;
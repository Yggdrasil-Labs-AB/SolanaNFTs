//React elements
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

//Components
import NFTPreview from '../NFTPreview/NFTPreview';
import NFTUpdate from '../NFTUpdate/NFTUpdate';
import Navbar from '../Navbar/Navbar';

//Utility functions
import { convertUsdToSol } from '../../Utils/pricingModifiers';
import { uploadIconIPFS, uploadMetadata, uploadModelIPFS } from '../../services/pinataServices';
import { uploadIcon } from '../../services/cloudinaryServices';
import { addNftConcept, deleteNftConcept, saveMetadataUri, updateNftConcept } from '../../services/dbServices';
import { createSendSolTx, getCoreNFTs } from '../../services/blockchainServices';
import { applyAttributes, cleanAttributes, delay, rollSecureRandomInt } from '../../Utils/generalUtils';

//Imported packages
import { useConnection } from '@solana/wallet-adapter-react';

import { creatorCosts } from '../../config/nftConfig';

//CONTEXT AND PROVIDERS
import { useGlobalVariables } from '../../providers/GlobalVariablesProvider';
import { ScreenProvider } from '../../providers/ScreenProvider';
import { useTransactionsController } from '../../providers/TransactionsProvider';

//HOOKS
import { useWalletAdmin } from '../../hooks/useWalletAdmin';
import { useNftConceptForm } from '../../hooks/useNftConceptForm';

import { fetchRollQualityData } from '../../services/gameServices';
import NftSideNav from '../SideNav/nftSideNav';

const NftHomepage = () => {

    //Wallet connection
    // const wallet = useWallet();

    const { wallet, userRole } = useWalletAdmin();
    const { connection } = useConnection();
    const { refetchNftConcepts } = useGlobalVariables();

    const {
        setTxState,
        setCreateState,
        setTransactionSig,
        page,
        setPage,
        preCalcPayment
    } = useTransactionsController();

    const [searchParams] = useSearchParams();
    const action = searchParams.get('action'); // "create" or "update"

    //Handles Page switching for UI on Initial load
    useEffect(() => {
        setPage(action);;
    }, []);

    //Handles disabling buttons
    const [isDisabled, setIsDisabled] = useState(false); //Button use for storing metadata in database
    const [createLockStatus, setCreateLockStatus] = useState(false); //Use case for if a Admin is create offchain metadata from create page

    const {
        info,
        setInfo,
        attributes,
        setAttributes,
        properties,
        setProperties,
        storeInfo,
        setStoreInfo,
        image,
        newMetadata,
        setNewMetadata,
        resetNftConceptForm,
        handleInfoChange,
        handleStoreChange,
        handleImageChange,
        handleModelUpload,
        handleAttributeChange,
        isNameTaken,
        resetDivisionOnTypeChange,
        imageName,
        modelName,
        modelPreviewUrl,
        modelFile
    } = useNftConceptForm();

    useEffect(() => {
        if (page === 'create') {
            handleStoreChange('creator', wallet.publicKey?.toBase58());
        }
    }, [page])

    //THIS EFFECT IS FOR TESTING APIS
    useEffect(() => {

        const asyncCall = async () => {

            const data = await getCoreNFTs(wallet.publicKey?.toBase58());
            console.log(data);
        }

        asyncCall();
    }, [wallet])

    //This combines Store & Metadata for any NEW adds to the Database
    const combineNewMetadataJSON = async () => {
        // Upload the image
        const { ipfsUri } = await uploadIconIPFS(image, imageName);
        const imageURL = ipfsUri;

        const { modelIpfsUri } = await uploadModelIPFS(modelFile, modelName);

        console.log("Upload complete: ", imageURL);

        //Set info.image to proper URL
        setInfo({ ...info, image: imageURL });

        //Use Immediate value
        const hardInfo = {
            ...info,
            image: imageURL,
            animation_url: modelIpfsUri
        }

        //Set properties image to proper URL
        setProperties({
            files: [
                { uri: ipfsUri, type: "image/png" },
                { uri: modelIpfsUri, type: "model/gltf-binary" } // .glb MIME
            ],
            category: "vr"
        });

        //Use immediate value
        const hardProperties = {
            files: [
                { uri: ipfsUri, type: "image/png" },
                { uri: modelIpfsUri, type: "model/gltf-binary" } // .glb MIME
            ],
            category: "vr"
        }

        //Combine Metadata
        const metadataCombined = {
            ...hardInfo,
            attributes,
            properties: hardProperties,
            storeInfo
        }

        return metadataCombined;
    }

    //This combines metadata & store data for db update
    const combineUpdateMetadataJSON = async () => {

        const metadataCombined = {
            ...info,
            attributes,
            properties,
            storeInfo,
        }

        return metadataCombined;
    }

    //This combines metadata for URI upload
    const combineOffchainMetatdata = async () => {

        const cleanedAttributes = cleanAttributes(attributes);

        const metadataCombined = {
            ...info,
            attributes: cleanedAttributes,
            properties,
        }

        return metadataCombined;
    }

    const creatorPayment = async () => {

        if (userRole === 'admin') //Admins are exempt from creator costs
            return true;

        try {
            //Pay for higher level creation items
            const rarityAttribute = attributes.find(attr => attr.trait_type === "rarity");

            const paymentInUSD = creatorCosts[rarityAttribute.value];

            if (paymentInUSD === 0)
                return true;

            const paymentInSol = await convertUsdToSol(paymentInUSD);

            const transaction = await createSendSolTx(wallet.publicKey, paymentInSol);

            if (!transaction)
                return false;

            const signature = await wallet.sendTransaction(transaction, connection);

            // Now wait for confirmation
            const latestBlockhash = await connection.getLatestBlockhash();

            await connection.confirmTransaction({
                signature,
                ...latestBlockhash
            }, 'confirmed');

            if (signature) {
                console.log("Creator Payment Successful")
                return true;
            } else {
                console.log("Creator Payment Failed");
                return false;
            }

        } catch (e) {
            console.log("Creator payment failed", e)
            return false;
        }
    }

    const handleAddNftConcept = async () => {
        if (page !== 'create') return; // Ensure this function only runs for 'create' action

        setTxState('started');

        try {
            // 🔹 Step 1: Handle Creator Payment
            const success = await creatorPayment();
            if (!success) {
                setTxState('failed');
                return false;
            }

            setTxState('complete');

        } catch (error) {
            console.error("❌ Error in creator payment:", error.response?.data || error.message);
            setTxState('failed');
            return false;
        }

        try {

            setCreateState('started');

            // Step 2: Prepare Metadata
            const metadataForDB = await combineNewMetadataJSON();

            console.log(metadataForDB);

            // Step 3: Submit to Database
            // eslint-disable-next-line no-unreachable
            const data = await addNftConcept(metadataForDB);
            if (!data) {
                throw new Error("Failed to save NFT metadata to the database.");
            }

            setNewMetadata(data);
            console.log("✅ NFT Metadata created successfully:", data);

            // Step 4: Refresh UI
            refetchNftConcepts(); //Get New NFT Concepts from Database

            setCreateState('complete'); //Track UI State

            resetNftConceptForm(); //Reset the Sidenav form

            return true;

        } catch (error) {
            console.error("❌ Error in adding NFT to database:", error.response?.data || error.message);
            setCreateState('failed');
            return false;
        }
    };

    const handleUpdateNftConcept = async () => {
        try {
            if (page === 'update') {

                //Combine Metadata
                const updateDataForDB = await combineUpdateMetadataJSON();

                console.log(updateDataForDB);

                //Remove ID from metadata
                const data = await updateNftConcept(updateDataForDB);

                console.log('Update Successfull,', data);

                refetchNftConcepts();

                return true;
            }
        } catch (error) {
            console.error('Error updatingNft Data:', error.response?.data || error.message);
        }
    }

    const createOffchainMetadata = async () => {
        try {
            setTxState('started');

            // 🔹 Step 1: Combine metadata for upload
            const metadataForJSONUpload = await combineOffchainMetatdata();

            console.log(metadataForJSONUpload);

            // 🔹 Step 2: Upload metadata and get the URI
            const metadataUri = await uploadMetadata(metadataForJSONUpload, metadataForJSONUpload.name);
            if (!metadataUri) {
                setTxState('failed')
                throw new Error("Metadata upload failed: No URI returned.");
            }

            setTxState('complete'); // ✅ Confirm upload success before marking complete

            // 🔹 Step 3: Determine Object ID
            const objectId = page === 'create' ? newMetadata?._id : info?._id;
            if (!objectId) {
                setTxState('failed');
                throw new Error("Missing Object ID: Cannot save metadata.");
            }

            setCreateState('started');

            // 🔹 Step 4: Save metadata URI to the database
            const data = await saveMetadataUri(objectId, metadataUri);
            if (!data) {
                throw new Error("Failed to update metadata URI.");
            }

            // 🔹 Step 5: Handle success
            console.log("Update Successful:", data);
            setCreateState('complete');
            setTransactionSig(metadataUri);
            resetNftConceptForm(); // ✅ Reset metadata only if successful
            refetchNftConcepts();

        } catch (error) {
            console.error("Error in createOffchainMetadata:", error);
            setTxState("failed");
            setCreateState("failed");
            alert(error.message);
        }
    };

    const handleDeleteNftConcept = async () => {

        setTxState('started');

        await delay(2000);

        try {
            await deleteNftConcept(info._id);

            setTxState('complete');

            refetchNftConcepts();
            resetNftConceptForm();

        } catch (error) {
            console.error('Error updating data', error.response?.data || error.message);
            setTxState('failed');
        }
    }

    return (
        // SCREEN PROVIDER IS TO TRACK SCREEN SIZE AND DYNAMICALLY UPDATE CSS
        <ScreenProvider>
            {/* THIS Handles bulk of Homepage Components */}
            <div style={{ overflow: 'hidden' }}>
                <Navbar resetNftConceptForm={resetNftConceptForm} setIsDisabled={setIsDisabled} />
                <div className="layout-container">
                    <NftSideNav info={info}
                        attributes={attributes}
                        storeInfo={storeInfo}
                        setStoreInfo={setStoreInfo}
                        handleInfoChange={handleInfoChange}
                        handleStoreChange={handleStoreChange}
                        handleAttributeChange={handleAttributeChange}
                        page={page}
                        setPage={setPage}
                        createOffchainMetadata={createOffchainMetadata}
                        handleDeleteNftConcept={handleDeleteNftConcept}
                        isDisabled={isDisabled}
                        setIsDisabled={setIsDisabled}
                        userRole={userRole}
                        walletAddress={wallet.publicKey?.toBase58()}
                        resetNftConceptForm={resetNftConceptForm}
                        createLockStatus={createLockStatus}
                        setCreateLockStatus={setCreateLockStatus}
                        handleUpdateNftConcept={handleUpdateNftConcept}
                        isNameTaken={isNameTaken}
                        resetDivisionOnTypeChange={resetDivisionOnTypeChange}
                        imageName={imageName}
                        modelName={modelName}
                    />
                    {page === "create" &&
                        <NFTPreview
                            info={info}
                            attributes={attributes}
                            storeInfo={storeInfo}
                            image={image}
                            modelPreviewUrl={modelPreviewUrl}
                            handleImageChange={handleImageChange}
                            handleAddNftConcept={handleAddNftConcept}
                            handleModelUpload={handleModelUpload} />}
                    {page === "update" &&
                        <NFTUpdate
                            setInfo={setInfo}
                            setAttributes={setAttributes}
                            setProperties={setProperties}
                            setStoreInfo={setStoreInfo}
                            userRole={userRole}
                            wallet={wallet}
                            createOffchainMetadata={createOffchainMetadata}
                            handleDeleteNftConcept={handleDeleteNftConcept} />}
                </div>
            </div>
        </ScreenProvider>
    );
};

export default NftHomepage;

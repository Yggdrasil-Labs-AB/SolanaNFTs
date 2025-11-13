import React, {useEffect, useState} from 'react';

import tempImage from '../../assets/itemBGs/tempImage.png';

import { FaLock } from "react-icons/fa";
import { FaLockOpen } from "react-icons/fa";
import MobileDetailsButton from '../MobileDetailsButton/MobileDetailsButton';

import { useTransactionsController } from '../../providers/TransactionsProvider';

import TxModalManager from '../txModal/TxModalManager';

import { getTraitRowsFromAttributes } from '../../Utils/renderNftHelper';
import GlbTest from '../pages/GlbTester';

const NFTPreview = ({
    info,
    attributes,
    storeInfo,
    image,
    handleImageChange,
    handleAddNftConcept,
    handleModelUpload,
    modelPreviewUrl
}) => {

    const {
        isModalOpen
    } = useTransactionsController();

    const [traitRows, setTraitRows] = useState([]);

    useEffect(() => {
        setTraitRows(getTraitRowsFromAttributes(attributes));
    }, [attributes]);

    // Determine rarity and background shadow
    const rarity = attributes.find(attr => attr.trait_type === "rarity")?.value || "Epic";
    const type = attributes.find(attr => attr.trait_type === "type")?.value || "unknown";
    const subType = attributes.find(attr => attr.trait_type === "subType")?.value || "unknown";

    const rarityClass = `nft-box shadow-${rarity.toLowerCase()}`; // Convert rarity to lowercase for className
    const bannerClass = `banner-standards banner-${rarity.toLowerCase()}`
    const nftBlockchain = attributes.find(attr => attr.trait_type === "blockchain")?.value || "solana";
    const nftBlockchainClass = `blockchain-${nftBlockchain}`

    const level = attributes.find(attr => attr.trait_type === "level")?.value || "5";


    return (
        <div className="nft-preview-styling">
            <h1 className='marykate'>Creator Preview</h1>
            <div style={{ display: 'inline-block' }}>
                <div className="d-flex justify-content-between" style={{ marginBottom: '5px' }}>
                    <div>Price: ${storeInfo.price}</div>
                    {storeInfo.metadataUri ? (<div><FaLock /></div>) : (<div><FaLockOpen /></div>)}
                </div>
                <button className={rarityClass} >
                    <div className='d-flex' style={{ marginBottom: '10px' }}>
                        <div className="d-flex justify-content-center align-items-center">
                            <img
                                src={image ? URL.createObjectURL(image) : tempImage}
                                alt={info.name}
                                style={{ width: "100px", height: "100px" }}
                            />
                        </div>
                        <div className="d-flex flex-column w-100">
                            <h3 className="nft-name lazy-dog">{info.name}</h3>
                            <div className="nft-stats d-flex flex-column align-items-center h-100 w-100 marykate">
                                {traitRows.map((row, idx) => (
                                    <div className="d-flex w-100" key={idx}>
                                        {row.map((trait, j) => (
                                            <p
                                                key={j}
                                                style={{
                                                    flex: row.length === 1 ? 1 : j === 0 ? 0.45 : 0.55,
                                                    textAlign: 'left',
                                                }}
                                            >
                                                <strong>{trait.label}:</strong> {trait.value}
                                            </p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid white', padding: '5px 0px' }}>

                    </div>
                    <div className="d-flex gap-3">
                        <div className={nftBlockchainClass}>{nftBlockchain}</div>
                        <div className={bannerClass}>{type}</div>
                        <div className={bannerClass}>{subType}</div>
                        <div className={bannerClass}>Lvl. {level}</div>
                    </div>
                </button>
                <GlbTest modelPreviewUrl={modelPreviewUrl}/>
            </div>
            {isModalOpen && <TxModalManager
                handleImageChange={handleImageChange}
                handleAddNftConcept={handleAddNftConcept}
                handleModelUpload={handleModelUpload} />}
            <MobileDetailsButton />
        </div>
    );
};

export default NFTPreview;
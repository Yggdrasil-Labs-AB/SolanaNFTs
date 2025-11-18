import { useEffect, useState } from 'react';

import tempImage from '../../assets/itemBGs/tempImage.png';
import { FaLock, FaLockOpen } from "react-icons/fa";

import MobileDetailsButton from '../MobileDetailsButton/MobileDetailsButton';
import { useTransactionsController } from '../../providers/TransactionsProvider';
import TxModalManager from '../txModal/TxModalManager';

import GlbInlinePreview from '../GlbInlinePreview/GlbInlinePreview';
import { formatTraitLabel } from '../../Utils/generalUtils';

import "../../css/nftpreview.css"

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
    const { isModalOpen } = useTransactionsController();
    const [previewUrl, setPreviewUrl] = useState(null);

    // Traits we DON'T want to show as stats
    const metaTraits = [
        'type',
        'subType',
        'rarity',
        'affinity',
        'division',
        'level',
        'blockchain',
        'rollQuality',
        'statsSeedRoll',
    ];

    // Everything else is a "stat"
    const previewStats = attributes
        .filter(attr => !metaTraits.includes(attr.trait_type))
        // hide totally empty values
        .filter(attr => attr.value !== "" && attr.value !== null && attr.value !== undefined);

    // Safe image preview URL
    useEffect(() => {
        if (!image) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(image);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [image]);

    const rarity = attributes.find(a => a.trait_type === "rarity")?.value || "common";
    const type = attributes.find(a => a.trait_type === "type")?.value || "Unknown";
    const subType = attributes.find(a => a.trait_type === "subType")?.value || "Unknown";
    const level = attributes.find(a => a.trait_type === "level")?.value || "1";

    const rarityClass = `banner-${rarity.toLowerCase()}`; // reuse your gradients
    const displayImage = previewUrl || tempImage;

    return (
        <div className="creator-preview-shell">
            <h2 className="marykate creator-preview-title">Creator Preview</h2>

            {/* NEW ROW WRAPPER */}
            <div className="creator-preview-row">
                {/* LEFT: CARD */}
                <div className="creator-preview-card">
                    {/* ...everything that was inside creator-preview-card before... */}

                    <div className="creator-preview-header">
                        <span className="creator-preview-price">
                            Price: ${storeInfo.price || '0.00'}
                        </span>
                        <span className="creator-preview-lock">
                            {storeInfo.metadataUri ? <FaLock /> : <FaLockOpen />}
                        </span>
                    </div>

                    <div className="creator-preview-image">
                        <img src={displayImage} alt={info.name || 'NFT preview'} />
                    </div>

                    <div className="creator-preview-name">
                        {info.name || 'Unnamed NFT'}
                    </div>

                    <div className="creator-preview-badges">
                        <span className={`badge badge-rarity ${rarityClass}`}>{rarity}</span>
                        <span className="badge">{type}</span>
                        <span className="badge">{subType}</span>
                    </div>

                    <div className="creator-preview-stats">
                        {previewStats.length ? (
                            previewStats.map((trait) => (
                                trait.value > 0 &&
                                <div
                                    key={trait.trait_type}
                                    className="creator-preview-stat-row"
                                >
                                    <span className="stat-label">
                                        {formatTraitLabel(trait.trait_type)}
                                    </span>
                                    <span className="stat-value">+{trait.value}%</span>
                                </div>
                            ))
                        ) : (
                            <div className="creator-preview-empty">
                                Add stats in the sidebar to see them here.
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: 3D MODEL */}
                {modelPreviewUrl && (
                    <div className="creator-preview-model">
                        <GlbInlinePreview modelPreviewUrl={modelPreviewUrl} />
                    </div>
                )}
            </div>

            {isModalOpen && (
                <TxModalManager
                    handleImageChange={handleImageChange}
                    handleAddNftConcept={handleAddNftConcept}
                    handleModelUpload={handleModelUpload}
                />
            )}

            <MobileDetailsButton />
        </div>
    );
};

export default NFTPreview;

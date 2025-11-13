
import { useState } from "react";

import { useInGameItemForm } from "../../hooks/useInGameItemForm";
import { uploadIcon } from "../../services/cloudinaryServices";

import { fetchRollQualityData } from '../../services/gameServices';

import { applyAttributes, rollSecureRandomInt } from '../../Utils/generalUtils';
import {
    stats,
    statModifiers,
    generalTypes,
    weaponOptions,
    rarityOptions,
    affinityOptions,
    divisionOptions,
    accessoriesOptions,
    armorOptions,
    helmetOptions
} from "../../config/gameConfig";

import { useWalletAdmin } from "../../hooks/useWalletAdmin";

//CSS
import "../../css/item-page.css"
import { addNewGameItem } from "../../services/dbGameServices";

const HandleInGameItems = () => {

    const {
        info,
        setInfo,
        attributes,
        setAttributes,
        storeInfo,
        setStoreInfo,
        image,
        handleInfoChange,
        handleAttributeChange,
        handleStoreChange,
        handleImageChange,
        imagePreview,
        resetGameItemForm
    } = useInGameItemForm();

    const [isDisabled, setIsDisabled] = useState(false);
    const [isCreate, setIsCreate] = useState(true);

    //This combines Store & Metadata for any NEW adds to the Database
    const combineItemInfo = async () => {
        // Upload the image
        const iconResp = await uploadIcon(image);
        const imageURL = iconResp.secure_url;

        console.log("Upload complete: ", imageURL);

        //Set info.image to proper URL
        setInfo({ ...info, image: imageURL });

        //Use Immediate value
        const hardInfo = {
            ...info,
            image: imageURL
        }

        //Get Random Int
        const seedNumber = rollSecureRandomInt();
        console.log(seedNumber);

        // Create the updated object locally
        const updatedStoreInfo = {
            ...storeInfo,
            statsRollSeed: seedNumber
        };

        setStoreInfo(updatedStoreInfo);

        const rarityAttribute = attributes.find(type => type.trait_type === "rarity");
        const itemType = attributes.find(type => type.trait_type === "type");
        const subItemType = attributes.find(type => type.trait_type === "subType");

        //Get roll quality data
        const rolledAttributes = await fetchRollQualityData(seedNumber, storeInfo.rollQuality, rarityAttribute?.value, itemType?.value, subItemType?.value);
        console.log(rolledAttributes);

        //Update Attributes
        const appliedAttributes = applyAttributes(attributes, rolledAttributes, seedNumber, storeInfo.rollQuality);

        setAttributes(appliedAttributes);

        //Combine Metadata
        const combinedNewItemData = {
            ...hardInfo,
            attributes: appliedAttributes,
            storeInfo: updatedStoreInfo,
        }

        return combinedNewItemData;
    }

    const handleAddNewItem = async () => {

        try {

            // Step 2: Prepare Metadata
            const newItemForDB = await combineItemInfo();

            // Step 3: Submit to Database
            const data = await addNewGameItem(newItemForDB);
            if (!data) {
                throw new Error("Failed to save NFT metadata to the database.");
            } else {
                console.log(data);
            }

            // Step 4: Refresh UI
            // refetchNftConcepts(); //Get New NFT Concepts from Database

            resetGameItemForm(); //Reset the Sidenav form

            return true;

        } catch (error) {
            console.error("❌ Error in adding NFT to database:", error.response?.data || error.message);
            return false;
        }
    };

    const { userRole } = useWalletAdmin();
    const isAdmin = userRole === 'admin';

    // Helpers to get/set attribute values
    const getAttr = (trait) =>
        attributes.find((a) => a.trait_type === trait) || { value: '' };

    const handleCoreAttrChange = (trait, value) => {
        const index = attributes.findIndex((a) => a.trait_type === trait);
        console.log(attributes);
        console.log(index);
        if (index === -1) return;
        handleAttributeChange(index, 'value', value);
    };

    const typeValue = getAttr('type').value;
    const subTypeValue = getAttr('subType').value;
    const rarityValue = getAttr('rarity').value;
    const affinityValue = getAttr('affinity').value;
    const divisionValue = getAttr('division').value;

    const subTypeOptions =
        typeValue === 'weapon'
            ? weaponOptions
            : typeValue === 'armor'
                ? armorOptions
                : typeValue === 'accessory'
                    ? accessoriesOptions :
                        typeValue === "helmet"
                            ? helmetOptions
                    : [];

    // Split attributes into stats & modifiers for nice layout
    const statAttrs = attributes.filter((a) => stats.includes(a.trait_type));
    const modifierAttrs = attributes.filter((a) =>
        statModifiers.includes(a.trait_type)
    );

    const onSubmit = async (e) => {
        e.preventDefault();
        if (isDisabled) return;

        if (isCreate) {
            await handleAddNewItem();
        } else {
            // await handleUpdateItem();
        }
    };

    return (
        <div className="ingame-items-shell">
            {/* Header / mode toggle */}
            <div className="ingame-items-header">
                <div>
                    <h2 className="marykate" style={{ marginBottom: 1 }}>
                        {isCreate ? 'Create In-Game Item' : 'Edit In-Game Item'}
                    </h2>
                    <p style={{ opacity: 1, fontSize: 13 }}>
                        Configure stats, rarity and in-game costs for Booh Brawlers items.
                    </p>
                </div>

                <div className="ingame-items-mode-toggle">
                    <button
                        type="button"
                        className={`mode-pill ${isCreate ? 'active' : ''}`}
                        onClick={() => {
                            setIsCreate(true);
                            resetGameItemForm();
                        }}
                    >
                        Create
                    </button>
                    <button
                        type="button"
                        className={`mode-pill ${!isCreate ? 'active' : ''}`}
                        onClick={() => setIsCreate(false)}
                    >
                        Update
                    </button>
                </div>
            </div>

            <form onSubmit={onSubmit} className="ingame-items-grid">
                {/* LEFT COLUMN – GENERAL INFO */}
                <section className="panel">
                    <h3 className="panel-title">General</h3>

                    <label className="field">
                        <span className="field-label">Name</span>
                        <input
                            type="text"
                            name="name"
                            value={info.name}
                            onChange={handleInfoChange}
                            placeholder="Divine Ember Staff"
                        />
                    </label>

                    <label className="field">
                        <span className="field-label">Description</span>
                        <textarea
                            name="description"
                            value={info.description}
                            onChange={handleInfoChange}
                            rows={3}
                            placeholder="A legendary staff forged from the first embers of Booh."
                        />
                    </label>

                    <label className="field">
                        <span className="field-label">Icon (512x512, square)</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </label>

                    {/* Preview */}
                    {imagePreview && (
                        <div style={{ marginTop: "10px" }}>
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{
                                    width: 120,
                                    height: 120,
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    border: "1px solid #333"
                                }}
                            />
                        </div>
                    )}
                </section>

                {/* MIDDLE COLUMN – CORE ATTRIBUTES */}
                <section className="panel">
                    <h3 className="panel-title">Core Attributes</h3>

                    <div className="field-row">
                        <label className="field">
                            <span className="field-label">Type</span>
                            <select
                                value={typeValue}
                                onChange={(e) => {
                                    handleCoreAttrChange('type', e.target.value);
                                }}
                            >
                                <option value="">Select type...</option>
                                {generalTypes.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="field">
                            <span className="field-label">Sub-Type</span>
                            <select
                                value={subTypeValue}
                                onChange={(e) =>
                                    handleCoreAttrChange('subType', e.target.value)
                                }
                                disabled={!typeValue}
                            >
                                <option value="">Select sub-type...</option>
                                {subTypeOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="field-row">
                        <label className="field">
                            <span className="field-label">Rarity</span>
                            <select
                                value={rarityValue}
                                onChange={(e) =>
                                    handleCoreAttrChange('rarity', e.target.value)
                                }
                            >
                                {rarityOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="field">
                            <span className="field-label">Affinity</span>
                            <select
                                value={affinityValue}
                                onChange={(e) =>
                                    handleCoreAttrChange('affinity', e.target.value)
                                }
                            >
                                <option value="">None</option>
                                {affinityOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label className="field">
                        <span className="field-label">Division (Faction)</span>
                        <select
                            value={divisionValue}
                            onChange={(e) =>
                                handleCoreAttrChange('division', e.target.value)
                            }
                        >
                            <option value="none">None</option>
                            {divisionOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                    </label>
                </section>

                {/* RIGHT COLUMN – STATS */}
                <section className="panel">
                    <h3 className="panel-title">Stats</h3>

                    <div className="stats-grid">
                        {statAttrs.map((attr) => {
                            const idx = attributes.findIndex(
                                (a) => a.trait_type === attr.trait_type
                            );
                            return (
                                <label className="field" key={attr.trait_type}>
                                    <span className="field-label">
                                        {attr.trait_type.replace(/([A-Z])/g, ' $1')}
                                    </span>
                                    <input
                                        type="number"
                                        value={attr.value}
                                        onChange={(e) =>
                                            handleAttributeChange(
                                                idx,
                                                'value',
                                                String(e.target.value)
                                            )
                                        }
                                    />
                                </label>
                            );
                        })}
                    </div>

                    <h4 className="panel-subtitle" style={{ marginTop: 12 }}>
                        Stat Modifiers - Rolled
                    </h4>
                    <div className="stats-grid">
                        {modifierAttrs.map((attr) => {
                            const idx = attributes.findIndex(
                                (a) => a.trait_type === attr.trait_type
                            );
                            return (
                                <label className="field" key={attr.trait_type}>
                                    <span className="field-label">
                                        {attr.trait_type.replace(/Modifier$/, '').replace(/([A-Z])/g, ' $1')}
                                    </span>
                                    <input
                                        type="number"
                                        value={attr.value}
                                        disabled={true}
                                        onChange={(e) =>
                                            handleAttributeChange(
                                                idx,
                                                'value',
                                                String(e.target.value)
                                            )
                                        }
                                    />
                                </label>
                            );
                        })}
                    </div>
                </section>

                {/* FULL-WIDTH – STORE INFO + ACTIONS */}
                <section className="panel panel-full">
                    <h3 className="panel-title">Store & Economy</h3>

                    <div className="field-row">
                        <label className="field checkbox-field">
                            <input
                                type="checkbox"
                                checked={storeInfo.available}
                                onChange={(e) => handleStoreChange('available', e.target.checked)}
                            />
                            <span className="field-label">Available in-game</span>
                        </label>

                        <label className="field">
                            <span className="field-label">Season</span>
                            <input
                                type="number"
                                value={storeInfo.season}
                                onChange={(e) =>
                                    handleStoreChange('season', Number(e.target.value) || 0)
                                }
                                min={1}
                            />
                        </label>

                        <label className="field">
                            <span className="field-label">Roll Quality</span>
                            <input
                                type="number"
                                value={storeInfo.rollQuality}
                                onChange={(e) =>
                                    handleStoreChange('rollQuality', Number(e.target.value) || 0)
                                }
                                min={0}
                                max={100}
                            />
                        </label>
                    </div>

                    <div className="field-row">
                        <label className="field">
                            <span className="field-label">Gold Cost</span>
                            <input
                                type="number"
                                value={storeInfo.goldCost}
                                onChange={(e) =>
                                    handleStoreChange('goldCost', Number(e.target.value) || 0)
                                }
                                min={0}
                            />
                        </label>

                        <label className="field">
                            <span className="field-label">BabyBooh Cost</span>
                            <input
                                type="number"
                                value={storeInfo.babyBoohCost}
                                onChange={(e) =>
                                    handleStoreChange('babyBoohCost', Number(e.target.value) || 0)
                                }
                                min={0}
                            />
                        </label>

                        <label className="field">
                            <span className="field-label">Booh Shards Cost</span>
                            <input
                                type="number"
                                value={storeInfo.boohShardsCost || 0}
                                onChange={(e) =>
                                    handleStoreChange(
                                        'boohShardsCost',
                                        Number(e.target.value) || 0
                                    )
                                }
                                min={0}
                            />
                        </label>
                    </div>

                    <div className="actions-row">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={resetGameItemForm}
                        >
                            Reset
                        </button>

                        <div className="actions-right">
                            {!isCreate && isAdmin && (
                                <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={""}
                                >
                                    Delete Item
                                </button>
                            )}

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={isDisabled}
                            >
                                {isCreate ? 'Create Item' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </section>
            </form>
        </div>
    );
}

export default HandleInGameItems;
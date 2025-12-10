
import { useState, useEffect } from "react";

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

import { useWalletAdmin } from "../../providers/WalletAdminProvider";

//CSS
import "../../css/item-page.css"
import { addNewGameItem, deleteItem, fetchAllInGameItems, updateInGameItem } from "../../services/dbGameServices";

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
    const [editingItem, setEditingItem] = useState(null);
    const [loadedItems, setLoadedItems] = useState(null);

    const { userRole, authToken } = useWalletAdmin();
    const isAdmin = userRole === 'admin';

    // Reusable fetch function
    const fetchItems = async () => {
        if (!authToken) return;

        const allItems = await fetchAllInGameItems(authToken);
        if (allItems) {
            setLoadedItems(allItems);
            console.log("Loaded Items:", allItems);
        }
    };

    // Initial load on mount
    useEffect(() => {
        fetchItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const combineItemInfo = async () => {
        // Upload the image
        const iconResp = await uploadIcon(image);
        const imageURL = iconResp.secure_url;

        console.log("Upload complete: ", imageURL);

        const hardInfo = {
            ...info,
            image: imageURL,
        };

        const seedNumber = rollSecureRandomInt();

        // Use local copy, not relying on setStoreInfo
        const updatedStoreInfo = {
            ...storeInfo,
            statsRollSeed: Number(seedNumber)
        };

        // const rarityAttribute = attributes.find(type => type.trait_type === "rarity");
        // const itemType = attributes.find(type => type.trait_type === "type");
        // const subItemType = attributes.find(type => type.trait_type === "subType");

        // IMPORTANT: use updatedStoreInfo.rollQuality (number or string, doesn't matter yet)
        // const rolledAttributes = await fetchRollQualityData(
        //     seedNumber,
        //     updatedStoreInfo.rollQuality,
        //     rarityAttribute?.value,
        //     itemType?.value,
        //     subItemType?.value
        // );

        // const appliedAttributes = applyAttributes(
        //     attributes,
        //     rolledAttributes,
        //     seedNumber,
        //     updatedStoreInfo.rollQuality
        // );

        // local only; you can still call setAttributes/setStoreInfo if you want UI sync
        
        setStoreInfo(updatedStoreInfo);
        setInfo(hardInfo);

        // Combine raw data
        const combinedNewItemData = {
            ...hardInfo,
            attributes,
            storeInfo: updatedStoreInfo,
        };

        // 🔥 normalize all numeric strings -> numbers here
        const normalizedItem = convertTextToNumbers(combinedNewItemData);

        return normalizedItem;
    };


    const convertTextToNumbers = (item) => {
        // Helper: try to coerce to number if it's a numeric-looking string
        const toNumberIfNumeric = (val) => {
            if (typeof val !== 'string') return val;

            const trimmed = val.trim();
            if (trimmed === '') return 0;

            const num = Number(trimmed);
            return Number.isNaN(num) ? val : num;
        };

        // 1) normalize attributes[].value
        const normalizedAttributes = (item.attributes || []).map((attr) => ({
            ...attr,
            value: toNumberIfNumeric(attr.value),
        }));

        // 2) normalize storeInfo numeric fields
        const numericKeys = [
            'goldCost',
            'babyBoohCost',
            'boohShardsCost',
            'season',
        ];

        const normalizedStoreInfo = { ...(item.storeInfo || {}) };

        numericKeys.forEach((key) => {
            if (key in normalizedStoreInfo) {
                normalizedStoreInfo[key] = toNumberIfNumeric(normalizedStoreInfo[key]);
            }
        });

        // Return a new normalized object
        return {
            ...item,
            attributes: normalizedAttributes,
            storeInfo: normalizedStoreInfo,
        };
    };

    const handleAddNewItem = async () => {

        try {
            
            setIsDisabled(true);

            const newItemForDB = await combineItemInfo();

            const data = await addNewGameItem(newItemForDB, authToken);
            if (!data) {
                throw new Error("Failed to save NFT metadata to the database.");
            } else {
                console.log(data);
            }

            // Step 4: Refresh UI
            fetchItems();

            resetGameItemForm(); //Reset the Sidenav form

            alert("Item Added Successfully");

            return true;

        } catch (error) {
            console.error("❌ Error in adding NFT to database:", error.response?.data || error.message);
            alert("Failed to add Item to database");
            return false;
        } finally{
            setIsDisabled(false);
        }
    };

    const handleUpdateItem = async () => {
        if (!editingItem?._id) {
            console.warn('No item selected for update');
            return false;
        }

        try {
            setIsDisabled(true);

            // 1. Handle image: if a new file is selected, upload it; else keep existing URL
            let imageURL = info.image || editingItem.image || '';

            if (image instanceof File) {
                const iconResp = await uploadIcon(image);
                imageURL = iconResp.secure_url;
                console.log('Updated icon uploaded:', imageURL);
            }

            // 2. Build raw update object from current form state
            const rawUpdate = {
                name: info.name,
                description: info.description,
                image: imageURL,
                attributes,
                storeInfo,
            };

            // 3. Normalize numeric strings -> numbers
            const normalizedUpdate = convertTextToNumbers(rawUpdate);

            // 4. Send to backend
            const updatedFromServer = await updateInGameItem(editingItem._id, normalizedUpdate, authToken);

            // 5. Sync local state so UI rerenders with new data
            setEditingItem(updatedFromServer);
            setInfo({
                name: updatedFromServer.name || '',
                description: updatedFromServer.description || '',
                image: updatedFromServer.image || '',
            });
            setAttributes(updatedFromServer.attributes || []);
            setStoreInfo(updatedFromServer.storeInfo || {});

            // Update the list
            setLoadedItems((prev) =>
                prev
                    ? prev.map((it) =>
                        it._id === updatedFromServer._id ? updatedFromServer : it
                    )
                    : prev
            );

            alert("Item Updated Successfully");

            return true;
        } catch (err) {
            console.error('Error updating item:', err);
            alert("Failed to Update Item.");
            return false;
        } finally {
            setIsDisabled(false);
        }
    };

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
            await handleUpdateItem();
        }
    };

    const onDeleteItem = async (e) => {


        if (!editingItem?._id) {
            console.warn("No item selected for deletion");
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${editingItem.name}"? This cannot be undone.`
        );
        if (!confirmDelete) return;

        try {
            setIsDisabled(true);

            // Call backend
            await deleteItem(editingItem._id, authToken);

            // Remove from local list
            setLoadedItems((prev) =>
                prev ? prev.filter((item) => item._id !== editingItem._id) : prev
            );

            // Reset form + mode
            setEditingItem(null);
            resetGameItemForm();

            alert("Item Delete Successfully");
        } catch (err) {
            console.error("Error deleting item:", err);
            alert("Failed to delete item. Check console for details.");
        } finally {
            setIsDisabled(false);
        }
    };

    const handleSelectItemForEdit = (item) => {
        setIsCreate(false);      // ensure we are in update mode
        setEditingItem(item);    // mark which one is being edited

        // Load basic info
        setInfo({
            name: item.name || '',
            description: item.description || '',
            image: item.image || '',
        });

        // Load all attributes
        setAttributes(item.attributes || []);

        // Load store info (fallback to existing storeInfo so we don't explode if something is missing)
        setStoreInfo({
            ...storeInfo,
            ...(item.storeInfo || {}),
        });

        // If you want to scroll the form into view, you could add a ref later
    };

    // Generic helper for numeric store fields that allows empty input
    const handleNumericStoreChange = (key) => (e) => {
        const val = e.target.value;

        if (val === '') {
            // Let the field be empty while editing
            handleStoreChange(key, '');
        } else {
            handleStoreChange(key, Number(val));
        }
    };

    const toInputValue = (v) =>
        v === '' || v === null || v === undefined ? '' : v;

    // For stat inputs: allow empty string, store numbers otherwise
    const handleNumericAttrChange = (idx) => (e) => {
        const val = e.target.value;
        if (val === '') {
            handleAttributeChange(idx, 'value', '');
        } else {
            handleAttributeChange(idx, 'value', Number(val));
        }
    };

    const toAttrInputValue = (v) =>
        v === '' || v === null || v === undefined ? '' : v;

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
                            setEditingItem(null);
                            resetGameItemForm();
                        }}
                    >
                        Create
                    </button>
                    <button
                        type="button"
                        className={`mode-pill ${!isCreate ? 'active' : ''}`}
                        onClick={() => {
                            setIsCreate(false);
                            setEditingItem(null);
                            resetGameItemForm();
                        }}
                    >
                        Update
                    </button>
                </div>
            </div>

            {(isCreate || editingItem) && (
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
                                    <label className="field" key={`${attr.trait_type}-${idx}`}>
                                        <span className="field-label">
                                            {attr.trait_type.replace(/([A-Z])/g, ' $1')}
                                        </span>
                                        <input
                                            type="number"
                                            value={toAttrInputValue(attr.value)}
                                            onChange={handleNumericAttrChange(idx)}
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
                                    <label className="field" key={`${attr.trait_type}-${idx}`}>
                                        <span className="field-label">
                                            {attr.trait_type
                                                .replace(/Modifier$/, '')
                                                .replace(/([A-Z])/g, ' $1')}
                                        </span>
                                        <input
                                            type="number"
                                            value={toAttrInputValue(attr.value)}
                                            disabled={true}
                                        // onChange isn't needed while disabled, but you can keep it if you want
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
                                    min={1}
                                    value={toInputValue(storeInfo.season)}
                                    onChange={handleNumericStoreChange('season')}
                                />
                            </label>
                        </div>

                        <div className="field-row">
                            <label className="field">
                                <span className="field-label">Gold Cost</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={toInputValue(storeInfo.goldCost)}
                                    onChange={handleNumericStoreChange('goldCost')}
                                />
                            </label>


                            <label className="field">
                                <span className="field-label">BabyBooh Cost</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={toInputValue(storeInfo.babyBoohCost)}
                                    onChange={handleNumericStoreChange('babyBoohCost')}
                                />
                            </label>


                            <label className="field">
                                <span className="field-label">Booh Shards Cost</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={toInputValue(storeInfo.boohShardsCost)}
                                    onChange={handleNumericStoreChange('boohShardsCost')}
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
                                        onClick={() => onDeleteItem()}
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
            )}
            {!isCreate && (
                <section className="panel panel-full" style={{ marginTop: 16 }}>
                    <h3 className="panel-title">Existing In-Game Items</h3>

                    {!loadedItems.length && (
                        <p style={{ fontSize: 13, opacity: 0.7 }}>
                            No items found in the database yet.
                        </p>
                    )}

                    <div className="items-list">
                        {loadedItems.map((item) => (
                            <div key={item._id}
                                className={`item-row ${editingItem?._id === item._id ? 'selected' : ''}`}
                                onClick={() => handleSelectItemForEdit(item)} style={{ cursor: 'pointer' }}
                            >
                                {/* ICON */}
                                <div className="item-icon">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        onError={(e) => {
                                            e.currentTarget.src = "/fallback-icon.png";
                                        }}
                                    />
                                </div>

                                {/* MAIN INFO */}
                                <div className="item-main">
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-desc">{item.description}</div>

                                    <div className="item-cost-row">
                                        <span>Gold: {item.storeInfo?.goldCost ?? 0}</span>
                                        <span>BabyBooh: {item.storeInfo?.babyBoohCost ?? 0}</span>
                                        <span>Booh Shards: {item.storeInfo?.boohShardsCost ?? 0}</span>
                                    </div>

                                    {/* ATTRIBUTES */}
                                    <div className="item-attrs">
                                        {item.attributes.map((attr, idx) => (
                                            <div key={`${attr.trait_type}-${idx}`} className="item-attr-pill">
                                                <span className="attr-name">{attr.trait_type}</span>
                                                <span className="attr-value">{attr.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
}

export default HandleInGameItems;